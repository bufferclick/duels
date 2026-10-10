import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createGun(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('gun'), x,y,facing); }
