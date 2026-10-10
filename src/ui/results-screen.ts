import { Icons } from './components/icons';
import type { FighterDef } from '../data/characters';

export function renderResults(container: HTMLElement, opts:{
  winner: FighterDef;
  loser: FighterDef;
  score: [number,number];
  isPlayerWin: boolean;
  onMenu:()=>void;
  onRematch:()=>void;
  stats: { p1DamageDealt:number, p2DamageDealt:number, maxCombo:number }
}) {
  container.innerHTML='';
  const el=document.createElement('div');
  el.className='screen';
  el.style.cssText='display:grid; place-items:center; background: radial-gradient(700px 400px at 30% 20%, rgba(122,59,255,0.12), transparent 60%), radial-gradient(600px 300px at 85% 90%, rgba(230,57,59,0.10), transparent 60%), linear-gradient(180deg,#0B0B12,#09090E); padding:24px;';
  el.innerHTML=`
    <div style="width:min(720px,92vw); background:var(--ink-panel); border:1px solid var(--line-strong); box-shadow:var(--shadow-panel); overflow:hidden;">
      <div style="padding:18px 20px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; background: linear-gradient(180deg, rgba(255,255,255,0.04), transparent);">
        <div class="label-mini">Match Result — Best of 3</div>
        <div class="label-mini" style="color:${opts.isPlayerWin?'var(--toxic-green)':'var(--blood-glow)'}">${opts.isPlayerWin?'Victory':'Defeat'}</div>
      </div>
      <div style="padding:28px 24px; text-align:center;">
        <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:var(--bone-muted);">${opts.isPlayerWin?'You are the last one standing':'The opponent stands over you'}</div>
        <div style="margin-top:10px; font-family:var(--font-display); font-weight:900; font-size:54px; line-height:0.9; text-transform:uppercase; letter-spacing:0.02em; color:${opts.winner.palette.primary};">${opts.winner.name}</div>
        <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--bone-muted); margin-top:6px;">${opts.isPlayerWin?'WINS':'LOSER'} • ${opts.score[0]} — ${opts.score[1]}</div>
        <div style="margin:18px auto; width:100%; height:1px; background:var(--line);"></div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; text-align:left;">
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:8px;">
            <div class="label-mini">Damage Dealt</div>
            <div style="font-family:var(--font-mono); font-weight:700; font-size:18px; margin-top:4px;">${Math.round(opts.stats.p1DamageDealt)}</div>
            <div class="label-mini">vs ${Math.round(opts.stats.p2DamageDealt)} taken</div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:8px;">
            <div class="label-mini">Best Combo</div>
            <div style="font-family:var(--font-mono); font-weight:700; font-size:18px; margin-top:4px;">${opts.stats.maxCombo} hits</div>
            <div class="label-mini">max in match</div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:8px;">
            <div class="label-mini">Versus</div>
            <div style="font-weight:700; font-size:13px; margin-top:4px;">${opts.loser.name}</div>
            <div class="label-mini">${opts.loser.title}</div>
          </div>
        </div>
        <div style="margin-top:18px; display:flex; gap:10px; justify-content:center;">
          <button class="btn-primary" data-rematch style="padding:12px 22px;">Rematch</button>
          <button class="btn-ghost" data-menu>Return to Menu</button>
        </div>
        <div class="label-mini" style="margin-top:14px; opacity:0.55;">Match history is kept in this session only • Stored stats: ${JSON.parse(localStorage.getItem('duels_stats')||'{"w":0,"l":0}').w}W — ${JSON.parse(localStorage.getItem('duels_stats')||'{"w":0,"l":0}').l}L lifetime</div>
      </div>
    </div>
  `;
  container.appendChild(el);
  el.querySelector('[data-rematch]')!.addEventListener('click', opts.onRematch);
  el.querySelector('[data-menu]')!.addEventListener('click', opts.onMenu);
}
