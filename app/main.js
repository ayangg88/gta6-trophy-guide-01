import { loadTrophies } from './data.js';
import { store } from './store.js';
import { shell } from './views/shell.js';
import { renderChecklist } from './views/checklist.js';
import { renderRoadmap } from './views/roadmap.js';
import { renderMissables } from './views/missables.js';
import { renderPlanner } from './views/planner.js';
import { renderSettings } from './views/settings.js';

const root=document.querySelector('#app');
const page=shell(root);
const filters={search:'',grade:'',kind:'',status:''};
let trophies=[];
let selectedId=1;
let activePage='checklist';
let showShotDrawer=true;
const queryShot=new URLSearchParams(location.search).get('shot');
const shotEarned=[2,3,4,5,6,8,9,10,15,16,17,18,19];

function syncHeader(){
 const count=store.get().earned.length;
 root.querySelector('#earned-count').textContent=count;
 root.querySelector('#progress-fill').style.width=`${count/55*100}%`;
}
function choose(id){if(activePage!=='checklist')Object.assign(filters,{search:'',grade:'',kind:'',status:''});selectedId=id;activePage='checklist';paint();}
function render(){
 syncHeader();
 page.classList.toggle('roadmap-shot',queryShot==='2'&&activePage==='roadmap');
 root.querySelectorAll('[data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page===activePage));
 if(activePage==='checklist'){
  renderChecklist(page,trophies,store.get(),selectedId,filters,choose,(id,value)=>store.earned(id,value),(next)=>{Object.assign(filters,next);render();},(key,value)=>store.setting(key,value));
  if(queryShot==='4'&&showShotDrawer)renderShotDrawer();
 }
 else if(activePage==='roadmap')renderRoadmap(page,trophies,store.get(),choose);
 else if(activePage==='missables')renderMissables(page,trophies,store.get(),choose);
 else if(activePage==='planner')renderPlanner(page,trophies,store.get(),choose);
 else renderSettings(page,store.get(),store);
}
function paint(){render();}
function navigate(name){activePage=name;render();}
function renderShotDrawer(){
 const drawer=document.createElement('aside');drawer.className='shot-settings';drawer.innerHTML=`<span class="eyebrow">QUICK SETTINGS</span><h2>Read with care.</h2><label><span><b>Spoiler cover</b><small>Mask unearned story names.</small></span><input id="shot-spoiler" type="checkbox" ${store.get().spoiler?'checked':''}></label><label><span><b>Hide hidden trophies</b><small>Remove PlayStation-hidden entries.</small></span><input id="shot-hidden" type="checkbox" ${store.get().hideHidden?'checked':''}></label><div class="drawer-tip"><b>${store.get().earned.length} / 55 EARNED</b><span>Story entries stay masked until earned.</span></div><button id="drawer-done">Back to the list →</button>`;
 page.append(drawer);
 drawer.querySelector('#shot-spoiler').addEventListener('change',event=>store.setting('spoiler',event.target.checked));
 drawer.querySelector('#shot-hidden').addEventListener('change',event=>store.setting('hideHidden',event.target.checked));
 drawer.querySelector('#drawer-done').addEventListener('click',()=>{showShotDrawer=false;navigate('checklist');});
}
root.addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(button)navigate(button.dataset.page);});
window.addEventListener('guide-page',event=>navigate(event.detail));
window.addEventListener('guide-note',event=>store.note(event.detail.id,event.detail.value));
window.addEventListener('guide-count',event=>store.count(event.detail.id,event.detail.value));
store.subscribe(()=>render());
window.addEventListener('keydown',event=>{
 if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();if(activePage!=='checklist')navigate('checklist');requestAnimationFrame(()=>root.querySelector('#search')?.focus());}
 if(activePage==='checklist'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
  const list=document.querySelector('#trophy-list');const rows=[...list.querySelectorAll('.row-open')];const index=rows.findIndex(row=>Number(row.dataset.trophy)===selectedId);
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const next=rows[Math.max(0,Math.min(rows.length-1,index+(event.key==='ArrowDown'?1:-1)))];if(next){selectedId=Number(next.dataset.trophy);paint();document.querySelector(`.row-open[data-trophy="${selectedId}"]`)?.focus();}}
  if(event.code==='Space'&&rows.length){event.preventDefault();const active=rows[index<0?0:index];const id=Number(active.dataset.trophy);store.earned(id,!store.get().earned.includes(id));}
 }
});

try{
 trophies=await loadTrophies();
 if(queryShot){
  store.stageShot(shotEarned,queryShot==='4'?{spoiler:true}:{});
  selectedId=queryShot==='4'?11:28;
  if(queryShot==='2')activePage='roadmap';
  if(queryShot==='3'){activePage='missables';filters.kind='missable';}
  if(queryShot==='4')activePage='checklist';
  if(queryShot==='1')activePage='checklist';
 }
 render();
}catch(error){page.innerHTML=`<section class="error-card"><span class="eyebrow">LOCAL DATA ERROR</span><h1>Guide data didn't load.</h1><p>${error.message}</p><p>Serve app/ from a static HTTP server so the local module and data file can open.</p></section>`;}
