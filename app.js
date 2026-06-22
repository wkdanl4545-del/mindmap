// ===================== 마인드맵 앱 (서버 없이 동작하는 순수 클라이언트 앱) =====================

const STORAGE_KEY = 'mindmap_projects_v1';
const AUTH_KEY = 'mindmap_auth_v1';
const AUTH_ID = 'khg2792';
const AUTH_PW = 'khg2792!!';

const THEMES = [
  { id: 'sunset', name: '선셋', bg: '#f8f9fb', palette: ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#9775FA', '#F783AC'] },
  { id: 'ocean',  name: '오션',  bg: '#f2f7fb', palette: ['#1C7ED6', '#15AABF', '#0CA678', '#5C7CFA', '#228BE6', '#3BC9DB', '#74C0FC'] },
  { id: 'forest', name: '포레스트', bg: '#f3f8f3', palette: ['#2F9E44', '#66A80F', '#37B24D', '#94D82D', '#0CA678', '#40C057', '#82C91E'] },
  { id: 'mono',   name: '모노톤', bg: '#f5f5f6', palette: ['#343A40', '#495057', '#868E96', '#ADB5BD', '#5C636E', '#212529', '#6C757D'] },
  { id: 'candy',  name: '캔디',  bg: '#fdf6fb', palette: ['#E64980', '#BE4BDB', '#F06595', '#CC5DE8', '#FF8787', '#FAA2C1', '#D0BFFF'] },
];

const ICONS = ['⭐','✅','❗','❓','🔥','💡','📌','🚀','🎯','📅','💬','📎','⚠️','❤️','👍','👎','🔑','🏆','📈','📉','🧩','🛠️','🔍','🎨','📷','💰','⏰','🌟','🚩','✏️'];

const DEFAULT_FONT = "'Segoe UI', 'Malgun Gothic', sans-serif";

function uid() { return 'n' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

// ===================== 영속성 =====================

function loadAllProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function saveAllProjects(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function createNewProject(name) {
  const rootId = uid();
  return {
    id: uid(),
    name: name || '새 마인드맵',
    theme: 'sunset',
    rootId,
    updatedAt: Date.now(),
    nodes: {
      [rootId]: {
        id: rootId, parentId: null, children: [],
        text: name || '중심 주제', x: 0, y: 0,
        bg: '#4a63e7', borderColor: null, borderWidth: 2, shape: 'pill', bold: true, fontSize: 16,
        fontFamily: DEFAULT_FONT, icon: '', image: null, collapsed: false
      }
    }
  };
}

// ===================== 애플리케이션 상태 =====================

const App = {
  projects: loadAllProjects(),
  current: null,
  selectedNodeId: null,
  history: [],
  future: [],
  pan: { x: 200, y: 600 },
  zoom: 1,
};

// ===================== 로그인 =====================

function isAuthed() {
  return localStorage.getItem(AUTH_KEY) === '1' || sessionStorage.getItem(AUTH_KEY) === '1';
}

function showLogin() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('editor-view').classList.add('hidden');
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value;
  if (id === AUTH_ID && pw === AUTH_PW) {
    if (document.getElementById('login-remember').checked) localStorage.setItem(AUTH_KEY, '1');
    else sessionStorage.setItem(AUTH_KEY, '1');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('login-view').classList.add('hidden');
    afterAuth();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
});

// ===================== 홈 화면 =====================

function renderHome() {
  document.getElementById('home-view').classList.remove('hidden');
  document.getElementById('editor-view').classList.add('hidden');
  document.getElementById('login-view').classList.add('hidden');
  const list = document.getElementById('project-list');
  const ids = Object.keys(App.projects).sort((a,b) => (App.projects[b].updatedAt||0) - (App.projects[a].updatedAt||0));
  if (ids.length === 0) {
    list.innerHTML = '<div class="empty-hint">아직 만든 마인드맵이 없습니다. "새 프로젝트"로 시작해보세요.</div>';
    return;
  }
  list.innerHTML = '';
  ids.forEach(id => {
    const p = App.projects[id];
    const card = document.createElement('div');
    card.className = 'project-card';
    const count = Object.keys(p.nodes).length;
    card.innerHTML = `<button class="pc-delete" title="삭제">✕</button>
      <div class="pc-title">${escapeHtml(p.name)}</div>
      <div class="pc-meta">노드 ${count}개 · ${p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ''}</div>`;
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('pc-delete')) return;
      openProject(id);
    });
    card.querySelector('.pc-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`"${p.name}" 프로젝트를 삭제할까요?`)) {
        delete App.projects[id];
        saveAllProjects(App.projects);
        renderHome();
      }
    });
    list.appendChild(card);
  });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function openProject(id) {
  App.current = JSON.parse(JSON.stringify(App.projects[id]));
  App.selectedNodeId = App.current.rootId;
  App.history = []; App.future = [];
  App.pan = { x: window.innerWidth/2, y: window.innerHeight/2 - 40 };
  App.zoom = 1;
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('editor-view').classList.remove('hidden');
  document.getElementById('project-name').value = App.current.name;
  document.getElementById('theme-select').value = App.current.theme;
  render();
}

function persistCurrentProject() {
  if (!App.current) return;
  App.current.updatedAt = Date.now();
  App.projects[App.current.id] = JSON.parse(JSON.stringify(App.current));
  saveAllProjects(App.projects);
}

