export function showRoundTransition(root:HTMLElement, text:string, sub:string, duration=1100): Promise<void> {
  return new Promise(res=>{
    const el=document.createElement('div');
    el.style.cssText='position:absolute; inset:0; display:grid; place-items:center; background:rgba(9,9,14,0.52); backdrop-filter:blur(6px); z-index:15; pointer-events:none;';
    el.innerHTML=`
      <div style="text-align:center; transform:skewX(-4deg);">
        <div style="font-family:var(--font-display); font-weight:900; font-size:72px; letter-spacing:0.06em; text-transform:uppercase; color:var(--bone); text-shadow:0 4px 24px rgba(0,0,0,0.6); line-height:1;">${text}</div>
        <div style="margin-top:8px; font-family:var(--font-mono); font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--bone-muted); background:var(--blood); color:white; display:inline-block; padding:4px 10px; transform:skewX(4deg);">${sub}</div>
      </div>
    `;
    root.appendChild(el);
    // animate
    el.animate([
      { opacity:0, transform:'scale(0.96)' },
      { opacity:1, transform:'scale(1)' }
    ], { duration:180, easing:'cubic-bezier(0.16,1,0.3,1)' });
    setTimeout(()=>{
      el.animate([
        { opacity:1 }, { opacity:0 }
      ], { duration:220, easing:'ease-out' }).onfinish=()=>{
        el.remove(); res();
      };
    }, duration);
  });
}
export function showKORound(root:HTMLElement, winnerName:string): Promise<void> {
  return showRoundTransition(root, 'K.O.', `${winnerName} TAKES THE ROUND`, 1200);
}
