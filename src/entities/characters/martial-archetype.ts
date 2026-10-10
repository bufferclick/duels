import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createMartial(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('martial'), x,y,facing); }
