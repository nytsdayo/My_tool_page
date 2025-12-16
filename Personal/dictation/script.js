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
const loopCheckbox = document.getElementById('loopCheckbox');
const blindModeCheckbox = document.getElementById('blindModeCheckbox');

// Recording Elements
const recordButton = document.getElementById('recordButton');
const stopRecordButton = document.getElementById('stopRecordButton');
const recordingStatus = document.getElementById('recordingStatus');
const audioPlayerContainer = document.getElementById('audioPlayerContainer');
const audioPlayback = document.getElementById('audioPlayback');
const downloadLink = document.getElementById('downloadLink');

const PREVIEW_DEBOUNCE_MS = 120;

const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const synth = supportsSpeech ? window.speechSynthesis : null;

let voices = [];
let utterance = null;
let wordMap = [];
let activeIndex = -1;
let previewTimer = null;
let loopTimer = null;
let isLooping = false;

// Recorder variables
let mediaRecorder = null;
let audioChunks = [];
let currentStream = null;
let currentAudioUrl = null;

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
    const lastWord = wordMap[wordMap.length - 1];
    if (!lastWord || charIndex < 0 || charIndex >= lastWord.end) {
        return;
    }

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
        textInput.disabled = true;
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
        textInput.disabled = false;
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
    if (loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = null;
    }

    if (!supportsSpeech) return;
    synth.cancel();
    utterance = null;
    resetHighlight();
    setUIState('idle');
    setStatus('停止しました。再生するテキストを入力して「再生」を押してください。');
}

function handleBoundary(event) {
    if (typeof event.charIndex !== 'number' || Number.isNaN(event.charIndex) || event.charIndex < 0) {
        return;
    }
    highlightByCharIndex(event.charIndex);
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
        setStatus(isLooping ? '読み上げ中 (ループ再生)' : '読み上げ中...');
        if (wordMap.length) {
            highlightByCharIndex(0);
        }
    };

    utterance.onend = () => {
        resetHighlight();
        if (isLooping && textInput.value.trim() !== '') {
            // Loop functionality
            loopTimer = setTimeout(() => {
                if (isLooping) speak();
                loopTimer = null;
            }, 500); // Short pause before looping
        } else {
            setUIState('idle');
            setStatus('読み上げが完了しました。');
        }
    };

    utterance.onpause = () => {
        setUIState('paused');
        setStatus('一時停止中です。');
    };

    utterance.onresume = () => {
        setUIState('playing');
        setStatus('読み上げを再開しました。');
    };

    utterance.onerror = (event) => {
        // Interrupted is common when cancelling
        if (event.error === 'interrupted') return;

        setUIState('idle');
        const reason = event?.error || '不明なエラー';
        setStatus(`読み上げ中にエラーが発生しました: ${reason}`);
        resetHighlight();
        utterance = null;
    };

    utterance.onboundary = (event) => {
        if (event.name === 'word' || !event.name) {
            handleBoundary(event);
        }
    };

    synth.speak(utterance);
}

// --- Recording Functions ---

async function setupRecorder() {
    // Feature detection for MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
        recordingStatus.textContent = 'お使いのブラウザは録音に対応していません (MediaRecorder not supported)。';
        recordButton.disabled = true;
        return;
    }

    recordButton.addEventListener('click', startRecording);
    stopRecordButton.addEventListener('click', stopRecording);
}

function cleanupRecordingStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

async function startRecording() {
    try {
        cleanupRecordingStream();
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        currentStream = stream;
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            currentAudioUrl = audioUrl;

            audioPlayback.src = audioUrl;
            audioPlayerContainer.hidden = false;
            downloadLink.href = audioUrl;

            // Cleanup stream after recording stops
            cleanupRecordingStream();
        };

        mediaRecorder.start();
        recordingStatus.textContent = '録音中...';
        recordButton.disabled = true;
        stopRecordButton.disabled = false;
    } catch (err) {
        console.error('Error accessing microphone:', err);
        recordingStatus.textContent = 'マイクへのアクセスが拒否されました。設定を確認してください。';
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        recordingStatus.textContent = '録音が完了しました。下のプレイヤーで確認できます。';
        recordButton.disabled = false;
        stopRecordButton.disabled = true;
    }
}

function init() {
    updateSliderLabels();
    updatePreview('');
    setUIState('idle');
    setupRecorder();

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
    stopButton.addEventListener('click', () => {
        isLooping = false;
        loopCheckbox.checked = false;
        cancelSpeech();
    });

    textInput.addEventListener('input', () => {
        if (previewTimer) {
            clearTimeout(previewTimer);
        }
        previewTimer = setTimeout(() => {
            updatePreview(textInput.value);
        }, PREVIEW_DEBOUNCE_MS);

        if (synth.speaking || synth.paused) {
            cancelSpeech();
        }
    });

    rateRange.addEventListener('input', () => {
        updateSliderLabels();
        if (synth.speaking || synth.paused) {
            cancelSpeech();
            setStatus('速度を変更しました。もう一度「再生」を押してください。');
        }
    });

    pitchRange.addEventListener('input', () => {
        updateSliderLabels();
        if (synth.speaking || synth.paused) {
            cancelSpeech();
            setStatus('ピッチを変更しました。もう一度「再生」を押してください。');
        }
    });

    loopCheckbox.addEventListener('change', (e) => {
        isLooping = e.target.checked;
    });

    blindModeCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            preview.classList.add('blind');
        } else {
            preview.classList.remove('blind');
        }
    });
}

init();
