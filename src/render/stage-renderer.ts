import type { StageDef } from '../data/stages';

export class StageRenderer {
  def: StageDef;
  time = 0;
  constructor(def: StageDef) { this.def = def; }
  setStage(def: StageDef) { this.def = def; this.time=0; }
  update() { this.time++; }

  draw(ctx: CanvasRenderingContext2D, camX:number, W:number, H:number) {
    const t=this.time;
    // sky gradient
    const grad = ctx.createLinearGradient(0,0,0,H*0.66);
    grad.addColorStop(0, this.def.palette.skyTop);
    grad.addColorStop(1, this.def.palette.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H*0.66);

    // parallax city/buildings
    ctx.save();
    ctx.translate(-camX*0.15,0);
    if (this.def.id==='rooftop') {
      // stars
      ctx.fillStyle='rgba(255,255,255,0.6)';
      for(let i=0;i<70;i++){
        const x = (i*137)%W + ((camX*0.02)%50);
        const y = (i*47)% (H*0.4);
        ctx.globalAlpha = 0.3 + Math.sin(t*0.03 + i)*0.3;
        ctx.fillRect(x,y,1.5,1.5);
      }
      ctx.globalAlpha=1;
      // skyline silhouette
      ctx.fillStyle='#0D0D14';
      for(let i=0;i<12;i++){
        const x = i*160 - 80;
        const h = 80 + (i%3)*40;
        ctx.fillRect(x, H*0.66 - h, 120, h);
        // windows
        ctx.fillStyle='rgba(255,46,99,0.35)';
        for(let wy=0; wy<4; wy++) for(let wx=0; wx<3; wx++){
          if ((i+wy+wx)%2) ctx.fillRect(x+18+wx*32, H*0.66 - h + 14 + wy*18, 14,8);
        }
        ctx.fillStyle='#0D0D14';
      }
      // neon sign flicker
      ctx.fillStyle = t%70<4 ? 'rgba(255,46,99,0.9)' : 'rgba(255,46,99,0.45)';
      ctx.fillRect(W*0.62, H*0.66-110, 86, 14);
      ctx.fillStyle='#0A0A0A';
      ctx.font='700 9px JetBrains Mono';
      ctx.fillText('NOCTURNE', W*0.62+10, H*0.66-100);

      // rain
      ctx.strokeStyle='rgba(180,200,255,0.28)';
      ctx.lineWidth=1;
      for(let i=0;i<110;i++){
        const x = (i*91 + t*5)%W;
        const y = (i*53 + t*9)% (H*0.66);
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-4,y+10); ctx.stroke();
      }
    } else if (this.def.id==='warehouse') {
      // hazy sky
      ctx.fillStyle='rgba(255,176,32,0.08)';
      ctx.beginPath(); ctx.ellipse(W*0.5, H*0.32, 360, 60,0,0,Math.PI*2); ctx.fill();
      // factory silhouettes
      ctx.fillStyle='#120F0A';
      for(let i=0;i<10;i++){
        const x=i*180-60;
        const h=70 + (i%2?30:10);
        ctx.fillRect(x, H*0.66 - h, 140, h);
        // crane
        if(i%3===0){ ctx.fillRect(x+40, H*0.66 - h -28, 6,28); ctx.fillRect(x+10, H*0.66 - h -28, 70,4); }
      }
      // flickering light
      if (t%90 < 46) {
        ctx.fillStyle='rgba(255,220,120,0.12)';
        ctx.fillRect(W*0.35,0,160,H*0.66);
      }
      // dust motes
      ctx.fillStyle='rgba(255,255,255,0.18)';
      for(let i=0;i<24;i++){
        const x = (i*113 + t*0.6)%W;
        const y = 40 + (i*29)%(H*0.3);
        ctx.globalAlpha=0.22;
        ctx.beginPath(); ctx.arc(x,y,1.1,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
    } else if (this.def.id==='desert') {
      // sun
      ctx.fillStyle='#FFD60A';
      ctx.beginPath(); ctx.arc(W*0.78, H*0.22, 44,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,214,10,0.14)';
      ctx.beginPath(); ctx.arc(W*0.78, H*0.22, 92,0,Math.PI*2); ctx.fill();
      // dunes silhouette far
      ctx.fillStyle='#2A0F0A';
      ctx.beginPath();
      ctx.moveTo(-100,H*0.66);
      ctx.bezierCurveTo(W*0.2,H*0.52,W*0.5,H*0.58,W+100,H*0.62);
      ctx.lineTo(W+100,H*0.66); ctx.lineTo(-100,H*0.66); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#3D1A0A';
      ctx.beginPath();
      ctx.moveTo(-100,H*0.66);
      ctx.bezierCurveTo(W*0.35,H*0.6,W*0.65,H*0.64,W+100,H*0.60);
      ctx.lineTo(W+100,H*0.66); ctx.closePath(); ctx.fill();
      // cracks glowing
      ctx.strokeStyle='rgba(255,160,40,0.18)'; ctx.lineWidth=1.2;
      for(let i=0;i<6;i++){
        const x = 80 + i*200 + Math.sin(t*0.008 + i)*10;
        ctx.beginPath(); ctx.moveTo(x, H*0.62); ctx.lineTo(x+18, H*0.58); ctx.lineTo(x+34, H*0.61); ctx.stroke();
      }
      // drifting dust
      ctx.strokeStyle='rgba(255,200,120,0.14)'; ctx.lineWidth=1;
      for(let i=0;i<18;i++){
        const x = (i*143 + t*1.2)%W;
        const y = H*0.42 + (i*31)%120;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+18,y); ctx.stroke();
      }
    }
    ctx.restore();

    // ground
    const groundTop = H*0.66;
    // base ground
    ctx.fillStyle = this.def.palette.ground;
    ctx.fillRect(0, groundTop, W, H-groundTop);
    // ground texture
    ctx.fillStyle='rgba(255,255,255,0.04)';
    for(let i=0;i<W;i+=28){
      const x = (i - (camX*0.4)%28);
      ctx.fillRect(x, groundTop+16, 16,2);
    }
    // ground highlight edge
    const edgeGrad = ctx.createLinearGradient(0,groundTop,0,groundTop+10);
    edgeGrad.addColorStop(0, this.def.palette.accent + '44');
    edgeGrad.addColorStop(1,'transparent');
    ctx.fillStyle=edgeGrad;
    ctx.fillRect(0,groundTop,W,10);

    // side walls vignette
    const vig = ctx.createLinearGradient(0,0,W,0);
    vig.addColorStop(0,'rgba(0,0,0,0.35)');
    vig.addColorStop(0.08,'transparent');
    vig.addColorStop(0.92,'transparent');
    vig.addColorStop(1,'rgba(0,0,0,0.35)');
    ctx.fillStyle=vig;
    ctx.fillRect(0,0,W,H);
  }
}
