import type { Fighter } from './fighter';

export class Projectile {
  x: number; y: number;
  vx: number; vy: number = 0;
  w = 22; h = 14;
  life = 90;
  damage: number;
  owner: Fighter;
  hit = false;
  trail: {x:number,y:number}[] = [];
  constructor(x:number,y:number,vx:number,damage:number,owner:Fighter) {
    this.x = x; this.y = y; this.vx = vx; this.damage = damage; this.owner = owner;
  }
  update() {
    this.trail.push({x:this.x,y:this.y});
    if (this.trail.length>6) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  getAABB() { return { x:this.x - this.w/2, y:this.y - this.h/2, w:this.w, h:this.h }; }
  alive() { return this.life>0 && !this.hit && this.x> -100 && this.x < 1500; }
}
