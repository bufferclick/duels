import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createPowerhouse(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('powerhouse'), x,y,facing); }
