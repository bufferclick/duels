import { BALANCE } from '../data/balance-constants';
import type { FighterDef, MoveDef, MoveId } from '../data/characters';
import { MeterSystem } from '../combat/meter-system';
import { ComboSystem } from '../combat/combo-system';
import { AABB, intersect } from './hitbox';

export type FighterState = 'idle'|'walk'|'run'|'crouch'|'jump'|'fall'|'dash'|'attack'|'hitstun'|'blockstun'|'block'|'down'|'getup'|'parry'|'throw';

export class Fighter {
  def: FighterDef;
  x: number; y: number;
  vx=0; vy=0;
  w=56; h=96;
  crouchH=64;
  facing: 1|-1 = 1;
  health=100; maxHealth=100;
  state: FighterState='idle';
  stateTime=0;
  healthGhost=100;
  ghostTimer=0;

  // combat
  meter = new MeterSystem();
  combo = new ComboSystem();
  currentMove: MoveDef | null = null;
  moveFrame=0;
  movePhase: 'startup'|'active'|'recovery'|'none'='none';
  hitstop=0;
  hitstun=0;
  blockstun=0;
  invincible=0;
  isBlocking=false;
  isCrouching=false;
  wantsCrouch=false;
  dashTime=0;
  dashCooldown=0;
  onGround=true;
  jumps=0;
  maxJumps: number;
  hasHitThisMove=false;
  lastAttacker: Fighter|null=null;

  // mechanics
  heat=0; // cyborg
  overheatTimer=0;
  bloodFuelActive=false;
  fearTimer=0;
  pullTimer=0;

  // visual
  animFrame=0;
  hurtFlash=0;

  // input intent (set externally)
  inputAxis=0;
  inputJump=false;
  inputCrouch=false;
  inputDash=false;
  inputBlock=false;

  facingOverride?: 1|-1;

  // history for AI
  lastMoveId: MoveId|null=null;

  constructor(def: FighterDef, x:number, y:number, facing:1|-1) {
    this.def = def;
    this.x = x; this.y = y;
    this.facing = facing;
    this.maxJumps = def.hasDoubleJump ? 2 : 1;
  }

  resetRound(x:number, facing:1|-1) {
    this.health=this.maxHealth;
    this.healthGhost=this.maxHealth;
    this.x=x; this.vx=0; this.vy=0; this.y=0;
    this.state='idle'; this.stateTime=0;
    this.hitstun=0; this.blockstun=0; this.hitstop=0; this.invincible=0;
    this.currentMove=null; this.moveFrame=0; this.movePhase='none';
    this.facing=facing; this.onGround=true; this.jumps=0;
    this.meter.value = Math.min(this.meter.value, 100); // carry meter? keep
    this.combo.reset();
    this.heat=0; this.overheatTimer=0; this.fearTimer=0;
    this.hurtFlash=0;
  }

  getHurtbox(): AABB {
    const h = this.isCrouching ? this.crouchH : this.h;
    return { x: this.x - this.w/2, y: this.y - h, w: this.w, h };
  }
  getHitbox(): AABB | null {
    if (!this.currentMove || this.movePhase!=='active') return null;
    // throw has separate logic
    const mv = this.currentMove;
    if (mv.id==='throw') return null;
    const reach = mv.range;
    const hh = mv.height;
    const hx = this.facing===1 ? this.x + this.w/2 : this.x - this.w/2 - reach;
    // y centered a bit up
    const hy = this.y - (this.isCrouching? 32 : 54) - hh/2;
    return { x: hx, y: hy, w: reach, h: hh };
  }
  getThrowBox(): AABB | null {
    if (!this.currentMove || this.currentMove.id!=='throw' || this.movePhase!=='active') return null;
    const r = BALANCE.throwRange;
    const hx = this.facing===1 ? this.x + this.w/2 : this.x - this.w/2 - r;
    return { x:hx, y: this.y - 56, w: r, h: 46 };
  }

  canAct(): boolean {
    if (this.hitstop>0) return false;
    if (this.hitstun>0 || this.blockstun>0) return false;
    if (this.state==='hitstun' || this.state==='blockstun' || this.state==='down') return false;
    if (this.overheatTimer>0) return false;
    if (this.currentMove && this.movePhase!=='none') return false;
    return true;
  }

