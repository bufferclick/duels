export function createPanel(title:string){
  const el=document.createElement('div');
  el.className='menu-card';
  el.innerHTML=`<div class="card-head"><div class="card-title">${title}</div></div><div class="card-body"></div>`;
  return el;
}
