import type { Fighter } from '../entities/fighter';
import { Icons } from './components/icons';

export function renderHUD(root: HTMLElement, p1: Fighter, p2: Fighter, timer: number, roundWins: [number,number], comboText: string) {
  // this is called each frame to update existing HUD DOM; we diff by ids
  let hud = root.querySelector('.hud-root') as HTMLElement;
  if (!hud) {
    hud=document.createElement('div');
    hud.className='hud-root';
    hud.innerHTML=`
      <div class="hud-top">
        <div class="hud-player left">
          <div class="hud-name-row">
            <div class="hud-faction-icon" data-p1-icon></div>
            <div>
              <div class="hud-name" data-p1-name></div>
              <div class="hud-subtitle" data-p1-title></div>
            </div>
          </div>
          <div class="health-wrap"><div class="health-track"><div class="health-ghost"></div><div class="health-fill" data-p1-hp></div></div></div>
          <div class="meter-wrap"><div class="meter-fill" data-p1-meter></div></div>
        </div>
        <div class="hud-center">
          <div class="timer-box"><div class="timer-value" data-timer>99</div></div>
          <div class="round-pips" data-p1-pips></div>
          <div class="label-mini" style="opacity:0.7;">Round</div>
          <div class="round-pips" data-p2-pips></div>
        </div>
        <div class="hud-player right">
          <div class="hud-name-row">
            <div class="hud-faction-icon" data-p2-icon></div>
            <div style="text-align:right;">
              <div class="hud-name" data-p2-name></div>
              <div class="hud-subtitle" data-p2-title></div>
            </div>
          </div>
          <div class="health-wrap"><div class="health-track"><div class="health-ghost right"></div><div class="health-fill right" data-p2-hp></div></div></div>
          <div class="meter-wrap"><div class="meter-fill" data-p2-meter></div></div>
        </div>
      </div>
      <div class="controls-hint">
        <kbd>J</kbd> Light <kbd>K</kbd> Heavy <kbd>Q</kbd> Sp1 <kbd>E</kbd> Sp2 <kbd>R</kbd> Ultimate <kbd>Shift</kbd> Dash <kbd>W</kbd> Jump <span style="opacity:0.6; margin-left:8px;">— Hold <kbd>S</kbd> / Back to Block • <kbd>ESC</kbd> Pause</span>
      </div>
      <div class="combo-indicator left" data-combo-left></div>
      <div class="combo-indicator right" data-combo-right></div>
    `;
    root.appendChild(hud);
  }
  const set = (sel:string, html:string)=> { const e=hud.querySelector(sel) as HTMLElement; if(e) e.innerHTML=html; };
  const setText=(sel:string, txt:string)=>{ const e=hud.querySelector(sel) as HTMLElement; if(e) e.textContent=txt; };

  // icons: simple SVG faction
  const fIcon = (faction:string, color:string)=> faction==='devils'
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7"><path d="M12 3l3 6 6 1-4.5 4 1 6L12 17l-5.5 3 1-6L3 10l6-1z"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M8 14c0 2 1.8 4 4 4s4-2 4-4"/><path d="M6 12l-2 4"/><path d="M18 12l2 4"/></svg>`;

  set('[data-p1-icon]', fIcon(p1.def.faction, p1.def.palette.primary));
  set('[data-p2-icon]', fIcon(p2.def.faction, p2.def.palette.primary));
  setText('[data-p1-name]', p1.def.name);
  setText('[data-p2-name]', p2.def.name);
  setText('[data-p1-title]', p1.def.title);
  setText('[data-p2-title]', p2.def.title);

  // health
  const p1hpEl = hud.querySelector('[data-p1-hp]') as HTMLElement;
  const p2hpEl = hud.querySelector('[data-p2-hp]') as HTMLElement;
  const p1ghost = hud.querySelector('.health-ghost:not(.right)') as HTMLElement;
  const p2ghost = hud.querySelector('.health-ghost.right') as HTMLElement;
  if(p1hpEl){
    p1hpEl.style.background = p1.def.palette.primary;
    p1hpEl.style.transform = `scaleX(${Math.max(0,p1.health/p1.maxHealth)})`;
  }
  if(p2hpEl){
    p2hpEl.style.background = p2.def.palette.primary;
    p2hpEl.style.transform = `scaleX(${Math.max(0,p2.health/p2.maxHealth)})`;
  }
  if(p1ghost) p1ghost.style.transform = `scaleX(${Math.max(0,p1.healthGhost/p1.maxHealth)})`;
  if(p2ghost) p2ghost.style.transform = `scaleX(${Math.max(0,p2.healthGhost/p2.maxHealth)})`;

  const p1m = hud.querySelector('[data-p1-meter]') as HTMLElement;
  const p2m = hud.querySelector('[data-p2-meter]') as HTMLElement;
  if(p1m){ p1m.style.width = (p1.getMeterRatio()*100)+'%'; p1m.style.background = p1.meter.canSpend(100) ? p1.def.palette.accent : 'var(--bone-dim)'; p1m.style.boxShadow = p1.meter.canSpend(100) ? `0 0 10px ${p1.def.palette.primary}`: 'none'; }
  if(p2m){ p2m.style.width = (p2.getMeterRatio()*100)+'%'; p2m.style.background = p2.meter.canSpend(100) ? p2.def.palette.accent : 'var(--bone-dim)'; p2m.style.boxShadow = p2.meter.canSpend(100) ? `0 0 10px ${p2.def.palette.primary}`: 'none'; }

  setText('[data-timer]', String(Math.ceil(timer)));
  // pips
  const p1pips = hud.querySelector('[data-p1-pips]') as HTMLElement;
  const p2pips = hud.querySelector('[data-p2-pips]') as HTMLElement;
  if(p1pips) p1pips.innerHTML = [0,1].map(i=> `<div class="pip ${roundWins[0]>i?'won':''}"></div>`).join('');
  if(p2pips) p2pips.innerHTML = [0,1].map(i=> `<div class="pip ${roundWins[1]>i?'won':''}"></div>`).join('');

  const comboLeft = hud.querySelector('[data-combo-left]') as HTMLElement;
  const comboRight = hud.querySelector('[data-combo-right]') as HTMLElement;
  if(comboLeft) comboLeft.textContent = comboText && p1.combo.hits>1 ? `${p1.combo.hits} HIT • ${Math.round(p1.combo.damage)} DMG` : '';
  if(comboRight) comboRight.textContent = comboText && p2.combo.hits>1 ? `${p2.combo.hits} HIT • ${Math.round(p2.combo.damage)} DMG` : '';

  // low health pulse on timer
  const timerEl = hud.querySelector('.timer-box') as HTMLElement;
  if(timerEl){
    if(timer<12) { timerEl.style.borderColor='var(--blood)'; timerEl.style.boxShadow='0 0 16px rgba(230,57,59,0.5)'; }
    else { timerEl.style.borderColor='var(--line-strong)'; timerEl.style.boxShadow='var(--shadow-panel)'; }
  }
}
