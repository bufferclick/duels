export type LoopCallback = (dt: number) => void;

export class GameLoop {
  private raf = 0;
  private last = 0;
  private cb: LoopCallback;
  private running = false;
  private fps = 60;
  private accumulator = 0;
  private step = 1000/60;

  constructor(cb: LoopCallback) { this.cb = cb; }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      let delta = now - this.last;
      this.last = now;
      // clamp
      delta = Math.min(delta, 50);
      this.accumulator += delta;
      while (this.accumulator >= this.step) {
        this.cb(this.step / (1000/60));
        this.accumulator -= this.step;
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
