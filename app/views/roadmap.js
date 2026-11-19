import { stages } from '../data.js';

export function renderRoadmap(page,trophies,state,onSelect) {
 const ids=new Set(stages.flatMap(stage=>stage.ids));
 const groups=stages.map(stage=>{
  const items=stage.ids.map(id=>trophies.find(t=>t.id===id)).filter(Boolean);
  const count=items.filter(t=>state.earned.includes(t.id)).length;
  return `<section class="stage-card"><div class="stage-head"><div><span class="eyebrow">${stage.id==='cleanup'?'ENDGAME AUDIT':`STAGE ${stage.id.toUpperCase()}`}</span><h2>${stage.title}</h2><p>${stage.note}</p></div><div class="stage-count"><b>${count}<small> / ${items.length}</small></b><span>logged</span></div></div><div class="stage-progress"><span style="width:${items.length?count/items.length*100:0}%"></span></div><div class="stage-trophies">${items.map(t=>`<button data-id="${t.id}" class="stage-trophy ${state.earned.includes(t.id)?'done':''}"><span>${state.earned.includes(t.id)?'✓':String(t.id).padStart(2,'0')}</span>${t.name}${t.missable?'<i>MISSABLE</i>':''}</button>`).join('')}</div></section>`;
 }).join('');
 page.innerHTML=`<div class="page-heading"><div><span class="eyebrow">PLATINUM ROUTE · FIVE STAGES</span><h1>Take the long way<span class="period">.</span></h1><p>Story foundation first, then strands and exploration, with the completion audit at the end.</p></div><span class="launch-tag">ORDERED FROM <b>OFFICIAL DESCRIPTIONS</b></span></div>
 <div class="warning-banner"><span class="warning-icon">!</span><div><b>One trophy is reported missable</b><p>Save at every chapter start and again before the final mission. The Chapter 1 balcony report for Positive Mental Attitude has not been confirmed in-game.</p></div><button data-open-missables>Review missables ↗</button></div>
 <div class="roadmap-grid">${groups}</div><p class="roadmap-footnote">The grouping is a practical order, not an official mission sequence. Advice is inferred from the listed conditions and remains untested at launch.</p>`;
 page.querySelectorAll('[data-id]').forEach(button=>button.addEventListener('click',()=>onSelect(Number(button.dataset.id))));
 page.querySelector('[data-open-missables]').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('guide-page',{detail:'missables'})));
}
