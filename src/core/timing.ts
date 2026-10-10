export class Timing {
  hitstop = 0;
  timescale = 1;
  slowTimer = 0;
  shake = 0;
  shakeDecay = 0.92;

  triggerHitstop(frames: number) {
    this.hitstop = Math.max(this.hitstop, frames);
  }
  triggerShake(intensity: number) {
    this.shake = Math.max(this.shake, intensity);
  }
  triggerSlow(frames: number, scale: number) {
    this.slowTimer = frames;
    this.timescale = scale;
  }
  update() {
    if (this.hitstop > 0) this.hitstop--;
    if (this.slowTimer > 0) {
      this.slowTimer--;
      if (this.slowTimer <= 0) this.timescale = 1;
    }
    this.shake *= this.shakeDecay;
    if (Math.abs(this.shake) < 0.1) this.shake = 0;
  }
  get dtScale() {
    if (this.hitstop > 0) return 0;
    return this.timescale;
  }
  get shakeOffset() {
    if (!this.shake) return { x: 0, y: 0 };
    return {
      x: (Math.random() * 2 - 1) * this.shake,
      y: (Math.random() * 2 - 1) * this.shake * 0.5
    };
  }
}