function goHome() {
  persistCurrentProject();
  App.current = null;
  renderHome();
}

// ===================== Undo/Redo =====================

function snapshot() {
  App.history.push(JSON.stringify(App.current));
  if (App.history.length > 60) App.history.shift();
  App.future = [];
}

function undo() {
  if (App.history.length === 0) return;
  App.future.push(JSON.stringify(App.current));
  App.current = JSON.parse(App.history.pop());
  render();
}

function redo() {
  if (App.future.length === 0) return;
  App.history.push(JSON.stringify(App.current));
  App.current = JSON.parse(App.future.pop());
  render();
}

// ===================== 트리 연산 =====================

function getNode(id) { return App.current.nodes[id]; }

function makeNode(id, parentId, opts) {
  return Object.assign({
    id, parentId, children: [], text: '새 노드', x: 0, y: 0,
    bg: '#4a63e7', borderColor: null, borderWidth: 2, shape: 'rounded', bold: false, fontSize: 14,
    fontFamily: DEFAULT_FONT, icon: '', image: null, collapsed: false
  }, opts);
}

function addChildNode(parentId, atX, atY) {
  snapshot();
  const parent = getNode(parentId);
  const theme = THEMES.find(t => t.id === App.current.theme) || THEMES[0];
  const depth = nodeDepth(parentId);
  const color = depth === 0 ? theme.palette[parent.children.length % theme.palette.length] : parent.bg;
  const id = uid();
  let x, y;
  if (atX !== undefined) { x = atX; y = atY; }
  else {
    const dir = nodeSide(parentId);
    x = parent.x + dir * 170;
    y = parent.y + parent.children.length * 64 - (parent.children.length ? 32 : 0);
  }
  App.current.nodes[id] = makeNode(id, parentId, { text: '새 노드', x, y, bg: color, shape: 'rounded', fontSize: 14 });
  parent.children.push(id);
  parent.collapsed = false;
  App.selectedNodeId = id;
  render();
  persistCurrentProject();
  focusNodeText(id, true);
  return id;
}

function addSiblingNode(nodeId) {
  const node = getNode(nodeId);
  if (!node.parentId) {
    if (nodeId === App.current.rootId) { addChildNode(nodeId); return; }
    snapshot();
    const id = uid();
    App.current.nodes[id] = makeNode(id, null, { text: '새 노드', x: node.x, y: node.y + 80, bg: node.bg, shape: node.shape });
    App.selectedNodeId = id;
    render();
    persistCurrentProject();
    focusNodeText(id, true);
    return;
  }
  snapshot();
  const parent = getNode(node.parentId);
  const id = uid();
  App.current.nodes[id] = makeNode(id, node.parentId, { text: '새 노드', x: node.x, y: node.y + 64, bg: node.bg, shape: node.shape });
  const idx = parent.children.indexOf(nodeId);
  parent.children.splice(idx + 1, 0, id);
  App.selectedNodeId = id;
  render();
  persistCurrentProject();
  focusNodeText(id, true);
}

function createFloatingNode(x, y) {
  snapshot();
  const id = uid();
  App.current.nodes[id] = makeNode(id, null, { text: '새 노드', x, y, bg: '#868E96', shape: 'rounded' });
  App.selectedNodeId = id;
  render();
  persistCurrentProject();
  focusNodeText(id, true);
}

function deleteNode(nodeId) {
  if (nodeId === App.current.rootId) { alert('중심 주제는 삭제할 수 없습니다.'); return; }
  const node = getNode(nodeId);
  snapshot();
  const stack = [nodeId];
  while (stack.length) {
    const cur = stack.pop();
    const n = getNode(cur);
    n.children.forEach(c => stack.push(c));
    delete App.current.nodes[cur];
  }
  if (node.parentId) {
    const parent = getNode(node.parentId);
    parent.children = parent.children.filter(c => c !== nodeId);
    App.selectedNodeId = node.parentId;
  } else {
    App.selectedNodeId = App.current.rootId;
  }
  render();
  persistCurrentProject();
}

function nodeDepth(id) {
  let d = 0, n = getNode(id);
  while (n.parentId) { d++; n = getNode(n.parentId); }
  return d;
}

function nodeSide(parentId) {
  const root = getNode(App.current.rootId);
  if (parentId === App.current.rootId) {
    const kids = root.children.map(getNode);
    const leftCount = kids.filter(k => k.x < root.x).length;
    const rightCount = kids.length - leftCount;
    return rightCount <= leftCount ? 1 : -1;
  }
  return getNode(parentId).x < root.x ? -1 : 1;
}

function isDescendant(ancestorId, candidateId) {
  let n = getNode(candidateId);
  while (n.parentId) {
    if (n.parentId === ancestorId) return true;
    n = getNode(n.parentId);
  }
  return false;
}

function reparentNode(nodeId, newParentId) {
  if (nodeId === newParentId) return false;
  if (nodeId === App.current.rootId) return false;
  if (isDescendant(nodeId, newParentId)) return false;
  const node = getNode(nodeId);
  if (node.parentId === newParentId) return false;
  snapshot();
  if (node.parentId) {
    const oldParent = getNode(node.parentId);
    oldParent.children = oldParent.children.filter(c => c !== nodeId);
  }
  const newParent = getNode(newParentId);
  newParent.children.push(nodeId);
  newParent.collapsed = false;
  node.parentId = newParentId;
  render();
  persistCurrentProject();
  return true;
}

