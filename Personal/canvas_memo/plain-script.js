import * as common from './common.js';

const canvas = document.getElementById("canvas");

const state = {
  draggingCard: null,
  dragOffset: { x: 0, y: 0 },
  resizingCard: null,
  resizeStart: { x: 0, y: 0, w: 0, h: 0, cardX: 0, cardY: 0 },
  resizeCorner: null,
  currentTextSize: "large",
  selectedCard: null,
  drawingFreehand: false,
  currentPath: [],
  tree: {
    cards: [],
    freehandPaths: [],
    nextId: 1,
    nextPathId: 1
  }
};

function render() {
  canvas.innerHTML = "";

  // フリーハンドパスを描画
  const svg = common.createFreehandSVG(state.tree.freehandPaths);
  if (svg) {
    canvas.appendChild(svg);
  }

  // カードを描画
  state.tree.cards.forEach(card => {
    const el = common.createCardElement(card, state, {
      updateTextSizeButtons: () => common.updateTextSizeButtons(state),
      onRender: render
    });
    canvas.appendChild(el);
  });
}

function updateTextSizeButtons() {
  common.updateTextSizeButtons(state);
}

document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const shape = btn.dataset.shape;
    if (common.addCard(state, shape)) {
      render();
    }
  });
});

document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    
    if (state.selectedCard) {
      state.selectedCard.textSize = size;
      render();
    }
    
    state.currentTextSize = size;
    updateTextSizeButtons();
  });
});

document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('すべての内容を削除してよろしいですか？')) {
    state.tree.cards = [];
    state.tree.freehandPaths = [];
    state.selectedCard = null;
    render();
  }
});

window.addEventListener("mousemove", e => {
  // フリーハンド描画中
  const freehandResult = common.handleFreehandDrawing(state, e, canvas);
  if (freehandResult) {
    render();
    common.addFreehandPreviewPath(canvas, state.currentPath);
    return;
  }

  // リサイズ処理
  if (common.handleResize(state, e)) {
    render();
    return;
  }
  
  // カードのドラッグ処理
  if (common.handleDrag(state, e)) {
    render();
    return;
  }
});

canvas.addEventListener("click", e => {
  if (e.target === canvas) {
    state.selectedCard = null;
    updateTextSizeButtons();
    render();
  }
});

canvas.addEventListener("mousedown", e => {
  common.startFreehandDrawing(state, e, canvas);
});

window.addEventListener("mouseup", () => {
  if (common.finishFreehandDrawing(state, canvas)) {
    render();
  }
  
  common.handleMouseUp(state);
});

render();
