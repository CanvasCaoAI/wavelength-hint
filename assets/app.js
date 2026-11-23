'use strict';
const STORAGE_KEY = 'wavelength-cn-1000-v1';
const ALL_CATS = [...new Set(DATA.map(q => q.cat))];
const byId = new Map(DATA.map(q => [
  q.id,
  q
]));
const el = id => document.getElementById(id);
const blankState = () => ({
  seen: [],
  favorites: [],
  round: 1,
  category: '全部题目',
  pair: [],
  picked: null
});
let state = blankState();
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && typeof saved === 'object')
    state = { ...state, ...saved };
} catch (e) {
}
state.seen = Array.isArray(state.seen) ? state.seen.filter(id => byId.has(id)) : [];
state.favorites = Array.isArray(state.favorites) ? state.favorites.filter(id => byId.has(id)) : [];
if (!ALL_CATS.includes(state.category) && ![
    '全部题目',
    '我的收藏'
  ].includes(state.category))
  state.category = '全部题目';
if (!Array.isArray(state.pair) || state.pair.length !== 2 || !state.pair.every(id => byId.has(id)))
  state.pair = [];
if (!state.pair.includes(state.picked))
  state.picked = null;
const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
  }
};
const shuffle = items => {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [
      a[j],
      a[i]
    ];
  }
  return a;
};
function pool() {
  return state.category === '全部题目' ? DATA : state.category === '我的收藏' ? DATA.filter(q => state.favorites.includes(q.id)) : DATA.filter(q => q.cat === state.category);
}
function makePair() {
  const items = pool();
  if (items.length < 2) {
    state.pair = [];
    state.picked = null;
    save();
    render();
    return;
  }
  const seen = new Set(state.seen);
  let available = items.filter(q => !seen.has(q.id));
  if (available.length < 2) {
    const ids = new Set(items.map(q => q.id));
    state.seen = state.seen.filter(id => !ids.has(id));
    available = items;
  }
  state.pair = shuffle(available).slice(0, 2).map(q => q.id);
  state.seen.push(...state.pair);
  state.picked = null;
  save();
  render();
}
function nextPair() {
  state.round = (Number(state.round) || 0) + 1;
  makePair();
}
function buildCategories() {
  const sel = el('categorySelect');
  sel.replaceChildren();
  for (const [label, count] of [
      [
        '全部题目',
        DATA.length
      ],
      ...ALL_CATS.map(cat => [
        cat,
        DATA.filter(q => q.cat === cat).length
      ]),
      [
        '我的收藏',
        state.favorites.length
      ]
    ]) {
    const o = document.createElement('option');
    o.value = label;
    o.textContent = `${ label } (${ count })`;
    sel.append(o);
  }
  sel.value = state.category;
}
function render() {
  buildCategories();
  el('roundLabel').textContent = String(state.round || 1).padStart(2, '0');
  const total = pool().length;
  const shown = pool().filter(q => state.seen.includes(q.id)).length;
  el('statusLine').innerHTML = `已经浏览 <strong>${ shown }</strong> / ${ total } 题`;
  el('bankPill').textContent = `✦ ${ DATA.length } 道题`;
  el('countFooter').textContent = DATA.length;
  el('app').classList.toggle('playing', !!state.picked);
  const area = el('options');
  area.replaceChildren();
  if (state.pair.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'round-tag';
    msg.style.gridColumn = '1 / -1';
    msg.textContent = state.category === '我的收藏' ? '收藏至少两道题后\uFF0C才能在这里二选一\u3002' : '当前分类没有足够的题目\u3002';
    area.append(msg);
  }
  for (const [idx, id] of state.pair.entries()) {
    const q = byId.get(id);
    if (!q)
      continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.setAttribute('aria-label', `选题${ idx + 1 }：${ q.left } 对 ${ q.right }。${ q.hint }`);
    const top = document.createElement('div');
    top.className = 'option-top';
    const num = document.createElement('span');
    num.className = 'option-num';
    num.textContent = `题目 0${ idx + 1 }`;
    const cat = document.createElement('span');
    cat.className = 'cat-label';
    cat.textContent = q.cat;
    top.append(num, cat);
    const ex = document.createElement('div');
    ex.className = 'extremes';
    const left = document.createElement('div');
    left.className = 'extreme left';
    left.textContent = q.left;
    const vs = document.createElement('div');
    vs.className = 'versus';
    vs.textContent = 'VS';
    const right = document.createElement('div');
    right.className = 'extreme right';
    right.textContent = q.right;
    ex.append(left, vs, right);
    const topicHint = document.createElement('div');
    topicHint.className = 'topic-hint';
    topicHint.textContent = '\uD83D\uDCA1 ' + q.hint;
    const hint = document.createElement('div');
    hint.className = 'select-hint';
    hint.textContent = '选择这道题 \u2192';
    btn.append(top, ex, topicHint, hint);
    btn.addEventListener('click', () => choose(id));
    area.append(btn);
  }
  if (state.picked) {
    const q = byId.get(state.picked);
    el('chosenMeta').textContent = `第 ${ state.round } 轮 · ${ q.cat } · 题号 #${ q.id }`;
    el('chosenLeft').textContent = q.left;
    el('chosenRight').textContent = q.right;
    el('chosenHint').textContent = '\uD83D\uDCA1 ' + q.hint;
    const fav = state.favorites.includes(q.id);
    el('favBtn').textContent = fav ? '\u2605 已收藏' : '\u2606 收藏这题';
    el('favBtn').classList.toggle('fav-on', fav);
    el('favBtn').setAttribute('aria-pressed', String(fav));
  }
  el('rerollBtn').disabled = total < 2;
  el('resetBtn').disabled = false;
}
function choose(id) {
  state.picked = id;
  save();
  render();
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
}
function reroll() {
  state.round = (Number(state.round) || 0) + 1;
  makePair();
  el('notice').textContent = '';
}
el('rerollBtn').addEventListener('click', reroll);
el('nextBtn').addEventListener('click', () => {
  nextPair();
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
});
el('backBtn').addEventListener('click', () => {
  state.picked = null;
  save();
  render();
});
el('categorySelect').addEventListener('change', e => {
  state.category = e.target.value;
  state.round = 1;
  makePair();
});
el('favBtn').addEventListener('click', () => {
  if (!state.picked)
    return;
  const id = state.picked;
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(x => x !== id) : [
    ...state.favorites,
    id
  ];
  save();
  render();
  el('choiceNotice').textContent = state.favorites.includes(id) ? '已加入收藏' : '已取消收藏';
});
el('resetBtn').addEventListener('click', () => {
  if (!confirm('确定清空已浏览进度并重新开始吗\uFF1F收藏的题目会保留\u3002'))
    return;
  const fav = state.favorites;
  const cat = state.category;
  state = blankState();
  state.favorites = fav;
  state.category = cat;
  makePair();
  el('notice').textContent = '进度已重置';
});
const help = el('helpOverlay');
el('helpBtn').addEventListener('click', () => help.classList.add('show'));
el('closeHelp').addEventListener('click', () => help.classList.remove('show'));
help.addEventListener('click', e => {
  if (e.target === help)
    help.classList.remove('show');
});
document.addEventListener('keydown', e => {
  if (help.classList.contains('show')) {
    if (e.key === 'Escape')
      help.classList.remove('show');
    return;
  }
  if (e.target.closest('select,button,input,textarea'))
    return;
  if (e.key === 'Escape' && state.picked) {
    state.picked = null;
    save();
    render();
  } else if (!state.picked && (e.key === '1' || e.key === '2')) {
    choose(state.pair[Number(e.key) - 1]);
  } else if (state.picked && e.code === 'Space') {
    e.preventDefault();
    nextPair();
  }
});
if (state.pair.length === 0) {
  makePair();
} else {
  render();
}