// ===================== 자동 정렬 (버튼으로 실행) =====================

const H_GAP = 90, V_GAP = 16, NODE_H = 44;

function subtreeWeight(id, memo) {
  if (memo.has(id)) return memo.get(id);
  const n = getNode(id);
  let w;
  if (n.collapsed || n.children.length === 0) w = 1;
  else w = n.children.reduce((s, c) => s + subtreeWeight(c, memo), 0);
  memo.set(id, w);
  return w;
}

function autoArrange() {
  snapshot();
  const memo = new Map();
  const root = getNode(App.current.rootId);
  root.x = 0; root.y = 0;
  const kids = root.children.slice();
  const left = [], right = [];
  kids.forEach(id => ((getNode(id).x < 0 ? left : right).push(id)));
  left.sort((a, b) => getNode(a).y - getNode(b).y);
  right.sort((a, b) => getNode(a).y - getNode(b).y);

  function place(ids, dir) {
    const totalWeight = ids.reduce((s, id) => s + subtreeWeight(id, memo), 0) || 1;
    let cursor = -totalWeight * (NODE_H + V_GAP) / 2;
    ids.forEach(id => {
      const w = subtreeWeight(id, memo) * (NODE_H + V_GAP);
      placeSubtree(id, dir, 1, cursor + w / 2);
      cursor += w;
    });
  }
  function placeSubtree(id, dir, depth, yCenter) {
    const n = getNode(id);
    n.x = dir * depth * H_GAP * 2.1;
    n.y = yCenter;
    if (n.collapsed || n.children.length === 0) return;
    const totalWeight = n.children.reduce((s, c) => s + subtreeWeight(c, memo), 0) || 1;
    let cursor = yCenter - totalWeight * (NODE_H + V_GAP) / 2;
    n.children.forEach(cid => {
      const w = subtreeWeight(cid, memo) * (NODE_H + V_GAP);
      placeSubtree(cid, dir, depth + 1, cursor + w / 2);
      cursor += w;
    });
  }
  place(right, 1);
  place(left, -1);

  // 루트에 연결되지 않은 떠 있는 노드들은 아래쪽에 가로로 나열
  const floating = Object.values(App.current.nodes).filter(n => !n.parentId && n.id !== App.current.rootId);
  floating.forEach((n, i) => { n.x = (i - floating.length / 2) * 200; n.y = 320; });

  render();
  persistCurrentProject();
}

document.getElementById('btn-auto-arrange').addEventListener('click', autoArrange);

// ===================== 렌더링 =====================

const OFFSET = 2000; // 4000x4000 캔버스의 중앙 기준점

function render() {
  const nodesLayer = document.getElementById('nodes-layer');
  const linesLayer = document.getElementById('lines-layer');
  nodesLayer.innerHTML = '';
  linesLayer.innerHTML = '';

  const theme = THEMES.find(t => t.id === App.current.theme) || THEMES[0];
  document.getElementById('canvas-wrap').style.background = theme.bg;

  Object.values(App.current.nodes).forEach(n => {
    if (!n.parentId) return;
    const parent = getNode(n.parentId);
    if (parent.collapsed) return;
    drawLine(linesLayer, parent.x + OFFSET, parent.y + OFFSET, n.x + OFFSET, n.y + OFFSET, n.bg);
  });

  Object.values(App.current.nodes).forEach(n => {
    if (isHiddenByCollapse(n.id)) return;
    nodesLayer.appendChild(buildNodeEl(n));
  });

  updateZoomTransform();
  updateToolbarForSelection();
}

function elbowPath(x1, y1, x2, y2) {
  const midX = x1 + (x2 - x1) / 2;
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const signY = dy > 0 ? 1 : -1;
  const signX1 = midX >= x1 ? 1 : -1;
  const signX2 = x2 >= midX ? 1 : -1;
  const r = Math.min(14, Math.abs(midX - x1), Math.abs(x2 - midX), Math.abs(dy) / 2);
  const bend1X = midX - r * signX1, bend2X = midX + r * signX2;
  const topY = y1 + r * signY, botY = y2 - r * signY;
  return `M ${x1} ${y1} L ${bend1X} ${y1} Q ${midX} ${y1} ${midX} ${topY} ` +
    `L ${midX} ${botY} Q ${midX} ${y2} ${bend2X} ${y2} L ${x2} ${y2}`;
}

function drawLine(layer, x1, y1, x2, y2, color) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', elbowPath(x1, y1, x2, y2));
  path.setAttribute('stroke', color || '#999');
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', '0.75');
  layer.appendChild(path);
  return path;
}

function isHiddenByCollapse(id) {
  let n = getNode(id);
  while (n.parentId) {
    const p = getNode(n.parentId);
    if (p.collapsed) return true;
    n = p;
  }
  return false;
}

