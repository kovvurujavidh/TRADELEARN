// TradeLearn - Smart Trading Journal & Learning Hub
// Full-Stack Architecture with Centralized Database & REST API

const API_BASE = '/api';
const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 8 * 1024 * 1024; // 8MB upload limit

let trades = [];
let learns = [];
let strategies = [];
let currentFilter = 'all';
let searchQuery = '';
let deleteTargetId = null;
let deleteType = 'trade';
let pendingPhotos = [];
let lightboxImages = [];
let lightboxIndex = 0;
let learnCurrentFilter = 'all';
let learnSearchQuery = '';
let learnDeleteTargetId = null;
let learnPendingPhotos = [];
let editingStrategyId = null;
let viewTradeId = null;
let viewLearnId = null;
let healthCheckTimer = null;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const els = {};

function cacheEls() {
  Object.assign(els, {
    headerDate: $('#headerDate'),
    themeToggle: $('#themeToggle'),
    dbBadge: $('#dbBadge'),

    exportBackupBtn: $('#exportBackupBtn'),
    restoreBackupBtn: $('#restoreBackupBtn'),
    importBackupFile: $('#importBackupFile'),

    tradeForm: $('#tradeForm'),
    editId: $('#editId'),
    formTitle: $('#formTitle'),
    formSubtitle: $('#formSubtitle'),
    submitBtn: $('#submitBtn'),
    submitBtnText: $('#submitBtnText'),
    cancelEditBtn: $('#cancelEditBtn'),
    searchInput: $('#searchInput'),
    filterChips: $('#filterChips'),
    tradeTableBody: $('#tradeTableBody'),
    mobileCards: $('#mobileCards'),
    emptyState: $('#emptyState'),
    tableWrap: $('#tableWrap'),
    statTotal: $('#statTotal'),
    statWins: $('#statWins'),
    statLosses: $('#statLosses'),
    statRate: $('#statRate'),
    statStreak: $('#statStreak'),
    breakdownGrid: $('#breakdownGrid'),
    exportCsvBtn: $('#exportCsvBtn'),
    importBtn: $('#importBtn'),
    importFile: $('#importFile'),
    clearAllBtn: $('#clearAllBtn'),
    deleteModal: $('#deleteModal'),
    cancelDeleteBtn: $('#cancelDeleteBtn'),
    confirmDeleteBtn: $('#confirmDeleteBtn'),
    clearModal: $('#clearModal'),
    cancelClearBtn: $('#cancelClearBtn'),
    confirmClearBtn: $('#confirmClearBtn'),
    toastContainer: $('#toastContainer'),
    photoUploadZone: $('#photoUploadZone'),
    photoInput: $('#photoInput'),
    uploadPreview: $('#uploadPreview'),
    uploadPlaceholder: $('#uploadPlaceholder'),
    lightboxOverlay: $('#lightboxOverlay'),
    lightboxImg: $('#lightboxImg'),
    lightboxClose: $('#lightboxClose'),
    lightboxPrev: $('#lightboxPrev'),
    lightboxNext: $('#lightboxNext'),
    lightboxCounter: $('#lightboxCounter'),
    fieldDescription: $('#fieldDescription'),

    strategiesGrid: $('#strategiesGrid'),
    strategiesEmptyState: $('#strategiesEmptyState'),
    addStrategyBtn: $('#addStrategyBtn'),
    strategyModal: $('#strategyModal'),

    learnForm: $('#learnForm'),
    learnEditId: $('#learnEditId'),
    learnFormTitle: $('#learnFormTitle'),
    learnFormSubtitle: $('#learnFormSubtitle'),
    learnDate: $('#learnDate'),
    learnTitle: $('#learnTitle'),
    learnDescription: $('#learnDescription'),
    learnRules: $('#learnRules'),
    learnSubmitBtn: $('#learnSubmitBtn'),
    learnSubmitBtnText: $('#learnSubmitBtnText'),
    learnCancelBtn: $('#learnCancelBtn'),
    learnPhotoZone: $('#learnPhotoZone'),
    learnPhotoInput: $('#learnPhotoInput'),
    learnUploadPreview: $('#learnUploadPreview'),
    learnUploadPlaceholder: $('#learnUploadPlaceholder'),
    learnCards: $('#learnCards'),
    learnEmptyState: $('#learnEmptyState'),
    learnSearchInput: $('#learnSearchInput'),
    learnFilterChips: $('#learnFilterChips'),
    exportLearnBtn: $('#exportLearnBtn'),
    clearLearnBtn: $('#clearLearnBtn'),
    learnDeleteModal: $('#learnDeleteModal'),
    cancelLearnDeleteBtn: $('#cancelLearnDeleteBtn'),
    confirmLearnDeleteBtn: $('#confirmLearnDeleteBtn'),
    learnClearModal: $('#learnClearModal'),
    cancelLearnClearBtn: $('#cancelLearnClearBtn'),
    confirmLearnClearBtn: $('#confirmLearnClearBtn'),

    tradeViewModal: $('#tradeViewModal'),
    tradeViewBody: $('#tradeViewBody'),
    learnViewModal: $('#learnViewModal'),
    learnViewBody: $('#learnViewBody')
  });
}

// ---------------------- INITIALIZATION ----------------------

async function init() {
  cacheEls();
  loadTheme();
  setHeaderDate();
  setDefaultDates();
  bindEvents();

  // Initial database health check & fetch data
  await checkDbHealth();
  await Promise.all([
    fetchTrades(),
    fetchLearns(),
    fetchStrategies()
  ]);

  // Periodic health check every 10 seconds
  if (healthCheckTimer) clearInterval(healthCheckTimer);
  healthCheckTimer = setInterval(checkDbHealth, 10000);
}

function setHeaderDate() {
  const n = new Date();
  if (els.headerDate) {
    els.headerDate.textContent = n.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}

function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const fieldDate = $('#fieldDate');
  if (fieldDate && !fieldDate.value) fieldDate.value = today;
  const learnDate = $('#learnDate');
  if (learnDate && !learnDate.value) learnDate.value = today;
}

function loadTheme() {
  const s = localStorage.getItem('tradeJournalTheme') || 'light';
  document.documentElement.setAttribute('data-theme', s);
}

function toggleTheme() {
  const c = document.documentElement.getAttribute('data-theme');
  const n = c === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', n);
  localStorage.setItem('tradeJournalTheme', n);
}

// ---------------------- DATABASE API CALLS ----------------------

async function checkDbHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health status error');
    const data = await res.json();
    if (els.dbBadge) {
      els.dbBadge.className = 'db-badge connected';
      els.dbBadge.textContent = '🟢 DB Connected (' + (data.database === 'postgresql' ? 'Postgres' : 'SQLite') + ')';
    }
    return true;
  } catch (err) {
    if (els.dbBadge) {
      els.dbBadge.className = 'db-badge disconnected';
      els.dbBadge.textContent = '🔴 DB Offline';
    }
    return false;
  }
}

// Trades
async function fetchTrades() {
  try {
    const res = await fetch(`${API_BASE}/trades`);
    if (!res.ok) throw new Error('Failed to load trades');
    trades = await res.json();
    renderAll();
  } catch (err) {
    console.error('Error fetching trades:', err);
    showToast('⚠️ Could not connect to database.');
  }
}

async function apiSaveTrade(tradeData, id) {
  const url = id ? `${API_BASE}/trades/${encodeURIComponent(id)}` : `${API_BASE}/trades`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tradeData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save trade');
  }
  return await res.json();
}

