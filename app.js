// ===================== 마인드맵 앱 (서버 없이 동작하는 순수 클라이언트 앱) =====================

const STORAGE_KEY = 'mindmap_projects_v1';
const FOLDER_STORAGE_KEY = 'mindmap_folders_v1';
const AUTH_KEY = 'mindmap_auth_v1';
const AUTH_ID = 'wkftodrls';
const AUTH_PW = 'gudrb!!';

const THEMES = [
  { id: 'sunset',   name: '선셋',     bg: '#f8f9fb', dot: '#e2e4ea', palette: ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#9775FA', '#F783AC'] },
  { id: 'ocean',    name: '오션',     bg: '#f2f7fb', dot: '#cfe6f7', palette: ['#1C7ED6', '#15AABF', '#0CA678', '#5C7CFA', '#228BE6', '#3BC9DB', '#74C0FC'] },
  { id: 'forest',   name: '포레스트', bg: '#f3f8f3', dot: '#cdeed2', palette: ['#2F9E44', '#66A80F', '#37B24D', '#94D82D', '#0CA678', '#40C057', '#82C91E'] },
  { id: 'mono',     name: '모노톤',   bg: '#f5f5f6', dot: '#dcdde0', palette: ['#343A40', '#495057', '#868E96', '#ADB5BD', '#5C636E', '#212529', '#6C757D'] },
  { id: 'candy',    name: '캔디',     bg: '#fdf6fb', dot: '#f3d9ee', palette: ['#E64980', '#BE4BDB', '#F06595', '#CC5DE8', '#FF8787', '#FAA2C1', '#D0BFFF'] },
  { id: 'berry',    name: '베리',     bg: '#fbf5fb', dot: '#ecd9ec', palette: ['#9C36B5', '#AE3EC9', '#C2255C', '#E64980', '#862E9C', '#A61E4D', '#D6336C'] },
  { id: 'autumn',   name: '오텀',     bg: '#fff8f0', dot: '#f0ddc4', palette: ['#E8590C', '#D9480F', '#F08C00', '#E67700', '#C92A2A', '#A61E4D', '#FAB005'] },
  { id: 'mint',     name: '민트',     bg: '#f1fbf8', dot: '#cdeee2', palette: ['#0CA678', '#12B886', '#099268', '#0CA678', '#37B24D', '#2B8A3E', '#66D9C4'] },
  { id: 'sky',      name: '스카이',   bg: '#f0f8ff', dot: '#cfe6f7', palette: ['#1971C2', '#1C7ED6', '#228BE6', '#4DABF7', '#339AF0', '#15AABF', '#3BC9DB'] },
  { id: 'rose',     name: '로즈',     bg: '#fff0f3', dot: '#f8d2dc', palette: ['#E03131', '#F03E3E', '#E8590C', '#F76707', '#C2255C', '#E64980', '#FA5252'] },
  { id: 'lavender', name: '라벤더',   bg: '#f6f3fc', dot: '#ddd0f2', palette: ['#7048E8', '#7950F2', '#9775FA', '#845EF7', '#5F3DC4', '#862E9C', '#B197FC'] },
  { id: 'citrus',   name: '시트러스', bg: '#fdfbf0', dot: '#f1e9b8', palette: ['#F08C00', '#FAB005', '#E8590C', '#82C91E', '#66A80F', '#FCC419', '#94D82D'] },
  { id: 'slate',    name: '슬레이트', bg: '#f4f6f8', dot: '#d7dee5', palette: ['#495057', '#4263EB', '#1864AB', '#364FC7', '#1C7ED6', '#343A40', '#5C7CFA'] },
  { id: 'coral',    name: '코랄',     bg: '#fff5f0', dot: '#fbd9c8', palette: ['#FF6B6B', '#FF8787', '#FFA8A8', '#F08C00', '#E8590C', '#FAB005', '#F76707'] },
  { id: 'emerald',  name: '에메랄드', bg: '#eefcf3', dot: '#bfe9cf', palette: ['#087F5B', '#0B7285', '#099268', '#2B8A3E', '#066649', '#0CA678', '#12B886'] },
  { id: 'royal',    name: '로열',     bg: '#f1f0fb', dot: '#cfcbef', palette: ['#3B5BDB', '#5C7CFA', '#7048E8', '#364FC7', '#6741D9', '#1864AB', '#4263EB'] },
  { id: 'midnight', name: '미드나이트', bg: '#161a25', dot: '#262c3d', palette: ['#4DABF7', '#F783AC', '#FFD43B', '#69DB7C', '#9775FA', '#3BC9DB', '#FF8787'] },
  { id: 'charcoal', name: '차콜',     bg: '#1f2227', dot: '#2c3036', palette: ['#FFA94D', '#74C0FC', '#B197FC', '#69DB7C', '#FFD43B', '#FF8787', '#66D9C4'] },
  { id: 'noir',     name: '느와르',   bg: '#0d0d0d', dot: '#262626', palette: ['#FAB005', '#E9ECEF', '#F76707', '#FFD43B', '#ADB5BD', '#E03131', '#FFFFFF'] },
];

const ICONS = ['⭐','✅','❗','❓','🔥','💡','📌','🚀','🎯','📅','💬','📎','⚠️','❤️','👍','👎','🔑','🏆','📈','📉','🧩','🛠️','🔍','🎨','📷','💰','⏰','🌟','🚩','✏️'];

const DEFAULT_FONT = "'Segoe UI', 'Malgun Gothic', sans-serif";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDSm06kUiCfX1KDIMSLOCszp6z0Zn_XmtY",
  authDomain: "mindmap-50e9e.firebaseapp.com",
  projectId: "mindmap-50e9e",
  storageBucket: "mindmap-50e9e.firebasestorage.app",
  messagingSenderId: "743505245659",
  appId: "1:743505245659:web:37edc72064bac51edb63fe"
};

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

