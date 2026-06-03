export function isValidMatch(cellA, cellB) {
  return cellA.value === cellB.value || cellA.value + cellB.value === 10;
}

export function areAdjacent(board, idxA, idxB) {
  const lo = Math.min(idxA, idxB);
  const hi = Math.max(idxA, idxB);

  let allClearedBetween = true;
  for (let i = lo + 1; i < hi; i++) {
    if (!board.cells[i].cleared) {
      allClearedBetween = false;
      break;
    }
  }
  if (allClearedBetween) return true;

  const colA = lo % board.cols;
  const colB = hi % board.cols;
  if (colA === colB) {
    let allClearedVertical = true;
    for (let i = lo + board.cols; i < hi; i += board.cols) {
      if (!board.cells[i].cleared) {
        allClearedVertical = false;
        break;
      }
    }
    if (allClearedVertical) return true;
  }

  return false;
}

export function hasAvailableMoves(board) {
  const active = [];
  for (let i = 0; i < board.cells.length; i++) {
    if (!board.cells[i].cleared) active.push(i);
  }

  for (let a = 0; a < active.length; a++) {
    for (let b = a + 1; b < active.length; b++) {
      const idxA = active[a];
      const idxB = active[b];
      if (isValidMatch(board.cells[idxA], board.cells[idxB]) &&
          areAdjacent(board, idxA, idxB)) {
        return true;
      }
    }
  }
  return false;
}

export function findOneMove(board) {
  const active = [];
  for (let i = 0; i < board.cells.length; i++) {
    if (!board.cells[i].cleared) active.push(i);
  }

  for (let a = 0; a < active.length; a++) {
    for (let b = a + 1; b < active.length; b++) {
      const idxA = active[a];
      const idxB = active[b];
      if (isValidMatch(board.cells[idxA], board.cells[idxB]) &&
          areAdjacent(board, idxA, idxB)) {
        return [idxA, idxB];
      }
    }
  }
  return null;
}
