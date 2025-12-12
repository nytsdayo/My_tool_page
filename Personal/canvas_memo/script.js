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
  tree: {
    cards: [
      { id: 1, x: 400, y: 120, w: 220, h: 120, text: "", shape: "rounded-rect" }
    ],
    connections: [],
    nextId: 2
  }
};

function addCard(shape = "rounded-rect") {
  const data = state.tree;
  const id = data.nextId++;

  let x = 100 + Math.random() * 400;
  let y = 100 + Math.random() * 400;
  let w = 220;
  let h = 120;

  // 丸の場合は正方形に
  if (shape === "circle") {
    w = 150;
    h = 150;
  }

  data.cards.push({ id, x, y, w, h, text: "", shape });
  render();
}

function render() {
  canvas.innerHTML = "";

  state.tree.cards.forEach(card => {
    const el = document.createElement("div");
    el.className = `card shape-${card.shape}`;
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
      
      state.draggingCard = card;
      state.dragOffset = {
        x: e.clientX - card.x,
        y: e.clientY - card.y
      };
      e.stopPropagation();
    });

    el.appendChild(ta);
    canvas.appendChild(el);
  });
}

// 形状ボタンのイベントリスナー
document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const shape = btn.dataset.shape;
    addCard(shape);
  });
});

window.addEventListener("mousemove", e => {
  // リサイズ処理
  if (state.resizingCard) {
    const dx = e.clientX - state.resizeStart.x;
    const dy = e.clientY - state.resizeStart.y;
    
    const minSize = 80;
    
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

window.addEventListener("mouseup", () => {
  state.draggingCard = null;
  state.resizingCard = null;
});

render();
