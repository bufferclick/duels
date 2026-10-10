export class MeterSystem {
  value = 0;
  max = 100;
  add(amt:number) { this.value = Math.min(this.max, this.value + amt); }
  spend(cost:number) {
    if (this.value >= cost) { this.value -= cost; return true; }
    return false;
  }
  canSpend(cost:number) { return this.value >= cost; }
  reset() { this.value = 0; }
  ratio() { return this.value / this.max; }
}
