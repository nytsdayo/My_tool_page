const voiceButton = document.getElementById('voiceButton');
const status = document.getElementById('status');
const result = document.getElementById('result');
const interim = document.getElementById('interim');
const notSupported = document.getElementById('notSupported');
const languageSelect = document.getElementById('languageSelect');
const pageTitle = document.getElementById('pageTitle');
const resultAreaTitle = document.querySelector('.result-area h3');
let finalText = '';

// Translations for UI elements
const translations = {
    'ja-JP': {
        title: '🎤 音声入力ページ',
        notSupported: 'お使いのブラウザは音声認識に対応していません。<br>Chrome または Edge をお使いください。',
        statusReady: 'マイクボタンをクリックして音声入力を開始',
        statusListening: '🎤 音声を聞いています...',
        resultTitle: '認識結果:',
        resultPlaceholder: 'ここに認識結果が表示されます...',
        errorPrefix: 'エラーが発生しました: '
    },
    'en-US': {
        title: '🎤 Voice Input Page',
        notSupported: 'Your browser does not support speech recognition.<br>Please use Chrome or Edge.',
        statusReady: 'Click the microphone button to start voice input',
        statusListening: '🎤 Listening...',
        resultTitle: 'Recognition Result:',
        resultPlaceholder: 'Recognition results will appear here...',
        errorPrefix: 'An error occurred: '
    },
    'en-GB': {
        title: '🎤 Voice Input Page',
        notSupported: 'Your browser does not support speech recognition.<br>Please use Chrome or Edge.',
        statusReady: 'Click the microphone button to start voice input',
        statusListening: '🎤 Listening...',
        resultTitle: 'Recognition Result:',
        resultPlaceholder: 'Recognition results will appear here...',
        errorPrefix: 'An error occurred: '
    }
};

function updateUILanguage(lang) {
    const t = translations[lang];
    pageTitle.textContent = t.title;
    notSupported.innerHTML = t.notSupported;
    resultAreaTitle.textContent = t.resultTitle;
    if (!finalText) {
        result.textContent = t.resultPlaceholder;
    }
    if (!isListening) {
        status.textContent = t.statusReady;
    }
}

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let isListening = false;

if (!SpeechRecognition) {
    notSupported.style.display = 'block';
    voiceButton.style.display = 'none';
    status.style.display = 'none';
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = languageSelect.value;
    recognition.interimResults = true;
    recognition.continuous = true;

    // Handle language change
    languageSelect.addEventListener('change', () => {
        const selectedLang = languageSelect.value;
        recognition.lang = selectedLang;
        updateUILanguage(selectedLang);
        // Reset if currently listening
        if (isListening) {
            recognition.stop();
        }
    });

    // Initialize UI language on page load
    updateUILanguage(languageSelect.value);

    voiceButton.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.addEventListener('start', () => {
        isListening = true;
        voiceButton.classList.add('listening');
        const t = translations[languageSelect.value];
        status.textContent = t.statusListening;
        finalText = '';
        result.textContent = '';
        interim.textContent = '';
    });

    recognition.addEventListener('end', () => {
        isListening = false;
        voiceButton.classList.remove('listening');
        const t = translations[languageSelect.value];
        status.textContent = t.statusReady;
        interim.textContent = '';
    });

    recognition.addEventListener('result', (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalText += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        result.textContent = finalText;
        interim.textContent = interimTranscript;
    });

    recognition.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event.error);
        const t = translations[languageSelect.value];
        status.textContent = t.errorPrefix + event.error;
        isListening = false;
        voiceButton.classList.remove('listening');
    });
}
