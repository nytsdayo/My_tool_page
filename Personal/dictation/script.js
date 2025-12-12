const textInput = document.getElementById('textInput');
const preview = document.getElementById('preview');
const statusEl = document.getElementById('status');
const unsupportedNotice = document.getElementById('unsupportedNotice');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const stopButton = document.getElementById('stopButton');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const pitchRange = document.getElementById('pitchRange');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');

const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const synth = supportsSpeech ? window.speechSynthesis : null;

let voices = [];
let utterance = null;
let wordMap = [];
let activeIndex = -1;

function updateSliderLabels() {
    rateValue.textContent = `${Number(rateRange.value).toFixed(1)}x`;
    pitchValue.textContent = Number(pitchRange.value).toFixed(1);
}

function resetHighlight() {
    if (activeIndex >= 0 && wordMap[activeIndex]) {
        wordMap[activeIndex].el.classList.remove('active');
    }
    activeIndex = -1;
}

function updatePreview(text) {
    preview.innerHTML = '';
    wordMap = [];
    resetHighlight();

    if (!text.trim()) {
        const placeholder = document.createElement('p');
        placeholder.className = 'placeholder';
        placeholder.textContent = '入力されたテキストがここに表示され、読み上げ中の単語がハイライトされます。';
        preview.appendChild(placeholder);
        return;
    }

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    const wordRegex = /\S+/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > cursor) {
            fragment.append(document.createTextNode(text.slice(cursor, start)));
        }

        const span = document.createElement('span');
        span.textContent = match[0];
        span.className = 'word';
        span.dataset.start = start;
        span.dataset.end = end;
        fragment.append(span);
        wordMap.push({ start, end, el: span });
        cursor = end;
    }

    if (cursor < text.length) {
        fragment.append(document.createTextNode(text.slice(cursor)));
    }

    preview.append(fragment);
}

function highlightByCharIndex(charIndex) {
    if (!wordMap.length) return;

    const targetIndex = wordMap.findIndex(
        (word) => charIndex >= word.start && charIndex < word.end
    );

    if (targetIndex === -1 || targetIndex === activeIndex) return;

    if (activeIndex >= 0 && wordMap[activeIndex]) {
        wordMap[activeIndex].el.classList.remove('active');
    }

    wordMap[targetIndex].el.classList.add('active');
    activeIndex = targetIndex;

    wordMap[targetIndex].el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
    });
}

function setStatus(message) {
    statusEl.textContent = message;
}

function setUIState(state) {
    if (state === 'playing') {
        playButton.disabled = true;
        pauseButton.disabled = false;
        resumeButton.disabled = true;
        stopButton.disabled = false;
    } else if (state === 'paused') {
        playButton.disabled = true;
        pauseButton.disabled = true;
        resumeButton.disabled = false;
        stopButton.disabled = false;
    } else {
        playButton.disabled = !supportsSpeech;
        pauseButton.disabled = true;
        resumeButton.disabled = true;
        stopButton.disabled = true;
    }
}

function populateVoices() {
    if (!supportsSpeech) return;
    voices = synth.getVoices().sort((a, b) => a.lang.localeCompare(b.lang));

    const currentSelection = voiceSelect.value;
    voiceSelect.innerHTML = '<option value="">ブラウザのデフォルト</option>';

    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' - 推奨' : ''}`;
        voiceSelect.appendChild(option);
    });

    if (voices.some((voice) => voice.name === currentSelection)) {
        voiceSelect.value = currentSelection;
    } else {
        const japaneseVoice = voices.find((voice) => voice.lang.startsWith('ja'));
        if (japaneseVoice) {
            voiceSelect.value = japaneseVoice.name;
        }
    }
}

function cancelSpeech() {
    if (!supportsSpeech) return;
    synth.cancel();
    utterance = null;
    resetHighlight();
    setUIState('idle');
    setStatus('停止しました。再生するテキストを入力して「再生」を押してください。');
}

function handleBoundary(event) {
    const index = typeof event.charIndex === 'number' ? event.charIndex : 0;
    highlightByCharIndex(index);
}

function speak() {
    if (!supportsSpeech) return;
    const text = textInput.value.trim();

    if (!text) {
        setStatus('テキストを入力してください。');
        return;
    }

    cancelSpeech();
    updatePreview(text);

    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Number(rateRange.value);
    utterance.pitch = Number(pitchRange.value);

    const selectedVoice = voices.find((voice) => voice.name === voiceSelect.value);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
        setUIState('playing');
        setStatus('読み上げ中...');
        if (wordMap.length) {
            highlightByCharIndex(0);
        }
    };

    utterance.onend = () => {
        resetHighlight();
        setUIState('idle');
        setStatus('読み上げが完了しました。');
    };

    utterance.onpause = () => {
        setUIState('paused');
        setStatus('一時停止中です。');
    };

    utterance.onresume = () => {
        setUIState('playing');
        setStatus('読み上げを再開しました。');
    };

    utterance.onerror = () => {
        setUIState('idle');
        setStatus('読み上げ中にエラーが発生しました。');
    };

    utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === undefined) {
            handleBoundary(event);
        }
    };

    synth.speak(utterance);
}

function init() {
    updateSliderLabels();
    updatePreview('');
    setUIState('idle');

    if (!supportsSpeech) {
        unsupportedNotice.hidden = false;
        setStatus('お使いのブラウザは音声合成に対応していません。');
        voiceSelect.disabled = true;
        rateRange.disabled = true;
        pitchRange.disabled = true;
        return;
    }

    populateVoices();
    synth.onvoiceschanged = populateVoices;

    playButton.addEventListener('click', speak);
    pauseButton.addEventListener('click', () => {
        if (synth.speaking && !synth.paused) {
            synth.pause();
        }
    });
    resumeButton.addEventListener('click', () => {
        if (synth.paused) {
            synth.resume();
        }
    });
    stopButton.addEventListener('click', cancelSpeech);

    textInput.addEventListener('input', () => {
        updatePreview(textInput.value);
        if (synth.speaking || synth.paused) {
            cancelSpeech();
        }
    });

    rateRange.addEventListener('input', () => {
        updateSliderLabels();
        if (utterance) {
            utterance.rate = Number(rateRange.value);
        }
    });

    pitchRange.addEventListener('input', () => {
        updateSliderLabels();
        if (utterance) {
            utterance.pitch = Number(pitchRange.value);
        }
    });
}

init();