function buildNodeEl(n) {
  const el = document.createElement('div');
  el.className = `mm-node shape-${n.shape}` + (n.id === App.selectedNodeId ? ' selected' : '');
  el.style.left = (n.x + OFFSET) + 'px';
  el.style.top = (n.y + OFFSET) + 'px';
  el.style.background = n.bg || '#ffffff';
  el.style.color = isDark(n.bg) ? '#fff' : '#1f2330';
  el.style.fontWeight = n.bold ? '700' : '400';
  el.style.fontSize = (n.fontSize || 14) + 'px';
  el.style.fontFamily = n.fontFamily || DEFAULT_FONT;
  el.style.borderColor = n.borderColor || (n.bg ? 'transparent' : '#c2c5cc');
  el.style.borderWidth = (n.borderWidth ?? 2) + 'px';
  el.dataset.id = n.id;

  if (n.image) {
    const img = document.createElement('img');
    img.src = n.image; img.className = 'mm-thumb';
    el.appendChild(img);
  }
  if (n.icon) {
    const ic = document.createElement('span');
    ic.className = 'mm-icon'; ic.textContent = n.icon;
    el.appendChild(ic);
  }
  const span = document.createElement('span');
  span.className = 'mm-text';
  span.textContent = n.text;
  el.appendChild(span);

  const handle = document.createElement('div');
  handle.className = 'mm-connect-handle';
  handle.title = '드래그하여 다른 노드와 연결';
  el.appendChild(handle);

  attachNodeEvents(el, n.id, span, handle);

  if (n.children.length > 0) {
    const badge = document.createElement('div');
    badge.className = 'mm-collapse-badge';
    badge.textContent = n.collapsed ? '+' + countDescendants(n.id) : '−';
    badge.style.left = (n.x + OFFSET + (n.x >= 0 ? 60 : -60)) + 'px';
    badge.style.top = (n.y + OFFSET) + 'px';
    badge.addEventListener('pointerdown', (e) => e.stopPropagation());
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      snapshot();
      n.collapsed = !n.collapsed;
      render();
      persistCurrentProject();
    });
    document.getElementById('nodes-layer').appendChild(badge);
  }
  return el;
}

function countDescendants(id) {
  let count = 0;
  const stack = [...getNode(id).children];
  while (stack.length) {
    count++;
    const n = getNode(stack.pop());
    stack.push(...n.children);
  }
  return count;
}

function isDark(hex) {
  if (!hex || hex[0] !== '#') return false;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 < 140;
}

// ===================== 좌표 변환 =====================

function screenToCanvas(clientX, clientY) {
  const rect = document.getElementById('canvas-wrap').getBoundingClientRect();
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  return { x: (localX - App.pan.x) / App.zoom, y: (localY - App.pan.y) / App.zoom };
}

// ===================== 노드 상호작용: 선택 / 드래그(이동+연결) / 편집 =====================

let dragState = null;     // 노드 본체 드래그 (이동 + 다른 노드에 드롭하면 연결)
let connectState = null;  // 연결 핸들 드래그 (이동 없이 연결선만 긋기)
let panState = null;
let longPressTimer = null;
const activePointers = new Map();
let pinchState = null;
let lastTap = { id: null, time: 0 };

function attachNodeEvents(el, id, textEl, handleEl) {
  el.addEventListener('pointerdown', (e) => {
    if (e.target === handleEl) return; // 핸들 자체 리스너가 처리
    e.stopPropagation();
    selectNode(id);
    if (e.target === textEl && textEl.isContentEditable) return;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    dragState = { id, startX: e.clientX, startY: e.clientY, origX: getNode(id).x, origY: getNode(id).y, moved: false };
    if (e.pointerType === 'touch') startLongPress(e, () => openContextMenuForNode(id, e.clientX, e.clientY));
  });
  el.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch' && e.target !== handleEl) {
      const now = Date.now();
      if (lastTap.id === id && now - lastTap.time < 350) { focusNodeText(id, true); lastTap = { id: null, time: 0 }; }
      else lastTap = { id, time: now };
    }
  });
  el.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    focusNodeText(id, true);
  });
  el.addEventListener('contextmenu', (e) => {
    e.preventDefault(); e.stopPropagation();
    selectNode(id);
    openContextMenuForNode(id, e.clientX, e.clientY);
  });

  handleEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); e.preventDefault();
    selectNode(id);
    handleEl.setPointerCapture && handleEl.setPointerCapture(e.pointerId);
    const n = getNode(id);
    connectState = { fromId: id, fromX: n.x, fromY: n.y };
  });
}

let lastPointerPos = { x: 0, y: 0 };

function startLongPress(e, onFire) {
  clearLongPress();
  const sx = e.clientX, sy = e.clientY;
  longPressTimer = setTimeout(() => {
    if (Math.abs(lastPointerPos.x - sx) > 10 || Math.abs(lastPointerPos.y - sy) > 10) return;
    onFire();
  }, 550);
}
function clearLongPress() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

function focusNodeText(id, selectAll) {
  selectNode(id);
  setTimeout(() => {
    const el = document.querySelector(`.mm-node[data-id="${id}"] .mm-text`);
    if (!el) return;
    el.contentEditable = 'true';
    el.focus();
    if (selectAll) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
    }
    el.addEventListener('blur', commitEdit, { once: true });
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); el.blur(); }
      if (ev.key === 'Escape') { ev.preventDefault(); el.blur(); }
      ev.stopPropagation();
    });
  }, 0);

  function commitEdit() {
    const el2 = document.querySelector(`.mm-node[data-id="${id}"] .mm-text`);
    if (!el2) return;
    const newText = el2.textContent.trim() || '노드';
    el2.contentEditable = 'false';
    if (getNode(id) && getNode(id).text !== newText) {
      snapshot();
      getNode(id).text = newText;
      persistCurrentProject();
    }
    render();
  }
}

