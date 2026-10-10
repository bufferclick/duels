import { BALANCE } from '../data/balance-constants';

export function calcDamage(base:number, opts: { isCounter?:boolean; isChip?:boolean; bloodFuelBonus?:number; heatPenalty?:boolean; calmBonus?:number } = {}) {
  let dmg = base;
  if (opts.isChip) dmg *= BALANCE.blockChipPercent;
  if (opts.isCounter) dmg *= 1.18;
  if (opts.bloodFuelBonus) dmg *= (1 + opts.bloodFuelBonus);
  if (opts.heatPenalty) dmg *= 0.85;
  if (opts.calmBonus) dmg *= opts.calmBonus;
  return Math.round(dmg);
}
