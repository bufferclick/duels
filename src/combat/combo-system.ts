export class ComboSystem {
  hits = 0;
  damage = 0;
  timer = 0;
  window = 42;
  decay = 0.85;
  lastHitFrame = -999;

  registerHit(baseDamage:number, frame:number) {
    if (frame - this.lastHitFrame > this.window) {
      this.hits = 0; this.damage = 0;
    }
    this.hits++;
    const scaled = baseDamage * Math.pow(this.decay, this.hits-1);
    this.damage += scaled;
    this.lastHitFrame = frame;
    this.timer = this.window;
    return scaled;
  }
  update(frame:number) {
    if (frame - this.lastHitFrame > this.window && this.hits>0) {
      // keep for display briefly
      if (frame - this.lastHitFrame > this.window + 30) { this.hits=0; this.damage=0; }
    }
  }
  reset() { this.hits=0; this.damage=0; this.lastHitFrame=-999; }
}