function selectNode(id) {
  App.selectedNodeId = id;
  document.querySelectorAll('.mm-node').forEach(el => el.classList.toggle('selected', el.dataset.id === id));
  updateToolbarForSelection();
}

document.addEventListener('pointermove', (e) => {
  lastPointerPos = { x: e.clientX, y: e.clientY };
  if (dragState) {
    dragState.lastX = e.clientX; dragState.lastY = e.clientY;
    const dx = (e.clientX - dragState.startX) / App.zoom;
    const dy = (e.clientY - dragState.startY) / App.zoom;
    if (Math.abs(dx) + Math.abs(dy) > 3) { dragState.moved = true; clearLongPress(); }
    const n = getNode(dragState.id);
    if (!n) return;
    n.x = dragState.origX + dx;
    n.y = dragState.origY + dy;
    render();
    return;
  }
  if (connectState) {
    const p = screenToCanvas(e.clientX, e.clientY);
    let layer = document.getElementById('temp-connect-line');
    if (!layer) {
      layer = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      layer.id = 'temp-connect-line';
      layer.setAttribute('stroke', '#2f9e44');
      layer.setAttribute('stroke-width', '2.5');
      layer.setAttribute('stroke-dasharray', '6 4');
      layer.setAttribute('fill', 'none');
      document.getElementById('lines-layer').appendChild(layer);
    }
    layer.setAttribute('d', elbowPath(connectState.fromX + OFFSET, connectState.fromY + OFFSET, p.x + OFFSET, p.y + OFFSET));
    document.querySelectorAll('.mm-node.connect-target').forEach(el => el.classList.remove('connect-target'));
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const targetEl = target && target.closest && target.closest('.mm-node');
    if (targetEl && targetEl.dataset.id !== connectState.fromId) targetEl.classList.add('connect-target');
    return;
  }
  if (panState) {
    App.pan.x = panState.origX + (e.clientX - panState.startX);
    App.pan.y = panState.origY + (e.clientY - panState.startY);
    updateZoomTransform();
    return;
  }
  if (activePointers.has(e.pointerId)) {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.size === 2 && pinchState) {
      const pts = Array.from(activePointers.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / pinchState.startDist;
      App.zoom = Math.min(2.5, Math.max(0.2, pinchState.startZoom * ratio));
      updateZoomTransform();
    }
  }
});

document.addEventListener('pointerup', (e) => {
  clearLongPress();
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchState = null;

  if (dragState) {
    const { id, moved } = dragState;
    if (moved) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const targetNodeEl = target && target.closest && target.closest('.mm-node');
      if (targetNodeEl && targetNodeEl.dataset.id !== id) {
        reparentNode(id, targetNodeEl.dataset.id);
      } else {
        render();
        persistCurrentProject();
      }
    }
    dragState = null;
    return;
  }
  if (connectState) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const targetEl = target && target.closest && target.closest('.mm-node');
    document.querySelectorAll('.mm-node.connect-target').forEach(el => el.classList.remove('connect-target'));
    const temp = document.getElementById('temp-connect-line');
    if (temp) temp.remove();
    if (targetEl && targetEl.dataset.id !== connectState.fromId) {
      reparentNode(targetEl.dataset.id, connectState.fromId);
    }
    connectState = null;
    return;
  }
  if (panState) {
    panState = null;
    document.getElementById('canvas-wrap').classList.remove('panning');
  }
});

document.addEventListener('pointercancel', (e) => {
  clearLongPress();
  activePointers.delete(e.pointerId);
  pinchState = null;
  dragState = null;
  if (connectState) {
    const temp = document.getElementById('temp-connect-line');
    if (temp) temp.remove();
  }
  connectState = null;
  panState = null;
});

// 빈 캔버스: 클릭으로 선택 해제 + 패닝 + 우클릭/롱프레스로 새 노드 메뉴
const canvasWrap = document.getElementById('canvas-wrap');

canvasWrap.addEventListener('pointerdown', (e) => {
  if (e.target.id !== 'canvas-wrap' && e.target.id !== 'nodes-layer' && e.target.id !== 'lines-layer') return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (activePointers.size === 2) {
    clearLongPress();
    const pts = Array.from(activePointers.values());
    pinchState = { startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), startZoom: App.zoom };
    panState = null;
    canvasWrap.classList.remove('panning');
    return;
  }
  App.selectedNodeId = null;
  document.querySelectorAll('.mm-node').forEach(el => el.classList.remove('selected'));
  panState = { startX: e.clientX, startY: e.clientY, origX: App.pan.x, origY: App.pan.y };
  canvasWrap.classList.add('panning');
  if (e.pointerType === 'touch') {
    startLongPress(e, () => {
      const p = screenToCanvas(e.clientX, e.clientY);
      openContextMenuForCanvas(p.x, p.y, e.clientX, e.clientY);
    });
  }
});

canvasWrap.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.mm-node')) return;
  e.preventDefault();
  const p = screenToCanvas(e.clientX, e.clientY);
  openContextMenuForCanvas(p.x, p.y, e.clientX, e.clientY);
});

