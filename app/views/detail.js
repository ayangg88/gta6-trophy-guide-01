import { isMasked } from '../filters.js';

const gradeName = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export function renderDetail(trophy, state, onNote) {
  if (!trophy) return `<aside class="detail-pane empty-detail"><span class="eyebrow">FIELD GUIDE</span><h2>Choose a trophy</h2><p>Open a card to read the description, planning notes and source trail.</p><div class="empty-stamp">✳</div></aside>`;
  const masked = isMasked(trophy, state);
  const earned = state.earned.includes(trophy.id);
  const title = masked ? 'Hidden trophy — earn it to reveal' : trophy.name;
  const desc = masked ? 'Story details are covered by your spoiler setting.' : trophy.description;
  const medals = { platinum: '✦', gold: '●', silver: '●', bronze: '●' };
  const links = masked ? '' : trophy.sources.map(source => source.url ? `<a href="${source.url}" target="_blank" rel="noreferrer">${source.name} ↗</a>` : `<span>${source.name}</span>`).join(' · ');
  const guide = masked ? '<p>Mark this trophy earned to reveal its guide.</p>' : `<p>${trophy.guide}</p>`;
  return `<aside class="detail-pane" aria-label="Trophy guide">
    <div class="detail-top"><span class="eyebrow">TROPHY ${String(trophy.id).padStart(2,'0')} / 55</span><span class="grade-chip ${trophy.grade}">${medals[trophy.grade]} ${gradeName[trophy.grade]}</span></div>
    ${trophy.hidden ? '<span class="hidden-chip">SPOILER</span>' : ''}
    <h2>${title}</h2><p class="official-description">${desc}</p>
    ${trophy.target ? `<div class="target-card"><span>PSN PROGRESS</span><label><input id="psn-counter" type="number" min="0" max="${trophy.target}" value="${Math.min(trophy.target,Number(state.counts[trophy.id]||0))}" aria-label="Current PSN count"> <b>/ ${trophy.target.toLocaleString()}</b></label><em>Target reported by PSNProfiles</em></div>` : ''}
    ${trophy.missable ? `<div class="warning-card"><b>REPORTED MISSABLE</b><span>Chapter 1 balcony spot reported to disappear after the chapter. This has not been confirmed in-game.</span></div>` : ''}
    <section class="guide-copy"><span class="eyebrow">FIELD GUIDE · ${trophy.kind.toUpperCase()}</span>${guide}</section>
    <section class="source-line"><span class="eyebrow">SOURCES</span><p>${links}</p><small>Launch date: 19 Nov 2026. No official guide is available yet.</small></section>
    <label class="notes-label" for="trophy-notes">YOUR NOTES <span>Saved on this device</span></label><textarea id="trophy-notes" placeholder="Route, count, or what to check next…" ${masked ? 'disabled' : ''}>${masked ? '' : (state.notes[trophy.id] || '')}</textarea>
    <div class="detail-foot">${earned ? 'RECORDED IN YOUR CHECKLIST' : 'ADVICE INFERRED FROM DESCRIPTION · NOT CHECKED IN GAME'}</div>
  </aside>`;
}

export function bindDetail(root, trophy, onNote, onCount) {
  const textarea = root.querySelector('#trophy-notes');
  if (textarea && trophy) textarea.addEventListener('change', () => onNote(trophy.id, textarea.value));
  const counter = root.querySelector('#psn-counter');
  if (counter && trophy) counter.addEventListener('change', () => onCount(trophy.id, counter.value));
}
