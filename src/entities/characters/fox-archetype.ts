import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createFox(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('fox'), x,y,facing); }