  tryStartMove(id: MoveId): boolean {
    if (!this.canAct()) return false;
    // ultimate needs meter
    if (id==='ultimate' && !this.meter.canSpend(BALANCE.superCost)) return false;
    // powerhouse ultimate requires punish window check handled outside but allow
    const mv = this.def.moves[id];
    if (!mv) return false;
    // heat check for cyborg
    if (this.def.id==='cyborg' && (id==='special1' || id==='special2' || id==='heavy')) {
      if (this.heat >= 100) return false;
    }
    this.currentMove = mv;
    this.moveFrame=0;
    this.movePhase='startup';
    this.state='attack';
    this.stateTime=0;
    this.hasHitThisMove=false;
    this.lastMoveId=id;
    if (id==='ultimate') { this.meter.spend(BALANCE.superCost); }
    // dash-like moves set velocity
    if (id==='special1' && this.def.id==='chainsaw') {
      this.vx = this.facing * 7;
    }
    if (id==='special2' && this.def.id==='gun') {
      this.vx = this.facing * 6;
      this.y -= 6; // slide
    }
    if (id==='special1' && this.def.id==='cyborg' && mv.isProjectile) {
      // standing
    }
    if (id==='special2' && this.def.id==='esper') {
      // will create projectile in game
    }
    return true;
  }

  tryDash(dir:1|-1): boolean {
    if (this.dashCooldown>0 || this.hitstun>0 || this.blockstun>0 || this.currentMove) return false;
    if (this.overheatTimer>0) return false;
    this.dashTime = BALANCE.dashDuration;
    this.dashCooldown = BALANCE.dashCooldown + BALANCE.dashDuration;
    this.vx = dir * BALANCE.dashSpeed;
    this.invincible = dir !== this.facing ? BALANCE.dashBackIFrames : 0;
    this.state='dash';
    this.stateTime=0;
    this.facing = dir; // allow turn
    return true;
  }
  tryJump(): boolean {
    if (this.hitstun>0 || this.blockstun>0 || this.currentMove) return false;
    if (this.onGround) {
      this.vy = BALANCE.jumpVelocity;
      this.onGround=false; this.jumps=1;
      this.state='jump'; this.stateTime=0;
      return true;
    } else if (this.jumps < this.maxJumps) {
      this.vy = BALANCE.doubleJumpVelocity;
      this.jumps++;
      this.state='jump'; this.stateTime=0;
      return true;
    }
    return false;
  }

  takeDamage(amount:number, opts:{hitstun?:number; knockbackX?:number; knockbackY?:number; attacker?:Fighter; chip?:boolean}={}) {
    if (this.invincible>0) return false;
    // blocking reduces
    let final = amount;
    let isBlocked = false;
    if (this.isBlocking && this.onGround && this.facing !== (opts.attacker?.facing ?? this.facing)) {
      // facing attacker? simple check: if attacker is in front and defender holds back
      // For now if isBlocking true, we block
      if (opts.chip) {
        final = amount * (opts.attacker?.def.moves.heavy.chipPercent ?? 0.18);
      } else {
        isBlocked = true;
        final = amount * 0.12; // chip only if special? simplified
        this.blockstun = opts.hitstun ? Math.floor(opts.hitstun * 0.6) : 8;
        this.state='blockstun'; this.stateTime=0;
        this.hurtFlash=6;
        // pushback
        this.vx = (opts.knockbackX ?? 4) * 0.4 * (opts.attacker ? (opts.attacker.facing) : 1) * -1;
        this.meter.add(3);
        opts.attacker?.meter.add(2);
        this.health = Math.max(0, this.health - final);
        this.ghostTimer=30;
        return true;
      }
    }
    // hit
    this.health = Math.max(0, this.health - final);
    this.healthGhost = Math.max(this.healthGhost, this.health + final*0.5);
    this.ghostTimer=40;
    this.hitstun = opts.hitstun ?? 14;
    this.state='hitstun'; this.stateTime=0;
    this.currentMove=null; this.movePhase='none'; this.moveFrame=0;
    this.vx = (opts.knockbackX ?? 6) * (opts.attacker?.facing ?? 1);
    if (opts.knockbackY) this.vy = opts.knockbackY;
    else if (!this.onGround) this.vy = -3;
    this.hurtFlash=8;
    this.lastAttacker = opts.attacker ?? null;
    // meter
    this.meter.add(4);
    opts.attacker?.meter.add(7);
    // lifesteal for bat
    if (opts.attacker?.def.id==='bat' && (opts.attacker.currentMove?.id==='heavy' || opts.attacker.currentMove?.id==='special1' || opts.attacker.currentMove?.id==='special2')) {
      opts.attacker.health = Math.min(opts.attacker.maxHealth, opts.attacker.health + final*0.18);
    }
    // blood fuel for rex
    if (opts.attacker?.def.id==='chainsaw' && opts.attacker.health < 40 && opts.attacker.currentMove?.id==='heavy') {
      opts.attacker.health = Math.min(opts.attacker.maxHealth, opts.attacker.health + 1.5);
    }
    if (final>18) {
      // heavy hit will trigger elsewhere
    }
    if (this.health<=0) {
      this.state='down'; this.hitstun=999; this.vx*=0.5;
    }
    return true;
  }

