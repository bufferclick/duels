import './styles/global.css';
import './styles/main-menu.css';
import './styles/character-select.css';
import './styles/hud.css';
import { renderMainMenu } from './ui/main-menu';
import { renderCharacterSelect } from './ui/character-select';
import { renderStageSelect } from './ui/stage-select';
import { renderResults } from './ui/results-screen';
import { renderSettings } from './ui/settings-menu';
import { Battle } from './core/battle';
import { audio } from './audio/audio-engine';
import { STAGES } from './data/stages';
import type { Difficulty } from './data/balance-constants';
import { getFighterDef } from './data/characters';

type Screen = 'menu'|'charSelect'|'stageSelect'|'battle'|'results';

class App {
  root: HTMLElement;
  difficulty: Difficulty = (localStorage.getItem('duels_difficulty') as Difficulty) || 'veteran';
  playerPick: string | null = null;
  cpuPick: string | null = null;
  stagePick: string = STAGES[0].id;
  mode: 'arcade'|'training' = 'arcade';
  battle: Battle | null = null;
  cleanupMenuBg: (()=>void) | null = null;

  constructor() {
    this.root = document.getElementById('app')!;
    // ensure container fills
    this.root.style.position='relative';
    this.root.style.width='100vw';
    this.root.style.height='100vh';
    this.root.style.overflow='hidden';
    audio.loadPersisted();
    this.showMenu();
    // global audio unlock on first interaction
    window.addEventListener('pointerdown', ()=> audio.init(), { once:true });
    window.addEventListener('keydown', ()=> audio.init(), { once:true });
  }

  clear() {
    if(this.cleanupMenuBg) { try{ this.cleanupMenuBg(); }catch{} this.cleanupMenuBg=null; }
    if(this.battle){ this.battle.destroy(); this.battle=null; }
    this.root.innerHTML='';
  }

  showMenu() {
    this.clear();
    const container=document.createElement('div');
    container.style.cssText='position:absolute; inset:0;';
    this.root.appendChild(container);
    const cleanup = renderMainMenu(container, {
      difficulty: this.difficulty,
      onAction: (a)=>{
        if(a==='arcade'){ this.mode='arcade'; this.showCharacterSelect(); }
        else if(a==='training'){ this.mode='training'; this.showCharacterSelect(); }
        else if(a==='settings'){ this.showSettings(); }
      },
      onDifficulty: (d)=>{
        this.difficulty=d;
        localStorage.setItem('duels_difficulty', d);
      },
      onSettings: ()=> this.showSettings()
    });
    this.cleanupMenuBg = cleanup;
  }

  showSettings() {
    const overlay=document.createElement('div');
    overlay.style.cssText='position:absolute; inset:0; z-index:30;';
    this.root.appendChild(overlay);
    renderSettings(overlay, ()=>{
      overlay.remove();
    });
  }

  showCharacterSelect() {
    this.clear();
    const container=document.createElement('div');
    container.style.cssText='position:absolute; inset:0;';
    this.root.appendChild(container);
    renderCharacterSelect(container, {
      onConfirm: (p,c)=>{
        this.playerPick=p; this.cpuPick=c;
        this.showStageSelect();
      },
      onBack: ()=> this.showMenu()
    });
  }

  showStageSelect() {
    this.clear();
    const container=document.createElement('div');
    container.style.cssText='position:absolute; inset:0;';
    this.root.appendChild(container);
    renderStageSelect(container, {
      onPick: (id)=>{
        this.stagePick=id;
        this.startBattle();
      },
      onBack: ()=> this.showCharacterSelect()
    });
  }

  startBattle() {
    if(!this.playerPick || !this.cpuPick) return;
    this.clear();
    const wrapper=document.createElement('div');
    wrapper.style.cssText='position:absolute; inset:0; background:#09090E; display:flex; flex-direction:column;';
    // battle container
    const battleContainer=document.createElement('div');
    battleContainer.style.cssText='flex:1; position:relative; overflow:hidden; background:#09090E;';
    wrapper.appendChild(battleContainer);
    this.root.appendChild(wrapper);

    // top border accent
    const accent=document.createElement('div');
    accent.style.cssText='height:2px; background: linear-gradient(90deg, var(--blood), var(--devil-violet), var(--cyber-amber));';
    wrapper.prepend(accent);

    // exit handler
    const onExit = ()=> this.showMenu();
    const onMatchEnd = (winner:'p1'|'p2', score:[number,number], stats:{p1Damage:number,p2Damage:number,maxCombo:number})=>{
      this.showResults(winner, score, stats);
    };

    this.battle = new Battle({
      playerId: this.playerPick,
      cpuId: this.cpuPick,
      stageId: this.stagePick,
      difficulty: this.difficulty,
      isTraining: this.mode==='training',
      container: battleContainer,
      onMatchEnd,
      onExit
    });

    // pause button overlay (top right)
    const pauseBtn=document.createElement('button');
    pauseBtn.className='btn-icon';
    pauseBtn.style.cssText='position:absolute; top:12px; right:12px; z-index:12; pointer-events:auto;';
    pauseBtn.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>`;
    pauseBtn.title='Pause (ESC)';
    pauseBtn.addEventListener('click', ()=> this.battle?.togglePause());
    wrapper.appendChild(pauseBtn);

    // training exit button
    if(this.mode==='training'){
      const exitBtn=document.createElement('button');
      exitBtn.className='btn-ghost';
      exitBtn.style.cssText='position:absolute; top:12px; left:12px; z-index:12; pointer-events:auto;';
      exitBtn.textContent='Exit Lab — ESC';
      exitBtn.addEventListener('click', ()=> { this.battle?.destroy(); this.showMenu(); });
      wrapper.appendChild(exitBtn);
    }
  }

  showResults(winner:'p1'|'p2', score:[number,number], stats:{p1Damage:number,p2Damage:number,maxCombo:number}) {
    this.clear();
    const container=document.createElement('div');
    container.style.cssText='position:absolute; inset:0;';
    this.root.appendChild(container);
    const winnerIsPlayer = winner==='p1';
    const winnerDef = getFighterDef(winnerIsPlayer ? this.playerPick! : this.cpuPick!);
    const loserDef = getFighterDef(winnerIsPlayer ? this.cpuPick! : this.playerPick!);
    renderResults(container, {
      winner: winnerDef,
      loser: loserDef,
      score,
      isPlayerWin: winnerIsPlayer,
      stats: { p1DamageDealt: stats.p1Damage, p2DamageDealt: stats.p2Damage, maxCombo: stats.maxCombo },
      onMenu: ()=> this.showMenu(),
      onRematch: ()=> {
        // swap? keep same picks but reset
        this.startBattle();
      }
    });
  }
}

new App();
