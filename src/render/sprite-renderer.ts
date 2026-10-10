import type { Fighter } from '../entities/fighter';

export function drawFighter(ctx:CanvasRenderingContext2D, f:Fighter, camX:number, isCPU=false) {
  const sx = f.x - camX;
  const sy = f.y;
  const facing = f.facing;
  const pal = f.def.palette;

  ctx.save();
  ctx.translate(sx, sy);

  // hurt flash
  if (f.hurtFlash>0 && f.hurtFlash%2===0) {
    ctx.globalAlpha = 0.6;
  }

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 2, f.w*0.55, 8, 0, 0, Math.PI*2);
  ctx.fill();

  // flip
  ctx.scale(facing, 1);

  // body block - procedural vector illustration
  const crouch = f.isCrouching ? 1 : 0;
  const yOff = crouch ? 18 : 0;
  const h = crouch ? f.crouchH : f.h;
  const state = f.state;

  // legs
  ctx.fillStyle = pal.secondary;
  // left leg
  drawLimb(ctx, -10, -14 + yOff, 12, 32, f.animFrame, 'leg', state, f);
  drawLimb(ctx, 8, -14 + yOff, 12, 32, f.animFrame+6, 'leg', state, f);
  // torso
  ctx.fillStyle = pal.primary;
  roundRect(ctx, -18, -72 + yOff, 36, 42, 3, true);

  // chest detail stripe
  ctx.fillStyle = pal.accent;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(-14, -58 + yOff, 28, 4);
  ctx.globalAlpha = 1;

  // shoulder pads
  ctx.fillStyle = pal.secondary;
  roundRect(ctx, -24, -68 + yOff, 14, 14, 2, true);
  roundRect(ctx, 10, -68 + yOff, 14, 14, 2, true);

  // arms - pose based on state
  const attackPhase = f.movePhase;
  const moveId = f.currentMove?.id;
  let armAngleL = 0.2, armAngleR = -0.2;
  let armExt = 0;
  if (state==='attack' && attackPhase==='active') {
    if (moveId==='light') { armExt = 22; armAngleR = -0.6; }
    else if (moveId==='heavy') { armExt = 28; armAngleR = -1.0; armAngleL = 0.6; }
    else if (moveId==='special1' || moveId==='ultimate') { armExt = 34; armAngleR = -0.2; }
  } else if (state==='hitstun') { armAngleL = 0.9; armAngleR = 0.9; }
  else if (state==='block' || state==='blockstun') { armExt = -10; armAngleL=0.7; armAngleR=0.7; }
  else {
    const bob = Math.sin(f.animFrame*0.18)*2;
    armAngleL = 0.22 + bob*0.06;
    armAngleR = -0.22 - bob*0.06;
  }
  // arms
  ctx.fillStyle = pal.skin;
  // left arm
  ctx.save();
  ctx.translate(-16, -58 + yOff);
  ctx.rotate(armAngleL);
  roundRect(ctx, -6, 0, 10, 26 + armExt*0.3, 4, true);
  // hand
  ctx.fillStyle = pal.accent;
  ctx.beginPath(); ctx.arc(0, 26 + armExt*0.3, 7, 0, Math.PI*2); ctx.fill();
  // saw detail for chainsaw
  if (f.def.id==='chainsaw') {
    ctx.fillStyle = '#D0D0D0';
    ctx.fillRect(-2, 6, 4, 22 + armExt*0.2);
    ctx.fillStyle = '#FFB020';
    for(let i=0;i<4;i++) ctx.fillRect(-6, 10+i*6, 3,3);
  }
  ctx.restore();
  // right arm
  ctx.save();
  ctx.translate(16, -58 + yOff);
  ctx.rotate(armAngleR);
  ctx.fillStyle = pal.skin;
  roundRect(ctx, -4, 0, 10, 28 + armExt*0.5, 4, true);
  ctx.fillStyle = pal.accent;
  ctx.beginPath(); ctx.arc(0, 28 + armExt*0.5, 7, 0, Math.PI*2); ctx.fill();
  if (f.def.id==='chainsaw') {
    ctx.fillStyle = '#D0D0D0';
    ctx.fillRect(-2, 6, 4, 24 + armExt*0.2);
    ctx.fillStyle = '#FFB020';
    for(let i=0;i<4;i++) ctx.fillRect(9, 10+i*6, 3,3);
  }
  if (f.def.id==='cyborg') {
    ctx.fillStyle = '#222';
    ctx.fillRect(-6, 10, 10, 14);
    ctx.fillStyle = pal.primary; // cannon glow
    ctx.globalAlpha = 0.8 + Math.sin(f.animFrame*0.5)*0.2;
    ctx.fillRect(-2, 22, 6, 6);
    ctx.globalAlpha=1;
  }
  if (f.def.id==='esper') {
    // orbiting debris
    const t = f.animFrame*0.12;
    for(let i=0;i<3;i++){
      const a = t + i*2.09;
      const ox = Math.cos(a)*18;
      const oy = Math.sin(a)*10 - 8;
      ctx.fillStyle = pal.secondary;
      ctx.beginPath(); ctx.arc(ox, oy, 4,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.restore();

  // head
  ctx.fillStyle = pal.skin;
  roundRect(ctx, -13, -92 + yOff, 26, 26, 6, true);
  // mask/helmet details per character
  ctx.fillStyle = pal.primary;
  if (f.def.id==='chainsaw') {
    // saw helmet
    ctx.fillRect(-10, -96 + yOff, 20, 8);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(-8, -86 + yOff, 16, 4); // visor
    ctx.fillStyle = '#E6393B';
    ctx.fillRect(0, -100 + yOff, 6, 18); // saw on head
  } else if (f.def.id==='bat') {
    // bat ears
    ctx.beginPath(); ctx.moveTo(-13,-92+yOff); ctx.lineTo(-18,-104+yOff); ctx.lineTo(-7,-92+yOff); ctx.fill();
    ctx.beginPath(); ctx.moveTo(13,-92+yOff); ctx.lineTo(18,-104+yOff); ctx.lineTo(7,-92+yOff); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(-8,-82+yOff,16,3);
  } else if (f.def.id==='fox') {
    ctx.fillStyle = pal.secondary;
    ctx.beginPath(); ctx.moveTo(-12,-91+yOff); ctx.lineTo(-16,-102+yOff); ctx.lineTo(-4,-91+yOff); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12,-91+yOff); ctx.lineTo(16,-102+yOff); ctx.lineTo(4,-91+yOff); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.fillRect(-7,-78+yOff,14,2);
  } else if (f.def.id==='gun') {
    ctx.fillStyle = '#0A0A0A';
    roundRect(ctx, -11,-90+yOff,22,10,2,true);
    ctx.fillStyle = 'rgba(230,57,59,0.9)';
    ctx.beginPath(); ctx.arc(6,-85+yOff,3,0,Math.PI*2); ctx.fill();
  } else if (f.def.id==='powerhouse') {
    ctx.fillStyle = '#FFD60A'; // bald with shine
    ctx.beginPath(); ctx.arc(0,-82+yOff,13,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(-4,-88+yOff,4,0,Math.PI*2); ctx.fill();
  } else if (f.def.id==='cyborg') {
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(-13,-92+yOff,26,6);
    ctx.fillStyle = '#FFB020';
    ctx.beginPath(); ctx.arc(4,-81+yOff,3.5,0,Math.PI*2); ctx.fill(); // eye glow
  } else if (f.def.id==='martial') {
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(-13,-92+yOff,26,8); // headband
    ctx.fillStyle = '#EDEBE3';
    ctx.fillRect(-6,-78+yOff,12,2);
  } else if (f.def.id==='esper') {
    ctx.fillStyle = pal.primary;
    ctx.globalAlpha=0.7;
    ctx.beginPath(); ctx.arc(0,-80+yOff,16,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle = pal.skin;
    roundRect(ctx,-11,-92+yOff,22,22,6,true);
    // hair
    ctx.fillStyle = pal.primary;
    ctx.fillRect(-14,-95+yOff,28,10);
  }

  // eyes
  ctx.fillStyle = f.hurtFlash>0 ? '#FF0000' : '#0A0A0A';
  if (f.def.id!=='cyborg' && f.def.id!=='powerhouse') {
    ctx.fillRect(-7, -80 + yOff, 5,3);
    ctx.fillRect(3, -80 + yOff, 5,3);
    if (f.hurtFlash>0) {
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-6,-79+yOff,2,1);
      ctx.fillRect(4,-79+yOff,2,1);
    }
  } else if (f.def.id==='powerhouse') {
    // simple dots
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.arc(-4,-80+yOff,1.8,0,Math.PI*2); ctx.arc(4,-80+yOff,1.8,0,Math.PI*2); ctx.fill();
  }

  // invincible flash
  if (f.invincible>0 && Math.floor(f.animFrame/2)%2===0) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -20,-92+yOff,40,78,4,true);
    ctx.globalAlpha=1;
  }

  // overheat indicator
  if (f.overheatTimer>0) {
    ctx.fillStyle = 'rgba(255,176,32,0.85)';
    ctx.fillRect(-18, -98+yOff, 36, 3);
    ctx.fillStyle = '#FFF';
    ctx.font = '700 7px JetBrains Mono';
    ctx.textAlign='center';
    ctx.fillText('OVERHEAT', 0, -100+yOff);
  }
  // heat bar for cyborg small
  if (f.def.id==='cyborg' && f.heat>0) {
    const w=36, h=3;
    ctx.fillStyle='rgba(0,0,0,0.6)';
    ctx.fillRect(-w/2, -102+yOff, w,h);
    ctx.fillStyle = f.heat>80?'#FF3B30':'#FFB020';
    ctx.fillRect(-w/2, -102+yOff, w*(f.heat/100),h);
  }

  ctx.restore();

  // nametag above
  ctx.save();
  ctx.translate(sx, sy - h - 18 + yOff);
  ctx.textAlign='center';
  ctx.font='700 10px Space Grotesk';
  ctx.fillStyle='rgba(0,0,0,0.55)';
  const tw = ctx.measureText(f.def.name).width + 12;
  roundRect(ctx, -tw/2, -10, tw, 14, 2, true);
  ctx.fillStyle = f.health < 30 ? '#FF4D4F' : '#EDEBE3';
  ctx.fillText(f.def.name, 0, 0);
  ctx.restore();

  // hitbox debug (if needed) - off by default
}

function roundRect(ctx:CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number, fill=true) {
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
  if(fill) ctx.fill();
  else ctx.stroke();
}
function drawLimb(ctx:CanvasRenderingContext2D, x:number,y:number,w:number,h:number, frame:number, type:'leg'|'arm', state:string, f:Fighter) {
  ctx.save();
  ctx.translate(x+w/2, y);
  let ang = 0;
  if (type==='leg') {
    if (state==='walk' || state==='run') ang = Math.sin(frame*0.3)*0.28;
    else if (state==='jump' || state==='fall') ang = 0.25;
    else if (state==='crouch') ang = 0.1;
  }
  ctx.rotate(ang);
  roundRect(ctx, -w/2, 0, w, h, 3, true);
  // boot
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(-w/2 -1, h-6, w+2, 8);
  ctx.restore();
}
