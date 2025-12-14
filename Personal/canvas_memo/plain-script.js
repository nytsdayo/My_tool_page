const canvas = document.getElementById("canvas");

// タッチイベントとマウスイベントを統一的に扱うヘルパー関数
function getEventCoordinates(e) {
  if (e.touches && e.touches.length > 0) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  return { clientX: e.clientX, clientY: e.clientY };
}

// 内部座標系（794x1123）への変換ヘルパー
function getInternalPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  // 現在の表示幅からスケールを計算 (内部幅は794px固定)
  const scale = rect.width / 794;
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
    scale: scale
  };
}

function addUnifiedEventListener(element, eventType, handler) {
  if (eventType === 'pointerdown') {
    element.addEventListener('mousedown', handler);
    element.addEventListener('touchstart', (e) => {
      // e.preventDefault(); // テキスト入力などができなくなるため、必要な場合のみ呼ぶ
      if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
      handler(e);
    }, { passive: false });
  } else if (eventType === 'pointermove') {
    element.addEventListener('mousemove', handler);
    element.addEventListener('touchmove', (e) => {
      e.preventDefault();
      handler(e);
    }, { passive: false });
  } else if (eventType === 'pointerup') {
    element.addEventListener('mouseup', handler);
    element.addEventListener('touchend', (e) => {
       // touchendにはtouchesがないためchangedTouchesを使う場合があるが、
       // ここではhandler内でe.touchesを参照しない設計にするか、注意が必要。
       // handler(e)を呼ぶが、座標取得が必要な場合は注意。
      e.preventDefault();
      handler(e);
    }, { passive: false });
  }
}
const FREEHAND_LONG_PRESS_MS = 300; // フリーハンド長押し時間（ミリ秒）

const state = {
  draggingCard: null,
  dragOffset: { x: 0, y: 0 },
  resizingCard: null,
  resizeStart: { x: 0, y: 0, w: 0, h: 0, cardX: 0, cardY: 0 },
  resizeCorner: null,
  rotatingCard: null,
  rotateStartAngle: 0,
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
  let h = 50; // デフォルト高さを小さく変更

  if (shape === "circle") {
    w = 120;
    h = 120;
  }

  if (shape === "arrow") {
    w = 200;
    h = 40; // 矢印の高さ（ヒットエリア）
  }

  if (shape === "freehand") {
    return;
  }

  data.cards.push({
    id,
    x,
    y,
    w,
    h,
    text: "",
    shape,
    textSize: state.currentTextSize,
    angle: 0 // 回転角度（度）
  });
  render();
}

function getMinSize(textSize) {
  // 最小サイズを小さく設定
  const minSizes = {
    small: 30,
    medium: 40,
    large: 50
  };
  return minSizes[textSize] || 40;
}

