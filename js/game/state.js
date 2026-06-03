import { createBoard, addRows, isBoardCleared, getRemainingCount } from './board.js';
import { isValidMatch, areAdjacent, hasAvailableMoves } from './rules.js';
import { getLevelConfig } from './levels.js';
import { calculateMatchScore } from '../systems/score.js';

export const Status = {
  IDLE: 'IDLE',
  SELECTED: 'SELECTED',
  ANIMATING: 'ANIMATING',
  HAMMER_MODE: 'HAMMER_MODE',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
};

export function createGameState(level = 1, coins = 0) {
  const config = getLevelConfig(level);
  const board = createBoard(config);

  return {
    board,
    config,
    level,
    selectedIndex: -1,
    status: Status.IDLE,
    score: 0,
    coins,
    comboCount: 0,
    lastMatchTime: 0,
    addRowsUsed: 0,
    addRowsRemaining: config.maxAddRows,
  };
}

export function handleTileSelect(state, index) {
  if (state.status === Status.ANIMATING || state.status === Status.LEVEL_COMPLETE) {
    return { action: 'none' };
  }

  const cell = state.board.cells[index];
  if (!cell || cell.cleared) {
    return { action: 'none' };
  }

  if (state.status === Status.HAMMER_MODE) {
    return { action: 'hammer', index };
  }

  if (state.status === Status.IDLE) {
    state.selectedIndex = index;
    state.status = Status.SELECTED;
    return { action: 'select', index };
  }

  if (state.status === Status.SELECTED) {
    if (index === state.selectedIndex) {
      state.selectedIndex = -1;
      state.status = Status.IDLE;
      return { action: 'deselect', index };
    }

    const cellA = state.board.cells[state.selectedIndex];
    const cellB = state.board.cells[index];

    if (isValidMatch(cellA, cellB) && areAdjacent(state.board, state.selectedIndex, index)) {
      const idxA = state.selectedIndex;
      state.status = Status.ANIMATING;
      state.selectedIndex = -1;

      const now = Date.now();
      if (now - state.lastMatchTime < 2000) {
        state.comboCount++;
      } else {
        state.comboCount = 0;
      }
      state.lastMatchTime = now;

      const points = calculateMatchScore(state.comboCount);
      state.score += points;

      return {
        action: 'match',
        idxA,
        idxB: index,
        points,
        combo: state.comboCount,
      };
    } else {
      const prevIdx = state.selectedIndex;
      state.selectedIndex = -1;
      state.status = Status.ANIMATING;
      return { action: 'invalid', idxA: prevIdx, idxB: index };
    }
  }

  return { action: 'none' };
}

export function completeClear(state, idxA, idxB) {
  state.board.cells[idxA].cleared = true;
  state.board.cells[idxB].cleared = true;
  state.status = Status.IDLE;

  if (isBoardCleared(state.board)) {
    state.status = Status.LEVEL_COMPLETE;
    return { action: 'level_complete', perfect: true };
  }

  if (!hasAvailableMoves(state.board)) {
    return { action: 'no_moves' };
  }

  return { action: 'continue' };
}

export function completeInvalid(state) {
  state.status = Status.IDLE;
}

export function handleAddRows(state) {
  if (state.addRowsRemaining <= 0) return false;

  addRows(state.board);
  state.addRowsUsed++;
  state.addRowsRemaining--;
  return true;
}

export function enterHammerMode(state) {
  if (state.status === Status.IDLE || state.status === Status.SELECTED) {
    state.selectedIndex = -1;
    state.status = Status.HAMMER_MODE;
    return true;
  }
  return false;
}

export function exitHammerMode(state) {
  state.status = Status.IDLE;
}

export function getSaveData(state) {
  return {
    board: state.board,
    level: state.level,
    score: state.score,
    coins: state.coins,
    addRowsUsed: state.addRowsUsed,
    addRowsRemaining: state.addRowsRemaining,
  };
}

export function restoreFromSave(save) {
  if (!save || !save.board || !Array.isArray(save.board.cells) || !save.level) {
    return null;
  }
  const config = getLevelConfig(save.level);
  return {
    board: save.board,
    config,
    level: save.level,
    selectedIndex: -1,
    status: Status.IDLE,
    score: save.score || 0,
    coins: save.coins || 0,
    comboCount: 0,
    lastMatchTime: 0,
    addRowsUsed: save.addRowsUsed || 0,
    addRowsRemaining: save.addRowsRemaining ?? config.maxAddRows,
  };
}
