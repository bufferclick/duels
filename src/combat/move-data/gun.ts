import { FIGHTERS } from '../../data/characters';
export const gunMoves = FIGHTERS.find(f=> f.id==='gun')!.moves;
