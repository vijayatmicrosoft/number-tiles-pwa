export function calculateMatchScore(comboLevel) {
  return 10 + (comboLevel * 5);
}

export function calculateLevelScore(matchScore, remainingTiles, addRowsUsed) {
  let bonus = 0;
  if (remainingTiles === 0) bonus = 500;
  else bonus = Math.max(20, 100 - remainingTiles * 2);

  const penalty = addRowsUsed * 5;
  return Math.max(0, matchScore + bonus - penalty);
}

export function calculateStars(levelScore, parScore) {
  if (levelScore >= parScore * 1.5) return 3;
  if (levelScore >= parScore) return 2;
  return 1;
}

export function calculateCoins(levelScore) {
  return Math.floor(levelScore / 50);
}
