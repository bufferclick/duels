export interface Particle {
  x:number; y:number; vx:number; vy:number; life:number; maxLife:number;
  size:number; color:string; alpha:number; gravity?:number; shape:'rect'|'circle'|'spark';
  rotation?:number; vr?:number;
}

export class ParticleSystem {
  particles: Particle[] = [];

  emit(x:number,y:number, opts: Partial<Particle> & {count?:number, speed?:number, angle?:number}) {
    const n = opts.count ?? 1;
    for(let i=0;i<n;i++) {
      const ang = (opts as any).angle ?? (Math.random()*Math.PI*2);
      const spd = (opts as any).speed ?? (Math.random()*5+2);
      const p: Particle = {
        x, y,
        vx: Math.cos(ang)*spd + (Math.random()-0.5)*2,
        vy: Math.sin(ang)*spd + (Math.random()-0.5)*2,
        life: opts.life ?? 18,
        maxLife: opts.life ?? 18,
        size: opts.size ?? (Math.random()*3+2),
        color: opts.color ?? '#FFFFFF',
        alpha: 1,
        gravity: opts.gravity ?? 0.3,
        shape: opts.shape ?? 'rect',
        rotation: Math.random()*Math.PI,
        vr: (Math.random()-0.5)*0.6
      };
      if (opts.vx!==undefined) p.vx = opts.vx as number;
      if (opts.vy!==undefined) p.vy = opts.vy as number;
      this.particles.push(p);
    }
  }

  hitSpark(x:number,y:number, color:string, heavy=false) {
    this.emit(x,y,{ color, size: heavy?5:3, life: heavy?16:12, shape:'spark', count: heavy?14:8, speed: heavy?7:5, gravity:0.4 });
    this.emit(x,y,{ color:'#FFFFFF', size:2, life:10, shape:'circle', count:6, speed:4 });
  }
  blockSpark(x:number,y:number) {
    this.emit(x,y,{ color:'#7AD8FF', size:3, life:10, shape:'rect', count:6, speed:4, gravity:0.2 });
  }
  dashTrail(x:number,y:number, color:string) {
    this.emit(x,y,{ color, size:6, life:12, shape:'rect', count:1, vx:(Math.random()-0.5)*1, vy:(Math.random()-0.5)*1, gravity:0 });
  }
  update() {
    for(const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity ?? 0;
      p.vx *= 0.98;
      p.life--;
      p.alpha = p.life / p.maxLife;
      if (p.vr) p.rotation! += p.vr;
    }
    this.particles = this.particles.filter(p=>p.life>0);
  }
  draw(ctx:CanvasRenderingContext2D, camX:number) {
    for(const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x - camX, p.y);
      if (p.rotation) ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape==='circle') {
        ctx.beginPath(); ctx.arc(0,0,p.size,0,Math.PI*2); ctx.fill();
      } else if (p.shape==='spark') {
        ctx.fillRect(-p.size/2, -p.size/4, p.size*1.6, p.size/2);
      } else {
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      }
      ctx.restore();
    }
  }
}
