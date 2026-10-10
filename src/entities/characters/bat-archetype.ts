import { Fighter } from '../fighter';
import { getFighterDef } from '../../data/characters';
export function createBat(x:number,y:number,facing:1|-1){ return new Fighter(getFighterDef('bat'), x,y,facing); }
