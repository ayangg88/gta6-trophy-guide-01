import { filterTrophies, isMasked } from '../filters.js';
import { renderDetail, bindDetail } from './detail.js';

const grades = [['','All grades'],['platinum','Platinum'],['gold','Gold'],['silver','Silver'],['bronze','Bronze']];
const kinds = [['','All kinds'],['story','Story'],['missable','Missable'],['collectibles','Collectibles'],['activities','Activities']];
function options(values, selected) { return values.map(([value,label]) => `<option value="${value}" ${selected===value?'selected':''}>${label}</option>`).join(''); }
const medals = { platinum: '✦', gold: '●', silver: '●', bronze: '●' };

export function renderChecklist(page, trophies, state, selectedId, filters, onSelect, onEarn, onFilter, onSetting) {
  const visible = filterTrophies(trophies, state, filters);
  const selected = visible.find(item => item.id === selectedId) || visible[0];
  page.innerHTML = `<div class="page-heading"><div><span class="eyebrow">YOUR COLLECTION · PS5</span><h1>Trophy ledger<span class="period">.</span></h1><p>55 marks on the road to a Leonida platinum.</p></div><div class="heading-side"><span class="launch-tag">GUIDE STATUS <b>LAUNCH DAY · 19 NOV 2026</b></span><button class="text-button" data-goto="planner">Plan next →</button></div></div>
    <section class="tracker-grid">
      <div class="list-pane">
        <div class="list-title"><div><b>THE TROPHY LIST</b><span>${visible.length} shown · ${state.earned.length} earned</span></div><label class="switch-label"><input id="spoiler-toggle" type="checkbox" ${state.spoiler?'checked':''}><span class="switch"></span>Spoiler cover</label></div>
        <div class="filters">
          <label class="search-box"><span>⌕</span><input id="search" type="search" placeholder="Search the guide…" value="${escapeAttr(filters.search)}"><kbd>/</kbd></label>
          <select aria-label="Grade filter" id="grade-filter">${options(grades,filters.grade)}</select><select aria-label="Kind filter" id="kind-filter">${options(kinds,filters.kind)}</select><select aria-label="Earned filter" id="status-filter">${options([['','All status'],['open','Unearned'],['earned','Earned']],filters.status)}</select>
          <label class="compact-check"><input id="hidden-filter" type="checkbox" ${state.hideHidden?'checked':''}> Hide hidden</label>
        </div>
        <div class="trophy-list" id="trophy-list" role="listbox" aria-label="Trophies">${visible.length ? visible.map(trophy => row(trophy,state,selected?.id,onEarn)).join('') : `<div class="no-results">No trophies match this view.<button data-reset-filters>Clear filters</button></div>`}</div>
        <div class="list-bottom"><span>ARROW KEYS TO MOVE · SPACE TO MARK</span><span>${state.earned.length} / 55 COMPLETE</span></div>
      </div>
      <div id="detail-slot">${renderDetail(selected,state)}</div>
    </section>`;
  page.querySelectorAll('.row-open').forEach(button => button.addEventListener('click', () => onSelect(Number(button.dataset.trophy))));
  page.querySelectorAll('.trophy-row input[type=checkbox]').forEach(box => box.addEventListener('change', event => { event.stopPropagation(); onEarn(Number(box.dataset.earnId),box.checked); }));
  const updateFilters = event => {
    const input=event.currentTarget;
    const caret=input===page.querySelector('#search')?input.selectionStart:null;
    const wasSearch=input.id==='search';
    onFilter({search:page.querySelector('#search').value,grade:page.querySelector('#grade-filter').value,kind:page.querySelector('#kind-filter').value,status:page.querySelector('#status-filter').value});
    if(wasSearch){const next=page.querySelector('#search');next.focus();next.setSelectionRange(caret,caret);}
  };
  page.querySelector('#search').addEventListener('input',updateFilters);
  ['#grade-filter','#kind-filter','#status-filter'].forEach(selector => page.querySelector(selector).addEventListener('change',updateFilters));
  page.querySelector('#hidden-filter').addEventListener('change',event=>onSetting('hideHidden',event.target.checked));
  page.querySelector('#spoiler-toggle').addEventListener('change',event=>onSetting('spoiler',event.target.checked));
  page.querySelector('[data-reset-filters]')?.addEventListener('click',()=>onFilter({search:'',grade:'',kind:'',status:''}));
  page.querySelector('[data-goto]')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('guide-page',{detail:'planner'})));
  bindDetail(page.querySelector('#detail-slot'),selected,(id,value)=>window.dispatchEvent(new CustomEvent('guide-note',{detail:{id,value}})),(id,value)=>window.dispatchEvent(new CustomEvent('guide-count',{detail:{id,value}})));
  return visible;
}

function row(trophy,state,selectedId,onEarn) {
  const earned=state.earned.includes(trophy.id), masked=isMasked(trophy,state);
  const title=masked?'Hidden trophy — earn it to reveal':trophy.name;
  const description=masked?'Story spoiler · toggle spoilers to preview':trophy.description;
  const gradeText={platinum:'PLAT',gold:'GOLD',silver:'SILV',bronze:'BRNZ'}[trophy.grade];
  return `<article class="trophy-row ${selectedId===trophy.id?'selected':''} ${earned?'earned':''}" role="option" aria-selected="${selectedId===trophy.id}" tabindex="-1">
    <label class="earn-control" title="Mark ${masked?'hidden trophy':escapeAttr(trophy.name)} earned"><input type="checkbox" data-earn-id="${trophy.id}" ${earned?'checked':''} aria-label="Mark ${masked?'hidden trophy':escapeAttr(trophy.name)} earned"><span></span></label>
    <button class="row-open" data-trophy="${trophy.id}"><span class="medal ${trophy.grade}">${gradeText}</span><span class="row-copy"><b>${escapeHtml(title)}</b><small>${escapeHtml(description)}</small></span></button>
    <span class="row-side">${trophy.hidden?'<i class="lock-mark">H</i>':''}${trophy.target?`<small>${trophy.target.toLocaleString()}</small>`:''}</span>
  </article>`;
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function escapeAttr(value){return escapeHtml(value).replace(/`/g,'&#96;');}
