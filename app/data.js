export async function loadTrophies() {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error('The local trophy list could not be opened.');
  const data = await response.json();
  if (!Array.isArray(data.trophies) || data.trophies.length !== 55) throw new Error('The trophy list should contain 55 entries.');
  return data.trophies;
}

export const stages = [
  { id: 'story', title: '01 · Main story', note: 'Keep chapter-start saves and one before the finale. Close each named mission as it appears.', ids: [2,3,4,5,6,8,9,10,11,12,13,7] },
  { id: 'strangers', title: '02 · Stranger strands & partners', note: 'Complete strands, partner conditions and the reported Chapter 3 race while it is available.', ids: [20,22,23,24,25,26,27,29,33,34] },
  { id: 'collect', title: '03 · Collections & exploration', note: 'Build count logs as you explore; keep sets and unique locations distinct.', ids: [28,30,31,35,42,43,48,52,54,55] },
  { id: 'activities', title: '04 · Activities & free roam', note: 'Work through races, challenges, stunts, range events and the smaller one-off conditions.', ids: [15,16,17,18,19,21,32,36,37,38,39,40,41,44,45,46,47,49,50,51,53] },
  { id: 'cleanup', title: '05 · Cleanup & 100%', note: 'Return to uncovered counters and use the in-game completion tracker for the final audit.', ids: [14,1] }
];

export const sourceLabel = 'Description-based advice · not checked in game';