  update(frame:number, opponent: Fighter) {
    this.stateTime++;
    this.animFrame++;
    if (this.hitstop>0) { this.hitstop--; return; }
    // timers
    if (this.hitstun>0) this.hitstun--;
    if (this.blockstun>0) this.blockstun--;
    if (this.invincible>0) this.invincible--;
    if (this.dashCooldown>0) this.dashCooldown--;
    if (this.ghostTimer>0) this.ghostTimer--; else {
      // lerp ghost to health
      this.healthGhost += (this.health - this.healthGhost) * 0.06;
      if (Math.abs(this.healthGhost - this.health) < 0.1) this.healthGhost = this.health;
    }
    if (this.hurtFlash>0) this.hurtFlash--;
    if (this.overheatTimer>0) { this.overheatTimer--; if (this.overheatTimer===0) this.heat=0; }
    if (this.heat>0 && this.def.id==='cyborg' && this.state!=='attack') {
      this.heat = Math.max(0, this.heat - 0.12);
    }
    if (this.fearTimer>0) this.fearTimer--;

    // move timeline
    if (this.currentMove) {
      this.moveFrame++;
      const mv = this.currentMove;
      if (this.movePhase==='startup' && this.moveFrame >= mv.startup) {
        this.movePhase='active';
        this.moveFrame=0;
      } else if (this.movePhase==='active' && this.moveFrame >= mv.active) {
        this.movePhase='recovery';
        this.moveFrame=0;
        // stop dash velocity for rev rush
        if (mv.id==='special1' && this.def.id==='chainsaw') this.vx *= 0.4;
      } else if (this.movePhase==='recovery' && this.moveFrame >= mv.recovery) {
        // end move
        this.currentMove=null; this.movePhase='none'; this.moveFrame=0;
        this.state='idle'; this.stateTime=0;
        // heat add for cyborg
        if (this.def.id==='cyborg') {
          if (mv.id==='special1') this.heat += 28;
          else if (mv.id==='special2') this.heat += 22;
          else if (mv.id==='heavy') this.heat += 12;
          if (this.heat>=100) { this.heat=100; this.overheatTimer=120; }
        }
      }
    } else {
      // no move
      if (this.hitstun<=0 && this.blockstun<=0 && this.state!=='down') {
        // determine idle vs walk
        if (!this.onGround) {
          this.state = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 0.5) {
          this.state = Math.abs(this.vx) > 5 ? 'run' : 'walk';
        } else if (this.isCrouching) this.state='crouch';
        else this.state='idle';
      }
    }

    // physics
    if (this.state!=='down') {
      // apply gravity
      if (!this.onGround) {
        this.vy += BALANCE.gravity;
      }
      // movement input when not in attack/hitstun/dash
      if (this.canAct() && this.dashTime<=0) {
        if (Math.abs(this.inputAxis)>0.1) {
          const spd = this.isCrouching ? 1.2 : (this.inputAxis * this.facing < 0 ? BALANCE.backWalkSpeed : (Math.abs(this.inputAxis)>0.9? BALANCE.runSpeed: BALANCE.walkSpeed));
          if (this.fearTimer>0) {
            this.vx = this.inputAxis * spd * 0.65;
          } else {
            this.vx = this.inputAxis * spd;
          }
          if (this.inputAxis * this.facing < 0) this.isBlocking = true; else this.isBlocking=false;
        } else {
          // friction
          this.vx *= BALANCE.friction;
          if (Math.abs(this.vx)<0.2) this.vx=0;
          this.isBlocking=false;
        }
        this.isCrouching = this.inputCrouch && this.onGround;
      } else if (this.dashTime>0) {
        // keep dash vx
      } else {
        // during hitstun/blockstun apply friction
        this.vx *= 0.92;
      }
    } else {
      this.vx *= 0.94;
    }

    if (this.dashTime>0) {
      this.dashTime--;
      if (this.dashTime<=0) {
        this.vx *= 0.35;
        this.state='idle';
      }
    }

    // integrate
    this.x += this.vx;
    this.y += this.vy;

    // floor
    if (this.y >= 0) {
      this.y = 0; this.vy=0; this.onGround=true; this.jumps=0;
      if (this.state==='fall' || this.state==='jump') this.state='idle';
    } else {
      this.onGround=false;
    }

    // stage bounds
    const half = this.w/2 + 12;
    this.x = Math.max(half, Math.min(BALANCE.stageWidth - half, this.x));

    // facing opponent (if not attacking)
    if (this.canAct() && this.dashTime<=0) {
      this.facing = opponent.x > this.x ? 1 : -1;
    }

    // combo update
    this.combo.update(frame);

    // handle down state
    if (this.health<=0 && this.state!=='down') {
      this.state='down';
    }
  }

  isAlive() { return this.health>0; }
  isInHitstun() { return this.hitstun>0; }
  isInBlockstun() { return this.blockstun>0; }

  getMeterRatio() { return this.meter.ratio(); }

  // for AI: distance to opponent
  distanceTo(op: Fighter) { return Math.abs(this.x - op.x); }
}
