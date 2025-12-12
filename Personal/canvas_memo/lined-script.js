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
  minLines: 35, // Canvas高さ1123px / 行高さ32px = 約35行
  currentTool: null,
  isDrawing: false,
  drawStart: null,
  decorations: []
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
  
  // デコレーションを描画
  state.decorations.forEach(deco => {
    const decoEl = document.createElement("div");
    decoEl.className = `decoration ${deco.type}`;
    decoEl.style.left = deco.x + "px";
    decoEl.style.top = deco.y + "px";
    decoEl.style.width = deco.width + "px";
    if (deco.type === 'box') {
      decoEl.style.height = deco.height + "px";
    }
    canvas.appendChild(decoEl);
  });
  
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
    state.decorations = [];
    render();
  }
});

// ツールボタンのイベントリスナー
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tool = btn.dataset.tool;
    
    // すでに選択されているツールをクリックした場合は解除
    if (state.currentTool === tool) {
      state.currentTool = null;
      btn.classList.remove('active');
      canvas.style.cursor = "text";
    } else {
      // 他のボタンのアクティブクラスを削除
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      
      state.currentTool = tool;
      btn.classList.add('active');
      canvas.style.cursor = "crosshair";
    }
  });
});

// キャンバス上でのマウスイベント
canvas.addEventListener('mousedown', (e) => {
  if (state.currentTool && (e.target === canvas || canvas.contains(e.target))) {
    state.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    state.drawStart = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (state.isDrawing && state.currentTool) {
    // プレビュー表示（オプション）
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (state.isDrawing && state.currentTool && state.drawStart) {
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    const x = Math.min(state.drawStart.x, endX);
    const y = Math.min(state.drawStart.y, endY);
    const width = Math.abs(endX - state.drawStart.x);
    const height = Math.abs(endY - state.drawStart.y);
    
    // 最小サイズチェック（誤クリック防止）
    if (width > MIN_DRAW_SIZE || height > MIN_DRAW_SIZE) {
      if (state.currentTool === 'highlighter') {
        // 蛍光ペンは行の高さに合わせる
        const lineY = Math.floor(y / LINE_HEIGHT) * LINE_HEIGHT;
        state.decorations.push({
          type: 'highlighter',
          x: x,
          y: lineY,
          width: width
        });
      } else if (state.currentTool === 'box') {
        // 枠線
        state.decorations.push({
          type: 'box',
          x: x,
          y: y,
          width: width,
          height: height
        });
      } else if (state.currentTool === 'underline') {
        // 下線は行の下部に配置
        const lineY = Math.floor(y / LINE_HEIGHT) * LINE_HEIGHT + LINE_HEIGHT - 3;
        state.decorations.push({
          type: 'underline',
          x: x,
          y: lineY,
          width: width
        });
      }
      
      render();
    }
    
    state.isDrawing = false;
    state.drawStart = null;
  }
});

render();
