const canvas = document.getElementById("canvas");

const state = {
  pan: { x: 0, y: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },
  draggingCard: null,
  dragOffset: { x: 0, y: 0 },
  resizingCard: null,
  resizeStart: { x: 0, y: 0, w: 0, h: 0, cardX: 0, cardY: 0 },
  resizeCorner: null,
  currentTextSize: "large",
  selectedCard: null,
  drawingFreehand: false,
  currentPath: [],
  canvasLayout: "plain",
  canvasText: "",
  tree: {
    cards: [
      { id: 1, x: 400, y: 120, w: 180, h: 100, text: "", shape: "rounded-rect", textSize: "large" }
    ],
    freehandPaths: [],
    connections: [],
    nextId: 2,
    nextPathId: 1
  }
};

function addCard(shape = "rounded-rect") {
  const data = state.tree;
  const id = data.nextId++;

  let x = 100 + Math.random() * 400;
  let y = 100 + Math.random() * 400;
  let w = 180;
  let h = 100;

  // 円形の場合は幅と高さを同じにして正円を描画する
  if (shape === "circle") {
    w = 120;
    h = 120;
  }

  // フリーハンドの場合は描画モードに入る
  if (shape === "freehand") {
    state.drawingFreehand = true;
    state.currentPath = [];
    canvas.style.cursor = "crosshair";
    return;
  }

  data.cards.push({ id, x, y, w, h, text: "", shape, textSize: state.currentTextSize });
  render();
}

// 文字サイズに応じた最小サイズを取得
function getMinSize(textSize) {
  const minSizes = {
    small: 60,
    medium: 80,
    large: 100
  };
  return minSizes[textSize] || 80;
}