async function apiDeleteTrade(id) {
  const res = await fetch(`${API_BASE}/trades/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete trade');
  return await res.json();
}

async function apiClearTrades() {
  const res = await fetch(`${API_BASE}/trades`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear trades');
  return await res.json();
}

// Learns
async function fetchLearns() {
  try {
    const res = await fetch(`${API_BASE}/learns`);
    if (!res.ok) throw new Error('Failed to load learnings');
    learns = await res.json();
    renderLearnAll();
  } catch (err) {
    console.error('Error fetching learnings:', err);
  }
}

async function apiSaveLearn(learnData, id) {
  const url = id ? `${API_BASE}/learns/${encodeURIComponent(id)}` : `${API_BASE}/learns`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(learnData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save learning');
  }
  return await res.json();
}

async function apiDeleteLearn(id) {
  const res = await fetch(`${API_BASE}/learns/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete learning');
  return await res.json();
}

async function apiClearLearns() {
  const res = await fetch(`${API_BASE}/learns`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear learnings');
  return await res.json();
}

// Strategies
async function fetchStrategies() {
  try {
    const res = await fetch(`${API_BASE}/strategies`);
    if (!res.ok) throw new Error('Failed to load strategies');
    strategies = await res.json();
    renderStrategy();
  } catch (err) {
    console.error('Error fetching strategies:', err);
  }
}

async function apiSaveStrategy(strategyData, id) {
  const url = id ? `${API_BASE}/strategies/${encodeURIComponent(id)}` : `${API_BASE}/strategies`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(strategyData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save strategy');
  }
  return await res.json();
}

async function apiDeleteStrategy(id) {
  const res = await fetch(`${API_BASE}/strategies/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete strategy');
  return await res.json();
}

// ---------------------- BACKUP & RESTORE ----------------------

async function exportFullBackup() {
  try {
    const res = await fetch(`${API_BASE}/backup`);
    if (!res.ok) throw new Error('Failed to export backup from server');
    const data = await res.json();
    const jsonStr = JSON.stringify(data, null, 2);
    const dateSlug = new Date().toISOString().split('T')[0];
    dlFile(jsonStr, `tradelearn-db-backup-${dateSlug}.json`, 'application/json;charset=utf-8;');
    showToast('💾 Database backup downloaded (.json)');
  } catch (err) {
    console.error('Backup error:', err);
    showToast('⚠️ Failed to export backup: ' + err.message);
  }
}

function triggerBackupRestore() {
  if (els.importBackupFile) els.importBackupFile.click();
}

async function handleBackupFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data || typeof data !== 'object') {
        showToast('Invalid backup file format.');
        return;
      }

      const tradeCount = Array.isArray(data.trades) ? data.trades.length : 0;
      const learnCount = Array.isArray(data.learns) ? data.learns.length : 0;
      const stratCount = Array.isArray(data.strategies) ? data.strategies.length : 0;

      const msg = `Restore database with ${tradeCount} trades, ${learnCount} learnings, and ${stratCount} strategies? (This will overwrite current DB)`;
      if (!confirm(msg)) {
        e.target.value = '';
        return;
      }

      const res = await fetch(`${API_BASE}/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Failed to restore backup to database');

      await Promise.all([fetchTrades(), fetchLearns(), fetchStrategies()]);
      showToast('✅ Database restored successfully!');
    } catch (err) {
      console.error('Restore error:', err);
      showToast('⚠️ Could not restore backup: ' + err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

// ---------------------- HELPERS ----------------------

function fmtDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showToast(m) {
  if (!els.toastContainer) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = m;
  els.toastContainer.appendChild(t);
  setTimeout(function() {
    if (t.parentNode) t.remove();
  }, 3500);
}

// ---------------------- RENDER TRADES & STATS ----------------------

function renderAll() {
  renderStats();
  renderBreakdown();
  renderHistory();
}

function renderStats() {
  const t = trades.length;
  const w = trades.filter(function(x) { return x.result === 'Win'; }).length;
  const l = t - w;
  const r = t === 0 ? 0 : (w / t) * 100;
  const s = calcStreak();

  if (els.statTotal) els.statTotal.textContent = t;
  if (els.statWins) els.statWins.textContent = w;
  if (els.statLosses) els.statLosses.textContent = l;
  if (els.statRate) els.statRate.textContent = (r % 1 === 0 ? r : r.toFixed(1)) + '%';
  if (els.statStreak) els.statStreak.textContent = s.count === 0 ? '0' : s.count + ' ' + s.type;
}

function calcStreak() {
  if (!trades.length) return { type: '', count: 0 };
  const s = trades.slice().sort(function(a, b) {
    return new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt;
  });
  const f = s[0].result;
  let c = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i].result === f) c++;
    else break;
  }
  return { type: f === 'Win' ? 'Win' : 'Loss', count: c };
}

function renderBreakdown() {
  const cats = [
    { label: 'Bull', count: 0, cls: 'blue' },
    { label: 'Bear', count: 0, cls: 'blue' },
    { label: 'Range', count: 0, cls: 'blue' },
    { label: 'SSL', count: 0, cls: 'purple' },
    { label: 'BSL', count: 0, cls: 'purple' },
    { label: 'Sweep Yes', count: 0, cls: 'green' },
    { label: 'MSS Yes', count: 0, cls: 'green' },
    { label: 'Disp Yes', count: 0, cls: 'green' }
  ];

  trades.forEach(function(t) {
    if (t.bias === 'Bull') cats[0].count++;
    if (t.bias === 'Bear') cats[1].count++;
    if (t.bias === 'Range') cats[2].count++;
    if (t.liquidity === 'SSL') cats[3].count++;
    if (t.liquidity === 'BSL') cats[4].count++;
    if (t.sweep === 'Yes') cats[5].count++;
    if (t.mss === 'Yes') cats[6].count++;
    if (t.displacement === 'Yes') cats[7].count++;
  });

  let mx = 1;
  cats.forEach(function(c) {
    if (c.count > mx) mx = c.count;
  });

  if (els.breakdownGrid) {
    els.breakdownGrid.innerHTML = cats.map(function(c) {
      const p = c.count === 0 ? 0 : (c.count / mx) * 100;
      return '<div class="breakdown-card"><div class="breakdown-label">' + c.label + '</div><div class="breakdown-bar-track"><div class="breakdown-bar-fill ' + c.cls + '" style="width:' + p + '%"></div></div><div class="breakdown-count">' + c.count + ' trade' + (c.count !== 1 ? 's' : '') + '</div></div>';
    }).join('');
  }
}

function getFilteredTrades() {
  let r = trades.slice();
  if (currentFilter !== 'all') {
    r = r.filter(function(t) {
      return t.bias === currentFilter || t.result === currentFilter || t.liquidity === currentFilter;
    });
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    r = r.filter(function(t) {
      return Object.keys(t).some(function(k) {
        if (Array.isArray(t[k])) return false;
        return String(t[k]).toLowerCase().indexOf(q) !== -1;
      });
    });
  }
  r.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt;
  });
  return r;
}

