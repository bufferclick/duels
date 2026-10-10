import { BALANCE } from '../data/balance-constants';

export class Camera {
  x = 700; // center
  y = 0;
  targetX = 700;
  shakeX = 0;
  shakeY = 0;
  width = 1400;
  viewportW = 1280;
  viewportH = 720;

  update(p1x: number, p2x: number, shake: {x:number,y:number}) {
    const mid = (p1x + p2x)/2;
    this.targetX = Math.max(this.viewportW/2, Math.min(BALANCE.stageWidth - this.viewportW/2, mid));
    this.x += (this.targetX - this.x) * BALANCE.cameraLerp;
    this.shakeX = shake.x;
    this.shakeY = shake.y;
  }
  worldToScreen(x: number, y: number) {
    return {
      x: x - (this.x - this.viewportW/2) + this.shakeX,
      y: y + this.shakeY
    };
  }
}
