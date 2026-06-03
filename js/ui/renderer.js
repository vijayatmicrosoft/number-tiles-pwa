export function renderBoard(board, containerEl) {
  containerEl.replaceChildren();

  board.cells.forEach((cell, index) => {
    const tile = document.createElement('div');
    tile.className = `tile tile--n${cell.value}`;
    tile.dataset.index = index;
    tile.textContent = cell.value;
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');

    if (cell.cleared) {
      tile.classList.add('tile--cleared');
      tile.removeAttribute('tabindex');
    }

    const row = Math.floor(index / board.cols) + 1;
    const col = (index % board.cols) + 1;
    tile.setAttribute('aria-label', `Tile ${cell.value}, row ${row}, column ${col}`);

    containerEl.appendChild(tile);
  });

  containerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.target.click();
    }
  });
}

export function getTileEl(containerEl, index) {
  return containerEl.querySelector(`[data-index="${index}"]`);
}

export function setTileClass(containerEl, index, className, add = true) {
  const tile = getTileEl(containerEl, index);
  if (tile) {
    if (add) tile.classList.add(className);
    else tile.classList.remove(className);
  }
}

export function clearAllSelections(containerEl) {
  containerEl.querySelectorAll('.tile--selected').forEach(el => {
    el.classList.remove('tile--selected');
  });
}

export function clearAllHints(containerEl) {
  containerEl.querySelectorAll('.tile--hint').forEach(el => {
    el.classList.remove('tile--hint');
  });
}
