import { Icons } from './components/icons';
import { audio } from '../audio/audio-engine';

export function renderSettings(root: HTMLElement, onClose:()=>void) {
  audio.init(); audio.loadPersisted();
  const overlay=document.createElement('div');
  overlay.style.cssText='position:absolute; inset:0; background:rgba(9,9,14,0.72); backdrop-filter:blur(12px); display:grid; place-items:center; z-index:22;';
  overlay.innerHTML=`
    <div style="width:520px; max-width:92vw; background:var(--ink-panel); border:1px solid var(--line-strong); box-shadow:var(--shadow-panel); overflow:hidden;">
      <div style="padding:16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line);">
        <div style="display:flex; gap:10px; align-items:center;">
          <div style="width:28px; height:28px; display:grid; place-items:center; background:var(--ink-surface); border:1px solid var(--line);">${Icons.gear}</div>
          <div class="display" style="font-weight:800; letter-spacing:0.06em;">Settings</div>
        </div>
        <button class="btn-icon" data-close>${Icons.close}</button>
      </div>
      <div style="padding:18px; display:flex; flex-direction:column; gap:18px;">
        ${(['master','sfx','music'] as const).map(cat=>`
          <div style="display:grid; grid-template-columns:120px 1fr 46px; gap:12px; align-items:center;">
            <div class="label-mini" style="color:var(--bone);">${cat.toUpperCase()}</div>
            <input type="range" min="0" max="1" step="0.01" value="${(audio.volumes as any)[cat]}" data-vol="${cat}">
            <div class="mono" style="font-size:11px; color:var(--bone-muted);" data-val="${cat}">${Math.round((audio.volumes as any)[cat]*100)}%</div>
          </div>
        `).join('')}
        <div style="height:1px; background:var(--line);"></div>
        <div>
          <div class="label-mini" style="margin-bottom:8px;">Controls</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12px; line-height:1.6; color:var(--bone-muted); background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:8px;">
            <div><strong style="color:var(--bone);">Move</strong> — A/D or Left/Right</div>
            <div><strong style="color:var(--bone);">Jump</strong> — W / Up</div>
            <div><strong style="color:var(--bone);">Crouch/Block</strong> — S / Down or Hold Back</div>
            <div><strong style="color:var(--bone);">Dash</strong> — Shift / Space</div>
            <div><strong style="color:var(--bone);">Light</strong> — J / Z</div>
            <div><strong style="color:var(--bone);">Heavy</strong> — K / X</div>
            <div><strong style="color:var(--bone);">Special 1</strong> — Q</div>
            <div><strong style="color:var(--bone);">Special 2</strong> — E</div>
            <div><strong style="color:var(--bone);">Ultimate</strong> — R (needs 100 meter)</div>
            <div><strong style="color:var(--bone);">Pause</strong> — ESC</div>
            <div><strong style="color:var(--bone);">Parry</strong> — Tap Block at impact</div>
            <div><strong style="color:var(--bone);">Throw</strong> — Close + Heavy near</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-primary" data-close2 style="flex:1;">Done</button>
          <button class="btn-ghost" data-test>Test SFX</button>
        </div>
        <div class="label-mini" style="opacity:0.6; text-align:center;">Audio engine — Web Audio oscillators + filtered noise • Settings saved to localStorage</div>
      </div>
    </div>
  `;
  root.appendChild(overlay);
  overlay.querySelectorAll('input[data-vol]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      const cat=(inp as HTMLInputElement).dataset.vol as 'master'|'sfx'|'music';
      const v=parseFloat((inp as HTMLInputElement).value);
      audio.setVolume(cat, v);
      const lab=overlay.querySelector(`[data-val="${cat}"]`) as HTMLElement;
      if(lab) lab.textContent=Math.round(v*100)+'%';
    });
  });
  const close=()=>{ overlay.remove(); onClose(); audio.sfxMenuBack(); };
  overlay.querySelector('[data-close]')!.addEventListener('click', close);
  overlay.querySelector('[data-close2]')!.addEventListener('click', close);
  overlay.querySelector('[data-test]')!.addEventListener('click', ()=>{ audio.sfxHeavyHit(); setTimeout(()=> audio.sfxUltimateTrigger(), 260); });
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
  return ()=> overlay.remove();
}
