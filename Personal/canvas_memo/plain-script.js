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

function addCard(shape = "rounded-rect") {
  const data = state.tree;
  const id = data.nextId++;

  let x = 100 + Math.random() * 400;
  let y = 100 + Math.random() * 400;
  let w = 180;
  let h = 100;

  if (shape === "circle") {
    w = 120;
    h = 120;
  }

  if (shape === "freehand") {
    state.drawingFreehand = true;
    state.currentPath = [];
    canvas.style.cursor = "crosshair";
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

    el.addEventListener("mousedown", e => {
      if (e.target === ta || e.target.classList.contains('resize-handle')) {
        return;
      }
      
      state.selectedCard = card;
      updateTextSizeButtons();
      
      state.draggingCard = card;
      state.dragOffset = {
        x: e.clientX - card.x,
        y: e.clientY - card.y
      };
      e.stopPropagation();
    });

    ta.addEventListener("mousedown", e => {
      state.selectedCard = card;
      updateTextSizeButtons();
      render();
    });

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
    addCard(shape);
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
  if (state.drawingFreehand) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
  
  if (state.draggingCard) {
    state.draggingCard.x = e.clientX - state.dragOffset.x;
    state.draggingCard.y = e.clientY - state.dragOffset.y;
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
  if (state.drawingFreehand) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    state.currentPath = [{ x, y }];
  }
});

window.addEventListener("mouseup", () => {
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