canvasWrap.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.08 : 0.08;
  App.zoom = Math.min(2.5, Math.max(0.2, App.zoom + delta));
  updateZoomTransform();
}, { passive: false });

function updateZoomTransform() {
  const t = `translate(${App.pan.x}px, ${App.pan.y}px) scale(${App.zoom}) translate(-${OFFSET}px, -${OFFSET}px)`;
  document.getElementById('nodes-layer').style.transform = t;
  document.getElementById('lines-layer').style.transform = t;
  document.getElementById('zoom-level').textContent = Math.round(App.zoom * 100) + '%';
}

// ===================== 컨텍스트 메뉴 (우클릭 / 롱프레스) =====================

function closeContextMenu() {
  document.getElementById('context-menu').classList.add('hidden');
}

function placeContextMenu(clientX, clientY) {
  const menu = document.getElementById('context-menu');
  menu.classList.remove('hidden');
  const w = menu.offsetWidth, h = menu.offsetHeight;
  menu.style.left = Math.min(clientX, window.innerWidth - w - 8) + 'px';
  menu.style.top = Math.min(clientY, window.innerHeight - h - 8) + 'px';
}

function cmItem(label, onClick, danger) {
  const div = document.createElement('div');
  div.className = 'cm-item' + (danger ? ' danger' : '');
  div.textContent = label;
  div.addEventListener('click', () => { closeContextMenu(); onClick(); });
  return div;
}

function openContextMenuForNode(id, clientX, clientY) {
  const menu = document.getElementById('context-menu');
  menu.innerHTML = '';
  const n = getNode(id);
  const theme = THEMES.find(t => t.id === App.current.theme) || THEMES[0];

  menu.appendChild(cmItem('➕ 자식 노드 추가', () => addChildNode(id)));
  menu.appendChild(cmItem('➕ 형제 노드 추가', () => addSiblingNode(id)));
  menu.appendChild(cmItem('✏️ 이름 바꾸기', () => focusNodeText(id, true)));
  if (n.children.length > 0) {
    menu.appendChild(cmItem(n.collapsed ? '➕ 펼치기' : '➖ 접기', () => {
      snapshot(); n.collapsed = !n.collapsed; render(); persistCurrentProject();
    }));
  }
  const sep1 = document.createElement('div'); sep1.className = 'cm-sep'; menu.appendChild(sep1);

  const colorRow = document.createElement('div'); colorRow.className = 'cm-row';
  const noneSw = document.createElement('div'); noneSw.className = 'swatch-none';
  noneSw.textContent = '∅'; noneSw.title = '배경색 없음';
  noneSw.addEventListener('click', () => { closeContextMenu(); snapshot(); n.bg = null; render(); persistCurrentProject(); });
  colorRow.appendChild(noneSw);
  theme.palette.forEach(c => {
    const sw = document.createElement('div'); sw.className = 'swatch'; sw.style.background = c;
    sw.addEventListener('click', () => { closeContextMenu(); snapshot(); n.bg = c; render(); persistCurrentProject(); });
    colorRow.appendChild(sw);
  });
  menu.appendChild(colorRow);

  menu.appendChild(cmItem('🖼 이미지 삽입', () => { App.selectedNodeId = id; document.getElementById('file-image-input').click(); }));
  menu.appendChild(cmItem('😀 아이콘 삽입', () => { App.selectedNodeId = id; document.getElementById('btn-icon').click(); }));

  const sep2 = document.createElement('div'); sep2.className = 'cm-sep'; menu.appendChild(sep2);
  if (id !== App.current.rootId) {
    menu.appendChild(cmItem('🗑 삭제', () => deleteNode(id), true));
  }
  placeContextMenu(clientX, clientY);
}

function openContextMenuForCanvas(canvasX, canvasY, clientX, clientY) {
  const menu = document.getElementById('context-menu');
  menu.innerHTML = '';
  menu.appendChild(cmItem('➕ 새 노드 추가', () => createFloatingNode(canvasX, canvasY)));
  menu.appendChild(cmItem('🧹 전체 자동 정렬', () => autoArrange()));
  placeContextMenu(clientX, clientY);
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target)) closeContextMenu();
});

// ===================== 툴바: 색상/모양/굵기/폰트 =====================

function updateToolbarForSelection() {
  const swatchWrap = document.getElementById('color-swatches');
  swatchWrap.innerHTML = '';
  const theme = THEMES.find(t => t.id === App.current.theme) || THEMES[0];
  theme.palette.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.background = c;
    if (App.selectedNodeId && getNode(App.selectedNodeId)?.bg === c) sw.classList.add('selected');
    sw.addEventListener('click', () => applyToSelected(n => n.bg = c));
    swatchWrap.appendChild(sw);
  });
  const n = App.selectedNodeId ? getNode(App.selectedNodeId) : null;
  document.getElementById('shape-select').value = n ? n.shape : 'rounded';
  document.getElementById('btn-color-none').classList.toggle('selected', !!n && !n.bg);
  document.getElementById('btn-border-none').classList.toggle('selected', !!n && !n.borderColor);
  document.getElementById('border-custom').value = (n && n.borderColor) || '#000000';
  document.getElementById('border-width-select').value = String((n && n.borderWidth) ?? 2);
  document.getElementById('font-family-select').value = (n && n.fontFamily) || DEFAULT_FONT;
}

