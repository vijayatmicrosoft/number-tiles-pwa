import { createGameState, handleTileSelect, completeClear, completeInvalid,
         handleAddRows, enterHammerMode, exitHammerMode, Status,
         getSaveData, restoreFromSave } from './game/state.js';
import { getLevelConfig } from './game/levels.js';
import { isBoardCleared, getRemainingCount } from './game/board.js';
import { hasAvailableMoves } from './game/rules.js';
import { calculateLevelScore, calculateStars, calculateCoins } from './systems/score.js';
import { useHammer, useHint, canAfford, BOOSTER_COSTS } from './systems/boosters.js';
import { renderBoard, setTileClass, clearAllSelections, clearAllHints } from './ui/renderer.js';
import { animateMatch, animateInvalid, showComboFloat } from './ui/animations.js';
import { updateAll, updateScore, updateCoins, updateAddRowsCount } from './ui/hud.js';
import { showLevelComplete, showNoMoves, showSettings, showInstallPrompt } from './ui/modals.js';
import { initAudio, playSound, setMuted } from './systems/audio.js';
import { saveGame, loadGame, saveSettings, loadSettings, resetProgress } from './storage.js';

let state;
let settings;
let deferredInstallPrompt = null;
const boardEl = document.getElementById('board');

function init() {
  registerServiceWorker();
  captureInstallPrompt();

  settings = loadSettings();

  const saved = loadGame();
  const restored = saved ? restoreFromSave(saved) : null;
  state = restored || createGameState(1, 0);

  render();
  bindEvents();
  updateAll(state);

  setMuted(!settings.sound);
}

function render() {
  renderBoard(state.board, boardEl);
  updateAll(state);
  updateBoosterButtons();
}

function updateBoosterButtons() {
  const hammerBtn = document.getElementById('hammerBtn');
  const hintBtn = document.getElementById('hintBtn');
  const addRowsBtn = document.getElementById('addRowsBtn');

  hammerBtn.disabled = !canAfford('hammer', state.coins);
  hintBtn.disabled = !canAfford('hint', state.coins);
  addRowsBtn.disabled = state.addRowsRemaining <= 0;
  updateAddRowsCount(state.addRowsRemaining);
}

function vibrate(ms) {
  if (settings.vibration && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

function onTileClick(e) {
  const tile = e.target.closest('.tile');
  if (!tile) return;

  const index = parseInt(tile.dataset.index, 10);
  if (isNaN(index)) return;

  initAudio();

  if (state.status === Status.HAMMER_MODE) {
    if (!state.board.cells[index].cleared) {
      useHammer(state.board, index);
      state.coins -= BOOSTER_COSTS.hammer;
      exitHammerMode(state);
      playSound('match');
      vibrate(10);
      render();
      autoSave();

      boardEl.classList.remove('hammer-active');

      if (isBoardCleared(state.board)) {
        state.status = Status.LEVEL_COMPLETE;
        onLevelComplete();
      } else if (!hasAvailableMoves(state.board)) {
        handleNoMoves();
      }
    }
    return;
  }

  const result = handleTileSelect(state, index);

  switch (result.action) {
    case 'select':
      clearAllSelections(boardEl);
      clearAllHints(boardEl);
      setTileClass(boardEl, index, 'tile--selected');
      playSound('tap');
      vibrate(5);
      break;

    case 'deselect':
      clearAllSelections(boardEl);
      playSound('tap');
      break;

    case 'match':
      playSound('match');
      vibrate(10);
      if (result.combo > 1) {
        showComboFloat(result.combo);
      }
      updateScore(state.score);

      animateMatch(boardEl, result.idxA, result.idxB).then(() => {
        const clearResult = completeClear(state, result.idxA, result.idxB);
        setTileClass(boardEl, result.idxA, 'tile--cleared');
        setTileClass(boardEl, result.idxB, 'tile--cleared');
        updateBoosterButtons();
        autoSave();

        if (clearResult.action === 'level_complete') {
          onLevelComplete();
        } else if (clearResult.action === 'no_moves') {
          handleNoMoves();
        }
      });
      break;

    case 'invalid':
      playSound('invalid');
      vibrate(30);
      animateInvalid(boardEl, result.idxA, result.idxB).then(() => {
        completeInvalid(state);
      });
      break;
  }
}

function handleNoMoves() {
  if (state.addRowsRemaining > 0) {
    showNoMoves(
      state.addRowsRemaining,
      () => doAddRows(),
      () => restartLevel()
    );
  } else {
    showNoMoves(0, () => {}, () => restartLevel());
  }
}

function doAddRows() {
  if (handleAddRows(state)) {
    render();
    autoSave();

    if (!hasAvailableMoves(state.board)) {
      handleNoMoves();
    }
  }
}

function onLevelComplete() {
  playSound('levelup');
  vibrate(50);
  const remaining = getRemainingCount(state.board);
  const totalScore = calculateLevelScore(state.score, remaining, state.addRowsUsed);
  const stars = calculateStars(totalScore, state.config.parScore);
  const coinsEarned = calculateCoins(totalScore);
  const bonus = totalScore - state.score;

  state.coins += coinsEarned;

  showLevelComplete({
    matchScore: state.score,
    bonus: Math.max(0, bonus),
    totalScore,
    stars,
    coinsEarned,
  }, () => {
    state = createGameState(state.level + 1, state.coins);
    render();
    autoSave();
  });
}

function restartLevel() {
  state = createGameState(state.level, state.coins);
  render();
  autoSave();
}

function autoSave() {
  saveGame(getSaveData(state));
}

function bindEvents() {
  boardEl.addEventListener('click', onTileClick);

  document.getElementById('addRowsBtn').addEventListener('click', () => {
    initAudio();
    doAddRows();
  });

  document.getElementById('hammerBtn').addEventListener('click', () => {
    initAudio();
    if (canAfford('hammer', state.coins) && enterHammerMode(state)) {
      clearAllSelections(boardEl);
      boardEl.classList.add('hammer-active');
      playSound('tap');
    }
  });

  document.getElementById('hintBtn').addEventListener('click', () => {
    initAudio();
    if (!canAfford('hint', state.coins)) return;

    const pair = useHint(state.board);
    if (pair) {
      state.coins -= BOOSTER_COSTS.hint;
      updateCoins(state.coins);
      updateBoosterButtons();
      autoSave();

      clearAllHints(boardEl);
      setTileClass(boardEl, pair[0], 'tile--hint');
      setTileClass(boardEl, pair[1], 'tile--hint');
      playSound('tap');
    }
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    showSettings(settings,
      (updated) => {
        settings = updated;
        saveSettings(settings);
        setMuted(!settings.sound);
      },
      () => {
        resetProgress();
        state = createGameState(1, 0);
        render();
      }
    );
  });

  document.getElementById('menuBtn').addEventListener('click', () => {
    showSettings(settings,
      (updated) => {
        settings = updated;
        saveSettings(settings);
        setMuted(!settings.sound);
      },
      () => {
        resetProgress();
        state = createGameState(1, 0);
        render();
      }
    );
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  }
}

function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    setTimeout(() => showInstallPrompt(deferredInstallPrompt), 3000);
  });
}

init();
