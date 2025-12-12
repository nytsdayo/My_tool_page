const canvas = document.getElementById("canvas");

// タッチイベントとマウスイベントを統一的に扱うヘルパー関数
function getEventCoordinates(e) {
  if (e.touches && e.touches.length > 0) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  return { clientX: e.clientX, clientY: e.clientY };
}

function addUnifiedEventListener(element, eventType, handler) {
  if (eventType === 'pointerdown') {
    element.addEventListener('mousedown', handler);
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handler(e);
    });
  } else if (eventType === 'pointermove') {
    element.addEventListener('mousemove', handler);
    element.addEventListener('touchmove', (e) => {
      e.preventDefault();
      handler(e);
    });
  } else if (eventType === 'pointerup') {
    element.addEventListener('mouseup', handler);
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      handler(e);
    });
  }
}
const FREEHAND_LONG_PRESS_MS = 300; // フリーハンド長押し時間（ミリ秒）

const state = {
  draggingCard: null,
  dragOffset: { x: 0, y: 0 },
  resizingCard: null,
  resizeStart: { x: 0, y: 0, w: 0, h: 0, cardX: 0, cardY: 0 },
  resizeCorner: null,
  currentTextSize: "large",
  selectedCard: null,
  drawingFreehand: false,
  freehandPressTimer: null,
  freehandLongPressThreshold: FREEHAND_LONG_PRESS_MS,
  currentPath: [],
  canvasData: {
    cards: [],
    freehandPaths: [],
    nextId: 1,
    nextPathId: 1
  }
};

function addCard(shape = "rounded-rect") {
  const data = state.canvasData;
  const id = data.nextId++;

  let x = 100 + Math.random() * 400;
  let y = 100 + Math.random() * 400;
  let w = 180;
  let h = 100;

  if (shape === "circle") {
    w = 120;
    h = 120;
  }

  if (shape === "arrow") {
    w = 200;
    h = 60;
  }

  if (shape === "freehand") {
    // フリーハンドモードはボタンを押下し続けている状態で有効化
    // 何もしない（長押しで有効化される）
    return;
  }

  data.cards.push({ id, x, y, w, h, text: "", shape, textSize: state.currentTextSize });
  render();
}

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

  if (state.canvasData.freehandPaths.length > 0) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("freehand-svg");
    svg.setAttribute("width", "794");
    svg.setAttribute("height", "1123");
    
    state.canvasData.freehandPaths.forEach(pathData => {
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

  state.canvasData.cards.forEach(card => {
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

    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    corners.forEach(corner => {
      const handle = document.createElement("div");
      handle.className = `resize-handle resize-${corner}`;
      
      const resizeHandler = (e) => {
        const coords = getEventCoordinates(e);
        state.resizingCard = card;
        state.resizeCorner = corner;
        state.resizeStart = {
          x: coords.clientX,
          y: coords.clientY,
          w: card.w,
          h: card.h,
          cardX: card.x,
          cardY: card.y
        };
        e.stopPropagation();
        e.preventDefault();
      };
      
      addUnifiedEventListener(handle, 'pointerdown', resizeHandler);
      el.appendChild(handle);
    });

    const dragHandler = (e) => {
      if (e.target === ta || e.target.classList.contains('resize-handle')) {
        return;
      }
      
      const coords = getEventCoordinates(e);
      state.selectedCard = card;
      updateTextSizeButtons();
      
      state.draggingCard = card;
      state.dragOffset = {
        x: coords.clientX - card.x,
        y: coords.clientY - card.y
      };
      e.stopPropagation();
    };
    
    addUnifiedEventListener(el, 'pointerdown', dragHandler);

    const textareaClickHandler = (e) => {
      state.selectedCard = card;
      updateTextSizeButtons();
      render();
    };
    
    addUnifiedEventListener(ta, 'pointerdown', textareaClickHandler);

    el.appendChild(ta);
    canvas.appendChild(el);
  });
}

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

document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const shape = btn.dataset.shape;
    if (shape !== 'freehand') {
      addCard(shape);
    }
  });
  
  // フリーハンドボタンのみ長押しで有効化
  if (btn.dataset.shape === 'freehand') {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      state.freehandPressTimer = setTimeout(() => {
        state.drawingFreehand = true;
        state.currentPath = [];
        canvas.style.cursor = "crosshair";
        btn.classList.add('active');
      }, state.freehandLongPressThreshold);
    });
    
    btn.addEventListener('mouseup', () => {
      if (state.freehandPressTimer) {
        clearTimeout(state.freehandPressTimer);
        state.freehandPressTimer = null;
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      if (state.freehandPressTimer) {
        clearTimeout(state.freehandPressTimer);
        state.freehandPressTimer = null;
      }
    });
  }
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
    state.canvasData.cards = [];
    state.canvasData.freehandPaths = [];
    state.selectedCard = null;
    render();
  }
});

