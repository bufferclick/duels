import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createEsper(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('esper'), x,y,facing); }
