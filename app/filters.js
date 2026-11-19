export function isMasked(trophy, state) {
  return Boolean(state.spoiler && trophy.kind === 'story' && !state.earned.includes(trophy.id));
}

export function filterTrophies(trophies, state, options) {
  const query = options.search.trim().toLowerCase();
  return trophies.filter(trophy => {
    const earned = state.earned.includes(trophy.id);
    if (state.hideHidden && trophy.hidden) return false;
    if (options.grade && trophy.grade !== options.grade) return false;
    if (options.kind && trophy.kind !== options.kind) return false;
    if (options.status === 'earned' && !earned || options.status === 'open' && earned) return false;
    if (query) {
      const searchable = isMasked(trophy, state)
        ? 'Hidden trophy — earn it to reveal Story spoiler · toggle spoilers to preview'
        : `${trophy.name} ${trophy.description} ${trophy.guide}`;
      if (!searchable.toLowerCase().includes(query)) return false;
    }
    return true;
  });
}