function renderHistory() {
  const f = getFilteredTrades();
  if (!f.length) {
    if (els.emptyState) els.emptyState.style.display = 'block';
    if (els.tableWrap) els.tableWrap.style.display = 'none';
    if (els.mobileCards) els.mobileCards.innerHTML = '';
    return;
  }

  if (els.emptyState) els.emptyState.style.display = 'none';
  if (els.tableWrap) els.tableWrap.style.display = '';

  let tableHtml = '';
  let cardsHtml = '';

  f.forEach(function(t) {
    const pCount = (t.photos && t.photos.length) ? t.photos.length : 0;
    const photoBadge = pCount > 0 ? '<span class="badge" style="background:var(--accent-light);color:var(--steel-blue);font-size:0.75rem;padding:2px 7px;">📷 ' + pCount + '</span>' : '';

    tableHtml += '<tr data-id="' + t.id + '">' +
      '<td>' + fmtDate(t.date) + (pCount ? ' ' + photoBadge : '') + '</td>' +
      '<td><span class="badge badge-' + (t.bias || '').toLowerCase() + '">' + (t.bias || '-') + '</span></td>' +
      '<td><span class="badge badge-' + (t.liquidity || '').toLowerCase() + '">' + (t.liquidity || '-') + '</span></td>' +
      '<td><span class="badge badge-' + (t.sweep === 'Yes' ? 'yes' : 'no') + '">' + (t.sweep || 'No') + '</span></td>' +
      '<td><span class="badge badge-' + (t.mss === 'Yes' ? 'yes' : 'no') + '">' + (t.mss || 'No') + '</span></td>' +
      '<td><span class="badge badge-' + (t.displacement === 'Yes' ? 'yes' : 'no') + '">' + (t.displacement || 'No') + '</span></td>' +
      '<td>' + esc(t.entry) + '</td>' +
      '<td>' + esc(t.sl) + '</td>' +
      '<td>' + esc(t.tp) + '</td>' +
      '<td><span class="badge badge-' + (t.result || '').toLowerCase() + '">' + (t.result || '-') + '</span></td>' +
      '<td><div class="actions-cell">' +
        '<button class="action-btn view-btn" data-id="' + t.id + '">View</button>' +
        '<button class="action-btn edit-btn" data-id="' + t.id + '">Edit</button>' +
        '<button class="action-btn action-btn-delete del-btn" data-id="' + t.id + '">Delete</button>' +
      '</div></td></tr>';

    cardsHtml += '<div class="mobile-card" data-id="' + t.id + '">' +
      '<div class="mobile-card-header">' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span class="mobile-card-date">' + fmtDate(t.date) + '</span>' +
          photoBadge +
        '</div>' +
        '<div class="mobile-card-actions">' +
          '<button class="action-btn view-btn" data-id="' + t.id + '">View</button>' +
          '<button class="action-btn edit-btn" data-id="' + t.id + '">Edit</button>' +
          '<button class="action-btn action-btn-delete del-btn" data-id="' + t.id + '">Del</button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-card-grid">' +
        '<div class="mobile-card-item"><span class="mobile-card-label">Bias</span><span class="mobile-card-value"><span class="badge badge-' + (t.bias || '').toLowerCase() + '">' + (t.bias || '-') + '</span></span></div>' +
        '<div class="mobile-card-item"><span class="mobile-card-label">Liquidity</span><span class="mobile-card-value"><span class="badge badge-' + (t.liquidity || '').toLowerCase() + '">' + (t.liquidity || '-') + '</span></span></div>' +
        '<div class="mobile-card-item"><span class="mobile-card-label">Result</span><span class="mobile-card-value"><span class="badge badge-' + (t.result || '').toLowerCase() + '">' + (t.result || '-') + '</span></span></div>' +
        '<div class="mobile-card-item"><span class="mobile-card-label">Entry</span><span class="mobile-card-value">' + esc(t.entry) + '</span></div>' +
        '<div class="mobile-card-item"><span class="mobile-card-label">SL</span><span class="mobile-card-value">' + esc(t.sl) + '</span></div>' +
        '<div class="mobile-card-item"><span class="mobile-card-label">TP</span><span class="mobile-card-value">' + esc(t.tp) + '</span></div>' +
      '</div>' +
      (t.description ? '<div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);line-height:1.3;border-top:1px dashed var(--border);padding-top:6px;">' + esc(t.description).substring(0, 90) + (t.description.length > 90 ? '...' : '') + '</div>' : '') +
    '</div>';
  });

  if (els.tradeTableBody) els.tradeTableBody.innerHTML = tableHtml;
  if (els.mobileCards) els.mobileCards.innerHTML = cardsHtml;
}

// ---------------------- TRADE VIEW MODAL ----------------------

function viewTrade(id) {
  const t = trades.find(function(x) { return x.id === id; });
  if (!t) return;
  viewTradeId = id;
  const p = t.photos || [];
  let html = '';

  html += '<div class="view-row"><span class="view-label">Date</span><span class="view-value">' + fmtDate(t.date) + '</span></div>';
  html += '<div class="view-row"><span class="view-label">15M Bias</span><span class="view-value"><span class="badge badge-' + (t.bias || '').toLowerCase() + '">' + t.bias + '</span></span></div>';
  html += '<div class="view-row"><span class="view-label">Liquidity</span><span class="view-value"><span class="badge badge-' + (t.liquidity || '').toLowerCase() + '">' + t.liquidity + '</span></span></div>';
  html += '<div class="view-row"><span class="view-label">Sweep</span><span class="view-value"><span class="badge badge-' + (t.sweep === 'Yes' ? 'yes' : 'no') + '">' + t.sweep + '</span></span></div>';
  html += '<div class="view-row"><span class="view-label">MSS</span><span class="view-value"><span class="badge badge-' + (t.mss === 'Yes' ? 'yes' : 'no') + '">' + t.mss + '</span></span></div>';
  html += '<div class="view-row"><span class="view-label">Displacement</span><span class="view-value"><span class="badge badge-' + (t.displacement === 'Yes' ? 'yes' : 'no') + '">' + t.displacement + '</span></span></div>';
  html += '<div class="view-row"><span class="view-label">Entry</span><span class="view-value">' + esc(t.entry) + '</span></div>';
  html += '<div class="view-row"><span class="view-label">Stop Loss</span><span class="view-value">' + esc(t.sl) + '</span></div>';
  html += '<div class="view-row"><span class="view-label">Take Profit</span><span class="view-value">' + esc(t.tp) + '</span></div>';
  html += '<div class="view-row"><span class="view-label">Result</span><span class="view-value"><span class="badge badge-' + (t.result || '').toLowerCase() + '">' + t.result + '</span></span></div>';

  if (t.description) {
    html += '<div class="view-section-title">Notes</div><div class="view-desc">' + esc(t.description) + '</div>';
  }

  if (p.length) {
    html += '<div class="view-section-title">Photos (' + p.length + ')</div><div class="view-photos" id="tradeViewPhotos"></div>';
  }

  els.tradeViewBody.innerHTML = html;

  if (p.length) {
    const photosDiv = document.getElementById('tradeViewPhotos');
    p.forEach(function(src, i) {
      const img = document.createElement('img');
      img.className = 'view-photo';
      img.src = src;
      img.alt = 'Photo ' + (i + 1);
      img.setAttribute('data-idx', i);
      img.addEventListener('click', function() {
        openLightboxArr(p, i);
      });
      photosDiv.appendChild(img);
    });
  }

  $('#tradeViewModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTradeView() {
  $('#tradeViewModal').classList.remove('active');
  document.body.style.overflow = '';
  viewTradeId = null;
}

function tradeViewEdit() {
  if (viewTradeId) {
    const id = viewTradeId;
    closeTradeView();
    editTrade(id);
  }
}

// ---------------------- TRADE FORM SUBMISSION ----------------------

async function handleFormSubmit(e) {
  e.preventDefault();
  const fd = getFormData();
  if (!fd.date || !fd.bias || !fd.liquidity || !fd.sweep || !fd.mss || !fd.displacement || !fd.entry || !fd.sl || !fd.tp || !fd.result) {
    showToast('Please fill in all required fields.');
    return;
  }

  const eid = els.editId.value;
  try {
    if (eid) {
      const existing = trades.find(t => t.id === eid);
      const np = pendingPhotos.length ? pendingPhotos : (existing ? existing.photos : []);
      const payload = Object.assign({}, fd, { photos: np });
      await apiSaveTrade(payload, eid);
      showToast('✅ Trade updated in database.');
      cancelEdit();
    } else {
      const payload = Object.assign({}, fd, {
        photos: pendingPhotos.slice(),
        createdAt: Date.now()
      });
      await apiSaveTrade(payload);
      showToast('✅ Trade saved to database.');
      resetForm();
    }
    await fetchTrades();
  } catch (err) {
    console.error('Error saving trade:', err);
    showToast('⚠️ Error saving trade: ' + err.message);
  }
}

function getFormData() {
  return {
    date: $('#fieldDate').value,
    bias: getActiveBtn('bias'),
    liquidity: getActiveBtn('liquidity'),
    sweep: getActiveBtn('sweep'),
    mss: getActiveBtn('mss'),
    displacement: getActiveBtn('displacement'),
    entry: $('#fieldEntry').value.trim(),
    sl: $('#fieldSL').value.trim(),
    tp: $('#fieldTP').value.trim(),
    result: getActiveBtn('result'),
    description: $('#fieldDescription').value.trim()
  };
}

function getActiveBtn(f) {
  const g = document.querySelector('.btn-group[data-field="' + f + '"]');
  if (!g) return '';
  const a = g.querySelector('.seg-btn.active');
  return a ? a.getAttribute('data-value') : '';
}

function setActiveBtn(f, v) {
  const g = document.querySelector('.btn-group[data-field="' + f + '"]');
  if (!g) return;
  g.querySelectorAll('.seg-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-value') === v);
  });
}

