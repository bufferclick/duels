import { Icons } from './components/icons';
import type { Difficulty } from '../data/balance-constants';
import { audio } from '../audio/audio-engine';

export type MenuAction = 'arcade'|'versus'|'training'|'settings';

export function renderMainMenu(container: HTMLElement, state: {difficulty:Difficulty, onAction:(a:MenuAction)=>void, onDifficulty:(d:Difficulty)=>void, onSettings:()=>void}) {
  container.innerHTML = '';
  const el = document.createElement('div');
  el.className='screen menu-screen';
  el.innerHTML = `
    <canvas class="menu-bg-canvas" width="1280" height="720"></canvas>
    <div class="menu-topbar">
      <div class="brand">
        <div class="brand-mark">${Icons.swords}</div>
        <div>
          <div class="brand-title">DUELS</div>
          <div class="brand-sub">Blood & Steel — Ver 1.0</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="btn-icon" data-action="settings" aria-label="Settings">${Icons.gear}</button>
      </div>
    </div>
    <div class="menu-body">
      <div class="hero-copy">
        <div class="eyebrow">Indie Fighting Game — Built from Scratch</div>
        <h1 class="title-duels"><span class="line1">BLOOD &</span><span class="line2">DUELS</span></h1>
        <p class="hero-desc"><strong>Eight fighters. Two factions. One arena.</strong> Devils and Monsters collide in a hand-crafted 2D fighter — procedural art, synthesized audio, real frame data and a CPU that actually punishes your whiffs. No engine. No asset packs. Just code.</p>
        <div class="menu-actions">
          <button class="btn-primary" data-action="arcade" style="padding:14px 26px; font-size:15px;">${Icons.play} &nbsp; Arcade — P1 vs CPU</button>
          <button class="btn-ghost" data-action="training">Training (P1 vs Dummy)</button>
        </div>
        <div class="hero-stats">
          <div class="stat"><div class="stat-val">8</div><div class="stat-label">Fighters</div></div>
          <div class="stat"><div class="stat-val">3</div><div class="stat-label">Stages</div></div>
          <div class="stat"><div class="stat-val">60</div><div class="stat-label">FPS Locked</div></div>
          <div class="stat"><div class="stat-val">∞</div><div class="stat-label">Combos</div></div>
        </div>
      </div>
      <div class="menu-card">
        <div class="card-head">
          <div class="card-title">Select Mode</div>
          <span class="label-mini">Difficulty — ${state.difficulty}</span>
        </div>
        <div class="card-body">
          <div class="mode-list">
            <button class="mode-item active" data-mode="arcade">
              <div class="mode-icon">${Icons.swords}</div>
              <div><div class="mode-name">Arcade Duel</div><div class="mode-desc">Best of 3 vs adaptive CPU — meter, parry, combos</div></div>
              <div style="color:var(--blood)">${Icons.play}</div>
            </button>
            <button class="mode-item" data-mode="training">
              <div class="mode-icon">${Icons.zap}</div>
              <div><div class="mode-name">Training Lab</div><div class="mode-desc">Dummy opponent, infinite health, practice frame data</div></div>
              <div class="label-mini">LAB</div>
            </button>
            <button class="mode-item" data-mode="settings">
              <div class="mode-icon">${Icons.gear}</div>
              <div><div class="mode-name">Settings & Audio</div><div class="mode-desc">Master / SFX / Ambience, key hints, data</div></div>
              <div class="label-mini">CFG</div>
            </button>
          </div>
          <div>
            <div class="label-mini" style="margin-bottom:8px;">CPU Difficulty</div>
            <div class="difficulty-row">
              ${(['novice','veteran','nightmare'] as Difficulty[]).map(d=>`
                <button class="diff-pill ${state.difficulty===d?'active':''}" data-diff="${d}">${d}</button>
              `).join('')}
            </div>
          </div>
          <div style="display:flex; gap:8px; margin-top:4px;">
            <button class="btn-primary" data-action="arcade" style="flex:1;">Enter Arena</button>
            <button class="btn-ghost" data-action="settings" style="flex:0 0 auto;">${Icons.gear} Settings</button>
          </div>
          <div class="label-mini" style="opacity:0.6; line-height:1.5;">
            Controls — WASD / Arrows move, J Light, K Heavy, Q Special 1, E Special 2, R Ultimate, Shift Dash, W/Up Jump. Gamepad supported.
          </div>
        </div>
      </div>
    </div>
    <div class="version-tag">Built from scratch — Canvas + Web Audio • No emojis • No stock assets</div>
  `;
  container.appendChild(el);

  // bg canvas draw
  const c = el.querySelector('.menu-bg-canvas') as HTMLCanvasElement;
  const ctx = c.getContext('2d')!;
  let raf=0;
  let t=0;
  function drawBG(){
    t++;
    ctx.clearRect(0,0,c.width,c.height);
    // grid
    ctx.strokeStyle='rgba(255,255,255,0.04)';
    ctx.lineWidth=1;
    for(let x=0;x<c.width;x+=40){ ctx.beginPath(); ctx.moveTo(x + (t*0.2)%40,0); ctx.lineTo(x + (t*0.2)%40,c.height); ctx.stroke(); }
    for(let y=0;y<c.height;y+=40){ ctx.beginPath(); ctx.moveTo(0,y + (t*0.15)%40); ctx.lineTo(c.width,y + (t*0.15)%40); ctx.stroke(); }
    // diagonal slash
    ctx.save();
    ctx.translate(c.width*0.62, c.height*0.5);
    ctx.rotate(-0.12);
    ctx.fillStyle='rgba(230,57,59,0.08)';
    ctx.fillRect(-320,-220,640,16);
    ctx.fillStyle='rgba(122,59,255,0.08)';
    ctx.fillRect(-320, -180, 640, 2);
    ctx.restore();
    // floating panels
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    for(let i=0;i<3;i++){
      const x= 860 + Math.sin(t*0.01+i)*6;
      const y= 140 + i*150 + Math.cos(t*0.008+i)*4;
      ctx.strokeRect(x,y,180,86);
      ctx.fillStyle='rgba(255,255,255,0.02)';
      ctx.fillRect(x,y,180,86);
    }
    raf=requestAnimationFrame(drawBG);
  }
  drawBG();

  el.querySelectorAll('[data-action]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const a=(b as HTMLElement).dataset.action as MenuAction;
      audio.sfxMenuConfirm();
      // cleanup raf before leaving
      cancelAnimationFrame(raf);
      state.onAction(a);
    });
    b.addEventListener('mouseenter', ()=> audio.sfxMenuMove());
  });
  el.querySelectorAll('[data-diff]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const d=(b as HTMLElement).dataset.diff as Difficulty;
      audio.sfxMenuMove();
      state.onDifficulty(d);
      // re-render pills
      el.querySelectorAll('.diff-pill').forEach(p=> p.classList.toggle('active', (p as HTMLElement).dataset.diff===d));
    });
  });
  el.querySelectorAll('[data-mode]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const m=(b as HTMLElement).dataset.mode;
      audio.sfxMenuMove();
      if(m==='arcade') { cancelAnimationFrame(raf); state.onAction('arcade'); }
      if(m==='training') { cancelAnimationFrame(raf); state.onAction('training'); }
      if(m==='settings') { state.onSettings(); }
    });
  });
  // settings button in topbar
  const settingsBtn = el.querySelector('[data-action="settings"]');
  // already handled
  return ()=> cancelAnimationFrame(raf);
}