const moveHandler = (e) => {
  const coords = getEventCoordinates(e);
  
  if (state.drawingFreehand) {
    const rect = canvas.getBoundingClientRect();
    const x = coords.clientX - rect.left;
    const y = coords.clientY - rect.top;
    state.currentPath.push({ x, y });
    
    // 一時パスのみを更新（render()は呼ばない）
    if (state.currentPath.length > 0) {
      let svg = canvas.querySelector('.freehand-svg');
      if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("freehand-svg");
        svg.setAttribute("width", "794");
        svg.setAttribute("height", "1123");
        canvas.appendChild(svg);
      }
      
      // 既存の一時パスを取得または作成
      let tempPath = svg.querySelector('.freehand-temp-path');
      if (!tempPath) {
        tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        tempPath.classList.add('freehand-temp-path');
        svg.appendChild(tempPath);
      }
      
      let d = `M ${state.currentPath[0].x} ${state.currentPath[0].y}`;
      for (let i = 1; i < state.currentPath.length; i++) {
        d += ` L ${state.currentPath[i].x} ${state.currentPath[i].y}`;
      }
      tempPath.setAttribute("d", d);
      tempPath.setAttribute("stroke", "#3b82f6");
      tempPath.setAttribute("stroke-width", "2");
      tempPath.setAttribute("fill", "none");
      tempPath.setAttribute("stroke-linecap", "round");
      tempPath.setAttribute("stroke-linejoin", "round");
      tempPath.setAttribute("opacity", "0.7");
    }
    return;
  }

  if (state.resizingCard) {
    const dx = coords.clientX - state.resizeStart.x;
    const dy = coords.clientY - state.resizeStart.y;
    
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
  
  if (state.draggingCard) {
    state.draggingCard.x = coords.clientX - state.dragOffset.x;
    state.draggingCard.y = coords.clientY - state.dragOffset.y;
    render();
    return;
  }
};

addUnifiedEventListener(window, 'pointermove', moveHandler);

const canvasDownHandler = (e) => {
  // フリーハンドモードの場合、描画開始
  if (state.drawingFreehand) {
    const coords = getEventCoordinates(e);
    const rect = canvas.getBoundingClientRect();
    const x = coords.clientX - rect.left;
    const y = coords.clientY - rect.top;
    state.currentPath = [{ x, y }];
  }
  
  // canvasの背景をクリックした場合、選択解除
  if (e.target === canvas) {
    state.selectedCard = null;
    updateTextSizeButtons();
    render();
  }
};

addUnifiedEventListener(canvas, 'pointerdown', canvasDownHandler);

const upHandler = () => {
  if (state.drawingFreehand && state.currentPath.length > 1) {
    state.canvasData.freehandPaths.push({
      id: state.canvasData.nextPathId++,
      points: [...state.currentPath]
    });
    state.currentPath = [];
    state.drawingFreehand = false;
    canvas.style.cursor = "default";
    // フリーハンドボタンのアクティブクラスを削除
    document.querySelector('.shape-btn[data-shape="freehand"]')?.classList.remove('active');
    render();
  }
  
  state.draggingCard = null;
  state.resizingCard = null;
};

addUnifiedEventListener(window, 'pointerup', upHandler);

render();
