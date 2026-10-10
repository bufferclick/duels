export type MoveId = 'light'|'heavy'|'special1'|'special2'|'ultimate'|'throw';

export interface MoveDef {
  id: MoveId;
  name: string;
  input: string;
  damage: number;
  startup: number;
  active: number;
  recovery: number;
  hitstun: number;
  blockstun: number;
  knockbackX: number;
  knockbackY: number;
  range: number;
  height: number;
  meterGain: number;
  chipPercent?: number;
  isProjectile?: boolean;
  projectileSpeed?: number;
  description: string;
}

export interface FighterDef {
  id: string;
  name: string;
  title: string;
  faction: 'devils'|'monsters';
  palette: { primary: string; secondary: string; accent: string; skin: string; };
  stats: { power: number; speed: number; range: number; technique: number; };
  lore: string;
  ability: string;
  moves: Record<MoveId, MoveDef>;
  hasDoubleJump?: boolean;
  passive?: string;
}

export const FIGHTERS: FighterDef[] = [
  {
    id: 'chainsaw',
    name: 'REX SAW',
    title: 'The Chainsaw Devil',
    faction: 'devils',
    palette: { primary: '#E6393B', secondary: '#7A1012', accent: '#FFB020', skin: '#E8DCC8' },
    stats: { power: 9, speed: 6, range: 4, technique: 5 },
    lore: 'A berserker bound by contract. His arms roar with twin chainsaws; the lower his blood, the louder they scream.',
    ability: 'Blood Fuel — damage + up to 35% when below 40% health. Heavy attacks regain 4% blood on hit.',
    moves: {
      light: { id:'light', name:'Saw Jab', input:'J', damage:8, startup:4, active:3, recovery:8, hitstun:12, blockstun:7, knockbackX:4, knockbackY:-2, range:62, height:44, meterGain:6, description:'Fast saw jab, chains into itself.' },
      heavy: { id:'heavy', name:'Rip Saw', input:'K', damage:16, startup:9, active:4, recovery:16, hitstun:18, blockstun:10, knockbackX:9, knockbackY:-4, range:74, height:52, meterGain:10, chipPercent:0.2, description:'Wide overhead rip that drains blood.' },
      special1: { id:'special1', name:'Rev Rush', input:'Q', damage:14, startup:12, active:8, recovery:18, hitstun:20, blockstun:14, knockbackX:12, knockbackY:-3, range:110, height:48, meterGain:12, description:'Rev and dash forward with saws extended.' },
      special2: { id:'special2', name:'Saw Launcher', input:'E', damage:18, startup:14, active:3, recovery:22, hitstun:16, blockstun:12, knockbackX:6, knockbackY:-10, range:68, height:56, meterGain:14, description:'Uppercut that launches. Combo starter.' },
      ultimate: { id:'ultimate', name:'CARNAGE ENGINE', input:'R', damage:38, startup:18, active:12, recovery:32, hitstun:30, blockstun:18, knockbackX:14, knockbackY:-6, range:140, height:64, meterGain:0, chipPercent:0.35, description:'Unleash both saws in a grinding blender. Blood Fuel multiplies damage.' },
      throw: { id:'throw', name:'Saw Drag', input:'Grab', damage:14, startup:5, active:3, recovery:16, hitstun:22, blockstun:0, knockbackX:8, knockbackY:-5, range:56, height:46, meterGain:6, description:'Drags opponent through revving teeth.' },
    }
  },
  {
    id: 'fox',
    name: 'KITSUNE',
    title: 'The Fox Devil',
    faction: 'devils',
    palette: { primary: '#FF6B6B', secondary: '#7A3BFF', accent: '#FFB020', skin: '#F5E6D8' },
    stats: { power: 5, speed: 8, range: 8, technique: 9 },
    lore: 'Nine-tailed illusionist. She never stands where you think she stands — foxfire answers for her.',
    ability: 'Fox Step — teleport dash leaves a foxfire trap. Trap detonates for 10 damage if stepped on.',
    moves: {
      light: { id:'light', name:'Claw Swipe', input:'J', damage:7, startup:5, active:3, recovery:7, hitstun:11, blockstun:6, knockbackX:3, knockbackY:-2, range:58, height:42, meterGain:6, description:'Quick claw swipe.' },
      heavy: { id:'heavy', name:'Tail Lash', input:'K', damage:14, startup:10, active:5, recovery:15, hitstun:17, blockstun:9, knockbackX:8, knockbackY:-3, range:78, height:46, meterGain:9, chipPercent:0.15, description:'Sweeping tail lash, good range.' },
      special1: { id:'special1', name:'Foxfire Volley', input:'Q', damage:9, startup:11, active:2, recovery:16, hitstun:14, blockstun:10, knockbackX:4, knockbackY:-2, range:0, height:20, meterGain:10, isProjectile:true, projectileSpeed:9, description:'Launches homing foxfire projectile.' },
      special2: { id:'special2', name:'Phantom Step', input:'E', damage:0, startup:4, active:10, recovery:12, hitstun:0, blockstun:0, knockbackX:0, knockbackY:0, range:0, height:0, meterGain:8, description:'Teleport 120px forward/back, leaves trap.' },
      ultimate: { id:'ultimate', name:'NINEFOLD HEX', input:'R', damage:36, startup:22, active:16, recovery:28, hitstun:28, blockstun:16, knockbackX:10, knockbackY:-4, range:0, height:0, meterGain:0, description:'Summons nine foxfire orbs that converge.' },
      throw: { id:'throw', name:'Fox Bind', input:'Grab', damage:13, startup:5, active:3, recovery:16, hitstun:20, blockstun:0, knockbackX:7, knockbackY:-4, range:56, height:44, meterGain:6, description:'Spirit chains bind and slam.' },
    }
  },
  {
    id: 'bat',
    name: 'NOCTURNE',
    title: 'The Night Devil',
    faction: 'devils',
    palette: { primary: '#2D1B4E', secondary: '#7A3BFF', accent: '#E6393B', skin: '#C9B8A8' },
    stats: { power: 9, speed: 3, range: 6, technique: 6 },
    lore: 'A cathedral of wings. He drinks fear and returns it as force — each hit steals life.',
    ability: 'Sanguine Feast — 18% lifesteal on heavy/special. Fear Aura briefly slows opponent dash on hit.',
    moves: {
      light: { id:'light', name:'Wing Jab', input:'J', damage:9, startup:6, active:3, recovery:10, hitstun:13, blockstun:8, knockbackX:4, knockbackY:-1, range:66, height:50, meterGain:6, description:'Heavy wing jab.' },
      heavy: { id:'heavy', name:'Gravitas Slam', input:'K', damage:19, startup:13, active:4, recovery:20, hitstun:22, blockstun:13, knockbackX:11, knockbackY:-5, range:80, height:58, meterGain:11, chipPercent:0.25, description:'Slow overhead slam, life drain.' },
      special1: { id:'special1', name:'Dread Wave', input:'Q', damage:12, startup:15, active:6, recovery:18, hitstun:26, blockstun:16, knockbackX:5, knockbackY:-2, range:160, height:52, meterGain:12, description:'Wide fear wave projectile, slows on hit.' },
      special2: { id:'special2', name:'Abyss Grasp', input:'E', damage:16, startup:18, active:4, recovery:20, hitstun:20, blockstun:12, knockbackX:3, knockbackY:-2, range:72, height:54, meterGain:13, description:'Command grab from mid range.' },
      ultimate: { id:'ultimate', name:'ECLIPSE FEAST', input:'R', damage:42, startup:24, active:10, recovery:34, hitstun:32, blockstun:20, knockbackX:12, knockbackY:-7, range:90, height:62, meterGain:0, chipPercent:0.35, description:'Envelops foe in wings, multi-hit drain.' },
      throw: { id:'throw', name:'Nightfall', input:'Grab', damage:16, startup:6, active:3, recovery:18, hitstun:24, blockstun:0, knockbackX:9, knockbackY:-6, range:56, height:48, meterGain:6, description:'Lifts and drains.' },
    }
  },
  {
    id: 'gun',
    name: 'CALIBER',
    title: 'The Gun Devil',
    faction: 'devils',
    palette: { primary: '#1A1A1A', secondary: '#E6393B', accent: '#FFB020', skin: '#D8CFC0' },
    stats: { power: 7, speed: 7, range: 10, technique: 6 },
    lore: 'He does not aim. He denies space. Every step you take is already in his crosshair.',
    ability: 'Suppressing Fire — projectiles have extra hitstun. Dash leaves afterimage that blocks one projectile.',
    moves: {
      light: { id:'light', name:'Pistol Jab', input:'J', damage:7, startup:4, active:2, recovery:8, hitstun:10, blockstun:6, knockbackX:3, knockbackY:-1, range:68, height:38, meterGain:5, description:'Quick pistol whip.' },
      heavy: { id:'heavy', name:'Shotgun Sweep', input:'K', damage:15, startup:11, active:3, recovery:16, hitstun:16, blockstun:10, knockbackX:10, knockbackY:-4, range:88, height:44, meterGain:10, chipPercent:0.2, description:'Close buckshot blast.' },
      special1: { id:'special1', name:'Burst Fire', input:'Q', damage:8, startup:9, active:2, recovery:14, hitstun:12, blockstun:8, knockbackX:3, knockbackY:-1, range:0, height:18, meterGain:8, isProjectile:true, projectileSpeed:13, description:'Three-round burst projectile.' },
      special2: { id:'special2', name:'Slide Shot', input:'E', damage:13, startup:10, active:6, recovery:16, hitstun:18, blockstun:12, knockbackX:9, knockbackY:-3, range:120, height:32, meterGain:11, description:'Sliding low shot, evades highs.' },
      ultimate: { id:'ultimate', name:'EXECUTION ORDER', input:'R', damage:40, startup:20, active:18, recovery:30, hitstun:30, blockstun:18, knockbackX:11, knockbackY:-5, range:0, height:0, meterGain:0, description:'Full-auto barrage, screen-filling.' },
      throw: { id:'throw', name:'Point Blank', input:'Grab', damage:14, startup:5, active:3, recovery:16, hitstun:21, blockstun:0, knockbackX:8, knockbackY:-3, range:56, height:42, meterGain:6, description:'Grabs and fires point blank.' },
    }
  },
  {
    id: 'cyborg',
    name: 'AUGUR-7',
    title: 'The Cyborg Hero',
    faction: 'monsters',
    palette: { primary: '#FFB020', secondary: '#222222', accent: '#4A7CFF', skin: '#E8DDD0' },
    stats: { power: 7, speed: 6, range: 7, technique: 7 },
    lore: 'Forged in fire, tempered in duty. His incinerator burns bright — too bright, if held too long.',
    ability: 'Overheat — specials build heat. At 100 heat, forced 2s cooldown where defense -30%. Manage it.',
    moves: {
      light: { id:'light', name:'Plasma Jab', input:'J', damage:8, startup:4, active:3, recovery:8, hitstun:12, blockstun:7, knockbackX:4, knockbackY:-2, range:64, height:44, meterGain:6, description:'Quick arm cannon jab.' },
      heavy: { id:'heavy', name:'Incinerate Sweep', input:'K', damage:16, startup:10, active:6, recovery:17, hitstun:19, blockstun:11, knockbackX:9, knockbackY:-4, range:82, height:48, meterGain:10, chipPercent:0.22, description:'Arm cannon flamethrower sweep.' },
      special1: { id:'special1', name:'Incinerator Burst', input:'Q', damage:14, startup:13, active:4, recovery:18, hitstun:18, blockstun:13, knockbackX:8, knockbackY:-3, range:0, height:24, meterGain:12, isProjectile:true, projectileSpeed:10, description:'Fireball projectile, builds heat.' },
      special2: { id:'special2', name:'Rocket Rush', input:'E', damage:15, startup:9, active:8, recovery:16, hitstun:19, blockstun:12, knockbackX:13, knockbackY:-2, range:130, height:42, meterGain:12, description:'Rocket-propelled shoulder tackle.' },
      ultimate: { id:'ultimate', name:'HELIOS CANNON', input:'R', damage:44, startup:26, active:14, recovery:36, hitstun:34, blockstun:22, knockbackX:13, knockbackY:-8, range:0, height:0, meterGain:0, description:'Full incinerator beam.' },
      throw: { id:'throw', name:'Overdrive Toss', input:'Grab', damage:15, startup:5, active:3, recovery:17, hitstun:22, blockstun:0, knockbackX:10, knockbackY:-7, range:56, height:46, meterGain:6, description:'Grabs and rocket-tosses.' },
    },
    passive: 'heat'
  },
  {
    id: 'martial',
    name: 'KAZU',
    title: 'The Martial Bastion',
    faction: 'monsters',
    palette: { primary: '#1A1A1A', secondary: '#EDEBE3', accent: '#E6393B', skin: '#D8BFA8' },
    stats: { power: 6, speed: 10, range: 4, technique: 10 },
    lore: 'No weapon. No trick. Only flow — water that breaks stone. His parry turns your strength against you.',
    ability: 'Flowing Counter — tap block at impact to parry. Successful parry opens 22f punish and restores meter.',
    moves: {
      light: { id:'light', name:'Jab-Step', input:'J', damage:7, startup:3, active:2, recovery:6, hitstun:10, blockstun:6, knockbackX:3, knockbackY:-1, range:60, height:40, meterGain:7, description:'Fastest jab in roster, +1 on block.' },
      heavy: { id:'heavy', name:'Crushing Palm', input:'K', damage:15, startup:8, active:3, recovery:13, hitstun:18, blockstun:10, knockbackX:8, knockbackY:-4, range:70, height:48, meterGain:10, chipPercent:0.18, description:'Palm that wallsplats near edge.' },
      special1: { id:'special1', name:'Waterfall Combo', input:'Q', damage:6, startup:7, active:10, recovery:14, hitstun:9, blockstun:6, knockbackX:2, knockbackY:-1, range:72, height:44, meterGain:9, description:'5-hit flurry, each hit light.' },
      special2: { id:'special2', name:'Counter Stance', input:'E', damage:18, startup:2, active:14, recovery:22, hitstun:24, blockstun:0, knockbackX:10, knockbackY:-5, range:68, height:50, meterGain:14, description:'Hold to parry, auto counters.' },
      ultimate: { id:'ultimate', name:'BREAKING FANG', input:'R', damage:39, startup:12, active:8, recovery:26, hitstun:30, blockstun:18, knockbackX:15, knockbackY:-6, range:78, height:54, meterGain:0, description:'Devastating counter ultimate, requires parry window.' },
      throw: { id:'throw', name:'Joint Lock', input:'Grab', damage:13, startup:4, active:3, recovery:14, hitstun:20, blockstun:0, knockbackX:6, knockbackY:-4, range:56, height:42, meterGain:7, description:'Fast throw, techable.' },
    }
  },
  {
    id: 'powerhouse',
    name: 'SENSEI',
    title: 'The Caped Powerhouse',
    faction: 'monsters',
    palette: { primary: '#FFD60A', secondary: '#E6393B', accent: '#222222', skin: '#E8CFC0' },
    stats: { power: 10, speed: 4, range: 3, technique: 5 },
    lore: 'He looks bored. He hits like a meteor. Every punch is a choice — miss, and the world answers.',
    ability: 'Calm Stance — moves are slow but deal massive damage. Ultimate requires precise counter window, not spammable.',
    moves: {
      light: { id:'light', name:'Casual Jab', input:'J', damage:11, startup:7, active:2, recovery:11, hitstun:14, blockstun:8, knockbackX:6, knockbackY:-2, range:64, height:42, meterGain:7, description:'Deceptively heavy jab.' },
      heavy: { id:'heavy', name:'Serious Punch', input:'K', damage:24, startup:16, active:3, recovery:24, hitstun:26, blockstun:16, knockbackX:14, knockbackY:-6, range:76, height:50, meterGain:13, chipPercent:0.3, description:'Huge damage, very punishable.' },
      special1: { id:'special1', name:'Shockwave Clap', input:'Q', damage:13, startup:14, active:5, recovery:20, hitstun:20, blockstun:14, knockbackX:9, knockbackY:-3, range:140, height:60, meterGain:11, description:'Claps hands, hits whole mid range.' },
      special2: { id:'special2', name:'Sidestep', input:'E', damage:0, startup:6, active:12, recovery:14, hitstun:0, blockstun:0, knockbackX:0, knockbackY:0, range:0, height:0, meterGain:6, description:'Short invincible sidestep.' },
      ultimate: { id:'ultimate', name:'ONE - PUNCH', input:'R', damage:55, startup:10, active:4, recovery:40, hitstun:40, blockstun:28, knockbackX:18, knockbackY:-10, range:84, height:58, meterGain:0, chipPercent:0.5, description:'The punch. Must land as counter-punish or it whiffs with huge recovery.' },
      throw: { id:'throw', name:'Overhand Toss', input:'Grab', damage:18, startup:7, active:3, recovery:20, hitstun:26, blockstun:0, knockbackX:12, knockbackY:-8, range:56, height:48, meterGain:7, description:'Casual one-hand throw.' },
    }
  },
  {
    id: 'esper',
    name: 'MIRA VALE',
    title: 'The Esper',
    faction: 'monsters',
    palette: { primary: '#7A3BFF', secondary: '#7AD8FF', accent: '#FFB020', skin: '#F0E8DC' },
    stats: { power: 6, speed: 7, range: 9, technique: 8 },
    lore: 'She floats. She pulls. She throws cities. Gravity is a suggestion she declines.',
    ability: 'Telekinetic Field — specials can pull/push opponent 60-100px. Debris orbs orbit and can be launched.',
    moves: {
      light: { id:'light', name:'Psi Jab', input:'J', damage:7, startup:5, active:3, recovery:8, hitstun:11, blockstun:7, knockbackX:3, knockbackY:-2, range:62, height:40, meterGain:6, description:'Telekinetic jab.' },
      heavy: { id:'heavy', name:'Debris Swing', input:'K', damage:15, startup:11, active:4, recovery:16, hitstun:18, blockstun:11, knockbackX:9, knockbackY:-4, range:86, height:46, meterGain:10, chipPercent:0.2, description:'Swings orbiting debris.' },
      special1: { id:'special1', name:'Grav Pull', input:'Q', damage:10, startup:12, active:6, recovery:16, hitstun:16, blockstun:10, knockbackX:-12, knockbackY:-2, range:200, height:48, meterGain:11, description:'Pulls opponent toward you.' },
      special2: { id:'special2', name:'Debris Burst', input:'E', damage:11, startup:14, active:3, recovery:18, hitstun:15, blockstun:11, knockbackX:7, knockbackY:-3, range:0, height:22, meterGain:12, isProjectile:true, projectileSpeed:8, description:'Launches debris projectile.' },
      ultimate: { id:'ultimate', name:'METEOR STORM', input:'R', damage:42, startup:28, active:20, recovery:32, hitstun:32, blockstun:20, knockbackX:10, knockbackY:-7, range:0, height:0, meterGain:0, description:'Rains debris from above, multi-hit.' },
      throw: { id:'throw', name:'Tele Throw', input:'Grab', damage:14, startup:6, active:4, recovery:18, hitstun:22, blockstun:0, knockbackX:11, knockbackY:-6, range:72, height:46, meterGain:7, description:'Long-range telekinetic throw.' },
    },
    hasDoubleJump: true
  }
];

export function getFighterDef(id: string) {
  return FIGHTERS.find(f => f.id === id)!;
}
