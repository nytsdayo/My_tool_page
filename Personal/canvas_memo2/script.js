// Canvas Memo 2 - Material Design PWA Version
// State Management
const state = {
  draggingCard: null,
  dragOffset: { x: 0, y: 0 },
  resizingCard: null,
  resizeStart: { x: 0, y: 0, w: 0, h: 0, cardX: 0, cardY: 0 },
  resizeCorner: null,
  currentSize: 'large',
  selectedCard: null,
  drawingShape: null,
  drawingStart: null,
  tempShape: null,
  drawingFreehand: false,
  freehandPressTimer: null,
  currentPath: [],
  canvasData: {
    cards: [],
    shapes: [],
    freehandPaths: [],
    nextId: 1,
    nextShapeId: 1,
    nextPathId: 1
  }
};

// Constants
const FREEHAND_LONG_PRESS_MS = 300;
const STORAGE_KEY = 'canvas_memo2_data';

// Elements
const canvas = document.getElementById('canvas');
const menuBtn = document.getElementById('menu-btn');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const addCardBtn = document.getElementById('add-card-btn');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const snackbar = document.getElementById('snackbar');
const snackbarMessage = document.getElementById('snackbar-message');

// Utility Functions
function getEventCoordinates(e) {
  if (e.touches && e.touches.length > 0) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  return { clientX: e.clientX, clientY: e.clientY };
}

function showSnackbar(message, duration = 3000) {
  snackbarMessage.textContent = message;
  snackbar.classList.add('show');
  setTimeout(() => {
    snackbar.classList.remove('show');
  }, duration);
}

function openDrawer() {
  drawer.classList.add('open');
  drawerOverlay.classList.add('visible');
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('visible');
}

// Card Functions
function createCard(x, y, text = '') {
  const card = document.createElement('div');
  card.className = 'card elevation-2';
  card.style.left = x + 'px';
  card.style.top = y + 'px';
  card.dataset.id = state.canvasData.nextId++;

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'ここにメモを入力...';
  textarea.value = text;
  card.appendChild(textarea);

  // Prevent text selection from starting drag
  textarea.addEventListener('mousedown', (e) => e.stopPropagation());
  textarea.addEventListener('touchstart', (e) => e.stopPropagation());

  // Card drag events
  card.addEventListener('mousedown', startDrag);
  card.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrag(e);
  });

  canvas.appendChild(card);
  
  state.canvasData.cards.push({
    id: card.dataset.id,
    x: x,
    y: y,
    text: text,
    width: card.offsetWidth,
    height: card.offsetHeight
  });

  saveToLocalStorage();
  return card;
}

function startDrag(e) {
  const card = e.currentTarget;
  const coords = getEventCoordinates(e);
  const rect = card.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  state.draggingCard = card;
  state.dragOffset = {
    x: coords.clientX - rect.left,
    y: coords.clientY - rect.top
  };

  card.classList.add('dragging');
}

function onPointerMove(e) {
  if (state.draggingCard) {
    e.preventDefault();
    const coords = getEventCoordinates(e);
    const canvasRect = canvas.getBoundingClientRect();
    
    const x = coords.clientX - canvasRect.left - state.dragOffset.x;
    const y = coords.clientY - canvasRect.top - state.dragOffset.y;
    
    state.draggingCard.style.left = x + 'px';
    state.draggingCard.style.top = y + 'px';
  } else if (state.drawingShape) {
    e.preventDefault();
    const coords = getEventCoordinates(e);
    const canvasRect = canvas.getBoundingClientRect();
    
    const currentX = coords.clientX - canvasRect.left;
    const currentY = coords.clientY - canvasRect.top;
    
    updateTempShape(state.drawingStart.x, state.drawingStart.y, currentX, currentY);
  } else if (state.drawingFreehand) {
    e.preventDefault();
    const coords = getEventCoordinates(e);
    const canvasRect = canvas.getBoundingClientRect();
    
    const x = coords.clientX - canvasRect.left;
    const y = coords.clientY - canvasRect.top;
    
    state.currentPath.push({ x, y });
    updateFreehandPath();
  }
}