function applyToSelected(fn) {
  if (!App.selectedNodeId || !getNode(App.selectedNodeId)) return;
  snapshot();
  fn(getNode(App.selectedNodeId));
  render();
  persistCurrentProject();
}

document.getElementById('color-custom').addEventListener('input', (e) => {
  applyToSelected(n => n.bg = e.target.value);
});
document.getElementById('btn-color-none').addEventListener('click', () => {
  applyToSelected(n => n.bg = null);
});
document.getElementById('border-custom').addEventListener('input', (e) => {
  applyToSelected(n => n.borderColor = e.target.value);
});
document.getElementById('btn-border-none').addEventListener('click', () => {
  applyToSelected(n => n.borderColor = null);
});
document.getElementById('border-width-select').addEventListener('change', (e) => {
  applyToSelected(n => n.borderWidth = Number(e.target.value));
});
document.getElementById('font-family-select').addEventListener('change', (e) => {
  applyToSelected(n => n.fontFamily = e.target.value);
});
document.getElementById('shape-select').addEventListener('change', (e) => {
  applyToSelected(n => n.shape = e.target.value);
});
document.getElementById('btn-bold').addEventListener('click', () => {
  applyToSelected(n => n.bold = !n.bold);
});
document.getElementById('btn-font-plus').addEventListener('click', () => {
  applyToSelected(n => n.fontSize = Math.min(36, (n.fontSize||14) + 2));
});
document.getElementById('btn-font-minus').addEventListener('click', () => {
  applyToSelected(n => n.fontSize = Math.max(10, (n.fontSize||14) - 2));
});

document.getElementById('btn-icon').addEventListener('click', (e) => {
  const popup = document.getElementById('icon-popup');
  if (!popup.classList.contains('hidden')) { popup.classList.add('hidden'); return; }
  popup.innerHTML = '';
  ICONS.forEach(ic => {
    const span = document.createElement('span');
    span.textContent = ic;
    span.addEventListener('click', () => {
      applyToSelected(n => n.icon = (n.icon === ic ? '' : ic));
      popup.classList.add('hidden');
    });
    popup.appendChild(span);
  });
  const rect = e.target.getBoundingClientRect();
  popup.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
  popup.style.top = (rect.bottom + 6) + 'px';
  popup.classList.remove('hidden');
});
document.addEventListener('click', (e) => {
  const popup = document.getElementById('icon-popup');
  if (!popup.contains(e.target) && e.target.id !== 'btn-icon') popup.classList.add('hidden');
});

document.getElementById('file-image-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => applyToSelected(n => n.image = reader.result);
  reader.readAsDataURL(file);
  e.target.value = '';
});

document.getElementById('theme-select').addEventListener('change', (e) => {
  snapshot();
  App.current.theme = e.target.value;
  render();
  persistCurrentProject();
});

document.getElementById('project-name').addEventListener('input', (e) => {
  App.current.name = e.target.value;
});
document.getElementById('project-name').addEventListener('blur', persistCurrentProject);

// ===================== 키보드 단축키 =====================

document.addEventListener('keydown', (e) => {
  if (!App.current) return;
  const active = document.activeElement;
  if (active && active.isContentEditable) return;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT')) return;
  if (!App.selectedNodeId) return;

  if (e.key === 'Tab') { e.preventDefault(); addChildNode(App.selectedNodeId); }
  else if (e.key === 'Enter') { e.preventDefault(); addSiblingNode(App.selectedNodeId); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteNode(App.selectedNodeId); }
  else if (e.key === 'F2') { e.preventDefault(); focusNodeText(App.selectedNodeId, true); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
});

// ===================== 툴바 버튼 바인딩 =====================

document.getElementById('btn-add-child').addEventListener('click', () => App.selectedNodeId && addChildNode(App.selectedNodeId));
document.getElementById('btn-add-sibling').addEventListener('click', () => App.selectedNodeId && addSiblingNode(App.selectedNodeId));
document.getElementById('btn-delete-node').addEventListener('click', () => App.selectedNodeId && deleteNode(App.selectedNodeId));
document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);
document.getElementById('btn-home').addEventListener('click', goHome);

document.getElementById('btn-zoom-in').addEventListener('click', () => { App.zoom = Math.min(2.5, App.zoom + 0.1); updateZoomTransform(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { App.zoom = Math.max(0.2, App.zoom - 0.1); updateZoomTransform(); });
document.getElementById('btn-zoom-reset').addEventListener('click', () => { App.zoom = 1; App.pan = { x: window.innerWidth/2, y: window.innerHeight/2 - 40 }; updateZoomTransform(); });

document.getElementById('btn-new-project').addEventListener('click', () => {
  const name = prompt('새 마인드맵 이름을 입력하세요', '새 마인드맵');
  if (name === null) return;
  const p = createNewProject(name);
  App.projects[p.id] = p;
  saveAllProjects(App.projects);
  openProject(p.id);
});

// ===================== JSON 내보내기/가져오기 =====================

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById('btn-export-json').addEventListener('click', () => {
  persistCurrentProject();
  downloadFile(`${App.current.name}.json`, JSON.stringify(App.current, null, 2), 'application/json');
});

function importProjectFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.nodes || !data.rootId) throw new Error('형식이 올바르지 않습니다.');
      data.id = uid();
      data.updatedAt = Date.now();
      App.projects[data.id] = data;
      saveAllProjects(App.projects);
      openProject(data.id);
    } catch (err) {
      alert('파일을 불러오는 중 오류가 발생했습니다: ' + err.message);
    }
  };
  reader.readAsText(file);
}

