const canvas = document.getElementById("canvas");

const state = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  isPanning: false,
  panStart: { x: 0, y: 0 },
  tree: {
    cards: [
      { id: 1, x: 400, y: 120, w: 220, h: 120, text: "" }
    ],
    connections: [],
    nextId: 2
  }
};

function addCard(parentId = null) {
  const data = state.tree;
  const id = data.nextId++;

  let x = 300 + Math.random() * 200;
  let y = 100;

  if (parentId) {
    const parent = data.cards.find(c => c.id === parentId);
    y = parent.y + 180;
    data.connections.push({ from: parentId, to: id });
  }

  data.cards.push({ id, x, y, w: 220, h: 120, text: "" });
  render();
}

function render() {
  canvas.innerHTML = "";

  state.tree.cards.forEach(card => {
    const el = document.createElement("div");
    el.className = "card";
    el.style.left = card.x * state.zoom + state.pan.x + "px";
    el.style.top = card.y * state.zoom + state.pan.y + "px";
    el.style.width = card.w * state.zoom + "px";
    el.style.height = card.h * state.zoom + "px";

    let dragging = false;
    let dragStart = { x: 0, y: 0 };

    const ta = document.createElement("textarea");
    ta.value = card.text;

    ta.addEventListener("input", e => {
      card.text = e.target.value;
    });

    ta.addEventListener("mousedown", e => {
      dragging = true;
      dragStart = {
        x: e.clientX - card.x,
        y: e.clientY - card.y
      };
      e.preventDefault();
    });

    window.addEventListener("mousemove", e => {
      if (!dragging) return;
      card.x = e.clientX - dragStart.x;
      card.y = e.clientY - dragStart.y;
      render();
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
    });

    el.appendChild(ta);
    canvas.appendChild(el);
  });
  };

document.getElementById("add-card").addEventListener("click", () => addCard());
document.getElementById("zoom-in").addEventListener("click", () => {
  state.zoom = Math.min(state.zoom + 0.2, 3);
  render();
});
document.getElementById("zoom-out").addEventListener("click", () => {
  state.zoom = Math.max(state.zoom - 0.2, 0.3);
  render();
});
document.getElementById("reset-zoom").addEventListener("click", () => {
  state.zoom = 1;
  state.pan = { x: 0, y: 0 };
  render();
});

canvas.addEventListener("mousedown", e => {
  state.isPanning = true;
  state.panStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
});

window.addEventListener("mousemove", e => {
  if (!state.isPanning) return;
  state.pan.x = e.clientX - state.panStart.x;
  state.pan.y = e.clientY - state.panStart.y;
  render();
});

window.addEventListener("mouseup", () => {
  state.isPanning = false;
});

render();
