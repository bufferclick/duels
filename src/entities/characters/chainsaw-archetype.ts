import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createChainsaw(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('chainsaw'), x,y,facing); }
