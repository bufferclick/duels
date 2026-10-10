import { Fighter } from '../entities/fighter';
import { getFighterDef } from '../data/characters';
import { STAGES } from '../data/stages';
import { BALANCE, Difficulty } from '../data/balance-constants';
import { InputManager } from './input-manager';
import { Timing } from './timing';
import { Camera } from './camera';
import { AIController } from '../ai/ai-controller';
import { ParticleSystem } from '../render/particle-system';
import { StageRenderer } from '../render/stage-renderer';
import { drawFighter } from '../render/sprite-renderer';
import { Projectile } from '../entities/projectile';
import { renderHUD } from '../ui/hud';
import { showKORound, showRoundTransition } from '../ui/round-transition';
import { audio } from '../audio/audio-engine';
import { intersect } from '../entities/hitbox';

export interface BattleConfig {
  playerId: string;
  cpuId: string;
  stageId: string;
  difficulty: Difficulty;
  isTraining?: boolean;
  container: HTMLElement;
  onMatchEnd: (winner: 'p1'|'p2', score:[number,number], stats:{p1Damage:number,p2Damage:number,maxCombo:number})=>void;
  onExit: ()=>void;
}

export class Battle {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  overlay: HTMLElement; // for HUD
  p1: Fighter;
  p2: Fighter;
  projectiles: Projectile[] = [];
  input: InputManager;
  timing = new Timing();
  camera = new Camera();
  ai: AIController;
  particles = new ParticleSystem();
  stageRenderer: StageRenderer;
  frame = 0;
  round = 1;
  score:[number,number]=[0,0];
  timer = BALANCE.roundTime;
  timerAccum = 0;
  isPaused = false;
  isRoundEnding = false;
  isMatchOver = false;
  stats = { p1Damage:0, p2Damage:0, maxCombo:0 };
  difficulty: Difficulty;
  isTraining: boolean;
  onMatchEnd: BattleConfig['onMatchEnd'];
  onExit: BattleConfig['onExit'];
  raf = 0;
  boundKey: (e:KeyboardEvent)=>void;

  constructor(cfg: BattleConfig) {
    this.container = cfg.container;
    this.difficulty = cfg.difficulty;
    this.isTraining = !!cfg.isTraining;
    this.onMatchEnd = cfg.onMatchEnd;
    this.onExit = cfg.onExit;

    // canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.canvas.style.width='100%';
    this.canvas.style.height='100%';
    this.canvas.style.display='block';
    this.ctx = this.canvas.getContext('2d')!;

    // overlay root
    this.overlay = document.createElement('div');
    this.overlay.style.position='absolute';
    this.overlay.style.inset='0';
    this.overlay.style.pointerEvents='none';
    // container already relative; set up wrapper
    this.container.innerHTML='';
    this.container.appendChild(this.canvas);
    this.container.appendChild(this.overlay);

    // stage
    const stageDef = STAGES.find(s=>s.id===cfg.stageId) || STAGES[0];
    this.stageRenderer = new StageRenderer(stageDef);
    audio.startAmbience(stageDef.id);

    // fighters
    const p1def = getFighterDef(cfg.playerId);
    const p2def = getFighterDef(cfg.cpuId);
    this.p1 = new Fighter(p1def, 420, 0, 1);
    this.p2 = new Fighter(p2def, 980, 0, -1);

    this.input = new InputManager();
    this.ai = new AIController(this.p2, this.p1, this.difficulty);
    this.camera.viewportW = 1280;
    this.camera.viewportH = 720;

    // resize handling
    this.resize();
    window.addEventListener('resize', ()=> this.resize());

    // pause key
    this.boundKey = (e:KeyboardEvent)=>{
      if(e.key==='Escape') this.togglePause();
    };
    window.addEventListener('keydown', this.boundKey);

    // start
    this.startRoundIntro();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    // keep canvas 1280x720 internal, CSS scales
  }

  async startRoundIntro() {
    if (this.isTraining) {
      this.p1.health = this.p1.maxHealth;
      this.p2.health = this.p2.maxHealth;
      this.timer = 99;
      this.loop();
      return;
    }
    await showRoundTransition(this.overlay, `Round ${this.round}`, `${this.p1.def.name} vs ${this.p2.def.name}`, 1100);
    audio.sfxRoundStart();
    this.timer = BALANCE.roundTime;
    this.loop();
  }

