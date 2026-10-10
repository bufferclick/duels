import { FIGHTERS, FighterDef } from '../data/characters';
import { Icons } from './components/icons';
import { audio } from '../audio/audio-engine';

function fighterPreviewCanvas(def: FighterDef, selected: boolean): HTMLCanvasElement {
  const c=document.createElement('canvas'); c.width=200; c.height=180; c.className='portrait-canvas';
  const ctx=c.getContext('2d')!;
  // bg gradient
  const g=ctx.createLinearGradient(0,0,0,180);
  g.addColorStop(0, def.palette.secondary+'22');
  g.addColorStop(1, '#0A0A0E');
  ctx.fillStyle=g; ctx.fillRect(0,0,200,180);
  // grid
  ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1;
  for(let x=0;x<200;x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,180); ctx.stroke(); }
  // silhouette body - matching fighter renderer but simplified
  ctx.save(); ctx.translate(100,130);
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0,18,36,7,0,0,Math.PI*2); ctx.fill();
  // legs
  ctx.fillStyle=def.palette.secondary;
  ctx.fillRect(-14,-22,10,28); ctx.fillRect(4,-22,10,28);
  ctx.fillStyle='#0A0A0A'; ctx.fillRect(-15,6,12,6); ctx.fillRect(3,6,12,6);
  // torso
  ctx.fillStyle=def.palette.primary;
  ctx.beginPath(); ctx.roundRect(-18,-58,36,38,4); ctx.fill();
  ctx.fillStyle=def.palette.accent; ctx.fillRect(-12,-44,24,3);
  // arms
  ctx.fillStyle=def.palette.skin;
  ctx.beginPath(); ctx.roundRect(-26,-54,10,30,4); ctx.fill();
  ctx.beginPath(); ctx.roundRect(16,-54,10,30,4); ctx.fill();
  ctx.fillStyle=def.palette.accent;
  ctx.beginPath(); ctx.arc(-21, -22,6,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(21,-22,6,0,Math.PI*2); ctx.fill();
  // saw detail
  if(def.id==='chainsaw'){ ctx.fillStyle='#DDD'; ctx.fillRect(-23,-48,4,18); ctx.fillRect(19,-48,4,18); }
  if(def.id==='cyborg'){ ctx.fillStyle='#222'; ctx.fillRect(16,-46,10,12); ctx.fillStyle='#FFB020'; ctx.fillRect(18,-32,6,4); }
  // head
  ctx.fillStyle=def.palette.skin;
  ctx.beginPath(); ctx.roundRect(-11,-78,22,22,6); ctx.fill();
  ctx.fillStyle=def.palette.primary;
  if(def.id==='chainsaw'){ ctx.fillRect(-9,-81,18,7); ctx.fillStyle='#1A1A1A'; ctx.fillRect(-7,-72,14,3); }
  if(def.id==='powerhouse'){ ctx.fillStyle='#FFD60A'; ctx.beginPath(); ctx.arc(0,-68,11,0,Math.PI*2); ctx.fill(); }
  if(def.id==='bat'){ ctx.beginPath(); ctx.moveTo(-11,-78); ctx.lineTo(-16,-89); ctx.lineTo(-5,-78); ctx.fill(); ctx.beginPath(); ctx.moveTo(11,-78); ctx.lineTo(16,-89); ctx.lineTo(5,-78); ctx.fill(); }
  ctx.fillStyle='#0A0A0A'; ctx.fillRect(-6,-66,4,2); ctx.fillRect(2,-66,4,2);
  ctx.restore();
  if(selected){
    ctx.strokeStyle=def.palette.primary; ctx.lineWidth=2; ctx.strokeRect(1,1,198,178);
  }
  return c;
}