document.getElementById('file-import-home').addEventListener('change', (e) => {
  const f = e.target.files[0]; if (f) importProjectFile(f);
  e.target.value = '';
});
document.getElementById('file-import-editor').addEventListener('change', (e) => {
  const f = e.target.files[0]; if (f) importProjectFile(f);
  e.target.value = '';
});

// ===================== PNG / PDF 내보내기 =====================

function buildExportSvg() {
  const nodes = Object.values(App.current.nodes).filter(n => !isHiddenByCollapse(n.id));
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
  });
  minX -= 200; maxX += 200; minY -= 100; maxY += 100;
  const w = maxX - minX, h = maxY - minY;

  const theme = THEMES.find(t => t.id === App.current.theme) || THEMES[0];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += `<rect width="100%" height="100%" fill="${theme.bg}"/>`;

  nodes.forEach(n => {
    if (!n.parentId) return;
    const p = getNode(n.parentId);
    if (isHiddenByCollapse(p.id)) return;
    const x1 = p.x - minX, y1 = p.y - minY, x2 = n.x - minX, y2 = n.y - minY;
    svg += `<path d="${elbowPath(x1, y1, x2, y2)}" stroke="${n.bg || '#999'}" stroke-width="2.5" fill="none" opacity="0.75"/>`;
  });

  nodes.forEach(n => {
    const x = n.x - minX, y = n.y - minY;
    const textColor = isDark(n.bg) ? '#fff' : '#1f2330';
    const label = escapeHtml((n.icon ? n.icon + ' ' : '') + n.text);
    const approxW = Math.max(50, label.length * (n.fontSize||14) * 0.62 + 24);
    const rx = n.shape === 'rect' ? 2 : n.shape === 'pill' || n.shape === 'ellipse' ? 22 : 12;
    const fill = n.bg || 'none';
    const stroke = n.borderColor || (n.bg ? 'none' : '#c2c5cc');
    svg += `<rect x="${x - approxW/2}" y="${y-22}" width="${approxW}" height="44" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
    svg += `<text x="${x}" y="${y+5}" font-size="${n.fontSize||14}" font-weight="${n.bold?700:400}" fill="${textColor}" text-anchor="middle" font-family="${(n.fontFamily || DEFAULT_FONT).replace(/'/g, '')}">${label}</text>`;
  });

  svg += '</svg>';
  return { svg, w, h };
}

document.getElementById('btn-export-png').addEventListener('click', () => {
  const { svg, w, h } = buildExportSvg();
  const img = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${App.current.name}.png`;
      a.click();
    });
  };
  img.src = url;
});

document.getElementById('btn-export-pdf').addEventListener('click', () => {
  const { svg } = buildExportSvg();
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>${escapeHtml(App.current.name)}</title>
    <style>body{margin:0;display:flex;justify-content:center;}</style></head><body>${svg}</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 300);
});

// ===================== 공유 링크 (URL에 데이터 인코딩) =====================

document.getElementById('btn-share').addEventListener('click', async () => {
  persistCurrentProject();
  const json = JSON.stringify(App.current);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const url = `${location.origin}${location.pathname}#share=${encoded}`;
  try {
    await navigator.clipboard.writeText(url);
    alert('공유 링크가 클립보드에 복사되었습니다.\n\n주의: 이 링크는 같은 페이지를 호스팅(예: GitHub Pages)했을 때만 다른 사람이 열 수 있습니다. 로컬 파일로만 열고 있다면, 대신 "내보내기(JSON)"로 파일을 보내주세요.');
  } catch (e) {
    prompt('아래 링크를 복사하세요:', url);
  }
});

function checkShareHash() {
  const hash = location.hash;
  if (!hash.startsWith('#share=')) return;
  try {
    const encoded = hash.slice(7);
    const json = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(json);
    if (!confirm(`공유된 마인드맵 "${data.name}"을 가져올까요?`)) { history.replaceState(null,'',location.pathname); return; }
    data.id = uid();
    data.updatedAt = Date.now();
    App.projects[data.id] = data;
    saveAllProjects(App.projects);
    history.replaceState(null, '', location.pathname);
    openProject(data.id);
  } catch (e) {
    console.error('공유 링크 파싱 실패', e);
  }
}

// ===================== 초기화 =====================

function initThemeSelect() {
  const sel = document.getElementById('theme-select');
  sel.innerHTML = '';
  THEMES.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id; opt.textContent = t.name;
    sel.appendChild(opt);
  });
}

window.addEventListener('beforeunload', () => { if (App.current) persistCurrentProject(); });
setInterval(() => { if (App.current) persistCurrentProject(); }, 8000);

function afterAuth() {
  if (location.hash.startsWith('#share=')) checkShareHash();
  else renderHome();
}

initThemeSelect();

if (!isAuthed()) showLogin();
else afterAuth();