function render() {
  canvas.innerHTML = "";

  // フリーハンド描画レイヤー
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

  // カード（図形）描画
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

    // 回転適用
    if (card.angle) {
      el.style.transform = `rotate(${card.angle}deg)`;
    }

    const ta = document.createElement("textarea");
    ta.value = card.text;

    ta.addEventListener("input", e => {
      card.text = e.target.value;
    });

    // 選択時のみハンドルを表示
    if (state.selectedCard === card) {
      // リサイズハンドル
      const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      corners.forEach(corner => {
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-${corner}`;

        const resizeHandler = (e) => {
          const coords = getEventCoordinates(e);
          const internal = getInternalPoint(coords.clientX, coords.clientY);

          state.resizingCard = card;
          state.resizeCorner = corner;
          state.resizeStart = {
            rawX: coords.clientX,
            rawY: coords.clientY,
            x: internal.x,
            y: internal.y,
            w: card.w,
            h: card.h,
            cardX: card.x,
            cardY: card.y,
            angle: card.angle || 0
          };
          e.stopPropagation();
          // e.preventDefault(); // ここで止めるとtouchmoveが発火しない可能性があるが、Unifiedで処理
        };

        addUnifiedEventListener(handle, 'pointerdown', resizeHandler);
        el.appendChild(handle);
      });

      // 回転ハンドル
      const rotateHandle = document.createElement("div");
      rotateHandle.className = "rotate-handle";
      const rotateStartHandler = (e) => {
        const coords = getEventCoordinates(e);
        const internal = getInternalPoint(coords.clientX, coords.clientY);

        state.rotatingCard = card;

        // カードの中心計算
        const cx = card.x + card.w / 2;
        const cy = card.y + card.h / 2;

        // 現在のマウス角度
        state.rotateStartAngle = Math.atan2(internal.y - cy, internal.x - cx) * 180 / Math.PI;
        state.initialCardAngle = card.angle || 0;

        e.stopPropagation();
      };
      addUnifiedEventListener(rotateHandle, 'pointerdown', rotateStartHandler);
      el.appendChild(rotateHandle);
    }

    // ドラッグハンドラ
    const dragHandler = (e) => {
      if (e.target === ta || e.target.classList.contains('resize-handle') || e.target.classList.contains('rotate-handle')) {
        return;
      }
      
      const coords = getEventCoordinates(e);
      state.selectedCard = card;
      updateTextSizeButtons();
      
      state.draggingCard = card;

      const internal = getInternalPoint(coords.clientX, coords.clientY);
      state.dragOffset = {
        x: internal.x - card.x,
        y: internal.y - card.y
      };

      render(); // 選択状態更新のため再描画
      e.stopPropagation();
    };
    
    addUnifiedEventListener(el, 'pointerdown', dragHandler);

    const textareaClickHandler = (e) => {
      // テキストエリアクリックでも選択状態にする
      if (state.selectedCard !== card) {
        state.selectedCard = card;
        updateTextSizeButtons();
        render();
      }
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
    const internal = getInternalPoint(coords.clientX, coords.clientY);
    state.currentPath.push({ x: internal.x, y: internal.y });
    
    if (state.currentPath.length > 0) {
      let svg = canvas.querySelector('.freehand-svg');
      if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("freehand-svg");
        svg.setAttribute("width", "794");
        svg.setAttribute("height", "1123");
        canvas.appendChild(svg);
      }
      
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
    // スケール考慮済みの現在位置
    const internal = getInternalPoint(coords.clientX, coords.clientY);

    // 画面上の移動量（スケール補正前）ではなく、内部座標系での差分を使う
    const dxGlobal = internal.x - state.resizeStart.x;
    const dyGlobal = internal.y - state.resizeStart.y;
    
    // 回転を考慮したローカル座標系での移動量計算
    const angleRad = (state.resizingCard.angle || 0) * Math.PI / 180;
    const dxLocal = dxGlobal * Math.cos(angleRad) + dyGlobal * Math.sin(angleRad);
    const dyLocal = -dxGlobal * Math.sin(angleRad) + dyGlobal * Math.cos(angleRad);

    const minSize = getMinSize(state.resizingCard.textSize);
    
    // 基本方針: 右ハンドルは幅(Length)を変更、下ハンドルは高さ(Thickness)を変更
    // 回転している場合でも、ローカル軸に沿って伸縮させる

    if (state.resizeCorner === 'bottom-right') {
      state.resizingCard.w = Math.max(minSize, state.resizeStart.w + dxLocal);
      state.resizingCard.h = Math.max(minSize, state.resizeStart.h + dyLocal);
    } else if (state.resizeCorner === 'bottom-left') {
      // 左側を動かす場合、本来は位置(x,y)と幅(w)を同時に変える必要があるが、
      // 回転時の座標計算が複雑になるため、簡易的に幅の変更のみ行うか、
      // あるいは回転していない場合のみ位置補正を行うか。
      // ここでは簡易実装として、回転時は幅のみ変更（右へ伸びる）挙動になるのを許容するか、
      // もしくは回転なしの場合だけ従来通り動くようにする。

      if (state.resizingCard.angle) {
        // 回転時は挙動が難しいので、とりあえず幅変更のみ（中心はずれる）
        // または、実装をスキップする
      } else {
         const newW = Math.max(minSize, state.resizeStart.w - dxLocal);
         state.resizingCard.x = state.resizeStart.cardX + (state.resizeStart.w - newW);
         state.resizingCard.w = newW;
         state.resizingCard.h = Math.max(minSize, state.resizeStart.h + dyLocal);
      }
    } else if (state.resizeCorner === 'top-right') {
      if (state.resizingCard.angle) {
         // 回転時は高さ変更のみ
         state.resizingCard.w = Math.max(minSize, state.resizeStart.w + dxLocal);
         state.resizingCard.h = Math.max(minSize, state.resizeStart.h - dyLocal);
      } else {
         const newH = Math.max(minSize, state.resizeStart.h - dyLocal);
         state.resizingCard.y = state.resizeStart.cardY + (state.resizeStart.h - newH);
         state.resizingCard.w = Math.max(minSize, state.resizeStart.w + dxLocal);
         state.resizingCard.h = newH;
      }
    } else if (state.resizeCorner === 'top-left') {
      if (state.resizingCard.angle) {
         // 回転時は簡易挙動
      } else {
         const newW = Math.max(minSize, state.resizeStart.w - dxLocal);
         const newH = Math.max(minSize, state.resizeStart.h - dyLocal);
         state.resizingCard.x = state.resizeStart.cardX + (state.resizeStart.w - newW);
         state.resizingCard.y = state.resizeStart.cardY + (state.resizeStart.h - newH);
         state.resizingCard.w = newW;
         state.resizingCard.h = newH;
      }
    }
    
    // 矢印モード等で、右ハンドル操作時に直感的な長さ変更ができるように、
    // 上記ロジックは bottom-right をメインに使うことを想定。
    // 回転時の top/left 操作の不整合は許容範囲とする（ユーザーは矢印の先端＝右をドラッグするはず）

    render();
    return;
  }

  if (state.rotatingCard) {
    const internal = getInternalPoint(coords.clientX, coords.clientY);
    const cx = state.rotatingCard.x + state.rotatingCard.w / 2;
    const cy = state.rotatingCard.y + state.rotatingCard.h / 2;

    const currentAngle = Math.atan2(internal.y - cy, internal.x - cx) * 180 / Math.PI;
    const deltaAngle = currentAngle - state.rotateStartAngle;

    state.rotatingCard.angle = (state.initialCardAngle + deltaAngle) % 360;
    render();
    return;
  }
  
  if (state.draggingCard) {
    const internal = getInternalPoint(coords.clientX, coords.clientY);
    state.draggingCard.x = internal.x - state.dragOffset.x;
    state.draggingCard.y = internal.y - state.dragOffset.y;
    render();
    return;
  }
};

addUnifiedEventListener(window, 'pointermove', moveHandler);

const canvasDownHandler = (e) => {
  if (state.drawingFreehand) {
    const coords = getEventCoordinates(e);
    const internal = getInternalPoint(coords.clientX, coords.clientY);
    state.currentPath = [{ x: internal.x, y: internal.y }];
  }
  
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
    document.querySelector('.shape-btn[data-shape="freehand"]')?.classList.remove('active');
    render();
  }
  
  state.draggingCard = null;
  state.resizingCard = null;
  state.rotatingCard = null;
};

addUnifiedEventListener(window, 'pointerup', upHandler);

render();