function loadAllFolders() {
  try {
    const raw = localStorage.getItem(FOLDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function saveAllFolders(map) {
  localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(map));
}

function createNewProject(name) {
  const rootId = uid();
  return {
    id: uid(),
    name: name || '새 마인드맵',
    theme: 'sunset',
    lineStyle: 'elbow',
    folderId: null,
    rootId,
    updatedAt: Date.now(),
    nodes: {
      [rootId]: {
        id: rootId, parentId: null, children: [],
        text: name || '중심 주제', x: 0, y: 0,
        bg: '#4a63e7', borderColor: null, borderWidth: 2, shape: 'pill', bold: true, fontSize: 16,
        fontFamily: DEFAULT_FONT, textAlign: 'center', icon: '', image: null, collapsed: false
      }
    }
  };
}

// ===================== 애플리케이션 상태 =====================

const App = {
  projects: loadAllProjects(),
  folders: loadAllFolders(),
  currentFolderId: null,
  current: null,
  selectedNodeId: null,
  selectedIds: new Set(),
  history: [],
  future: [],
  pan: { x: 200, y: 600 },
  zoom: 1,
};

// ===================== 로그인 (아이디/비밀번호) =====================

function isAuthed() {
  return localStorage.getItem(AUTH_KEY) === '1' || sessionStorage.getItem(AUTH_KEY) === '1';
}

function ensureFirebaseApp() {
  if (typeof firebase === 'undefined') return false;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  return true;
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
    document.getElementById('login-error').textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
    document.getElementById('login-error').classList.remove('hidden');
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  if (typeof firebase !== 'undefined') firebase.auth().signOut().catch(() => {});
  if (cloudUnsub) { cloudUnsub(); cloudUnsub = null; }
  if (cloudFolderUnsub) { cloudFolderUnsub(); cloudFolderUnsub = null; }
  cloudReady = false;
  showLogin();
});

// ===================== 홈 화면 =====================

function renderHome() {
  document.getElementById('home-view').classList.remove('hidden');
  document.getElementById('editor-view').classList.add('hidden');
  document.getElementById('login-view').classList.add('hidden');
  renderBreadcrumb();

  const list = document.getElementById('project-list');
  const folderIds = Object.keys(App.folders)
    .filter(id => (App.folders[id].parentId || null) === App.currentFolderId)
    .sort((a, b) => App.folders[a].name.localeCompare(App.folders[b].name));
  const projectIds = Object.keys(App.projects)
    .filter(id => (App.projects[id].folderId || null) === App.currentFolderId)
    .sort((a, b) => (App.projects[b].updatedAt || 0) - (App.projects[a].updatedAt || 0));

  if (folderIds.length === 0 && projectIds.length === 0) {
    list.innerHTML = '<div class="empty-hint">아직 만든 마인드맵이 없습니다. "새 프로젝트"로 시작해보세요.</div>';
    return;
  }
  list.innerHTML = '';

  folderIds.forEach(id => {
    const f = App.folders[id];
    const card = document.createElement('div');
    card.className = 'folder-card';
    card.innerHTML = `<div class="fc-actions">
        <button class="fc-move" title="폴더 이동">📦</button>
        <button class="fc-rename" title="이름 변경">✏️</button>
        <button class="fc-delete" title="삭제">✕</button>
      </div>
      <div class="fc-icon">📁</div>
      <div class="fc-title">${escapeHtml(f.name)}</div>`;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fc-actions')) return;
      App.currentFolderId = id;
      renderHome();
    });
    card.querySelector('.fc-move').addEventListener('click', (e) => {
      e.stopPropagation();
      const exclude = collectFolderAndDescendants(id);
      openFolderPicker(e.clientX, e.clientY, exclude, (targetId) => moveFolderTo(id, targetId));
    });
    card.querySelector('.fc-rename').addEventListener('click', (e) => {
      e.stopPropagation();
      const name = prompt('새 폴더 이름을 입력하세요', f.name);
      if (name === null || !name.trim()) return;
      f.name = name.trim();
      f.updatedAt = Date.now();
      saveAllFolders(App.folders);
      pushFolderToCloud(f);
      renderHome();
    });
    card.querySelector('.fc-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteFolder(id);
    });
    list.appendChild(card);
  });

  projectIds.forEach(id => {
    const p = App.projects[id];
    const card = document.createElement('div');
    card.className = 'project-card';
    const count = Object.keys(p.nodes || {}).length;
    card.innerHTML = `<button class="pc-move" title="폴더로 이동">📦</button>
      <button class="pc-delete" title="삭제">✕</button>
      <div class="pc-title">${escapeHtml(p.name)}</div>
      <div class="pc-meta">노드 ${count}개 · ${p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ''}</div>`;
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('pc-delete') || e.target.classList.contains('pc-move')) return;
      openProject(id);
    });
    card.querySelector('.pc-move').addEventListener('click', (e) => {
      e.stopPropagation();
      openFolderPicker(e.clientX, e.clientY, null, (targetId) => moveProjectTo(id, targetId));
    });
    card.querySelector('.pc-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`"${p.name}" 프로젝트를 삭제할까요?`)) {
        delete App.projects[id];
        saveAllProjects(App.projects);
        deleteProjectFromCloud(id);
        renderHome();
      }
    });
    list.appendChild(card);
  });
}

