const canvas = document.getElementById("canvas");

// タッチイベントとマウスイベントを統一的に扱うヘルパー関数
function getEventCoordinates(e) {
  if (e.touches && e.touches.length > 0) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  return { clientX: e.clientX, clientY: e.clientY };
}

const state = {
  canvasText: "",
  lines: [],
  minLines: 35 // Canvas高さ1123px / 行高さ32px = 約35行
};

function ensureMinimumLines(text) {
  const lines = text.split('\n');
  const currentLines = lines.length;
  
  if (currentLines < state.minLines) {
    const linesToAdd = state.minLines - currentLines;
    return text + '\n'.repeat(linesToAdd);
  }
  
  return text;
}

function render() {
  canvas.innerHTML = "";
  
  const textarea = document.createElement("textarea");
  textarea.id = "canvas-textarea";
  
  // 初期値に最低限の改行を追加
  const initialText = ensureMinimumLines(state.canvasText);
  textarea.value = initialText;
  state.canvasText = initialText;
  
  textarea.placeholder = "ここに文字を入力...";
  
  textarea.addEventListener("input", e => {
    // 入力時に最低限の行数を保つ
    const newText = ensureMinimumLines(e.target.value);
    
    // カーソル位置を保存
    const cursorPosition = textarea.selectionStart;
    
    state.canvasText = newText;
    state.lines = newText.split('\n');
    
    // テキストが変更された場合のみ更新
    if (textarea.value !== newText) {
      textarea.value = newText;
      // カーソル位置を復元
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
  
  // クリック/タッチ位置に応じてカーソルを移動
  const clickHandler = (e) => {
    const coords = getEventCoordinates(e);
    const rect = textarea.getBoundingClientRect();
    const y = coords.clientY - rect.top;
    const lineHeight = 32; // CSSのline-heightと一致
    const clickedLine = Math.floor(y / lineHeight);
    
    // 現在の行数
    const currentLines = textarea.value.split('\n').length;
    
    // クリックされた行が現在の行数より多い場合、改行を追加
    if (clickedLine >= currentLines) {
      const linesToAdd = clickedLine - currentLines + 1;
      textarea.value += '\n'.repeat(linesToAdd);
      state.canvasText = textarea.value;
      state.lines = textarea.value.split('\n');
    }
    
    // カーソル位置を計算
    const lines = textarea.value.split('\n');
    // clickedLineが行数を超えないようにクリップ
    const safeLine = Math.min(clickedLine, lines.length - 1);
    let position = 0;
    for (let i = 0; i < safeLine; i++) {
      position += lines[i].length + 1; // +1 for newline
    }
    // safeLine行目の先頭にカーソルを置く
    
    textarea.setSelectionRange(position, position);
    textarea.focus();
  };
  
  textarea.addEventListener("click", clickHandler);
  textarea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    clickHandler(e);
  });
  
  canvas.appendChild(textarea);
}

document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('すべての内容を削除してよろしいですか？')) {
    state.canvasText = "";
    state.lines = [];
    render();
  }
});

render();
