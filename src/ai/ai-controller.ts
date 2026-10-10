import type { Fighter } from '../entities/fighter';
import { DIFFICULTY } from './difficulty-profiles';
import { getPersonalityWeights, Behavior } from './behavior-weights';
import type { Difficulty } from '../data/balance-constants';

export class AIController {
  fighter: Fighter;
  opponent: Fighter;
  difficulty: Difficulty;
  frame = 0;
  reactionQueue: {act: Behavior, execFrame:number}[] = [];
  state: 'neutral'|'pressure'|'defensive'|'punish' = 'neutral';
  blockedTimer=0;
  personality: Record<Behavior, number>;

  constructor(fighter: Fighter, opponent: Fighter, difficulty: Difficulty='veteran') {
    this.fighter = fighter;
    this.opponent = opponent;
    this.difficulty = difficulty;
    this.personality = getPersonalityWeights(fighter.def.id);
  }
  setDifficulty(d: Difficulty) { this.difficulty=d; }
  setOpponent(op: Fighter) { this.opponent = op; }

  update(currentFrame:number) {
    this.frame = currentFrame;
    if (this.reactionQueue.length) {
      const next = this.reactionQueue[0];
      if (currentFrame >= next.execFrame) {
        this.reactionQueue.shift();
        this.execute(next.act);
      }
    }
    // decide periodically
    if (currentFrame % 7 !== 0) return;
    if (this.fighter.hitstun>0 || this.fighter.blockstun>0) return;
    if (this.fighter.currentMove) return;
    if (this.reactionQueue.length>1) return;

    const dist = Math.abs(this.fighter.x - this.opponent.x);
    const oppAttacking = !!this.opponent.currentMove && (this.opponent.movePhase==='startup' || this.opponent.movePhase==='active');
    const oppRecovery = !!this.opponent.currentMove && this.opponent.movePhase==='recovery';
    const profile = DIFFICULTY[this.difficulty];

    // sense punish opportunity
    if (oppRecovery && dist < profile.whiffPunishDist + 30) {
      if (Math.random() < profile.punishChance) {
        this.queue(this.choosePunish(dist), profile.reactionDelay);
        return;
      }
    }
    // defend if opponent attacking
    if (oppAttacking && dist < 110) {
      if (Math.random() < profile.blockChance) {
        // hold block by moving back
        this.queue('block', Math.max(1, profile.reactionDelay - 4));
        return;
      }
    }
    // zone logic
    const weights: Partial<Record<Behavior, number>> = {};
    const p = this.personality;

    if (dist > 180) {
      weights.approach = p.approach * (profile.aggression*1.2);
      weights.special1 = p.special1 * 1.4;
      weights.special2 = p.special2 * 1.1;
      weights.dash_in = p.dash_in;
      if (dist>300) weights.retreat = 0;
    } else if (dist < 70) {
      weights.attack_light = p.attack_light * 1.5;
      weights.attack_heavy = p.attack_heavy*0.9;
      weights.throw = p.throw * (dist<58?2:0.5);
      weights.dash_back = p.dash_back * 0.8;
      weights.retreat = p.retreat*0.6;
      // powerhouse wants heavy
      if (this.fighter.def.id==='powerhouse') weights.attack_heavy = 2.2;
    } else {
      weights.attack_light = p.attack_light;
      weights.attack_heavy = p.attack_heavy;
      weights.special1 = p.special1;
      weights.special2 = p.special2;
      weights.approach = p.approach*0.7;
      weights.retreat = p.retreat*0.7;
    }
    // meter aware
    if (this.fighter.meter.canSpend(100)) {
      const healthRatio = this.opponent.health / this.opponent.maxHealth;
      if (healthRatio < profile.meterUseThreshold) weights.ultimate = 2.5;
      else if (Math.random()<0.12) weights.ultimate = 1.2;
      else weights.ultimate = 0.2;
    } else {
      weights.ultimate = 0;
    }
    // projectile characters want to zone
    if (this.fighter.def.id==='gun' || this.fighter.def.id==='fox' || this.fighter.def.id==='esper') {
      if (dist < 120) weights.retreat = (weights.retreat||1)*1.6;
      if (dist > 150) weights.special1 = (weights.special1||1)*1.6;
    }
    // low health aggression
    if (this.fighter.health < 30) {
      weights.attack_heavy = (weights.attack_heavy||1)*1.4;
      if (this.fighter.meter.canSpend(100)) weights.ultimate = 3;
    }
    // random decision
    const choice = this.weightedPick(weights);
    if (!choice) return;
    // inaccurate decision simulation
    if (Math.random() > profile.decisionAccuracy) {
      // sometimes pick wrong move
      const all: Behavior[] = ['approach','retreat','attack_light','attack_heavy','special1','special2','block','dash_in','dash_back','jump'];
      this.queue(all[Math.floor(Math.random()*all.length)], profile.reactionDelay + (Math.random()*6|0));
    } else {
      this.queue(choice, profile.reactionDelay);
    }
  }

  choosePunish(dist:number): Behavior {
    if (dist < 70) return Math.random()<0.6? 'attack_heavy':'attack_light';
    if (dist < 130) return Math.random()<0.5? 'special1':'special2';
    return 'dash_in';
  }

  weightedPick(weights: Partial<Record<Behavior,number>>): Behavior|null {
    const entries = Object.entries(weights) as [Behavior,number][];
    const total = entries.reduce((s,[,w])=>s+w,0);
    if (total<=0) return null;
    let r = Math.random()*total;
    for (const [b,w] of entries) { r-=w; if (r<=0) return b; }
    return entries[0][0];
  }

  queue(act:Behavior, delay:number) {
    this.reactionQueue.push({ act, execFrame: this.frame + delay });
    if (this.reactionQueue.length>2) this.reactionQueue.shift();
  }

  execute(act:Behavior) {
    const f=this.fighter, o=this.opponent;
    const facing = o.x > f.x ? 1 : -1;
    switch(act) {
      case 'approach':
        f.inputAxis = facing as 1|-1;
        setTimeout(()=>{ if(f.inputAxis===facing) f.inputAxis=0; }, 220);
        break;
      case 'retreat':
        f.inputAxis = (-facing) as 1|-1;
        setTimeout(()=>{ if(f.inputAxis===-facing) f.inputAxis=0; }, 240);
        break;
      case 'attack_light': f.tryStartMove('light'); break;
      case 'attack_heavy': f.tryStartMove('heavy'); break;
      case 'special1': f.tryStartMove('special1'); break;
      case 'special2': f.tryStartMove('special2'); break;
      case 'ultimate': f.tryStartMove('ultimate'); break;
      case 'dash_in': f.tryDash(facing as 1|-1); break;
      case 'dash_back': f.tryDash((-facing) as 1|-1); break;
      case 'block':
        f.inputAxis = -facing;
        f.isBlocking = true;
        setTimeout(()=>{ f.isBlocking=false; if(f.inputAxis===-facing) f.inputAxis=0; }, 320);
        break;
      case 'jump': f.tryJump(); break;
      case 'throw': f.tryStartMove('throw'); break;
    }
  }
}