function renderBreadcrumb() {
  const bc = document.getElementById('folder-breadcrumb');
  bc.innerHTML = '';
  const home = document.createElement('span');
  home.className = 'bc-item' + (App.currentFolderId ? '' : ' current');
  home.textContent = '🏠 홈';
  home.addEventListener('click', () => { App.currentFolderId = null; renderHome(); });
  bc.appendChild(home);
  const path = folderPath(App.currentFolderId);
  path.forEach((f, i) => {
    const sep = document.createElement('span');
    sep.className = 'bc-sep'; sep.textContent = '/';
    bc.appendChild(sep);
    const item = document.createElement('span');
    item.className = 'bc-item' + (i === path.length - 1 ? ' current' : '');
    item.textContent = f.name;
    item.addEventListener('click', () => { App.currentFolderId = f.id; renderHome(); });
    bc.appendChild(item);
  });
}

function folderPath(folderId) {
  const path = [];
  let cur = folderId;
  while (cur) {
    const f = App.folders[cur];
    if (!f) break;
    path.unshift(f);
    cur = f.parentId;
  }
  return path;
}

function collectFolderAndDescendants(folderId) {
  const ids = [folderId];
  let changed = true;
  while (changed) {
    changed = false;
    Object.values(App.folders).forEach(f => {
      if (f.parentId && ids.includes(f.parentId) && !ids.includes(f.id)) { ids.push(f.id); changed = true; }
    });
  }
  return ids;
}

function isFolderDescendant(ancestorId, candidateId) {
  let f = App.folders[candidateId];
  while (f && f.parentId) {
    if (f.parentId === ancestorId) return true;
    f = App.folders[f.parentId];
  }
  return false;
}

function deleteFolder(folderId) {
  const folder = App.folders[folderId];
  if (!folder) return;
  const allIds = collectFolderAndDescendants(folderId);
  const projectsInside = Object.values(App.projects).filter(p => allIds.includes(p.folderId));
  const subFolderCount = allIds.length - 1;
  const msg = subFolderCount || projectsInside.length
    ? `"${folder.name}" 폴더를 삭제하면 하위 폴더 ${subFolderCount}개와 마인드맵 ${projectsInside.length}개가 모두 삭제됩니다. 계속할까요?`
    : `"${folder.name}" 폴더를 삭제할까요?`;
  if (!confirm(msg)) return;
  projectsInside.forEach(p => {
    delete App.projects[p.id];
    deleteProjectFromCloud(p.id);
  });
  allIds.forEach(fid => {
    delete App.folders[fid];
    deleteFolderFromCloud(fid);
  });
  saveAllProjects(App.projects);
  saveAllFolders(App.folders);
  if (allIds.includes(App.currentFolderId)) App.currentFolderId = folder.parentId || null;
  renderHome();
}

function moveFolderTo(folderId, newParentId) {
  if (folderId === newParentId) return;
  if (newParentId && isFolderDescendant(folderId, newParentId)) { alert('하위 폴더로는 이동할 수 없습니다.'); return; }
  const folder = App.folders[folderId];
  if (!folder) return;
  folder.parentId = newParentId || null;
  folder.updatedAt = Date.now();
  saveAllFolders(App.folders);
  pushFolderToCloud(folder);
  renderHome();
}

function moveProjectTo(projectId, folderId) {
  const p = App.projects[projectId];
  if (!p) return;
  p.folderId = folderId || null;
  p.updatedAt = Date.now();
  saveAllProjects(App.projects);
  pushProjectToCloud(p);
  renderHome();
}

function buildFolderOptionsList(excludeIds) {
  const items = [];
  function walk(parentId, depth) {
    Object.values(App.folders)
      .filter(f => (f.parentId || null) === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(f => {
        if (excludeIds && excludeIds.includes(f.id)) return;
        items.push({ id: f.id, name: f.name, depth });
        walk(f.id, depth + 1);
      });
  }
  walk(null, 0);
  return items;
}

function openFolderPicker(clientX, clientY, excludeIds, onSelect) {
  const menu = document.getElementById('context-menu');
  menu.innerHTML = '';
  menu.appendChild(cmItem('📂 최상위(홈)', () => onSelect(null)));
  buildFolderOptionsList(excludeIds).forEach(item => {
    const label = '　'.repeat(item.depth) + '📁 ' + item.name;
    menu.appendChild(cmItem(label, () => onSelect(item.id)));
  });
  placeContextMenu(clientX, clientY);
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
  document.getElementById('line-style-select').value = App.current.lineStyle || 'elbow';
  render();
}

function persistCurrentProject() {
  if (!App.current) return Promise.resolve();
  App.current.updatedAt = Date.now();
  App.projects[App.current.id] = JSON.parse(JSON.stringify(App.current));
  saveAllProjects(App.projects);
  return pushProjectToCloud(App.projects[App.current.id]);
}

let toastTimer = null;
function showToast(message, isError) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.toggle('error', !!isError);
  el.classList.remove('hidden');
  requestAnimationFrame(() => el.classList.add('show'));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 250);
  }, isError ? 3000 : 1600);
}

function saveProjectAs(newName) {
  if (!App.current) return;
  const copy = JSON.parse(JSON.stringify(App.current));
  copy.id = uid();
  copy.name = newName;
  copy.updatedAt = Date.now();
  App.projects[copy.id] = copy;
  saveAllProjects(App.projects);
  pushProjectToCloud(copy);
  openProject(copy.id);
  showToast(`"${newName}"으로 저장되었습니다`);
}

function goHome() {
  persistCurrentProject();
  App.current = null;
  renderHome();
}

// ===================== 클라우드 동기화 (Firebase Firestore) =====================

let cloudReady = false;
let cloudDb = null;
let cloudUnsub = null;
let cloudFolderUnsub = null;