  loop() {
    let last = performance.now();
    const step = 1000/60;
    let acc=0;
    const tick = (now:number)=>{
      if(this.isMatchOver) return;
      if(this.isPaused) { last=now; this.raf=requestAnimationFrame(tick); return; }
      let dt = now - last; last=now; dt=Math.min(dt,50); acc+=dt;
      while(acc>=step){
        this.update();
        acc-=step;
      }
      this.draw();
      this.raf=requestAnimationFrame(tick);
    };
    this.raf=requestAnimationFrame(tick);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.boundKey);
    audio.stopAmbience();
    this.input = null as any;
  }

  togglePause() {
    if(this.isRoundEnding || this.isMatchOver) return;
    if(this.isPaused){
      this.isPaused=false;
      // remove pause overlay if any
      const existing = this.container.querySelector('[data-pause-overlay]');
      if(existing) existing.remove();
      // re-enable pointer etc
    } else {
      this.isPaused=true;
      // lazy import pause
      import('../ui/pause-menu').then(m=>{
        const containerWrap=document.createElement('div');
        containerWrap.setAttribute('data-pause-overlay','');
        containerWrap.style.cssText='position:absolute; inset:0; pointer-events:auto;';
        this.container.appendChild(containerWrap);
        m.renderPause(containerWrap, {
          onResume:()=>{ this.isPaused=false; containerWrap.remove(); },
          onRestart:()=>{ containerWrap.remove(); this.restartRound(); },
          onMenu:()=>{ this.destroy(); this.onExit(); },
          onSettings:()=>{ import('../ui/settings-menu').then(s=> s.renderSettings(this.container, ()=>{})); }
        });
      });
    }
  }

  restartRound() {
    this.isPaused=false;
    this.isRoundEnding=false;
    this.p1.resetRound(420, 1);
    this.p2.resetRound(980, -1);
    this.projectiles=[];
    this.timer = BALANCE.roundTime;
    this.frame=0;
  }

  update() {
    this.frame++;
    this.timing.update();
    if(this.timing.hitstop>0) {
      // still draw particles? but freeze fighters
      this.particles.update();
      return;
    }
    this.input.update();
    this.stageRenderer.update();
    this.particles.update();

    // handle player input -> fighter
    this.handlePlayerInput(this.p1, this.input);

    // AI
    this.ai.update(this.frame);
    // AI movement handling is via inputAxis set inside AI; we need to propagate? AI directly manipulates fighter.inputAxis etc.
    // For consistency, we sync fighter inputAxis from AI queue execution which already sets properties

    // update fighters
    this.p1.update(this.frame, this.p2);
    this.p2.update(this.frame, this.p1);

    // projectiles
    for(const pr of this.projectiles) pr.update();
    this.projectiles = this.projectiles.filter(p=>p.alive());

    // projectile collisions
    for(const pr of this.projectiles){
      const target = pr.owner === this.p1 ? this.p2 : this.p1;
      if (target.invincible>0) continue;
      const a = pr.getAABB();
      const b = target.getHurtbox();
      if(intersect(a,b)){
        pr.hit=true;
        const dmg = pr.damage;
        // apply damage
        const dealt = target.takeDamage(dmg, { hitstun:16, knockbackX:7, attacker: pr.owner });
        if(dealt){
          this.particles.hitSpark(target.x, target.y - 52, pr.owner.def.palette.primary, false);
          audio.sfxHeavyHit();
          this.timing.triggerHitstop(6);
          this.timing.triggerShake(3);
          if(pr.owner===this.p1) this.stats.p1Damage+=dmg; else this.stats.p2Damage+=dmg;
        }
      }
    }

    // fighter hitbox collisions
    this.checkHit(this.p1, this.p2);
    this.checkHit(this.p2, this.p1);

    // throw collisions
    this.checkThrow(this.p1, this.p2);
    this.checkThrow(this.p2, this.p1);

    // handle projectile spawning for special moves
    this.checkProjectileSpawn(this.p1);
    this.checkProjectileSpawn(this.p2);

    // camera
    this.camera.update(this.p1.x, this.p2.x, this.timing.shakeOffset);

    // timer
    if(!this.isTraining && !this.isRoundEnding){
      this.timerAccum += 1/60;
      if(this.timerAccum >= 1){
        this.timerAccum-=1;
        this.timer = Math.max(0, this.timer -1);
      }
      if(this.timer<=0){
        this.handleTimeOver();
      }
      // KO check
      if(this.p1.health<=0 || this.p2.health<=0){
        this.handleKO();
      }
    } else if (this.isTraining) {
      // infinite health restore if low
      if(this.p2.health<=0){
        this.p2.health = this.p2.maxHealth;
        this.p2.state='idle';
        this.p2.hitstun=0;
      }
      if(this.p1.health<=0){
        this.p1.health = this.p1.maxHealth;
        this.p1.state='idle';
        this.p1.hitstun=0;
      }
      // regenerate meter slowly? handled
      this.timer = 99;
    }

    // combo max
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.p1.combo.hits, this.p2.combo.hits);

    // meter passive gain? already per hit

    // update meter heat for cyborg display
  }

  handlePlayerInput(f: Fighter, input: InputManager){
    if(f!==this.p1) return;
    // movement axis
    const axis = input.getAxis();
    f.inputAxis = axis;
    f.inputCrouch = input.isHeld('down');
    // jump
    if(input.wasPressed('up')) {
      if(f.tryJump()) audio.sfxJump();
    }
    // dash
    if(input.wasPressed('dash')){
      const dir = (f.facing===1 ? (input.isHeld('left')?-1:1) : (input.isHeld('right')?1:-1));
      // prefer input direction if held, else facing
      let d:1|-1 = f.facing;
      if(input.isHeld('left')) d=-1;
      else if(input.isHeld('right')) d=1;
      else d=f.facing;
      if(f.tryDash(d)) audio.sfxDash();
    }
    // attacks with buffer
    if(input.consume('light')) {
      if(f.tryStartMove('light')) audio.sfxLightHit();
      else if(f.canAct()) audio.sfxMenuError();
    }
    if(input.consume('heavy')) {
      // check throw proximity: if close and opponent not in hitstun, do throw
      const dist = Math.abs(f.x - (f===this.p1?this.p2:this.p1).x);
      if(dist < BALANCE.throwRange && Math.random()<0.9){
        // prefer throw if close and pressing heavy + close? simple: if opponent blocking, throw beats block
        const opp = f===this.p1? this.p2: this.p1;
        if(opp.isBlocking && f.tryStartMove('throw')) { audio.sfxHeavyHit(); }
        else if(f.tryStartMove('heavy')) audio.sfxHeavyHit();
      } else {
        if(f.tryStartMove('heavy')) audio.sfxHeavyHit();
      }
    }
    if(input.consume('special1')) {
      if(f.tryStartMove('special1')){
        audio.sfxSpecialCharge();
        // projectile spawn will happen next frame in active
      }
    }
    if(input.consume('special2')) {
      if(f.tryStartMove('special2')){
        audio.sfxSpecialCharge();
        // for fox phantom step, teleport immediately on startup
        if(f.def.id==='fox'){
          const dir = input.isHeld('left') ? -1 : input.isHeld('right') ? 1 : f.facing;
          f.x += dir * 120;
          f.x = Math.max(f.w/2, Math.min(BALANCE.stageWidth - f.w/2, f.x));
          f.invincible=10;
          this.particles.emit(f.x, f.y-30, { color:f.def.palette.accent, count:12, size:4, life:14, shape:'circle', speed:3 });
        }
        if(f.def.id==='esper' && f.currentMove?.id==='special1'){
          // pull opponent
          const opp = f===this.p1?this.p2:this.p1;
          const dir = f.facing;
          opp.x -= dir * 90; // pull toward
          opp.vx = -dir * 4;
          this.particles.emit(opp.x, opp.y-36, { color: f.def.palette.primary, count:10, life:12, shape:'spark', speed:4 });
          // force hitstun small
          opp.hitstun = 12; opp.state='hitstun';
        }
        if(f.def.id==='powerhouse' && f.currentMove?.id==='special2'){
          f.invincible=12;
        }
      }
    }
    if(input.consume('ultimate')) {
      if(f.meter.canSpend(100)){
        if(f.tryStartMove('ultimate')){
          audio.sfxUltimateTrigger();
          this.timing.triggerShake(10);
          this.timing.triggerHitstop(8);
          this.timing.triggerSlow(14, 0.45);
          // ultimate effects: screen flash will be drawn
          // for powerhouse, check counter condition: if opponent attacking, bonus
        }
      } else {
        audio.sfxMenuError();
      }
    }
  }

  checkProjectileSpawn(f:Fighter){
    if(!f.currentMove || f.movePhase!=='active' || f.currentMove.isProjectile!==true) return;
    // spawn only once per move at first active frame
    if(f.moveFrame!==1) return;
    // already have projectile? spawn
    const mv = f.currentMove;
    const dir = f.facing;
    const spawnX = dir===1 ? f.x + f.w/2 + 12 : f.x - f.w/2 - 12;
    const spawnY = f.y - 44;
    const speed = mv.projectileSpeed || 9;
    const proj = new Projectile(spawnX, spawnY, dir * speed, mv.damage, f);
    // special handling: gun burst fires 3 quick? We'll fire one but could burst
    if(f.def.id==='gun' && mv.id==='special1'){
      // burst 3
      this.projectiles.push(proj);
      setTimeout(()=> {
        if(!this.isMatchOver){
          const p2 = new Projectile(spawnX, spawnY+2, dir*speed, mv.damage*0.85, f);
          this.projectiles.push(p2);
        }
      }, 90);
      setTimeout(()=> {
        if(!this.isMatchOver){
          const p3 = new Projectile(spawnX, spawnY-2, dir*speed, mv.damage*0.85, f);
          this.projectiles.push(p3);
        }
      }, 180);
    } else {
      this.projectiles.push(proj);
    }
    audio.sfxProjectile();

    // for ultimate multi-hit, spawn multiple projectiles over time for some characters
    if(mv.id==='ultimate'){
      if(f.def.id==='fox' || f.def.id==='gun' || f.def.id==='esper'){
        // schedule extra hits
        for(let i=0;i<4;i++){
          setTimeout(()=>{
            if(!this.isMatchOver && f.currentMove?.id==='ultimate'){
              const p = new Projectile(spawnX + dir*i*12, spawnY + (Math.random()*16-8), dir*(speed*0.95), mv.damage*0.35, f);
              p.life=70;
              this.projectiles.push(p);
              audio.sfxProjectile();
            }
          }, 160 + i*140);
        }
      }
      if(f.def.id==='esper'){
        // meteor rain: spawn from above
        for(let i=0;i<6;i++){
          setTimeout(()=>{
            const rx = f===this.p1 ? this.p2.x + (Math.random()*60-30) : this.p1.x + (Math.random()*60-30);
            const p = new Projectile(rx, -40 - i*12, (Math.random()-0.5)*2, 8, f);
            p.vy=7; p.vx=(Math.random()-0.5)*1.5; p.w=18; p.h=18;
            this.projectiles.push(p);
          }, 220 + i*120);
        }
      }
    }
  }

  checkHit(attacker:Fighter, defender:Fighter){
    const hb = attacker.getHitbox();
    if(!hb) return;
    if(attacker.hasHitThisMove) return;
    if(defender.invincible>0) return;
    const hurt = defender.getHurtbox();
    if(!intersect(hb, hurt)) return;
    // hit
    const mv = attacker.currentMove!;
    const dist = Math.abs(attacker.x - defender.x);
    // chip if defender blocking high and not crouching? simplified: isBlocking
    const isBlocked = defender.isBlocking && defender.onGround && !defender.isInHitstun();
    let damage = mv.damage;
    // blood fuel bonus
    let bloodBonus = 0;
    if(attacker.def.id==='chainsaw' && attacker.health < 40){
      bloodBonus = (40 - attacker.health)/40 * 0.35;
    }
    // powerhouse calm bonus
    let calmBonus: number|undefined;
    if(attacker.def.id==='powerhouse' && mv.id==='ultimate'){
      // need counter window: defender must be in attack recovery or hitstun? For now require defender attacking
      if(defender.currentMove && defender.movePhase==='recovery') calmBonus=1.0;
      else { damage *= 0.45; } // weak if not counter
    }
    if(isBlocked && mv.chipPercent){
      const chip = Math.round(damage * mv.chipPercent);
      defender.takeDamage(chip, { hitstun: mv.blockstun, knockbackX: mv.knockbackX*0.5, attacker, chip:true });
      this.particles.blockSpark(defender.x + (attacker.facing* -18), defender.y - 44);
      audio.sfxBlock();
      attacker.meter.add(2);
      if(attacker===this.p1) this.stats.p1Damage+=chip; else this.stats.p2Damage+=chip;
    } else if(!isBlocked) {
      // parry check for martial
      let isParry=false;
      if(defender.def.id==='martial' && defender.currentMove?.id==='special2' && defender.movePhase==='active'){
        isParry=true;
        attacker.hitstun = 0; // attacker stunned?
        defender.invincible=6;
        attacker.takeDamage(0, { hitstun:22, knockbackX:2, attacker:defender });
        defender.state='parry';
        this.particles.hitSpark(defender.x, defender.y-42, '#FFD60A', true);
        audio.sfxHitConfirm();
        attacker.hasHitThisMove=true;
        return;
      }
      // compute final damage with bonuses
      if(bloodBonus) damage = Math.round(damage * (1+bloodBonus));
      if(calmBonus!==undefined && mv.id==='ultimate' && defender.currentMove) damage = Math.round(damage * 1.25);
      // combo scaling
      const scaled = defender.combo.registerHit(damage, this.frame);
      // but we also apply damage via takeDamage -> need to compute scaled?
      // We'll use scaled as final damage, override
      const isCounter = defender.currentMove && defender.movePhase==='startup';
      const finalDamage = isCounter ? Math.round(scaled*1.18) : Math.round(scaled);
      defender.takeDamage(finalDamage, { hitstun: mv.hitstun, knockbackX: mv.knockbackX, knockbackY: mv.knockbackY, attacker });
      this.particles.hitSpark(defender.x + (attacker.facing*-10), defender.y - 46, attacker.def.palette.primary, mv.damage>14);
      // hitstop & shake
      const hs = mv.damage>18 ? BALANCE.hitstopHeavy : mv.damage>10 ? BALANCE.hitstopSpecial : BALANCE.hitstopLight;
      const shake = mv.damage>18 ? BALANCE.screenShakeHeavy : BALANCE.screenShakeLight;
      if(mv.id==='ultimate'){ this.timing.triggerHitstop(BALANCE.hitstopUltimate); this.timing.triggerShake(BALANCE.screenShakeUltimate); }
      else { this.timing.triggerHitstop(hs); this.timing.triggerShake(shake); }
      if(mv.damage>14) audio.sfxHeavyHit(); else audio.sfxLightHit();
      if(attacker===this.p1) this.stats.p1Damage+=finalDamage; else this.stats.p2Damage+=finalDamage;
      // fear aura for bat
      if(attacker.def.id==='bat' && mv.id==='heavy'){
        defender.fearTimer=90;
      }
      // powerhouse heavy hit pause
      if(attacker.def.id==='powerhouse' && mv.id==='heavy'){
        this.timing.triggerSlow(10, 0.35);
      }
    } else {
      // blocked non-chip
      defender.takeDamage(0, { hitstun: mv.blockstun, knockbackX:2, attacker, chip:false }); // will handle blockstun
      // we already handled blockstun via takeDamage logic for blocked? but we short-circuited chip path; need generic block
      defender.blockstun = mv.blockstun;
      defender.state='blockstun';
      this.particles.blockSpark(defender.x, defender.y-40);
      audio.sfxBlock();
      defender.meter.add(2);
    }
    attacker.hasHitThisMove=true;
    // for multi-hit moves like waterfall combo, allow multiple hits if we reset flag after small interval? We'll reset after active frame advances
    if(attacker.def.id==='martial' && mv.id==='special1'){
      // 5-hit flurry: allow hits every 3 frames
      setTimeout(()=> attacker.hasHitThisMove=false, 90);
    }
    // ultimate multi-hit: allow again quickly
    if(mv.id==='ultimate'){
      setTimeout(()=> attacker.hasHitThisMove=false, 120);
    }
  }

  checkThrow(attacker:Fighter, defender:Fighter){
    const tb = attacker.getThrowBox();
    if(!tb) return;
    if(attacker.hasHitThisMove) return;
    if(defender.invincible>0) return;
    if(Math.abs(attacker.x - defender.x) > BALANCE.throwRange + 8) return;
    const hurt = defender.getHurtbox();
    if(!intersect(tb, hurt)) return;
    // throw beats block, but loses to hitstun? if defender in hitstun, throw whiffs (throw break)
    if(defender.hitstun>0 || defender.blockstun>0) return;
    if(defender.isBlocking) {
      // throw succeeds vs block
    }
    const mv = attacker.currentMove!;
    defender.takeDamage(mv.damage, { hitstun:22, knockbackX:8, knockbackY:-4, attacker });
    this.particles.hitSpark(defender.x, defender.y-42, attacker.def.palette.accent, true);
    audio.sfxHeavyHit();
    this.timing.triggerHitstop(8);
    this.timing.triggerShake(5);
    if(attacker===this.p1) this.stats.p1Damage+=mv.damage; else this.stats.p2Damage+=mv.damage;
    attacker.hasHitThisMove=true;
    // throw pushes
    defender.vx = attacker.facing * 8;
    defender.vy = -4;
  }

  handleKO(){
    if(this.isRoundEnding) return;
    // determine winner of round
    let winner: Fighter;
    if(this.p1.health<=0 && this.p2.health<=0){
      // tie -> less damage? give to p1 for simplicity
      winner = this.p1.health >= this.p2.health ? this.p1 : this.p2;
    } else if(this.p1.health<=0) winner=this.p2;
    else winner=this.p1;
    this.isRoundEnding=true;
    this.p1.invincible=999; this.p2.invincible=999;
    audio.sfxKO();
    this.timing.triggerShake(10);
    this.timing.triggerHitstop(14);
    const winnerName = winner.def.name;
    showKORound(this.overlay, winnerName).then(()=>{
      // award point
      if(winner===this.p1) this.score[0]++; else this.score[1]++;
      if(this.score[0]>=2 || this.score[1]>=2){
        this.endMatch();
      } else {
        // next round
        this.round++;
        this.p1.resetRound(420, 1);
        this.p2.resetRound(980, -1);
        this.projectiles=[];
        this.timer=BALANCE.roundTime;
        this.isRoundEnding=false;
        this.p1.invincible=30; this.p2.invincible=30;
        showRoundTransition(this.overlay, `Round ${this.round}`, `First to 2 — ${this.score[0]} : ${this.score[1]}`, 1000).then(()=>{
          audio.sfxRoundStart();
        });
      }
    });
  }
  handleTimeOver(){
    if(this.isRoundEnding) return;
    this.isRoundEnding=true;
    let winner: Fighter;
    if(this.p1.health > this.p2.health) winner=this.p1;
    else if(this.p2.health > this.p1.health) winner=this.p2;
    else winner=this.p1; // tie goes P1? doesn't matter
    audio.sfxKO();
    showKORound(this.overlay, `TIME — ${winner.def.name}`).then(()=>{
      if(winner===this.p1) this.score[0]++; else this.score[1]++;
      if(this.score[0]>=2 || this.score[1]>=2) this.endMatch();
      else {
        this.round++;
        this.p1.resetRound(420,1);
        this.p2.resetRound(980,-1);
        this.projectiles=[];
        this.timer=BALANCE.roundTime;
        this.isRoundEnding=false;
        showRoundTransition(this.overlay, `Round ${this.round}`, `${this.score[0]} : ${this.score[1]}`, 1000).then(()=> audio.sfxRoundStart());
      }
    });
  }
  endMatch(){
    this.isMatchOver=true;
    const p1Wins = this.score[0] > this.score[1];
    const winnerDef = p1Wins ? this.p1.def : this.p2.def;
    const loserDef = p1Wins ? this.p2.def : this.p1.def;
    // persist stats
    try{
      const key='duels_stats';
      const cur=JSON.parse(localStorage.getItem(key)||'{"w":0,"l":0}');
      if(p1Wins) cur.w++; else cur.l++;
      localStorage.setItem(key, JSON.stringify(cur));
      // session history
      const hist=JSON.parse(localStorage.getItem('duels_history')||'[]');
      hist.unshift({ date:new Date().toISOString(), p1:this.p1.def.id, p2:this.p2.def.id, score:this.score.join('-'), win:p1Wins });
      localStorage.setItem('duels_history', JSON.stringify(hist.slice(0,20)));
    }catch{}
    if(p1Wins) audio.sfxWin(); else audio.sfxLose();
    setTimeout(()=>{
      this.destroy();
      this.onMatchEnd(p1Wins?'p1':'p2', this.score, { p1Damage:this.stats.p1Damage, p2Damage:this.stats.p2Damage, maxCombo:this.stats.maxCombo });
    }, 900);
  }

  draw(){
    const ctx=this.ctx;
    const W=this.canvas.width, H=this.canvas.height;
    // clear
    ctx.clearRect(0,0,W,H);

    // camera shake is handled via camera + timing
    // we draw world with camera offset
    const camX = this.camera.x - W/2; // world X of left edge

    // stage
    this.stageRenderer.draw(ctx, camX, W, H);

    // ground line reference: world Y 0 is ground; screen Y = H*0.66 + (world Y)
    // In fighter, y is world Y (0 ground, negative air). Convert: screenY = groundTop + y
    const groundTop = H*0.66;

    // projectiles
    for(const pr of this.projectiles){
      const sx = pr.x - camX;
      const sy = groundTop + pr.y - pr.h/2; // pr.y is world? we set y as world; adjust
      // trail
      pr.trail.forEach((t,i)=>{
        const tx = t.x - camX;
        const ty = groundTop + t.y;
        ctx.globalAlpha = (i/pr.trail.length)*0.35;
        ctx.fillStyle = pr.owner.def.palette.primary;
        ctx.fillRect(tx-3, ty-3, 6,3);
      });
      ctx.globalAlpha=1;
      // glow
      ctx.fillStyle = pr.owner.def.palette.primary;
      ctx.shadowColor = pr.owner.def.palette.primary;
      ctx.shadowBlur=12;
      ctx.fillRect(sx - pr.w/2, sy, pr.w, pr.h);
      ctx.shadowBlur=0;
      // core
      ctx.fillStyle='#FFFFFF';
      ctx.fillRect(sx - pr.w/2 + 4, sy+4, pr.w-8, pr.h-8);
    }

    // fighters
    // need to translate world Y to screen: fighter y world + groundTop
    // We'll patch drawFighter to expect world Y offset? Currently drawFighter uses y as screen already. So we wrap.
    const drawWrapped = (f:Fighter)=>{
      const saveTranslate = (x:number, y:number)=>{ return { x, y: groundTop + y }; };
      // instead of calling drawFighter directly with camX, we create temporary context transform
      // We'll manually call drawFighter with adjusted y by temporarily setting f.y screen conversion inside?
      // Simpler: save ctx, translate groundTop before calling
      ctx.save();
      ctx.translate(0, groundTop);
      drawFighter(ctx, f, camX, f===this.p2);
      ctx.restore();
    };
    // draw order by x (back to front)
    const order = this.p1.x < this.p2.x ? [this.p1, this.p2] : [this.p2, this.p1];
    order.forEach(f=> drawWrapped(f));

    // particles (world space)
    ctx.save();
    ctx.translate(0, groundTop);
    this.particles.draw(ctx, camX);
    ctx.restore();

    // hitbox debug optional (off)
    // if(false){
    //   const drawBox=(a:any,color:string)=>{ const sx=a.x - camX; const sy=groundTop + a.y; ctx.strokeStyle=color; ctx.strokeRect(sx,sy,a.w,a.h); };
    //   const hb1=this.p1.getHitbox(); if(hb1) drawBox(hb1,'rgba(255,0,0,0.7)');
    //   const hb2=this.p2.getHitbox(); if(hb2) drawBox(hb2,'rgba(255,0,0,0.7)');
    //   drawBox(this.p1.getHurtbox(),'rgba(0,255,0,0.5)');
    //   drawBox(this.p2.getHurtbox(),'rgba(0,255,0,0.5)');
    // }

    // vignette
    const vig=ctx.createRadialGradient(W/2,H/2, W*0.4, W/2,H/2, W*0.9);
    vig.addColorStop(0,'transparent');
    vig.addColorStop(1,'rgba(0,0,0,0.35)');
    ctx.fillStyle=vig;
    ctx.fillRect(0,0,W,H);

    // chromatic on heavy hitstop? subtle
    if(this.timing.hitstop>0 && this.timing.hitstop%2===0){
      ctx.fillStyle='rgba(255,255,255,0.04)';
      ctx.fillRect(0,0,W,H);
    }

    // HUD is DOM overlay, but we also update via function each frame: call renderHUD
    // do it here (it manages its own DOM)
    renderHUD(this.overlay, this.p1, this.p2, this.timer, this.score, 'combo');
  }
}