function onPointerUp(e) {
  if (state.draggingCard) {
    state.draggingCard.classList.remove('dragging');
    
    // Update card position in data
    const cardData = state.canvasData.cards.find(c => c.id === state.draggingCard.dataset.id);
    if (cardData) {
      cardData.x = parseInt(state.draggingCard.style.left);
      cardData.y = parseInt(state.draggingCard.style.top);
      saveToLocalStorage();
    }
    
    state.draggingCard = null;
  } else if (state.drawingShape) {
    finalizeTempShape();
    state.drawingShape = null;
    state.drawingStart = null;
  } else if (state.drawingFreehand) {
    finalizeFreehandPath();
    state.drawingFreehand = false;
    state.currentPath = [];
  }
}

// Shape Drawing Functions
function startShapeDrawing(e, shapeType) {
  const coords = getEventCoordinates(e);
  const canvasRect = canvas.getBoundingClientRect();
  
  state.drawingShape = shapeType;
  state.drawingStart = {
    x: coords.clientX - canvasRect.left,
    y: coords.clientY - canvasRect.top
  };
}

function updateTempShape(x1, y1, x2, y2) {
  if (!state.tempShape) {
    state.tempShape = document.createElement('div');
    state.tempShape.className = `shape ${state.drawingShape} ${state.currentSize}`;
    canvas.appendChild(state.tempShape);
  }

  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  state.tempShape.style.left = left + 'px';
  state.tempShape.style.top = top + 'px';
  state.tempShape.style.width = width + 'px';
  state.tempShape.style.height = height + 'px';
}

function finalizeTempShape() {
  if (state.tempShape) {
    const shapeData = {
      id: state.canvasData.nextShapeId++,
      type: state.drawingShape,
      size: state.currentSize,
      x: parseInt(state.tempShape.style.left),
      y: parseInt(state.tempShape.style.top),
      width: parseInt(state.tempShape.style.width),
      height: parseInt(state.tempShape.style.height)
    };
    
    state.canvasData.shapes.push(shapeData);
    state.tempShape = null;
    saveToLocalStorage();
  }
}