function cloudCollectionRef() {
  return cloudDb.collection('mindmap_data').doc(AUTH_ID).collection('projects');
}

function cloudFolderCollectionRef() {
  return cloudDb.collection('mindmap_data').doc(AUTH_ID).collection('folders');
}

function initCloudSync() {
  if (!ensureFirebaseApp()) return;
  try {
    const proceed = () => {
      cloudDb = firebase.firestore();
      cloudReady = true;
      if (cloudUnsub) cloudUnsub();
      cloudUnsub = cloudCollectionRef().onSnapshot((snap) => {
        let changed = false;
        snap.docChanges().forEach(change => {
          const id = change.doc.id;
          if (change.type === 'removed') {
            if (App.projects[id]) { delete App.projects[id]; changed = true; }
            return;
          }
          const remote = change.doc.data();
          const local = App.projects[id];
          if (!local || (remote.updatedAt || 0) > (local.updatedAt || 0)) {
            App.projects[id] = remote;
            if (!App.current || App.current.id !== id) changed = true;
          }
        });
        if (changed) {
          saveAllProjects(App.projects);
          if (!App.current) renderHome();
        }
        if (pendingOpenProjectId && App.projects[pendingOpenProjectId]) {
          const id = pendingOpenProjectId;
          pendingOpenProjectId = null;
          openProject(id);
        }
      }, (err) => console.error('동기화 수신 오류', err));

      if (cloudFolderUnsub) cloudFolderUnsub();
      cloudFolderUnsub = cloudFolderCollectionRef().onSnapshot((snap) => {
        let changed = false;
        snap.docChanges().forEach(change => {
          const id = change.doc.id;
          if (change.type === 'removed') {
            if (App.folders[id]) { delete App.folders[id]; changed = true; }
            return;
          }
          const remote = change.doc.data();
          const local = App.folders[id];
          if (!local || (remote.updatedAt || 0) > (local.updatedAt || 0)) {
            App.folders[id] = remote;
            changed = true;
          }
        });
        if (changed) {
          saveAllFolders(App.folders);
          if (!App.current) renderHome();
        }
      }, (err) => console.error('폴더 동기화 수신 오류', err));
    };
    if (firebase.auth().currentUser) {
      proceed();
    } else {
      firebase.auth().signInAnonymously().then(proceed).catch(err => console.error('Firebase 익명 로그인 실패', err));
    }
  } catch (err) {
    console.error('Firebase 초기화 실패', err);
  }
}

function pushProjectToCloud(project) {
  if (!cloudReady || !project) return Promise.resolve();
  return cloudCollectionRef().doc(project.id).set(project).catch(err => {
    console.error('클라우드 저장 실패', err);
    throw err;
  });
}

function deleteProjectFromCloud(id) {
  if (!cloudReady) return;
  cloudCollectionRef().doc(id).delete().catch(err => console.error('클라우드 삭제 실패', err));
}

function pushFolderToCloud(folder) {
  if (!cloudReady || !folder) return;
  cloudFolderCollectionRef().doc(folder.id).set(folder).catch(err => console.error('폴더 클라우드 저장 실패', err));
}

function deleteFolderFromCloud(id) {
  if (!cloudReady) return;
  cloudFolderCollectionRef().doc(id).delete().catch(err => console.error('폴더 클라우드 삭제 실패', err));
}

function pullProjectFromCloud(projectId) {
  if (!cloudReady) { showToast('⚠ 클라우드에 연결되어 있지 않습니다', true); return; }
  cloudCollectionRef().doc(projectId).get().then(doc => {
    if (!doc.exists) { showToast('⚠ 클라우드에 저장된 버전이 없습니다', true); return; }
    if (!confirm('클라우드의 최신 버전을 가져오면 지금 화면의 변경 내용은 사라집니다. 계속할까요?')) return;
    const remote = doc.data();
    App.projects[projectId] = remote;
    saveAllProjects(App.projects);
    if (App.current && App.current.id === projectId) {
      App.current = JSON.parse(JSON.stringify(remote));
      App.selectedNodeId = App.current.rootId;
      App.selectedIds = new Set();
      App.history = []; App.future = [];
      document.getElementById('project-name').value = App.current.name;
      document.getElementById('line-style-select').value = App.current.lineStyle || 'elbow';
      render();
    }
    showToast('☁ 클라우드에서 불러왔습니다');
  }).catch(err => {
    console.error('클라우드 가져오기 실패', err);
    showToast('⚠ 클라우드에서 가져오는 중 오류가 발생했습니다', true);
  });
}

