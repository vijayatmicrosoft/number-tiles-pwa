function bindModal(modal, handlers) {
  const ac = new AbortController();

  modal.addEventListener('cancel', (e) => {
    e.preventDefault();
  }, { signal: ac.signal });

  for (const [el, fn] of handlers) {
    el.addEventListener('click', () => {
      modal.close();
      ac.abort();
      fn();
    }, { signal: ac.signal });
  }

  modal.showModal();
  return ac;
}

export function showLevelComplete(stats, onNext) {
  const modal = document.getElementById('levelCompleteModal');
  const starsContainer = document.getElementById('starsContainer');
  const statsContainer = document.getElementById('levelStats');

  const starIcons = [];
  for (let i = 0; i < 3; i++) {
    starIcons.push(i < stats.stars ? '\u2B50' : '\u2606');
  }
  starsContainer.textContent = starIcons.join(' ');

  statsContainer.replaceChildren();
  const lines = [
    ['Match Score', stats.matchScore],
    ['Bonus', `+${stats.bonus}`],
    ['Coins Earned', `+${stats.coinsEarned}`],
    ['Total', stats.totalScore],
  ];
  for (const [label, value] of lines) {
    const div = document.createElement('div');
    div.textContent = `${label}: `;
    const strong = document.createElement('strong');
    strong.textContent = value;
    div.appendChild(strong);
    statsContainer.appendChild(div);
  }

  bindModal(modal, [
    [document.getElementById('nextLevelBtn'), onNext],
  ]);
}

export function showNoMoves(addRowsRemaining, onAddRows, onRestart) {
  const modal = document.getElementById('noMovesModal');
  const text = document.getElementById('noMovesText');
  const addBtn = document.getElementById('addRowsModalBtn');
  const restartBtn = document.getElementById('restartLevelBtn');

  if (addRowsRemaining > 0) {
    text.textContent = `No more valid pairs on the board. You can add rows (${addRowsRemaining} remaining) to create new matches.`;
    addBtn.style.display = '';
    addBtn.textContent = `Add Rows (${addRowsRemaining})`;
  } else {
    text.textContent = 'No moves left and no more row additions available. You can restart the level or use a booster.';
    addBtn.style.display = 'none';
  }

  const handlers = [
    [restartBtn, onRestart],
  ];
  if (addRowsRemaining > 0) {
    handlers.push([addBtn, onAddRows]);
  }

  bindModal(modal, handlers);
}

export function showSettings(settings, onSave, onReset) {
  const modal = document.getElementById('settingsModal');
  const soundToggle = document.getElementById('soundToggle');
  const vibrationToggle = document.getElementById('vibrationToggle');
  const resetBtn = document.getElementById('resetProgressBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');

  soundToggle.checked = settings.sound;
  vibrationToggle.checked = settings.vibration;

  const ac = new AbortController();

  modal.addEventListener('cancel', (e) => {
    e.preventDefault();
  }, { signal: ac.signal });

  closeBtn.addEventListener('click', () => {
    const updated = {
      sound: soundToggle.checked,
      vibration: vibrationToggle.checked,
    };
    modal.close();
    ac.abort();
    onSave(updated);
  }, { signal: ac.signal });

  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure? This will delete all progress.')) {
      modal.close();
      ac.abort();
      onReset();
    }
  }, { signal: ac.signal });

  modal.showModal();
}

export function showInstallPrompt(installEvent) {
  const modal = document.getElementById('installModal');
  const installBtn = document.getElementById('installBtn');
  const dismissBtn = document.getElementById('dismissInstallBtn');

  const installHandler = async () => {
    if (installEvent) {
      installEvent.prompt();
      await installEvent.userChoice;
    }
  };

  bindModal(modal, [
    [installBtn, installHandler],
    [dismissBtn, () => {}],
  ]);
}