function render() {
  canvas.innerHTML = "";
  
  // レイアウトクラスを更新
  canvas.className = state.canvasLayout;

  // 罫線モードの場合、全体テキストエリアを追加
  if (state.canvasLayout === "lined") {
    const textarea = document.createElement("textarea");
    textarea.id = "canvas-textarea";
    textarea.value = state.canvasText;
    textarea.placeholder = "ここに文字を入力...";
    textarea.addEventListener("input", e => {
      state.canvasText = e.target.value;
    });
    canvas.appendChild(textarea);
  }

  // フリーハンドパスを描画
  if (state.tree.freehandPaths.length > 0) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("freehand-svg");
    svg.setAttribute("width", "794");
    svg.setAttribute("height", "1123");
    
    state.tree.freehandPaths.forEach(pathData => {
      if (pathData.points.length > 1) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M ${pathData.points[0].x} ${pathData.points[0].y}`;
        for (let i = 1; i < pathData.points.length; i++) {
          d += ` L ${pathData.points[i].x} ${pathData.points[i].y}`;
        }
        path.setAttribute("d", d);
        path.setAttribute("stroke", "#3b82f6");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        svg.appendChild(path);
      }
    });
    
    canvas.appendChild(svg);
  }

  state.tree.cards.forEach(card => {
    const el = document.createElement("div");
    el.className = `card shape-${card.shape} text-${card.textSize}`;
    if (state.selectedCard === card) {
      el.classList.add('selected');
    }
    el.style.left = card.x + "px";
    el.style.top = card.y + "px";
    el.style.width = card.w + "px";
    el.style.height = card.h + "px";

    const ta = document.createElement("textarea");
    ta.value = card.text;

    ta.addEventListener("input", e => {
      card.text = e.target.value;
    });

    // リサイズハンドルを追加
    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    corners.forEach(corner => {
      const handle = document.createElement("div");
      handle.className = `resize-handle resize-${corner}`;
      handle.addEventListener("mousedown", e => {
        state.resizingCard = card;
        state.resizeCorner = corner;
        state.resizeStart = {
          x: e.clientX,
          y: e.clientY,
          w: card.w,
          h: card.h,
          cardX: card.x,
          cardY: card.y
        };
        e.stopPropagation();
        e.preventDefault();
      });
      el.appendChild(handle);
    });

    // カードのドラッグ開始（textareaの外枠をクリックした場合）
    el.addEventListener("mousedown", e => {
      // textareaまたはリサイズハンドルをクリックした場合はドラッグしない
      if (e.target === ta || e.target.classList.contains('resize-handle')) {
        return;
      }
      
      // カードを選択
      state.selectedCard = card;
      updateTextSizeButtons();
      
      state.draggingCard = card;
      state.dragOffset = {
        x: e.clientX - card.x,
        y: e.clientY - card.y
      };
      e.stopPropagation();
    });

    // textareaクリック時もカードを選択
    ta.addEventListener("mousedown", e => {
      state.selectedCard = card;
      updateTextSizeButtons();
      render();
    });

    el.appendChild(ta);
    canvas.appendChild(el);
  });
}

// 文字サイズボタンの表示を更新
function updateTextSizeButtons() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
    if (state.selectedCard && btn.dataset.size === state.selectedCard.textSize) {
      btn.classList.add('active');
    } else if (!state.selectedCard && btn.dataset.size === state.currentTextSize) {
      btn.classList.add('active');
    }
  });
}

// 形状ボタンのイベントリスナー
document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const shape = btn.dataset.shape;
    addCard(shape);
  });
});

// 文字サイズボタンのイベントリスナー
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    
    // カードが選択されている場合は、そのカードの文字サイズを変更
    if (state.selectedCard) {
      state.selectedCard.textSize = size;
      render();
    }
    
    // デフォルトの文字サイズを更新（新規カード用）
    state.currentTextSize = size;
    updateTextSizeButtons();
  });
});

// レイアウトボタンのイベントリスナー
document.querySelectorAll('.layout-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const layout = btn.dataset.layout;
    
    // レイアウトが変わる場合のみ確認
    if (layout !== state.canvasLayout) {
      const hasContent = state.tree.cards.length > 0 || 
                        state.tree.freehandPaths.length > 0 || 
                        state.canvasText.trim() !== "";
      
      let shouldClear = false;
      if (hasContent) {
        shouldClear = confirm('レイアウトを変更します。現在の内容を削除しますか？\n\n「OK」= 削除する\n「キャンセル」= 保持する');
      }
      
      if (shouldClear) {
        state.tree.cards = [];
        state.tree.freehandPaths = [];
        state.canvasText = "";
        state.selectedCard = null;
      }
      
      state.canvasLayout = layout;
      
      // すべてのボタンからactiveクラスを削除
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
      // クリックされたボタンにactiveクラスを追加
      btn.classList.add('active');
      
      render();
    }
  });
});

// クリアボタンのイベントリスナー
document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('すべての内容を削除してよろしいですか？')) {
    state.tree.cards = [];
    state.tree.freehandPaths = [];
    state.canvasText = "";
    state.selectedCard = null;
    render();
  }
});

window.addEventListener("mousemove", e => {
  // フリーハンド描画中
  if (state.drawingFreehand) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    state.currentPath.push({ x, y });
    
    // リアルタイムでパスを描画
    render();
    if (state.currentPath.length > 0) {
      const svg = canvas.querySelector('.freehand-svg');
      if (svg) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M ${state.currentPath[0].x} ${state.currentPath[0].y}`;
        for (let i = 1; i < state.currentPath.length; i++) {
          d += ` L ${state.currentPath[i].x} ${state.currentPath[i].y}`;
        }
        path.setAttribute("d", d);
        path.setAttribute("stroke", "#3b82f6");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("opacity", "0.7");
        svg.appendChild(path);
      }
    }
    return;
  }

  // リサイズ処理
  if (state.resizingCard) {
    const dx = e.clientX - state.resizeStart.x;
    const dy = e.clientY - state.resizeStart.y;
    
    const minSize = getMinSize(state.resizingCard.textSize);
    
    if (state.resizeCorner === 'bottom-right') {
      state.resizingCard.w = Math.max(minSize, state.resizeStart.w + dx);
      state.resizingCard.h = Math.max(minSize, state.resizeStart.h + dy);
    } else if (state.resizeCorner === 'bottom-left') {
      const newW = Math.max(minSize, state.resizeStart.w - dx);
      state.resizingCard.x = state.resizeStart.cardX + (state.resizeStart.w - newW);
      state.resizingCard.w = newW;
      state.resizingCard.h = Math.max(minSize, state.resizeStart.h + dy);
    } else if (state.resizeCorner === 'top-right') {
      const newH = Math.max(minSize, state.resizeStart.h - dy);
      state.resizingCard.y = state.resizeStart.cardY + (state.resizeStart.h - newH);
      state.resizingCard.w = Math.max(minSize, state.resizeStart.w + dx);
      state.resizingCard.h = newH;
    } else if (state.resizeCorner === 'top-left') {
      const newW = Math.max(minSize, state.resizeStart.w - dx);
      const newH = Math.max(minSize, state.resizeStart.h - dy);
      state.resizingCard.x = state.resizeStart.cardX + (state.resizeStart.w - newW);
      state.resizingCard.y = state.resizeStart.cardY + (state.resizeStart.h - newH);
      state.resizingCard.w = newW;
      state.resizingCard.h = newH;
    }
    
    render();
    return;
  }
  
  // カードのドラッグ処理
  if (state.draggingCard) {
    state.draggingCard.x = e.clientX - state.dragOffset.x;
    state.draggingCard.y = e.clientY - state.dragOffset.y;
    render();
    return;
  }
});

// キャンバスクリックで選択解除
canvas.addEventListener("click", e => {
  if (e.target === canvas) {
    state.selectedCard = null;
    updateTextSizeButtons();
    render();
  }
});

// フリーハンド描画開始
canvas.addEventListener("mousedown", e => {
  if (state.drawingFreehand) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    state.currentPath = [{ x, y }];
  }
});

window.addEventListener("mouseup", () => {
  // フリーハンド描画終了
  if (state.drawingFreehand && state.currentPath.length > 1) {
    state.tree.freehandPaths.push({
      id: state.tree.nextPathId++,
      points: [...state.currentPath]
    });
    state.currentPath = [];
    state.drawingFreehand = false;
    canvas.style.cursor = "default";
    render();
  }
  
  state.draggingCard = null;
  state.resizingCard = null;
});

render();