function pullAllFromCloud() {
  if (!cloudReady) { showToast('⚠ 클라우드에 연결되어 있지 않습니다', true); return; }
  Promise.all([cloudCollectionRef().get(), cloudFolderCollectionRef().get()]).then(([projSnap, folderSnap]) => {
    projSnap.forEach(doc => { App.projects[doc.id] = doc.data(); });
    folderSnap.forEach(doc => { App.folders[doc.id] = doc.data(); });
    saveAllProjects(App.projects);
    saveAllFolders(App.folders);
    if (!App.current) renderHome();
    showToast('☁ 클라우드 목록을 새로고침했습니다');
  }).catch(err => {
    console.error('클라우드 가져오기 실패', err);
    showToast('⚠ 클라우드에서 가져오는 중 오류가 발생했습니다', true);
  });
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
    fontFamily: DEFAULT_FONT, textAlign: 'auto', icon: '', image: null, collapsed: false
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

function deleteSelectedNodes() {
  const ids = App.selectedIds.size ? Array.from(App.selectedIds) : (App.selectedNodeId ? [App.selectedNodeId] : []);
  const targets = ids.filter(id => id !== App.current.rootId && getNode(id));
  if (!targets.length) {
    if (ids.includes(App.current.rootId)) alert('중심 주제는 삭제할 수 없습니다.');
    return;
  }
  snapshot();
  targets.forEach(nodeId => {
    const node = getNode(nodeId);
    if (!node) return;
    const stack = [nodeId];
    while (stack.length) {
      const cur = stack.pop();
      const n = getNode(cur);
      if (!n) continue;
      n.children.forEach(c => stack.push(c));
      delete App.current.nodes[cur];
    }
    if (node.parentId && getNode(node.parentId)) {
      const parent = getNode(node.parentId);
      parent.children = parent.children.filter(c => c !== nodeId);
    }
  });
  App.selectedIds = new Set([App.current.rootId]);
  App.selectedNodeId = App.current.rootId;
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
  const canvasEl = document.getElementById('canvas-wrap');
  canvasEl.style.backgroundColor = theme.bg;
  canvasEl.style.backgroundImage = `radial-gradient(circle, ${theme.dot || '#e2e4ea'} 1px, transparent 1px)`;
  canvasEl.style.backgroundSize = '22px 22px';

  // 노드를 먼저 그려서 실제 폭을 알아야 연결선이 박스 가장자리에 정확히 닿는다
  Object.values(App.current.nodes).forEach(n => {
    if (isHiddenByCollapse(n.id)) return;
    nodesLayer.appendChild(buildNodeEl(n));
  });

  const lineStyle = App.current.lineStyle || 'elbow';
  if (lineStyle === 'bracket' || lineStyle === 'taper') {
    Object.values(App.current.nodes).forEach(parent => {
      if (parent.collapsed) return;
      const kids = parent.children.filter(id => !isHiddenByCollapse(id)).map(getNode);
      if (!kids.length) return;
      const appendPath = (d, color, width) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('transform', `translate(${OFFSET}, ${OFFSET})`);
        path.setAttribute('stroke', color || '#999');
        path.setAttribute('stroke-width', String(width));
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.75');
        linesLayer.appendChild(path);
      };
      if (lineStyle === 'taper') {
        bracketChildTaperPaths(parent, kids).forEach(p => {
          appendPath(p.thick, parent.bg, 6);
          appendPath(p.thin, p.color, 2.5);
        });
      } else {
        bracketChildPaths(parent, kids).forEach(p => appendPath(p.d, p.color, 2.5));
      }
    });
  } else {
    Object.values(App.current.nodes).forEach(n => {
      if (!n.parentId) return;
      const parent = getNode(n.parentId);
      if (parent.collapsed) return;
      const dir = n.x >= parent.x ? 1 : -1;
      const x1 = parent.x + dir * measuredHalfWidth(parent.id);
      const x2 = n.x - dir * measuredHalfWidth(n.id);
      drawLine(linesLayer, x1 + OFFSET, parent.y + OFFSET, x2 + OFFSET, n.y + OFFSET, n.bg);
    });
  }

  updateZoomTransform();
  updateToolbarForSelection();
}

