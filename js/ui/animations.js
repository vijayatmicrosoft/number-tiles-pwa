import { getTileEl } from './renderer.js';

const ANIM_TIMEOUT = 500;

export function animateMatch(containerEl, idxA, idxB) {
  return new Promise(resolve => {
    const tileA = getTileEl(containerEl, idxA);
    const tileB = getTileEl(containerEl, idxB);
    let resolved = 0;

    function onEnd() {
      resolved++;
      if (resolved >= 2) {
        clearTimeout(fallback);
        resolve();
      }
    }

    if (tileA) {
      tileA.classList.remove('tile--selected');
      tileA.classList.add('tile--matched');
      tileA.addEventListener('animationend', () => {
        tileA.classList.remove('tile--matched');
        onEnd();
      }, { once: true });
    } else { resolved++; }

    if (tileB) {
      tileB.classList.remove('tile--selected');
      tileB.classList.add('tile--matched');
      tileB.addEventListener('animationend', () => {
        tileB.classList.remove('tile--matched');
        onEnd();
      }, { once: true });
    } else { resolved++; }

    const fallback = setTimeout(() => {
      if (resolved < 2) resolve();
    }, ANIM_TIMEOUT);

    if (resolved >= 2) { clearTimeout(fallback); resolve(); }
  });
}

export function animateInvalid(containerEl, idxA, idxB) {
  return new Promise(resolve => {
    const tileA = getTileEl(containerEl, idxA);
    const tileB = getTileEl(containerEl, idxB);
    let resolved = 0;

    function onEnd() {
      resolved++;
      if (resolved >= 2) {
        clearTimeout(fallback);
        resolve();
      }
    }

    [tileA, tileB].forEach(tile => {
      if (tile) {
        tile.classList.remove('tile--selected');
        tile.classList.add('tile--invalid');
        tile.addEventListener('animationend', () => {
          tile.classList.remove('tile--invalid');
          onEnd();
        }, { once: true });
      } else { resolved++; }
    });

    const fallback = setTimeout(() => {
      if (resolved < 2) resolve();
    }, ANIM_TIMEOUT);

    if (resolved >= 2) { clearTimeout(fallback); resolve(); }
  });
}

export function showComboFloat(multiplier) {
  const el = document.createElement('div');
  el.className = 'combo-float';
  el.textContent = `Combo x${multiplier + 1}!`;
  document.body.appendChild(el);
  const fallback = setTimeout(() => el.remove(), 1000);
  el.addEventListener('animationend', () => {
    clearTimeout(fallback);
    el.remove();
  });
}
