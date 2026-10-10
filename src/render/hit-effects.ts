import { ParticleSystem } from './particle-system';
export function spawnHitEffect(ps: ParticleSystem, x:number,y:number, heavy:boolean, color:string){
  ps.hitSpark(x,y,color,heavy);
}
