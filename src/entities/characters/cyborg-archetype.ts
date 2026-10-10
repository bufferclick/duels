import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createCyborg(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('cyborg'), x,y,facing); }
