import type { Fighter } from '../entities/fighter';

export type Behavior = 'approach'|'retreat'|'attack_light'|'attack_heavy'|'special1'|'special2'|'ultimate'|'block'|'dash_in'|'dash_back'|'jump'|'throw';

export function getPersonalityWeights(id: string): Record<Behavior, number> {
  const base: Record<Behavior, number> = {
    approach:1, retreat:1, attack_light:1, attack_heavy:1, special1:1, special2:1, ultimate:0.4, block:1, dash_in:0.6, dash_back:0.6, jump:0.5, throw:0.4
  };
  switch(id) {
    case 'martial': return { ...base, attack_light:1.6, attack_heavy:1.2, special2:1.8, block:1.4, dash_in:1.2, throw:0.9 };
    case 'esper': return { ...base, retreat:1.5, special1:1.6, special2:1.7, approach:0.6, jump:1.1, ultimate:0.6 };
    case 'gun': return { ...base, retreat:1.4, special1:1.8, special2:0.8, attack_heavy:1.1, approach:0.5 };
    case 'chainsaw': return { ...base, approach:1.6, attack_heavy:1.5, special1:1.4, dash_in:1.3, block:0.7 };
    case 'bat': return { ...base, attack_heavy:1.6, special1:1.2, special2:1.3, approach:0.8, block:1.1 };
    case 'fox': return { ...base, special1:1.7, special2:1.6, dash_back:1.4, retreat:1.3, attack_light:1.3 };
    case 'cyborg': return { ...base, special1:1.5, special2:1.4, attack_heavy:1.2, approach:1.1 };
    case 'powerhouse': return { ...base, attack_heavy:1.8, special1:1.1, ultimate:0.9, block:0.6, approach:0.9, dash_in:0.4 };
    default: return base;
  }
}
