const inputTextarea = document.getElementById('input');
const outputTextarea = document.getElementById('output');
const cleanBtn = document.getElementById('cleanBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

/**
 * テキストからカタカナ、「|」、「,」、タイムスタンプを除去し、各行末に句読点を追加する
 * @param {string} text - 入力テキスト
 * @returns {string} - クリーンなテキスト
 */
function cleanText(text) {
    // 行ごとに処理
    const lines = text.split('\n');
    const cleanedLines = lines.map(line => {
        // タイムスタンプ行（HH:MM:SS形式）を除去
        if (/^\d{1,2}:\d{2}:\d{2}\s*$/.test(line.trim())) {
            return '';
        }

        // |に続くカタカナ（長音符ー、小文字、繰り返し記号を含む）を除去
        let cleaned = line.replace(/\|[\u30A0-\u30FF]+/g, '');

        // ,に続くカタカナを除去し、残りのカンマも除去
        cleaned = cleaned.replace(/,[\u30A0-\u30FF]*/g, '');

        // 行末に句読点を追加（空行でなく、既に句読点がない場合）
        const trimmed = cleaned.trim();
        if (trimmed && !/[。、！？!?]$/.test(trimmed)) {
            cleaned = trimmed + '。';
        }

        return cleaned;
    });

    // 空行を除去して結合
    return cleanedLines.filter(line => line.trim() !== '').join('\n');
}

// 変換ボタン
cleanBtn.addEventListener('click', () => {
    const inputText = inputTextarea.value;
    const cleanedText = cleanText(inputText);
    outputTextarea.value = cleanedText;
});

// 入力時にリアルタイム変換
inputTextarea.addEventListener('input', () => {
    const inputText = inputTextarea.value;
    const cleanedText = cleanText(inputText);
    outputTextarea.value = cleanedText;
});

// クリアボタン
clearBtn.addEventListener('click', () => {
    inputTextarea.value = '';
    outputTextarea.value = '';
    inputTextarea.focus();
});

// コピーボタン
copyBtn.addEventListener('click', async () => {
    const textToCopy = outputTextarea.value;
    if (!textToCopy) {
        return;
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        copyBtn.textContent = '✅ コピーしました!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 結果をコピー';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        // フォールバック: 古いブラウザ対応
        outputTextarea.select();
        document.execCommand('copy');
        copyBtn.textContent = '✅ コピーしました!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 結果をコピー';
            copyBtn.classList.remove('copied');
        }, 2000);
    }
});
