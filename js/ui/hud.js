const scoreEl = document.getElementById('scoreValue');
const levelEl = document.getElementById('levelValue');
const coinsEl = document.getElementById('coinsValue');
const addRowsCountEl = document.getElementById('addRowsCount');

export function updateScore(score) {
  if (scoreEl) scoreEl.textContent = score;
}

export function updateLevel(level) {
  if (levelEl) levelEl.textContent = level;
}

export function updateCoins(coins) {
  if (coinsEl) coinsEl.textContent = coins;
}

export function updateAddRowsCount(count) {
  if (addRowsCountEl) addRowsCountEl.textContent = count;
}

export function updateAll(state) {
  updateScore(state.score);
  updateLevel(state.level);
  updateCoins(state.coins);
  updateAddRowsCount(state.addRowsRemaining);
}