function elbowPath(x1, y1, x2, y2, bendX) {
  const midX = bendX !== undefined ? bendX : x1 + (x2 - x1) / 2;
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

function curvedPath(x1, y1, x2, y2) {
  const mx = x1 + (x2 - x1) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function connectorPath(x1, y1, x2, y2) {
  return (App.current.lineStyle === 'curved' ? curvedPath : elbowPath)(x1, y1, x2, y2);
}

function measuredHalfWidth(nodeId) {
  const el = document.querySelector(`.mm-node[data-id="${nodeId}"]`);
  if (el && el.offsetWidth) return el.offsetWidth / 2;
  const n = getNode(nodeId);
  const label = (n && n.icon ? n.icon + ' ' : '') + ((n && n.text) || '');
  return Math.max(25, label.length * ((n && n.fontSize) || 14) * 0.31 + 12);
}

function bracketChildPaths(parent, kids) {
  const avgDx = kids.reduce((s, k) => s + (k.x - parent.x), 0) / kids.length;
  const dir = avgDx >= 0 ? 1 : -1;
  const parentHalf = measuredHalfWidth(parent.id);
  const trunkX = parent.x + dir * (parentHalf + 20);
  const x1 = parent.x + dir * parentHalf;
  return kids.map(k => {
    const x2 = k.x - dir * measuredHalfWidth(k.id);
    return { d: elbowPath(x1, parent.y, x2, k.y, trunkX), color: k.bg };
  });
}

function elbowSplit(x1, y1, x2, y2, bendX) {
  const midX = bendX !== undefined ? bendX : x1 + (x2 - x1) / 2;
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) {
    const mid = x1 + (x2 - x1) / 2;
    return { thick: `M ${x1} ${y1} L ${mid} ${y1}`, thin: `M ${mid} ${y1} L ${x2} ${y2}` };
  }
  const signY = dy > 0 ? 1 : -1;
  const signX1 = midX >= x1 ? 1 : -1;
  const signX2 = x2 >= midX ? 1 : -1;
  const r = Math.min(14, Math.abs(midX - x1), Math.abs(x2 - midX), Math.abs(dy) / 2);
  const bend1X = midX - r * signX1, bend2X = midX + r * signX2;
  const topY = y1 + r * signY, botY = y2 - r * signY;
  return {
    thick: `M ${x1} ${y1} L ${bend1X} ${y1} Q ${midX} ${y1} ${midX} ${topY} L ${midX} ${botY}`,
    thin: `M ${midX} ${botY} Q ${midX} ${y2} ${bend2X} ${y2} L ${x2} ${y2}`
  };
}

function bracketChildTaperPaths(parent, kids) {
  const avgDx = kids.reduce((s, k) => s + (k.x - parent.x), 0) / kids.length;
  const dir = avgDx >= 0 ? 1 : -1;
  const parentHalf = measuredHalfWidth(parent.id);
  const trunkX = parent.x + dir * (parentHalf + 20);
  const x1 = parent.x + dir * parentHalf;
  return kids.map(k => {
    const x2 = k.x - dir * measuredHalfWidth(k.id);
    const split = elbowSplit(x1, parent.y, x2, k.y, trunkX);
    return { thick: split.thick, thin: split.thin, color: k.bg };
  });
}

function drawLine(layer, x1, y1, x2, y2, color) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', connectorPath(x1, y1, x2, y2));
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
  el.className = `mm-node shape-${n.shape}` + (App.selectedIds.has(n.id) ? ' selected' : '');
  el.style.left = (n.x + OFFSET) + 'px';
  el.style.top = (n.y + OFFSET) + 'px';
  if (n.shape === 'none') {
    el.style.background = 'transparent';
    el.style.borderColor = 'transparent';
    el.style.borderWidth = '0px';
    el.style.color = n.bg || '#1f2330';
  } else {
    el.style.background = n.bg || '#ffffff';
    el.style.color = isDark(n.bg) ? '#fff' : '#1f2330';
    el.style.borderColor = n.borderColor || (n.bg ? 'transparent' : '#c2c5cc');
    el.style.borderWidth = (n.borderWidth ?? 2) + 'px';
  }
  el.style.fontWeight = n.bold ? '700' : '400';
  el.style.fontSize = (n.fontSize || 14) + 'px';
  el.style.fontFamily = n.fontFamily || DEFAULT_FONT;
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
  span.style.textAlign = resolveTextAlign(n);
  span.style.flex = '1';
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

function resolveTextAlign(n) {
  if (n.textAlign && n.textAlign !== 'auto') return n.textAlign;
  if (n.id === App.current.rootId) return 'center';
  const root = getNode(App.current.rootId);
  return n.x < root.x ? 'right' : 'left';
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
let marqueeState = null;  // Ctrl+드래그로 여러 노드를 사각형으로 선택
let longPressTimer = null;
const activePointers = new Map();
let pinchState = null;
let lastTap = { id: null, time: 0 };

function attachNodeEvents(el, id, textEl, handleEl) {
  el.addEventListener('pointerdown', (e) => {
    if (e.target === handleEl) return; // 핸들 자체 리스너가 처리
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      toggleSelectNode(id);
      return;
    }
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
  App.selectedIds = new Set([id]);
  applySelectionClasses();
  updateToolbarForSelection();
}

function toggleSelectNode(id) {
  if (App.selectedIds.has(id)) App.selectedIds.delete(id);
  else App.selectedIds.add(id);
  App.selectedNodeId = App.selectedIds.has(id) ? id : (Array.from(App.selectedIds).pop() || null);
  applySelectionClasses();
  updateToolbarForSelection();
}

function clearSelection() {
  App.selectedNodeId = null;
  App.selectedIds = new Set();
  applySelectionClasses();
}

function applySelectionClasses() {
  document.querySelectorAll('.mm-node').forEach(el => el.classList.toggle('selected', App.selectedIds.has(el.dataset.id)));
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
    layer.setAttribute('d', connectorPath(connectState.fromX + OFFSET, connectState.fromY + OFFSET, p.x + OFFSET, p.y + OFFSET));
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
  if (marqueeState) {
    const left = Math.min(e.clientX, marqueeState.startClientX) - marqueeState.wrapRect.left;
    const top = Math.min(e.clientY, marqueeState.startClientY) - marqueeState.wrapRect.top;
    const w = Math.abs(e.clientX - marqueeState.startClientX);
    const h = Math.abs(e.clientY - marqueeState.startClientY);
    marqueeState.rectEl.style.left = left + 'px';
    marqueeState.rectEl.style.top = top + 'px';
    marqueeState.rectEl.style.width = w + 'px';
    marqueeState.rectEl.style.height = h + 'px';
    marqueeState.lastClientX = e.clientX;
    marqueeState.lastClientY = e.clientY;
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
  if (marqueeState) {
    const endX = marqueeState.lastClientX ?? marqueeState.startClientX;
    const endY = marqueeState.lastClientY ?? marqueeState.startClientY;
    const p1 = screenToCanvas(marqueeState.startClientX, marqueeState.startClientY);
    const p2 = screenToCanvas(endX, endY);
    const minX = Math.min(p1.x, p2.x), maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y), maxY = Math.max(p1.y, p2.y);
    Object.values(App.current.nodes).forEach(n => {
      if (isHiddenByCollapse(n.id)) return;
      if (n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY) {
        App.selectedIds.add(n.id);
        App.selectedNodeId = n.id;
      }
    });
    marqueeState.rectEl.remove();
    marqueeState = null;
    applySelectionClasses();
    updateToolbarForSelection();
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
  if (marqueeState) { marqueeState.rectEl.remove(); marqueeState = null; }
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
  if (e.ctrlKey || e.metaKey) {
    const wrapRect = canvasWrap.getBoundingClientRect();
    marqueeState = { startClientX: e.clientX, startClientY: e.clientY, wrapRect };
    const rectEl = document.createElement('div');
    rectEl.id = 'marquee-rect';
    canvasWrap.appendChild(rectEl);
    marqueeState.rectEl = rectEl;
    return;
  }
  clearSelection();
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
  const align = (n && n.textAlign) || 'auto';
  document.getElementById('btn-align-auto').classList.toggle('selected', align === 'auto');
  document.getElementById('btn-align-left').classList.toggle('selected', align === 'left');
  document.getElementById('btn-align-center').classList.toggle('selected', align === 'center');
  document.getElementById('btn-align-right').classList.toggle('selected', align === 'right');
}

function applyToSelected(fn) {
  const ids = App.selectedIds.size ? Array.from(App.selectedIds) : (App.selectedNodeId ? [App.selectedNodeId] : []);
  const valid = ids.filter(id => getNode(id));
  if (!valid.length) return;
  snapshot();
  valid.forEach(id => fn(getNode(id)));
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
document.getElementById('btn-align-auto').addEventListener('click', () => {
  applyToSelected(n => n.textAlign = 'auto');
});
document.getElementById('btn-align-left').addEventListener('click', () => {
  applyToSelected(n => n.textAlign = 'left');
});
document.getElementById('btn-align-center').addEventListener('click', () => {
  applyToSelected(n => n.textAlign = 'center');
});
document.getElementById('btn-align-right').addEventListener('click', () => {
  applyToSelected(n => n.textAlign = 'right');
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

document.getElementById('btn-theme').addEventListener('click', (e) => {
  const popup = document.getElementById('theme-popup');
  if (!popup.classList.contains('hidden')) { popup.classList.add('hidden'); return; }
  popup.innerHTML = '';
  THEMES.forEach(t => {
    const card = document.createElement('div');
    card.className = 'theme-card' + (App.current.theme === t.id ? ' selected' : '');
    const swatch = document.createElement('div');
    swatch.className = 'tc-swatch';
    swatch.style.background = t.bg;
    t.palette.slice(0, 5).forEach(c => {
      const dot = document.createElement('div');
      dot.className = 'tc-dot';
      dot.style.background = c;
      swatch.appendChild(dot);
    });
    const name = document.createElement('div');
    name.className = 'tc-name';
    name.textContent = t.name;
    card.appendChild(swatch);
    card.appendChild(name);
    card.addEventListener('click', () => {
      snapshot();
      App.current.theme = t.id;
      render();
      persistCurrentProject();
      popup.classList.add('hidden');
    });
    popup.appendChild(card);
  });
  const rect = e.target.closest('button').getBoundingClientRect();
  popup.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
  popup.style.top = (rect.bottom + 6) + 'px';
  popup.classList.remove('hidden');
});
document.addEventListener('click', (e) => {
  const popup = document.getElementById('theme-popup');
  if (!popup.contains(e.target) && e.target.id !== 'btn-theme') popup.classList.add('hidden');
});

document.getElementById('project-name').addEventListener('input', (e) => {
  App.current.name = e.target.value;
});
document.getElementById('project-name').addEventListener('blur', persistCurrentProject);

document.getElementById('line-style-select').addEventListener('change', (e) => {
  snapshot();
  App.current.lineStyle = e.target.value;
  render();
  persistCurrentProject();
});

// ===================== 키보드 단축키 =====================

document.addEventListener('keydown', (e) => {
  if (!App.current) return;
  const active = document.activeElement;
  if (active && active.isContentEditable) return;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT')) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (e.shiftKey) {
      const name = prompt('다른 이름으로 저장할 이름을 입력하세요', `${App.current.name} 복사본`);
      if (name !== null && name.trim()) saveProjectAs(name.trim());
    } else {
      persistCurrentProject();
      showToast('저장되었습니다');
    }
    return;
  }
  if (!App.selectedNodeId) return;

  if (e.key === 'Tab') { e.preventDefault(); addChildNode(App.selectedNodeId); }
  else if (e.key === 'Enter') { e.preventDefault(); addSiblingNode(App.selectedNodeId); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelectedNodes(); }
  else if (e.key === 'F2') { e.preventDefault(); focusNodeText(App.selectedNodeId, true); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
});

// ===================== 툴바 버튼 바인딩 =====================

document.getElementById('btn-add-child').addEventListener('click', () => App.selectedNodeId && addChildNode(App.selectedNodeId));
document.getElementById('btn-add-sibling').addEventListener('click', () => App.selectedNodeId && addSiblingNode(App.selectedNodeId));
document.getElementById('btn-delete-node').addEventListener('click', () => deleteSelectedNodes());
document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);
document.getElementById('btn-home').addEventListener('click', goHome);

document.getElementById('btn-toolbar-more').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('toolbar-extra').classList.toggle('open');
});
document.addEventListener('click', (e) => {
  const extra = document.getElementById('toolbar-extra');
  const moreBtn = document.getElementById('btn-toolbar-more');
  if (extra.classList.contains('open') && !extra.contains(e.target) && e.target !== moreBtn) {
    extra.classList.remove('open');
  }
});

document.getElementById('btn-zoom-in').addEventListener('click', () => { App.zoom = Math.min(2.5, App.zoom + 0.1); updateZoomTransform(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { App.zoom = Math.max(0.2, App.zoom - 0.1); updateZoomTransform(); });
document.getElementById('btn-zoom-reset').addEventListener('click', () => { App.zoom = 1; App.pan = { x: window.innerWidth/2, y: window.innerHeight/2 - 40 }; updateZoomTransform(); });

document.getElementById('btn-new-project').addEventListener('click', () => {
  const name = prompt('새 마인드맵 이름을 입력하세요', '새 마인드맵');
  if (name === null) return;
  const p = createNewProject(name);
  p.folderId = App.currentFolderId;
  App.projects[p.id] = p;
  saveAllProjects(App.projects);
  pushProjectToCloud(p);
  openProject(p.id);
});

document.getElementById('btn-new-folder').addEventListener('click', () => {
  const name = prompt('새 폴더 이름을 입력하세요', '새 폴더');
  if (name === null || !name.trim()) return;
  const folder = { id: uid(), name: name.trim(), parentId: App.currentFolderId, updatedAt: Date.now() };
  App.folders[folder.id] = folder;
  saveAllFolders(App.folders);
  pushFolderToCloud(folder);
  renderHome();
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

document.getElementById('btn-save').addEventListener('click', () => {
  persistCurrentProject();
  showToast('저장되었습니다');
});

document.getElementById('btn-save-as').addEventListener('click', () => {
  const name = prompt('다른 이름으로 저장할 이름을 입력하세요', `${App.current.name} 복사본`);
  if (name === null || !name.trim()) return;
  saveProjectAs(name.trim());
});

document.getElementById('btn-save-sync').addEventListener('click', () => {
  if (!App.current) return;
  const btn = document.getElementById('btn-save-sync');
  btn.disabled = true;
  persistCurrentProject().then(() => {
    showToast('☁ 저장 및 동기화 완료');
  }).catch(() => {
    showToast('⚠ 로컬에는 저장됐지만 클라우드 동기화는 실패했습니다 (오프라인일 수 있음)', true);
  }).finally(() => {
    btn.disabled = false;
  });
});

document.getElementById('btn-cloud-pull').addEventListener('click', () => {
  if (!App.current) return;
  pullProjectFromCloud(App.current.id);
});

document.getElementById('btn-cloud-refresh').addEventListener('click', () => {
  pullAllFromCloud();
});

function importProjectFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.nodes || !data.rootId) throw new Error('형식이 올바르지 않습니다.');
      data.id = uid();
      data.updatedAt = Date.now();
      data.folderId = App.currentFolderId;
      App.projects[data.id] = data;
      saveAllProjects(App.projects);
      pushProjectToCloud(data);
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

  const exportLineStyle = App.current.lineStyle || 'elbow';
  if (exportLineStyle === 'bracket' || exportLineStyle === 'taper') {
    nodes.forEach(parent => {
      if (parent.collapsed) return;
      const kids = parent.children.filter(id => !isHiddenByCollapse(id)).map(getNode);
      if (!kids.length) return;
      const addPath = (d, color, width) => {
        svg += `<path d="${d}" transform="translate(${-minX}, ${-minY})" stroke="${color || '#999'}" stroke-width="${width}" stroke-linecap="round" fill="none" opacity="0.75"/>`;
      };
      if (exportLineStyle === 'taper') {
        bracketChildTaperPaths(parent, kids).forEach(p => {
          addPath(p.thick, parent.bg, 6);
          addPath(p.thin, p.color, 2.5);
        });
      } else {
        bracketChildPaths(parent, kids).forEach(p => addPath(p.d, p.color, 2.5));
      }
    });
  } else {
    nodes.forEach(n => {
      if (!n.parentId) return;
      const p = getNode(n.parentId);
      if (isHiddenByCollapse(p.id)) return;
      const dir = n.x >= p.x ? 1 : -1;
      const x1 = (p.x + dir * measuredHalfWidth(p.id)) - minX, y1 = p.y - minY;
      const x2 = (n.x - dir * measuredHalfWidth(n.id)) - minX, y2 = n.y - minY;
      svg += `<path d="${connectorPath(x1, y1, x2, y2)}" stroke="${n.bg || '#999'}" stroke-width="2.5" fill="none" opacity="0.75"/>`;
    });
  }

  nodes.forEach(n => {
    const x = n.x - minX, y = n.y - minY;
    const textColor = isDark(n.bg) ? '#fff' : '#1f2330';
    const label = escapeHtml((n.icon ? n.icon + ' ' : '') + n.text);
    const approxW = Math.max(50, label.length * (n.fontSize||14) * 0.62 + 24);
    const rx = n.shape === 'rect' ? 2 : n.shape === 'pill' || n.shape === 'ellipse' ? 22 : 12;
    const noBox = n.shape === 'none';
    if (!noBox) {
      const fill = n.bg || 'none';
      const stroke = n.borderColor || (n.bg ? 'none' : '#c2c5cc');
      svg += `<rect x="${x - approxW/2}" y="${y-22}" width="${approxW}" height="44" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
    }
    const align = resolveTextAlign(n);
    const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
    const textX = align === 'left' ? x - approxW/2 + 8 : align === 'right' ? x + approxW/2 - 8 : x;
    const textFill = noBox ? (n.bg || textColor) : textColor;
    svg += `<text x="${textX}" y="${y+5}" font-size="${n.fontSize||14}" font-weight="${n.bold?700:400}" fill="${textFill}" text-anchor="${anchor}" font-family="${(n.fontFamily || DEFAULT_FONT).replace(/'/g, '')}">${label}</text>`;
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

window.addEventListener('beforeunload', () => { if (App.current) persistCurrentProject(); });
setInterval(() => { if (App.current) persistCurrentProject(); }, 8000);

// 플래너 앱의 "프로젝트 플로우" 페이지에서 #open=projectId 형태로 들어오면 해당 마인드맵을 바로 연다.
let pendingOpenProjectId = null;

function afterAuth() {
  initCloudSync();
  if (location.hash.startsWith('#share=')) {
    checkShareHash();
    return;
  }
  if (location.hash.startsWith('#open=')) {
    const id = decodeURIComponent(location.hash.slice(6));
    history.replaceState(null, '', location.pathname);
    if (App.projects[id]) { openProject(id); return; }
    pendingOpenProjectId = id;
  }
  renderHome();
}

if (!isAuthed()) {
  showLogin();
} else {
  afterAuth();
}
