const KEY = 'leonida-platinum-guide-v1';
const EMPTY = { earned: [], notes: {}, counts: {}, spoiler: false, hideHidden: false };

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...EMPTY, ...saved, earned: Array.isArray(saved.earned) ? saved.earned : [], notes: saved.notes && typeof saved.notes === 'object' ? saved.notes : {}, counts: saved.counts && typeof saved.counts === 'object' ? saved.counts : {} };
  } catch { return { ...EMPTY }; }
}

let state = read();
const listeners = new Set();
function save() { localStorage.setItem(KEY, JSON.stringify(state)); listeners.forEach(listener => listener(state)); }

export const store = {
  get: () => state,
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  earned(id, value) { state = { ...state, earned: value ? [...new Set([...state.earned, id])] : state.earned.filter(item => item !== id) }; save(); },
  note(id, value) { state = { ...state, notes: { ...state.notes, [id]: value } }; save(); },
  count(id, value) { state = { ...state, counts: { ...state.counts, [id]: Math.max(0, Number(value) || 0) } }; save(); },
  stageShot(ids, settings = {}) { state = { ...state, earned: [...new Set(ids)], ...settings }; },
  setting(key, value) { state = { ...state, [key]: value }; save(); },
  export() { return JSON.stringify({ schema: 'leonida-progress/v1', exportedAt: new Date().toISOString(), earned: state.earned, notes: state.notes, counts: state.counts, spoiler: state.spoiler, hideHidden: state.hideHidden }, null, 2); },
  import(text) {
    const incoming = JSON.parse(text);
    if (!incoming || !Array.isArray(incoming.earned) || !incoming.notes || typeof incoming.notes !== 'object') throw new Error('That file does not look like a guide save.');
    const ids = incoming.earned.filter(id => Number.isInteger(id) && id >= 1 && id <= 55);
    state = { ...state, earned: [...new Set(ids)], notes: Object.fromEntries(Object.entries(incoming.notes).filter(([id, note]) => Number(id) >= 1 && Number(id) <= 55 && typeof note === 'string')), counts: Object.fromEntries(Object.entries(incoming.counts || {}).filter(([id, count]) => Number(id) >= 1 && Number(id) <= 55 && Number.isFinite(Number(count))).map(([id,count])=>[id,Number(count)])), spoiler: Boolean(incoming.spoiler), hideHidden: Boolean(incoming.hideHidden) };
    save();
  },
  reset() { state = { ...EMPTY }; save(); }
};