// Freehand Drawing Functions
function updateFreehandPath() {
  if (state.currentPath.length < 2) return;

  if (!state.tempFreehandSVG) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `freehand-path ${state.currentSize}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    canvas.appendChild(svg);
    state.tempFreehandSVG = svg;
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let d = `M ${state.currentPath[0].x} ${state.currentPath[0].y}`;
  
  for (let i = 1; i < state.currentPath.length; i++) {
    d += ` L ${state.currentPath[i].x} ${state.currentPath[i].y}`;
  }
  
  path.setAttribute('d', d);
  
  state.tempFreehandSVG.innerHTML = '';
  state.tempFreehandSVG.appendChild(path);
}

function finalizeFreehandPath() {
  if (state.currentPath.length > 1) {
    const pathData = {
      id: state.canvasData.nextPathId++,
      size: state.currentSize,
      points: [...state.currentPath]
    };
    
    state.canvasData.freehandPaths.push(pathData);
    saveToLocalStorage();
  }

  if (state.tempFreehandSVG) {
    state.tempFreehandSVG = null;
  }
}

// Canvas Event Handlers
canvas.addEventListener('mousedown', (e) => {
  if (e.target === canvas) {
    if (state.drawingShape) {
      startShapeDrawing(e, state.drawingShape);
    } else if (state.drawingFreehand && state.freehandPressTimer === null) {
      // Freehand drawing
      const coords = getEventCoordinates(e);
      const canvasRect = canvas.getBoundingClientRect();
      state.currentPath = [{
        x: coords.clientX - canvasRect.left,
        y: coords.clientY - canvasRect.top
      }];
    }
  }
});

canvas.addEventListener('touchstart', (e) => {
  if (e.target === canvas) {
    e.preventDefault();
    if (state.drawingShape) {
      startShapeDrawing(e, state.drawingShape);
    } else if (state.drawingFreehand && state.freehandPressTimer === null) {
      const coords = getEventCoordinates(e);
      const canvasRect = canvas.getBoundingClientRect();
      state.currentPath = [{
        x: coords.clientX - canvasRect.left,
        y: coords.clientY - canvasRect.top
      }];
    }
  }
});

document.addEventListener('mousemove', onPointerMove);
document.addEventListener('touchmove', onPointerMove, { passive: false });

document.addEventListener('mouseup', onPointerUp);
document.addEventListener('touchend', onPointerUp);

// Drawer Event Handlers
menuBtn.addEventListener('click', openDrawer);
closeDrawerBtn.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

// Shape Button Handlers
const shapeButtons = document.querySelectorAll('.shape-btn');
shapeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const shape = btn.dataset.shape;
    
    // Clear previous active states
    shapeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (shape === 'freehand') {
      state.drawingFreehand = true;
      state.drawingShape = null;
      showSnackbar('フリーハンドモード有効');
    } else {
      state.drawingShape = shape;
      state.drawingFreehand = false;
      showSnackbar(`${shape}描画モード有効`);
    }
    
    closeDrawer();
  });
});

// Size Button Handlers
const sizeButtons = document.querySelectorAll('.size-btn');
sizeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sizeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentSize = btn.dataset.size;
    showSnackbar(`サイズ: ${btn.textContent}`);
  });
});

// Action Button Handlers
addCardBtn.addEventListener('click', () => {
  const x = Math.random() * (canvas.offsetWidth - 250) + 25;
  const y = Math.random() * (canvas.offsetHeight - 150) + 25;
  createCard(x, y);
  showSnackbar('新しいカードを追加しました');
});

clearBtn.addEventListener('click', () => {
  if (confirm('すべてのカードと図形をクリアしますか？')) {
    canvas.innerHTML = '';
    state.canvasData = {
      cards: [],
      shapes: [],
      freehandPaths: [],
      nextId: 1,
      nextShapeId: 1,
      nextPathId: 1
    };
    saveToLocalStorage();
    showSnackbar('すべてクリアしました');
  }
});

saveBtn.addEventListener('click', () => {
  // Update card texts before saving
  const cards = canvas.querySelectorAll('.card');
  cards.forEach(card => {
    const cardData = state.canvasData.cards.find(c => c.id === card.dataset.id);
    if (cardData) {
      const textarea = card.querySelector('textarea');
      cardData.text = textarea.value;
    }
  });
  
  saveToLocalStorage();
  showSnackbar('保存しました');
});

// Local Storage Functions
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.canvasData));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    showSnackbar('保存に失敗しました');
  }
}

function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      state.canvasData = JSON.parse(data);
      renderCanvas();
      showSnackbar('前回のデータを読み込みました');
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
}

function renderCanvas() {
  canvas.innerHTML = '';
  
  // Render shapes
  state.canvasData.shapes.forEach(shapeData => {
    const shape = document.createElement('div');
    shape.className = `shape ${shapeData.type} ${shapeData.size}`;
    shape.style.left = shapeData.x + 'px';
    shape.style.top = shapeData.y + 'px';
    shape.style.width = shapeData.width + 'px';
    shape.style.height = shapeData.height + 'px';
    canvas.appendChild(shape);
  });
  
  // Render freehand paths
  state.canvasData.freehandPaths.forEach(pathData => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `freehand-path ${pathData.size}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M ${pathData.points[0].x} ${pathData.points[0].y}`;
    
    for (let i = 1; i < pathData.points.length; i++) {
      d += ` L ${pathData.points[i].x} ${pathData.points[i].y}`;
    }
    
    path.setAttribute('d', d);
    svg.appendChild(path);
    canvas.appendChild(svg);
  });
  
  // Render cards
  state.canvasData.cards.forEach(cardData => {
    const card = document.createElement('div');
    card.className = 'card elevation-2';
    card.style.left = cardData.x + 'px';
    card.style.top = cardData.y + 'px';
    card.dataset.id = cardData.id;

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'ここにメモを入力...';
    textarea.value = cardData.text || '';
    card.appendChild(textarea);

    textarea.addEventListener('mousedown', (e) => e.stopPropagation());
    textarea.addEventListener('touchstart', (e) => e.stopPropagation());

    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e);
    });

    canvas.appendChild(card);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  
  // Add initial welcome card if empty
  if (state.canvasData.cards.length === 0) {
    createCard(50, 50, 'Canvas Memo 2へようこそ！\n\nこのツールはPWAとして動作します。\n\n• ☰ メニューから図形ツールを選択\n• + ボタンでカードを追加\n• カードをドラッグして移動\n• オフラインでも使用可能');
  }
});

// Prevent default touch behaviors
document.body.addEventListener('touchmove', (e) => {
  if (e.target === canvas || e.target.closest('.canvas')) {
    e.preventDefault();
  }
}, { passive: false });
