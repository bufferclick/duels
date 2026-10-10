export function createButton(label:string, variant:'primary'|'ghost'='primary'){
  const b=document.createElement('button');
  b.className= variant==='primary' ? 'btn-primary' : 'btn-ghost';
  b.textContent=label;
  return b;
}