function resetForm() {
  els.tradeForm.reset();
  els.editId.value = '';
  setDefaultDates();
  $$('.btn-group[data-field]').forEach(function(g) {
    if (g.getAttribute('data-field') === 'learnCategory') return;
    g.querySelectorAll('.seg-btn').forEach(function(b) {
      b.classList.remove('active');
    });
  });
  els.submitBtnText.textContent = 'Add Trade';
  els.cancelEditBtn.style.display = 'none';
  els.formTitle.textContent = 'New Trade';
  els.formSubtitle.textContent = 'Record the setup before you forget it.';
  pendingPhotos = [];
  renderUploadPreview();
}

function cancelEdit() {
  resetForm();
}

function editTrade(id) {
  const t = trades.find(x => x.id === id);
  if (!t) return;

  els.editId.value = t.id;
  $('#fieldDate').value = t.date;
  $('#fieldEntry').value = t.entry;
  $('#fieldSL').value = t.sl;
  $('#fieldTP').value = t.tp;
  $('#fieldDescription').value = t.description || '';

  setActiveBtn('bias', t.bias);
  setActiveBtn('liquidity', t.liquidity);
  setActiveBtn('sweep', t.sweep);
  setActiveBtn('mss', t.mss);
  setActiveBtn('displacement', t.displacement);
  setActiveBtn('result', t.result);

  pendingPhotos = t.photos ? t.photos.slice() : [];
  renderUploadPreview();

  els.submitBtnText.textContent = 'Update Trade';
  els.cancelEditBtn.style.display = 'inline-flex';
  els.formTitle.textContent = 'Editing Trade';
  els.formSubtitle.textContent = 'Update the details below.';
  $('#newTradeCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function promptDelete(id) {
  deleteTargetId = id;
  deleteType = 'trade';
  els.deleteModal.classList.add('active');
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    if (deleteType === 'trade') {
      await apiDeleteTrade(deleteTargetId);
      await fetchTrades();
      showToast('Trade deleted.');
    } else {
      await apiDeleteLearn(deleteTargetId);
      await fetchLearns();
      showToast('Learning deleted.');
    }
  } catch (err) {
    showToast('⚠️ Error deleting: ' + err.message);
  }
  closeModals();
}

function closeModals() {
  $$('.modal-overlay').forEach(function(m) {
    m.classList.remove('active');
  });
  deleteTargetId = null;
  learnDeleteTargetId = null;
}

function promptClearAll() {
  if (!trades.length) {
    showToast('No trades to clear.');
    return;
  }
  els.clearModal.classList.add('active');
}

async function confirmClearAll() {
  try {
    await apiClearTrades();
    await fetchTrades();
    showToast('All trades cleared from database.');
  } catch (err) {
    showToast('⚠️ Error clearing trades: ' + err.message);
  }
  closeModals();
}

// ---------------------- PHOTO UPLOAD & COMPRESSION ----------------------

function handlePhotoClick() {
  els.photoInput.click();
}

function handlePhotoFiles(files) {
  const rem = MAX_PHOTOS - pendingPhotos.length;
  if (rem <= 0) {
    showToast('Maximum ' + MAX_PHOTOS + ' photos allowed.');
    return;
  }
  const toProc = Array.from(files).slice(0, rem);
  let done = 0;
  toProc.forEach(function(f) {
    if (!f.type.startsWith('image/')) {
      done++;
      if (done === toProc.length) renderUploadPreview();
      return;
    }
    if (f.size > MAX_PHOTO_SIZE) {
      done++;
      showToast('Skipped image larger than 8MB.');
      if (done === toProc.length) renderUploadPreview();
      return;
    }
    const r = new FileReader();
    r.onload = function(ev) {
      compressImg(ev.target.result, 900, 0.75, function(c) {
        pendingPhotos.push(c);
        done++;
        if (done === toProc.length) renderUploadPreview();
      });
    };
    r.readAsDataURL(f);
  });
}

function compressImg(dUrl, maxDim, q, cb) {
  const img = new Image();
  img.onload = function() {
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round(h * maxDim / w);
        w = maxDim;
      } else {
        w = Math.round(w * maxDim / h);
        h = maxDim;
      }
    }
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    cb(cv.toDataURL('image/jpeg', q));
  };
  img.src = dUrl;
}

function removePendingPhoto(i) {
  pendingPhotos.splice(i, 1);
  renderUploadPreview();
}

function renderUploadPreview() {
  els.uploadPreview.innerHTML = '';
  if (pendingPhotos.length) {
    els.uploadPreview.classList.add('has-items');
    els.uploadPlaceholder.style.display = 'none';
    pendingPhotos.forEach(function(s, i) {
      const d = document.createElement('div');
      d.className = els.editId.value ? 'preview-existing' : 'preview-thumb';
      const img = document.createElement('img');
      img.src = s;
      img.alt = 'Photo ' + (i + 1);
      const btn = document.createElement('button');
      btn.className = 'preview-remove';
      btn.innerHTML = '&times;';
      btn.title = 'Remove';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        removePendingPhoto(i);
      });
      d.appendChild(img);
      d.appendChild(btn);
      d.addEventListener('click', function(e) {
        if (e.target === btn || e.target.classList.contains('preview-remove')) return;
        openLightboxArr(pendingPhotos, i);
      });
      els.uploadPreview.appendChild(d);
    });
  } else {
    els.uploadPreview.classList.remove('has-items');
    els.uploadPlaceholder.style.display = '';
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  els.photoUploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  els.photoUploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  els.photoUploadZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) handlePhotoFiles(e.dataTransfer.files);
}

