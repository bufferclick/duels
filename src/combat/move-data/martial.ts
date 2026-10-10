import { FIGHTERS } from '../../data/characters';
export const martialMoves = FIGHTERS.find(f=> f.id==='martial')!.moves;
