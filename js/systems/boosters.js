import { findOneMove } from '../game/rules.js';

export const BOOSTER_COSTS = { hammer: 10, hint: 5 };

export function canAfford(boosterType, coins) {
  return coins >= BOOSTER_COSTS[boosterType];
}

export function useHammer(board, index) {
  if (index >= 0 && index < board.cells.length && !board.cells[index].cleared) {
    board.cells[index].cleared = true;
    return true;
  }
  return false;
}

export function useHint(board) {
  return findOneMove(board);
}