// ---------------------- LIGHTBOX ----------------------

function openLightboxArr(imgs, idx) {
  lightboxImages = imgs;
  lightboxIndex = idx;
  updateLightbox();
  els.lightboxOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  if (!lightboxImages.length) return;
  els.lightboxImg.src = lightboxImages[lightboxIndex];
  els.lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
  els.lightboxPrev.style.display = lightboxImages.length > 1 ? '' : 'none';
  els.lightboxNext.style.display = lightboxImages.length > 1 ? '' : 'none';
}

function closeLightbox() {
  els.lightboxOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function lbPrev() {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
}

function lbNext() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightbox();
}

// ---------------------- CSV EXPORT / IMPORT ----------------------

function exportCSV() {
  if (!trades.length) {
    showToast('No trades to export.');
    return;
  }
  const h = ['Date', '15m Bias', 'Liquidity', 'Sweep', 'MSS', 'Displacement', 'Entry', 'SL', 'TP', 'Result', 'Description'];
  const rows = trades.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  }).map(function(t) {
    return [t.date, t.bias, t.liquidity, t.sweep, t.mss, t.displacement, t.entry, t.sl, t.tp, t.result, t.description || ''];
  });
  const csv = [h].concat(rows).map(function(r) {
    return r.map(function(c) { return csvEsc(c); }).join(',');
  }).join('\n');
  dlFile(csv, 'trade-journal.csv', 'text/csv;charset=utf-8;');
  showToast('CSV exported.');
}

function csvEsc(v) {
  const s = String(v);
  return (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1)
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
}

function importData() {
  els.importFile.click();
}

async function handleImport(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = async function(ev) {
    const lines = parseCSV(ev.target.result);
    if (lines.length < 2) {
      showToast('No valid trades found.');
      return;
    }
    const hdr = lines[0].map(function(h) { return h.trim().toLowerCase(); });
    const exp = ['date', '15m bias', 'liquidity', 'sweep', 'mss', 'displacement', 'entry', 'sl', 'tp', 'result', 'description'];
    const cm = {};
    exp.forEach(function(eh, i) {
      let idx = -1;
      for (let j = 0; j < hdr.length; j++) {
        if (hdr[j] === eh || hdr[j].replace(/\s+/g, '') === eh.replace(/\s+/g, '')) {
          idx = j;
          break;
        }
      }
      if (idx !== -1) cm[i] = idx;
    });

    if (Object.keys(cm).length < 5) {
      showToast('Could not parse CSV headers.');
      return;
    }

    let imp = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (row.length < 5) continue;
      const g = function(c) {
        const m = cm[c];
        return m !== undefined ? (row[m] || '').trim() : '';
      };
      const tradePayload = {
        date: g(0) || new Date().toISOString().split('T')[0],
        bias: g(1) || 'Range',
        liquidity: g(2) || 'SSL',
        sweep: g(3) || 'No',
        mss: g(4) || 'No',
        displacement: g(5) || 'No',
        entry: g(6) || '',
        sl: g(7) || '',
        tp: g(8) || '',
        result: g(9) || 'Win',
        description: g(10) || '',
        photos: [],
        createdAt: Date.now() + i
      };
      try {
        await apiSaveTrade(tradePayload);
        imp++;
      } catch (err) {
        console.error('Error importing row:', err);
      }
    }
    await fetchTrades();
    showToast('Imported ' + imp + ' trade' + (imp !== 1 ? 's' : '') + ' to database.');
  };
  r.readAsText(f);
  e.target.value = '';
}

function parseCSV(t) {
  const lines = [];
  let cur = [];
  let cell = '';
  let iq = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const nx = t[i + 1];
    if (iq) {
      if (ch === '"' && nx === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        iq = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        iq = true;
      } else if (ch === ',') {
        cur.push(cell);
        cell = '';
      } else if (ch === '\n' || (ch === '\r' && nx === '\n')) {
        cur.push(cell);
        cell = '';
        if (cur.length) lines.push(cur);
        cur = [];
        if (ch === '\r') i++;
      } else if (ch === '\r') {
        cur.push(cell);
        cell = '';
        if (cur.length) lines.push(cur);
        cur = [];
      } else {
        cell += ch;
      }
    }
  }
  if (cell || cur.length) {
    cur.push(cell);
    lines.push(cur);
  }
  return lines;
}

// ---------------------- STRATEGY TAB ----------------------