export function renderCharacterSelect(container: HTMLElement, opts:{
  onConfirm:(playerId:string, cpuId:string)=>void,
  onBack:()=>void
}) {
  let playerPick = FIGHTERS[0].id;
  let cpuPick = FIGHTERS[4].id;

  container.innerHTML='';
  const el=document.createElement('div');
  el.className='screen cs-screen';
  el.innerHTML=`
    <div class="cs-header">
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="btn-icon" data-back>${Icons.back}</button>
        <div>
          <div class="cs-title">Choose <em>Fighter</em></div>
          <div class="label-mini">8 fighters — Devils vs Monsters • Use click to select</div>
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <div class="label-mini">P1 vs CPU</div>
        <button class="btn-primary" data-confirm>${Icons.check} Lock In</button>
      </div>
    </div>
    <div class="cs-body">
      <div>
        <div class="label-mini" style="margin-bottom:8px;">Roster — Click P1 card, then CPU card (hold Shift to set CPU)</div>
        <div class="roster-grid" data-grid></div>
        <div style="margin-top:12px; display:flex; gap:10px;">
          <button class="btn-ghost" data-random>Random Both</button>
          <button class="btn-ghost" data-confirm2>Confirm & Continue</button>
        </div>
      </div>
      <div class="detail-panel">
        <div class="detail-preview"><canvas class="detail-canvas" width="360" height="260"></canvas></div>
        <div class="detail-info" data-detail></div>
      </div>
    </div>
  `;
  container.appendChild(el);
  const grid = el.querySelector('[data-grid]') as HTMLElement;
  const detailInfo = el.querySelector('[data-detail]') as HTMLElement;
  const detailCanvas = el.querySelector('.detail-canvas') as HTMLCanvasElement;
  const dctx = detailCanvas.getContext('2d')!;

  function renderGrid(){
    grid.innerHTML='';
    FIGHTERS.forEach(f=>{
      const card=document.createElement('button');
      card.className='fighter-card';
      if(f.id===playerPick) card.classList.add('selected');
      if(f.id===cpuPick) card.classList.add('cpu-pick');
      const badgeClass = f.faction==='devils'?'devils':'monsters';
      const portrait = fighterPreviewCanvas(f, f.id===playerPick);
      card.innerHTML=`
        <div class="fighter-portrait"></div>
        <div class="faction-badge ${badgeClass}">${f.faction==='devils'?'Devil':'Monster'}</div>
        <div class="fighter-meta">
          <div class="fighter-name">${f.name}</div>
          <div class="fighter-archetype">${f.title}</div>
        </div>
      `;
      card.querySelector('.fighter-portrait')!.appendChild(portrait);
      card.addEventListener('click', (e)=>{
        const shift=(e as MouseEvent).shiftKey;
        if(shift){
          cpuPick=f.id; audio.sfxMenuMove();
        } else {
          playerPick=f.id; audio.sfxMenuMove();
          if(f.id===cpuPick){
            // auto pick different cpu
            const others=FIGHTERS.filter(x=>x.id!==f.id);
            cpuPick=others[Math.floor(Math.random()*others.length)].id;
          }
        }
        renderGrid();
        renderDetail();
      });
      card.addEventListener('mouseenter', ()=> {
        // preview hover does not change selection, but could update detail on hover? keep detail on selection
      });
      grid.appendChild(card);
    });
  }

  function renderDetail(){
    const f=FIGHTERS.find(x=>x.id===playerPick)!;
    const cpu=FIGHTERS.find(x=>x.id===cpuPick)!;
    // canvas
    dctx.clearRect(0,0,detailCanvas.width,detailCanvas.height);
    const g=dctx.createLinearGradient(0,0,0,260);
    g.addColorStop(0, f.palette.secondary+'28');
    g.addColorStop(1, '#09090E');
    dctx.fillStyle=g; dctx.fillRect(0,0,360,260);
    // grid
    dctx.strokeStyle='rgba(255,255,255,0.05)';
    for(let x=0;x<360;x+=24){ dctx.beginPath(); dctx.moveTo(x,0); dctx.lineTo(x,260); dctx.stroke(); }
    // draw larger fighter
    dctx.save(); dctx.translate(180,190);
    dctx.scale(1.6,1.6);
    // reused simplified draw
    dctx.fillStyle='rgba(0,0,0,0.35)'; dctx.beginPath(); dctx.ellipse(0,6,26,6,0,0,Math.PI*2); dctx.fill();
    dctx.fillStyle=f.palette.secondary; dctx.fillRect(-10,-16,8,20); dctx.fillRect(2,-16,8,20);
    dctx.fillStyle='#0A0A0A'; dctx.fillRect(-10,4,10,5); dctx.fillRect(2,4,10,5);
    dctx.fillStyle=f.palette.primary; dctx.beginPath(); (dctx as any).roundRect(-14,-42,28,28,4); dctx.fill();
    dctx.fillStyle=f.palette.accent; dctx.fillRect(-9,-32,18,3);
    dctx.fillStyle=f.palette.skin; dctx.beginPath(); (dctx as any).roundRect(-18,-40,8,22,3); dctx.fill(); dctx.beginPath(); (dctx as any).roundRect(10,-40,8,22,3); dctx.fill();
    dctx.fillStyle=f.palette.secondary; dctx.beginPath(); dctx.arc(-14,-16,5,0,Math.PI*2); dctx.fill(); dctx.beginPath(); dctx.arc(14,-16,5,0,Math.PI*2); dctx.fill();
    dctx.fillStyle=f.palette.skin; dctx.beginPath(); (dctx as any).roundRect(-9,-58,18,18,5); dctx.fill();
    if(f.id==='chainsaw'){ dctx.fillStyle='#DDD'; dctx.fillRect(-16,-36,3,14); dctx.fillRect(13,-36,3,14); }
    dctx.fillStyle='#0A0A0A'; dctx.fillRect(-5,-49,3,2); dctx.fillRect(2,-49,3,2);
    dctx.restore();
    // faction orb
    dctx.fillStyle=f.palette.primary; dctx.globalAlpha=0.14; dctx.beginPath(); dctx.arc(70,50,56,0,Math.PI*2); dctx.fill(); dctx.globalAlpha=1;
    dctx.fillStyle='rgba(255,255,255,0.06)'; dctx.fillRect(12,12,64,2);
    dctx.fillStyle=f.palette.primary; dctx.fillRect(12,12, 32,2);

    detailInfo.innerHTML=`
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
        <div>
          <div class="detail-name" style="color:${f.palette.primary}">${f.name}</div>
          <div class="label-mini" style="color:${f.palette.primary}; opacity:0.8;">${f.title} • ${f.faction.toUpperCase()}</div>
        </div>
        <div class="faction-badge ${f.faction==='devils'?'devils':'monsters'}" style="position:static;">${f.faction}</div>
      </div>
      <div class="detail-lore">${f.lore}</div>
      <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); padding:10px; border-radius:8px;">
        <div class="label-mini" style="margin-bottom:6px;">Passive Ability</div>
        <div style="font-size:12px; line-height:1.5;">${f.ability}</div>
      </div>
      <div class="stat-bars">
        ${Object.entries(f.stats).map(([k,v])=>`
          <div class="stat-row">
            <div class="stat-label-sm">${k}</div>
            <div class="stat-track"><div class="stat-fill" style="width:${v*10}%; background:${f.palette.primary}"></div></div>
            <div class="label-mini" style="color:${f.palette.primary}">${v}/10</div>
          </div>
        `).join('')}
      </div>
      <div class="label-mini">Moveset</div>
      <div class="moves-list">
        ${Object.values(f.moves).map(m=>`
          <div class="move-row">
            <div><div class="move-name">${m.name}</div><div style="font-size:10px; color:var(--bone-muted);">${m.description}</div></div>
            <div class="move-input">${m.input}</div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:6px; padding:10px; background:rgba(122,59,255,0.08); border:1px solid rgba(122,59,255,0.2); border-radius:8px;">
        <div class="label-mini">CPU Opponent</div>
        <div style="display:flex; align-items:center; gap:10px; margin-top:6px;">
          <div style="width:36px; height:36px; background:${cpu.palette.primary}; display:grid; place-items:center; color:white; font-family:var(--font-display); font-weight:800;">${cpu.name.slice(0,2)}</div>
          <div><div style="font-weight:700; font-size:13px;">${cpu.name}</div><div class="label-mini">${cpu.title}</div></div>
          <div style="margin-left:auto;" class="label-mini">Shift+Click card to change CPU</div>
        </div>
      </div>
    `;
  }

  renderGrid(); renderDetail();

  el.querySelector('[data-back]')!.addEventListener('click', ()=>{ audio.sfxMenuBack(); opts.onBack(); });
  const confirm = ()=>{
    const p=FIGHTERS.find(x=>x.id===playerPick)!;
    const c=FIGHTERS.find(x=>x.id===cpuPick)!;
    if(p.id===c.id){ audio.sfxMenuError(); return; }
    audio.sfxMenuConfirm(); opts.onConfirm(playerPick,cpuPick);
  };
  el.querySelector('[data-confirm]')!.addEventListener('click', confirm);
  el.querySelector('[data-confirm2]')!.addEventListener('click', confirm);
  el.querySelector('[data-random]')!.addEventListener('click', ()=>{
    playerPick=FIGHTERS[Math.floor(Math.random()*FIGHTERS.length)].id;
    let others=FIGHTERS.filter(x=>x.id!==playerPick);
    cpuPick=others[Math.floor(Math.random()*others.length)].id;
    audio.sfxMenuMove(); renderGrid(); renderDetail();
  });
}
