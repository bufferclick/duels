export class ParrySystem {
  window = 6;
  // returns true if parry successful
  check(attackerFrame: number, defenderParryFrame: number) {
    return Math.abs(attackerFrame - defenderParryFrame) <= this.window;
  }
}