function renderStrategy() {
  const g = $('#strategiesGrid');
  const e = $('#strategiesEmptyState');
  if (!strategies.length) {
    if (g) g.innerHTML = '';
    if (e) e.style.display = '';
    return;
  }
  if (e) e.style.display = 'none';
  if (g) {
    g.innerHTML = strategies.map(function(s) {
      const prev = (s.content || '').substring(0, 120).replace(/\n/g, ' ');
      return '<div class="strategy-card" data-id="' + s.id + '">' +
        '<div class="strategy-card-title">' + esc(s.title) + '</div>' +
        '<div class="strategy-card-preview">' + (prev || 'No content yet...') + '</div>' +
        '<div class="strategy-card-meta">' +
          '<span>' + fmtDate(s.date) + '</span>' +
          '<div class="strategy-card-actions">' +
            '<button class="action-btn strat-edit-btn" data-id="' + s.id + '">Edit</button>' +
            '<button class="action-btn action-btn-delete strat-del-btn" data-id="' + s.id + '">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }
}

function addNewStrategy() {
  editingStrategyId = null;
  $('#strategyModalTitle').value = '';
  $('#strategyModalTextarea').value = '';
  $('#strategyModalDate').textContent = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  $('#deleteStrategyModalBtn').style.display = 'none';
  $('#strategyModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  $('#strategyModalTitle').focus();
}

function openStrategyModal(id) {
  const s = strategies.find(x => x.id === id);
  if (!s) return;
  editingStrategyId = id;
  $('#strategyModalTitle').value = s.title;
  $('#strategyModalTextarea').value = s.content || '';
  $('#strategyModalDate').textContent = 'Created ' + fmtDate(s.date);
  $('#deleteStrategyModalBtn').style.display = '';
  $('#strategyModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  $('#strategyModalTitle').focus();
}

function closeStrategyModal() {
  $('#strategyModal').classList.remove('active');
  document.body.style.overflow = '';
  editingStrategyId = null;
}

async function saveStrategyModal() {
  const title = $('#strategyModalTitle').value.trim() || 'Untitled Strategy';
  const content = $('#strategyModalTextarea').value;
  const isEdit = !!editingStrategyId;

  try {
    const payload = {
      title: title,
      content: content,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now()
    };
    await apiSaveStrategy(payload, editingStrategyId);
    await fetchStrategies();
    closeStrategyModal();
    showToast(isEdit ? 'Strategy updated.' : 'Strategy added.');
  } catch (err) {
    showToast('⚠️ Error saving strategy: ' + err.message);
  }
}

async function confirmDeleteStrategy() {
  if (!editingStrategyId) return;
  try {
    await apiDeleteStrategy(editingStrategyId);
    await fetchStrategies();
    closeStrategyModal();
    showToast('Strategy deleted.');
  } catch (err) {
    showToast('⚠️ Error deleting strategy: ' + err.message);
  }
  editingStrategyId = null;
}

// ---------------------- LEARN TAB ----------------------

function renderLearnAll() {
  renderLearnCards();
}

function renderLearnCards() {
  const f = getFilteredLearns();
  if (!f.length) {
    if (els.learnEmptyState) els.learnEmptyState.style.display = 'block';
    if (els.learnCards) els.learnCards.innerHTML = '';
    return;
  }
  if (els.learnEmptyState) els.learnEmptyState.style.display = 'none';
  if (els.learnCards) {
    els.learnCards.innerHTML = f.map(function(l) {
      const cat = l.category || 'Note';
      const catCls = 'badge-' + cat.toLowerCase();
      const pCount = (l.photos && l.photos.length) ? l.photos.length : 0;
      const pBadge = pCount > 0 ? '<span class="badge" style="background:var(--accent-light);color:var(--steel-blue);font-size:0.75rem;">📷 ' + pCount + '</span>' : '';

      return '<div class="learn-card" data-id="' + l.id + '">' +
        '<div class="learn-card-header">' +
          '<div class="learn-card-meta">' +
            '<span class="badge ' + catCls + '">' + cat + '</span>' +
            pBadge +
            '<span class="learn-card-date">' + fmtDate(l.date) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="learn-card-title">' + esc(l.title) + '</div>' +
        (l.description ? '<div class="learn-card-desc">' + esc(l.description).substring(0, 100) + (l.description.length > 100 ? '...' : '') + '</div>' : '') +
        '<div class="learn-card-actions">' +
          '<button class="action-btn learn-view-btn" data-id="' + l.id + '">View</button>' +
          '<button class="action-btn learn-edit-btn" data-id="' + l.id + '">Edit</button>' +
          '<button class="action-btn action-btn-delete learn-del-btn" data-id="' + l.id + '">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }
}

function getFilteredLearns() {
  let r = learns.slice();
  if (learnCurrentFilter !== 'all') {
    r = r.filter(function(l) { return l.category === learnCurrentFilter; });
  }
  if (learnSearchQuery.trim()) {
    const q = learnSearchQuery.toLowerCase();
    r = r.filter(function(l) {
      return Object.keys(l).some(function(k) {
        if (Array.isArray(l[k])) return false;
        return String(l[k]).toLowerCase().indexOf(q) !== -1;
      });
    });
  }
  r.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt;
  });
  return r;
}

function viewLearn(id) {
  const l = learns.find(function(x) { return x.id === id; });
  if (!l) return;
  viewLearnId = id;
  const p = l.photos || [];
  let html = '';

  html += '<div class="view-row"><span class="view-label">Date</span><span class="view-value">' + fmtDate(l.date) + '</span></div>';
  html += '<div class="view-row"><span class="view-label">Category</span><span class="view-value"><span class="badge badge-' + (l.category || 'note').toLowerCase() + '">' + (l.category || 'Note') + '</span></span></div>';
  html += '<div class="view-row"><span class="view-label">Title</span><span class="view-value">' + esc(l.title) + '</span></div>';

  if (l.description) {
    html += '<div class="view-section-title">Description</div><div class="view-desc">' + esc(l.description) + '</div>';
  }
  if (l.rules) {
    html += '<div class="view-section-title">Key Rules / Takeaways</div><div class="view-desc">' + esc(l.rules) + '</div>';
  }
  if (p.length) {
    html += '<div class="view-section-title">Photos (' + p.length + ')</div><div class="view-photos" id="learnViewPhotos"></div>';
  }

  els.learnViewBody.innerHTML = html;

  if (p.length) {
    const photosDiv = document.getElementById('learnViewPhotos');
    p.forEach(function(src, i) {
      const img = document.createElement('img');
      img.className = 'view-photo';
      img.src = src;
      img.alt = 'Photo ' + (i + 1);
      img.setAttribute('data-idx', i);
      img.addEventListener('click', function() {
        openLightboxArr(p, i);
      });
      photosDiv.appendChild(img);
    });
  }

  $('#learnViewModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLearnView() {
  $('#learnViewModal').classList.remove('active');
  document.body.style.overflow = '';
  viewLearnId = null;
}

function learnViewEdit() {
  if (viewLearnId) {
    const id = viewLearnId;
    closeLearnView();
    editLearn(id);
  }
}

async function handleLearnSubmit(e) {
  e.preventDefault();
  const fd = {
    date: $('#learnDate').value,
    category: getActiveBtn('learnCategory'),
    title: $('#learnTitle').value.trim(),
    description: $('#learnDescription').value.trim(),
    rules: $('#learnRules').value.trim(),
    photos: learnPendingPhotos.slice()
  };

  if (!fd.date || !fd.category || !fd.title) {
    showToast('Please fill in date, category, and title.');
    return;
  }

  const eid = els.learnEditId.value;
  try {
    if (eid) {
      const existing = learns.find(l => l.id === eid);
      fd.photos = learnPendingPhotos.length ? learnPendingPhotos : (existing ? existing.photos : []);
      await apiSaveLearn(fd, eid);
      showToast('✅ Learning updated in database.');
      cancelLearnEdit();
    } else {
      fd.createdAt = Date.now();
      await apiSaveLearn(fd);
      showToast('✅ Learning saved to database.');
      resetLearnForm();
    }
    await fetchLearns();
  } catch (err) {
    showToast('⚠️ Error saving learning: ' + err.message);
  }
}

function editLearn(id) {
  const l = learns.find(x => x.id === id);
  if (!l) return;

  els.learnEditId.value = l.id;
  $('#learnDate').value = l.date;
  $('#learnTitle').value = l.title;
  $('#learnDescription').value = l.description || '';
  $('#learnRules').value = l.rules || '';
  setActiveBtn('learnCategory', l.category);

  learnPendingPhotos = l.photos ? l.photos.slice() : [];
  renderLearnUploadPreview();

  els.learnSubmitBtnText.textContent = 'Update Learning';
  els.learnCancelBtn.style.display = 'inline-flex';
  els.learnFormTitle.textContent = 'Editing Learning';
  els.learnFormSubtitle.textContent = 'Update the details below.';
  $('#learnFormCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelLearnEdit() {
  resetLearnForm();
}

function resetLearnForm() {
  els.learnForm.reset();
  els.learnEditId.value = '';
  setDefaultDates();
  $$('#tabLearn .btn-group').forEach(function(g) {
    g.querySelectorAll('.seg-btn').forEach(function(b) {
      b.classList.remove('active');
    });
  });
  els.learnSubmitBtnText.textContent = 'Save Learning';
  els.learnCancelBtn.style.display = 'none';
  els.learnFormTitle.textContent = 'New Learning';
  els.learnFormSubtitle.textContent = 'Save chart patterns, concepts, and insights.';
  learnPendingPhotos = [];
  renderLearnUploadPreview();
}

function promptLearnDelete(id) {
  learnDeleteTargetId = id;
  els.learnDeleteModal.classList.add('active');
}

async function confirmLearnDelete() {
  if (!learnDeleteTargetId) return;
  try {
    await apiDeleteLearn(learnDeleteTargetId);
    await fetchLearns();
    showToast('Learning deleted.');
  } catch (err) {
    showToast('⚠️ Error deleting: ' + err.message);
  }
  closeModals();
  learnDeleteTargetId = null;
}

function promptClearLearn() {
  if (!learns.length) {
    showToast('No learnings to clear.');
    return;
  }
  els.learnClearModal.classList.add('active');
}

async function confirmClearLearn() {
  try {
    await apiClearLearns();
    await fetchLearns();
    showToast('All learnings cleared from database.');
  } catch (err) {
    showToast('⚠️ Error clearing learnings: ' + err.message);
  }
  closeModals();
}

function handleLearnPhotoClick() {
  els.learnPhotoInput.click();
}

function handleLearnPhotoFiles(files) {
  const rem = MAX_PHOTOS - learnPendingPhotos.length;
  if (rem <= 0) {
    showToast('Maximum ' + MAX_PHOTOS + ' photos allowed.');
    return;
  }
  const toProc = Array.from(files).slice(0, rem);
  let done = 0;
  toProc.forEach(function(f) {
    if (!f.type.startsWith('image/')) {
      done++;
      if (done === toProc.length) renderLearnUploadPreview();
      return;
    }
    if (f.size > MAX_PHOTO_SIZE) {
      done++;
      showToast('Skipped image larger than 8MB.');
      if (done === toProc.length) renderLearnUploadPreview();
      return;
    }
    const r = new FileReader();
    r.onload = function(ev) {
      compressImg(ev.target.result, 900, 0.75, function(c) {
        learnPendingPhotos.push(c);
        done++;
        if (done === toProc.length) renderLearnUploadPreview();
      });
    };
    r.readAsDataURL(f);
  });
}

function removeLearnPendingPhoto(i) {
  learnPendingPhotos.splice(i, 1);
  renderLearnUploadPreview();
}

function renderLearnUploadPreview() {
  els.learnUploadPreview.innerHTML = '';
  if (learnPendingPhotos.length) {
    els.learnUploadPreview.classList.add('has-items');
    els.learnUploadPlaceholder.style.display = 'none';
    learnPendingPhotos.forEach(function(s, i) {
      const d = document.createElement('div');
      d.className = els.learnEditId.value ? 'preview-existing' : 'preview-thumb';
      const img = document.createElement('img');
      img.src = s;
      img.alt = 'Photo ' + (i + 1);
      const btn = document.createElement('button');
      btn.className = 'preview-remove';
      btn.innerHTML = '&times;';
      btn.title = 'Remove';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeLearnPendingPhoto(i);
      });
      d.appendChild(img);
      d.appendChild(btn);
      d.addEventListener('click', function(e) {
        if (e.target === btn || e.target.classList.contains('preview-remove')) return;
        openLightboxArr(learnPendingPhotos, i);
      });
      els.learnUploadPreview.appendChild(d);
    });
  } else {
    els.learnUploadPreview.classList.remove('has-items');
    els.learnUploadPlaceholder.style.display = '';
  }
}

function handleLearnDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  els.learnPhotoZone.classList.add('drag-over');
}

function handleLearnDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  els.learnPhotoZone.classList.remove('drag-over');
}

function handleLearnDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  els.learnPhotoZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) handleLearnPhotoFiles(e.dataTransfer.files);
}

function exportLearnCSV() {
  if (!learns.length) {
    showToast('No learnings to export.');
    return;
  }
  const h = ['Date', 'Category', 'Title', 'Description', 'Key Rules'];
  const rows = learns.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  }).map(function(l) {
    return [l.date, l.category, l.title, l.description || '', l.rules || ''];
  });
  const csv = [h].concat(rows).map(function(r) {
    return r.map(function(c) { return csvEsc(c); }).join(',');
  }).join('\n');
  dlFile(csv, 'trade-journal-learnings.csv', 'text/csv;charset=utf-8;');
  showToast('Learnings exported.');
}

