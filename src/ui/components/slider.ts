export function createSlider(min:number,max:number, value:number, onChange:(v:number)=>void){
  const el=document.createElement('input');
  el.type='range'; el.min=String(min); el.max=String(max); el.step='0.01'; el.value=String(value);
  el.addEventListener('input',()=> onChange(parseFloat(el.value)));
  return el;
}
