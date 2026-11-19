export function shell(root) {
  root.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#checklist" aria-label="Leonida Guide home"><span class="brand-mark">L</span><span>LEONIDA <b>FIELD NOTES</b></span></a>
      <nav class="main-nav" aria-label="Guide pages">
        <button data-page="checklist" class="nav-link active">Trophies</button><button data-page="roadmap" class="nav-link">Roadmap</button><button data-page="missables" class="nav-link">Missables <i>1</i></button><button data-page="planner" class="nav-link">Next up</button><button data-page="settings" class="nav-link">Settings & save</button>
      </nav>
      <div class="header-progress"><div class="earned-line"><span class="earned-count" id="earned-count">0</span><span class="earned-total">/ 55<br><small>earned</small></span></div><div class="progress-track"><span id="progress-fill"></span></div></div>
    </header>
    <main id="page"></main>
    <footer><span>LEONIDA PLATINUM GUIDE</span><span>Offline field guide · progress stays in this browser</span></footer>`;
  return root.querySelector('#page');
}
