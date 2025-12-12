// 共通のカード管理とインタラクション機能

/**
 * 文字サイズに応じた最小サイズを取得
 */
export function getMinSize(textSize) {
  const minSizes = {
    small: 60,
    medium: 80,
    large: 100
  };
  return minSizes[textSize] || 80;
}

/**
 * カード追加機能
 */
export function addCard(state, shape = "rounded-rect") {
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
    document.getElementById("canvas").style.cursor = "crosshair";
    return;
  }

  data.cards.push({ id, x, y, w, h, text: "", shape, textSize: state.currentTextSize });
  return true; // カードが追加されたことを示す
}

/**
 * フリーハンドパスのSVG要素を作成
 */
export function createFreehandSVG(freehandPaths) {
  if (freehandPaths.length === 0) {
    return null;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("freehand-svg");
  svg.setAttribute("width", "794");
  svg.setAttribute("height", "1123");
  
  freehandPaths.forEach(pathData => {
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
  
  return svg;
}

/**
 * カード要素を作成
 */
export function createCardElement(card, state, options = {}) {
  const { onRender } = options;

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
    if (e.target === ta || e.target.classList.contains('resize-handle')) {
      return;
    }
    
    state.selectedCard = card;
    if (options.updateTextSizeButtons) {
      options.updateTextSizeButtons();
    }
    
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
    if (options.updateTextSizeButtons) {
      options.updateTextSizeButtons();
    }
    if (onRender) {
      onRender();
    }
  });

  el.appendChild(ta);
  return el;
}

/**
 * 文字サイズボタンの表示を更新
 */
export function updateTextSizeButtons(state) {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
    if (state.selectedCard && btn.dataset.size === state.selectedCard.textSize) {
      btn.classList.add('active');
    } else if (!state.selectedCard && btn.dataset.size === state.currentTextSize) {
      btn.classList.add('active');
    }
  });
}

/**
 * マウスムーブイベントハンドラー - リサイズ処理
 */
export function handleResize(state, e) {
  if (!state.resizingCard) {
    return false;
  }

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
  
  return true; // リサイズが処理されたことを示す
}

/**
 * マウスムーブイベントハンドラー - ドラッグ処理
 */
export function handleDrag(state, e) {
  if (!state.draggingCard) {
    return false;
  }

  state.draggingCard.x = e.clientX - state.dragOffset.x;
  state.draggingCard.y = e.clientY - state.dragOffset.y;
  return true; // ドラッグが処理されたことを示す
}

/**
 * フリーハンド描画処理
 */
export function handleFreehandDrawing(state, e, canvas) {
  if (!state.drawingFreehand) {
    return null;
  }

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  state.currentPath.push({ x, y });
  
  return { x, y, shouldRender: true };
}

/**
 * フリーハンド描画のリアルタイムプレビューパスを追加
 */
export function addFreehandPreviewPath(canvas, currentPath) {
  if (currentPath.length === 0) {
    return;
  }

  const svg = canvas.querySelector('.freehand-svg');
  if (svg) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let d = `M ${currentPath[0].x} ${currentPath[0].y}`;
    for (let i = 1; i < currentPath.length; i++) {
      d += ` L ${currentPath[i].x} ${currentPath[i].y}`;
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

/**
 * フリーハンド描画開始
 */
export function startFreehandDrawing(state, e, canvas) {
  if (!state.drawingFreehand) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  state.currentPath = [{ x, y }];
}

/**
 * フリーハンド描画終了
 */
export function finishFreehandDrawing(state, canvas) {
  if (state.drawingFreehand && state.currentPath.length > 1) {
    state.tree.freehandPaths.push({
      id: state.tree.nextPathId++,
      points: [...state.currentPath]
    });
    state.currentPath = [];
    state.drawingFreehand = false;
    canvas.style.cursor = "default";
    return true; // 描画が完了したことを示す
  }
  return false;
}

/**
 * マウスアップ時の処理
 */
export function handleMouseUp(state) {
  state.draggingCard = null;
  state.resizingCard = null;
}
