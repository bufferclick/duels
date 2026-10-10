import { Icons } from './components/icons';
import { audio } from '../audio/audio-engine';

export function renderPause(root: HTMLElement, opts:{ onResume:()=>void, onRestart:()=>void, onMenu:()=>void, onSettings:()=>void }) {
  const overlay=document.createElement('div');
  overlay.style.cssText='position:absolute; inset:0; background:rgba(9,9,14,0.72); backdrop-filter:blur(10px); display:grid; place-items:center; z-index:20;';
  overlay.innerHTML=`
    <div style="width:420px; background:var(--ink-panel); border:1px solid var(--line-strong); box-shadow:var(--shadow-panel); overflow:hidden;">
      <div style="padding:16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line);">
        <div class="display" style="font-weight:900; letter-spacing:0.08em;">Paused</div>
        <button class="btn-icon" data-close>${Icons.close}</button>
      </div>
      <div style="padding:16px; display:flex; flex-direction:column; gap:10px;">
        <button class="btn-primary" data-resume style="width:100%; justify-content:center; display:flex; gap:8px; align-items:center;">${Icons.play} Resume</button>
        <button class="btn-ghost" data-restart style="width:100%;">Restart Round</button>
        <button class="btn-ghost" data-settings style="width:100%;">${Icons.gear} Settings</button>
        <button class="btn-ghost" data-menu style="width:100%; color:var(--blood-glow); border-color:rgba(230,57,59,0.3);">Quit to Menu</button>
      </div>
    </div>
  `;
  root.appendChild(overlay);
  overlay.querySelector('[data-resume]')!.addEventListener('click', ()=>{ audio.sfxMenuConfirm(); opts.onResume(); overlay.remove(); });
  overlay.querySelector('[data-close]')!.addEventListener('click', ()=>{ audio.sfxMenuBack(); opts.onResume(); overlay.remove(); });
  overlay.querySelector('[data-restart]')!.addEventListener('click', ()=>{ audio.sfxMenuConfirm(); overlay.remove(); opts.onRestart(); });
  overlay.querySelector('[data-settings]')!.addEventListener('click', ()=>{ audio.sfxMenuMove(); opts.onSettings(); });
  overlay.querySelector('[data-menu]')!.addEventListener('click', ()=>{ audio.sfxMenuBack(); overlay.remove(); opts.onMenu(); });
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay){ audio.sfxMenuBack(); opts.onResume(); overlay.remove(); } });
  return ()=> overlay.remove();
}
