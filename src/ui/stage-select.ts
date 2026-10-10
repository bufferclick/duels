import { STAGES, StageDef } from '../data/stages';
import { Icons } from './components/icons';
import { audio } from '../audio/audio-engine';

export function renderStageSelect(container: HTMLElement, opts:{
  onPick:(id:string)=>void, onBack:()=>void
}) {
  container.innerHTML='';
  const el=document.createElement('div');
  el.className='screen';
  el.style.background='linear-gradient(180deg,#0B0B12,#09090E)';
  el.innerHTML=`
    <div class="cs-header">
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="btn-icon" data-back>${Icons.back}</button>
        <div><div class="cs-title">Select <em>Stage</em></div><div class="label-mini">Three hand-drawn arenas — each with ambient audio</div></div>
      </div>
    </div>
    <div style="flex:1; display:grid; grid-template-columns: repeat(3,1fr); gap:16px; padding:18px 24px; max-width:1280px; width:100%; margin:0 auto;">
      ${STAGES.map(s=>`
        <button class="stage-card" data-stage="${s.id}" style="text-align:left; position:relative; overflow:hidden; background:${s.palette.ground}; border:1px solid rgba(255,255,255,0.08); cursor:pointer; display:flex; flex-direction:column; min-height:360px;">
          <div style="height:200px; position:relative; overflow:hidden; background: linear-gradient(180deg, ${s.palette.skyTop}, ${s.palette.skyBottom});">
            <div style="position:absolute; inset:0; opacity:0.9; background:
              radial-gradient(220px 90px at 70% 30%, ${s.palette.accent}22, transparent 70%),
              linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.35) 100%);
            "></div>
            <div style="position:absolute; left:14px; top:14px; font-family:var(--font-mono); font-size:9px; letter-spacing:0.14em; text-transform:uppercase; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.12); padding:4px 8px; color:${s.palette.accent};">${s.id}</div>
            <div style="position:absolute; bottom:14px; left:14px; right:14px;">
              <div style="font-family:var(--font-display); font-weight:900; font-size:22px; letter-spacing:0.04em; text-transform:uppercase; color:white; line-height:1;">${s.name}</div>
              <div style="font-family:var(--font-mono); font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.7);">${s.subtitle}</div>
            </div>
            <!-- mini parallax preview -->
            <div style="position:absolute; bottom:0; left:0; right:0; height:36px; background:${s.palette.ground}; opacity:0.9;"></div>
          </div>
          <div style="padding:14px; flex:1; background:rgba(20,20,28,0.85); display:flex; flex-direction:column; gap:8px;">
            <div class="label-mini">Ambient Bed</div>
            <div style="font-size:12px; color:var(--bone-muted); line-height:1.5;">${s.ambient}</div>
            <div style="margin-top:auto; display:flex; gap:8px; align-items:center;">
              <span style="width:10px; height:10px; background:${s.palette.accent}; display:inline-block; transform:rotate(45deg);"></span>
              <span class="label-mini" style="color:${s.palette.accent};">${s.palette.accent}</span>
              <span style="margin-left:auto; font-family:var(--font-display); font-weight:800; font-size:12px; letter-spacing:0.06em; text-transform:uppercase; color:var(--bone);">Fight Here —></span>
            </div>
          </div>
        </button>
      `).join('')}
    </div>
  `;
  container.appendChild(el);
  // add hover canvas effect? simple
  el.querySelectorAll('[data-stage]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id=(btn as HTMLElement).dataset.stage!;
      audio.sfxMenuConfirm();
      opts.onPick(id);
    });
    btn.addEventListener('mouseenter', ()=> audio.sfxMenuMove());
  });
  el.querySelector('[data-back]')!.addEventListener('click', ()=>{ audio.sfxMenuBack(); opts.onBack(); });
}
