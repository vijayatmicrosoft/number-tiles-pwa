const COLS = 9;

export function createBoard(levelConfig) {
  const { rows, digitMin, digitMax } = levelConfig;
  const total = rows * COLS;
  const cells = [];

  for (let i = 0; i < total; i++) {
    cells.push({
      id: i,
      value: randomInt(digitMin, digitMax),
      cleared: false,
    });
  }

  return { cols: COLS, cells };
}

export function addRows(board) {
  const remaining = board.cells.filter(c => !c.cleared).map(c => c.value);
  const startId = board.cells.length;
  remaining.forEach((val, i) => {
    board.cells.push({ id: startId + i, value: val, cleared: false });
  });
  return board;
}

export function isBoardCleared(board) {
  return board.cells.every(c => c.cleared);
}

export function getRemainingCount(board) {
  return board.cells.filter(c => !c.cleared).length;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
