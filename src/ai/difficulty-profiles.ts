import type { Difficulty } from '../data/balance-constants';

export interface DifficultyProfile {
  reactionDelay: number; // frames
  decisionAccuracy: number; // 0-1
  aggression: number; // 0-1
  punishChance: number;
  blockChance: number;
  whiffPunishDist: number;
  meterUseThreshold: number; // health% to use super
}

export const DIFFICULTY: Record<Difficulty, DifficultyProfile> = {
  novice: {
    reactionDelay: 14,
    decisionAccuracy: 0.55,
    aggression: 0.4,
    punishChance: 0.35,
    blockChance: 0.45,
    whiffPunishDist: 80,
    meterUseThreshold: 0.4
  },
  veteran: {
    reactionDelay: 7,
    decisionAccuracy: 0.78,
    aggression: 0.62,
    punishChance: 0.68,
    blockChance: 0.72,
    whiffPunishDist: 110,
    meterUseThreshold: 0.55
  },
  nightmare: {
    reactionDelay: 3,
    decisionAccuracy: 0.92,
    aggression: 0.82,
    punishChance: 0.88,
    blockChance: 0.84,
    whiffPunishDist: 140,
    meterUseThreshold: 0.7
  }
};