function dlFile(c, n, m) {
  const b = new Blob(['﻿' + c], { type: m });
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u;
  a.download = n;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(u);
}

// ---------------------- EVENT BINDINGS ----------------------

function bindEvents() {
  // Theme & Tabs
  if (els.themeToggle) els.themeToggle.addEventListener('click', toggleTheme);

  $$('.tab-btn').forEach(function(b) {
    b.addEventListener('click', function() {
      $$('.tab-btn').forEach(function(x) { x.classList.remove('active'); });
      b.classList.add('active');
      $$('.tab-content').forEach(function(x) { x.classList.remove('active'); });
      const tabId = 'tab' + b.getAttribute('data-tab').charAt(0).toUpperCase() + b.getAttribute('data-tab').slice(1);
      const tabEl = $('#' + tabId);
      if (tabEl) tabEl.classList.add('active');
    });
  });

  // Backup & Restore
  if (els.exportBackupBtn) els.exportBackupBtn.addEventListener('click', exportFullBackup);
  if (els.restoreBackupBtn) els.restoreBackupBtn.addEventListener('click', triggerBackupRestore);
  if (els.importBackupFile) els.importBackupFile.addEventListener('change', handleBackupFileImport);

  // Trade Form
  if (els.tradeForm) els.tradeForm.addEventListener('submit', handleFormSubmit);
  if (els.cancelEditBtn) els.cancelEditBtn.addEventListener('click', cancelEdit);

  $$('.btn-group').forEach(function(g) {
    g.querySelectorAll('.seg-btn').forEach(function(b) {
      b.addEventListener('click', function() {
        g.querySelectorAll('.seg-btn').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
    });
  });

  if (els.searchInput) {
    els.searchInput.addEventListener('input', function(e) {
      searchQuery = e.target.value;
      renderHistory();
    });
  }

  if (els.filterChips) {
    els.filterChips.addEventListener('click', function(e) {
      const c = e.target.closest('.chip');
      if (!c) return;
      els.filterChips.querySelectorAll('.chip').forEach(function(x) { x.classList.remove('active'); });
      c.classList.add('active');
      currentFilter = c.getAttribute('data-filter');
      renderHistory();
    });
  }

  if (els.exportCsvBtn) els.exportCsvBtn.addEventListener('click', exportCSV);
  if (els.importBtn) els.importBtn.addEventListener('click', importData);
  if (els.importFile) els.importFile.addEventListener('change', handleImport);
  if (els.clearAllBtn) els.clearAllBtn.addEventListener('click', promptClearAll);
  if (els.confirmClearBtn) els.confirmClearBtn.addEventListener('click', confirmClearAll);
  if (els.cancelClearBtn) els.cancelClearBtn.addEventListener('click', closeModals);
  if (els.confirmDeleteBtn) els.confirmDeleteBtn.addEventListener('click', confirmDelete);
  if (els.cancelDeleteBtn) els.cancelDeleteBtn.addEventListener('click', closeModals);

  if (els.deleteModal) {
    els.deleteModal.addEventListener('click', function(e) {
      if (e.target === els.deleteModal) closeModals();
    });
  }

  if (els.clearModal) {
    els.clearModal.addEventListener('click', function(e) {
      if (e.target === els.clearModal) closeModals();
    });
  }

  // Photo uploads
  if (els.photoUploadZone) {
    els.photoUploadZone.addEventListener('click', handlePhotoClick);
    els.photoUploadZone.addEventListener('dragover', handleDragOver);
    els.photoUploadZone.addEventListener('dragleave', handleDragLeave);
    els.photoUploadZone.addEventListener('drop', handleDrop);
  }
  if (els.photoInput) {
    els.photoInput.addEventListener('change', function(e) {
      if (e.target.files.length) {
        handlePhotoFiles(e.target.files);
        e.target.value = '';
      }
    });
  }

  // Lightbox
  if (els.lightboxClose) els.lightboxClose.addEventListener('click', closeLightbox);
  if (els.lightboxPrev) els.lightboxPrev.addEventListener('click', lbPrev);
  if (els.lightboxNext) els.lightboxNext.addEventListener('click', lbNext);
  if (els.lightboxOverlay) {
    els.lightboxOverlay.addEventListener('click', function(e) {
      if (e.target === els.lightboxOverlay) closeLightbox();
    });
  }

  // Strategy
  if (els.addStrategyBtn) els.addStrategyBtn.addEventListener('click', addNewStrategy);
  const closeStratBtn = $('#closeStrategyModal');
  if (closeStratBtn) closeStratBtn.addEventListener('click', closeStrategyModal);
  const saveStratBtn = $('#saveStrategyModalBtn');
  if (saveStratBtn) saveStratBtn.addEventListener('click', saveStrategyModal);
  const cancelStratBtn = $('#cancelStrategyModalBtn');
  if (cancelStratBtn) cancelStratBtn.addEventListener('click', closeStrategyModal);
  const delStratBtn = $('#deleteStrategyModalBtn');
  if (delStratBtn) delStratBtn.addEventListener('click', confirmDeleteStrategy);
  if (els.strategyModal) {
    els.strategyModal.addEventListener('click', function(e) {
      if (e.target === els.strategyModal) closeStrategyModal();
    });
  }

  // Learn
  if (els.learnForm) els.learnForm.addEventListener('submit', handleLearnSubmit);
  if (els.learnCancelBtn) els.learnCancelBtn.addEventListener('click', cancelLearnEdit);
  if (els.learnSearchInput) {
    els.learnSearchInput.addEventListener('input', function(e) {
      learnSearchQuery = e.target.value;
      renderLearnCards();
    });
  }
  if (els.learnFilterChips) {
    els.learnFilterChips.addEventListener('click', function(e) {
      const c = e.target.closest('.chip');
      if (!c) return;
      els.learnFilterChips.querySelectorAll('.chip').forEach(function(x) { x.classList.remove('active'); });
      c.classList.add('active');
      learnCurrentFilter = c.getAttribute('data-filter');
      renderLearnCards();
    });
  }
  if (els.exportLearnBtn) els.exportLearnBtn.addEventListener('click', exportLearnCSV);
  if (els.clearLearnBtn) els.clearLearnBtn.addEventListener('click', promptClearLearn);
  if (els.confirmLearnClearBtn) els.confirmLearnClearBtn.addEventListener('click', confirmClearLearn);
  if (els.cancelLearnClearBtn) els.cancelLearnClearBtn.addEventListener('click', closeModals);
  if (els.learnDeleteModal) {
    els.learnDeleteModal.addEventListener('click', function(e) {
      if (e.target === els.learnDeleteModal) closeModals();
    });
  }
  if (els.learnClearModal) {
    els.learnClearModal.addEventListener('click', function(e) {
      if (e.target === els.learnClearModal) closeModals();
    });
  }
  if (els.confirmLearnDeleteBtn) els.confirmLearnDeleteBtn.addEventListener('click', confirmLearnDelete);
  if (els.cancelLearnDeleteBtn) els.cancelLearnDeleteBtn.addEventListener('click', closeModals);

  if (els.learnPhotoZone) {
    els.learnPhotoZone.addEventListener('click', handleLearnPhotoClick);
    els.learnPhotoZone.addEventListener('dragover', handleLearnDragOver);
    els.learnPhotoZone.addEventListener('dragleave', handleLearnDragLeave);
    els.learnPhotoZone.addEventListener('drop', handleLearnDrop);
  }
  if (els.learnPhotoInput) {
    els.learnPhotoInput.addEventListener('change', function(e) {
      if (e.target.files.length) {
        handleLearnPhotoFiles(e.target.files);
        e.target.value = '';
      }
    });
  }

  // Modals close / edit buttons
  const closeTradeViewM = $('#closeTradeViewModal');
  if (closeTradeViewM) closeTradeViewM.addEventListener('click', closeTradeView);
  const closeTradeViewB = $('#closeTradeViewBtn');
  if (closeTradeViewB) closeTradeViewB.addEventListener('click', closeTradeView);
  const tradeViewEditB = $('#tradeViewEditBtn');
  if (tradeViewEditB) tradeViewEditB.addEventListener('click', tradeViewEdit);
  const tradeViewModalEl = $('#tradeViewModal');
  if (tradeViewModalEl) {
    tradeViewModalEl.addEventListener('click', function(e) {
      if (e.target === tradeViewModalEl) closeTradeView();
    });
  }

  const closeLearnViewM = $('#closeLearnViewModal');
  if (closeLearnViewM) closeLearnViewM.addEventListener('click', closeLearnView);
  const closeLearnViewB = $('#closeLearnViewBtn');
  if (closeLearnViewB) closeLearnViewB.addEventListener('click', closeLearnView);
  const learnViewEditB = $('#learnViewEditBtn');
  if (learnViewEditB) learnViewEditB.addEventListener('click', learnViewEdit);
  const learnViewModalEl = $('#learnViewModal');
  if (learnViewModalEl) {
    learnViewModalEl.addEventListener('click', function(e) {
      if (e.target === learnViewModalEl) closeLearnView();
    });
  }

  // Delegated buttons for Trade History (Desktop & Mobile)
  if (els.tradeTableBody) {
    els.tradeTableBody.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (btn.classList.contains('view-btn')) viewTrade(id);
      else if (btn.classList.contains('edit-btn')) editTrade(id);
      else if (btn.classList.contains('del-btn')) promptDelete(id);
    });
  }

  if (els.mobileCards) {
    els.mobileCards.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (btn.classList.contains('view-btn')) viewTrade(id);
      else if (btn.classList.contains('edit-btn')) editTrade(id);
      else if (btn.classList.contains('del-btn')) promptDelete(id);
    });
  }

  // Delegated buttons for Learnings
  if (els.learnCards) {
    els.learnCards.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (btn.classList.contains('learn-view-btn')) viewLearn(id);
      else if (btn.classList.contains('learn-edit-btn')) editLearn(id);
      else if (btn.classList.contains('learn-del-btn')) promptLearnDelete(id);
    });
  }

  // Delegated buttons for Strategy
  if (els.strategiesGrid) {
    els.strategiesGrid.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (btn.classList.contains('strat-edit-btn')) openStrategyModal(id);
      else if (btn.classList.contains('strat-del-btn')) {
        editingStrategyId = id;
        confirmDeleteStrategy();
      }
    });

    els.strategiesGrid.addEventListener('click', function(e) {
      const card = e.target.closest('.strategy-card');
      if (!card || e.target.closest('.action-btn')) return;
      openStrategyModal(card.getAttribute('data-id'));
    });
  }

  // Keyboard Shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (els.strategyModal && els.strategyModal.classList.contains('active')) closeStrategyModal();
      else if (els.tradeViewModal && els.tradeViewModal.classList.contains('active')) closeTradeView();
      else if (els.learnViewModal && els.learnViewModal.classList.contains('active')) closeLearnView();
      else if (els.lightboxOverlay && els.lightboxOverlay.classList.contains('active')) closeLightbox();
      else closeModals();
    }
    if (els.lightboxOverlay && els.lightboxOverlay.classList.contains('active')) {
      if (e.key === 'ArrowLeft') lbPrev();
      if (e.key === 'ArrowRight') lbNext();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
