import { stages } from '../data.js';

export function renderPlanner(page,trophies,state,onSelect) {
 const rank=new Map(stages.flatMap((stage,index)=>stage.ids.map(id=>[id,index])));
 const next=trophies.filter(t=>!state.earned.includes(t.id)).sort((a,b)=>(rank.get(a.id)??99)-(rank.get(b.id)??99)||a.id-b.id).slice(0,5);
 page.innerHTML=`<div class="page-heading"><div><span class="eyebrow">FIELD PLAN · BASED ON YOUR CHECKLIST</span><h1>Next up<span class="period">.</span></h1><p>These are the earliest open items in the roadmap order.</p></div><span class="launch-tag">YOUR QUEUE <b>${next.length} PICKS</b></span></div>
 <section class="planner-card"><div class="planner-head"><span class="eyebrow">THE NEXT FEW</span><span>Updates as trophies are marked earned</span></div>${next.length?next.map((t,index)=>`<button data-id="${t.id}" class="plan-row"><span class="plan-rank">0${index+1}</span><span class="plan-title"><b>${t.name}</b><small>${t.description}</small></span><span class="plan-meta">${t.missable?'<i>TIME-SENSITIVE</i>':t.kind.toUpperCase()}<b>${t.grade.toUpperCase()}</b></span><span class="plan-arrow">↗</span></button>`).join(''):'<div class="all-done"><span>✦</span><h2>Every listed trophy is checked.</h2><p>Review the 100% completion award for the final audit.</p></div>'}</section>
 <div class="planner-note"><b>PLANNING NOTE</b><span>Chapter saves protect the reported meditation missable. Use the roadmap for the full stage order.</span><button data-goto-roadmap>See route →</button></div>`;
 page.querySelectorAll('[data-id]').forEach(button=>button.addEventListener('click',()=>onSelect(Number(button.dataset.id))));
 page.querySelector('[data-goto-roadmap]').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('guide-page',{detail:'roadmap'})));
}
