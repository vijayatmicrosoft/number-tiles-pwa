const LEVELS = [
  { rows: 3, digitMin: 1, digitMax: 5, parScore: 200, maxAddRows: 3 },
  { rows: 3, digitMin: 1, digitMax: 7, parScore: 250, maxAddRows: 3 },
  { rows: 4, digitMin: 1, digitMax: 9, parScore: 300, maxAddRows: 3 },
  { rows: 4, digitMin: 1, digitMax: 9, parScore: 350, maxAddRows: 3 },
  { rows: 5, digitMin: 1, digitMax: 9, parScore: 400, maxAddRows: 3 },
  { rows: 5, digitMin: 1, digitMax: 9, parScore: 450, maxAddRows: 3 },
  { rows: 5, digitMin: 1, digitMax: 9, parScore: 500, maxAddRows: 3 },
  { rows: 6, digitMin: 1, digitMax: 9, parScore: 550, maxAddRows: 3 },
  { rows: 6, digitMin: 1, digitMax: 9, parScore: 600, maxAddRows: 3 },
  { rows: 6, digitMin: 1, digitMax: 9, parScore: 650, maxAddRows: 3 },
];

export function getLevelConfig(levelNum) {
  levelNum = Math.max(1, levelNum);
  if (levelNum <= LEVELS.length) {
    return { ...LEVELS[levelNum - 1] };
  }
  const rows = Math.min(7, 6 + Math.floor((levelNum - 10) / 5));
  return {
    rows,
    digitMin: 1,
    digitMax: 9,
    parScore: 600 + (levelNum - 10) * 30,
    maxAddRows: 3,
  };
}
