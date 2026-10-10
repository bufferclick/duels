// Procedural synthesis engine using Web Audio API
export class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  sfxGain: GainNode | null = null;
  musicGain: GainNode | null = null;
  enabled = true;
  volumes = { master: 0.85, sfx: 0.9, music: 0.55 };

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.musicGain.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.updateGains();
      // create subtle reverb
      this.createReverb();
    } catch { this.enabled=false; }
  }
  updateGains() {
    if (!this.master || !this.sfxGain || !this.musicGain) return;
    this.master.gain.value = this.volumes.master;
    this.sfxGain.gain.value = this.volumes.sfx;
    this.musicGain.gain.value = this.volumes.music;
  }
  setVolume(cat: 'master'|'sfx'|'music', v:number) {
    (this.volumes as any)[cat]=v;
    this.updateGains();
    try { localStorage.setItem('duels_vol_'+cat, String(v)); } catch {}
  }
  loadPersisted() {
    try {
      (['master','sfx','music'] as const).forEach(cat=>{
        const s = localStorage.getItem('duels_vol_'+cat);
        if (s!==null) (this.volumes as any)[cat]=parseFloat(s);
      });
      this.updateGains();
    } catch {}
  }

  private convolver: ConvolverNode | null = null;
  private createReverb() {
    if (!this.ctx) return;
    const len = this.ctx.sampleRate * 1.2;
    const imp = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for(let ch=0; ch<2; ch++){
      const d = imp.getChannelData(ch);
      for(let i=0;i<len;i++){
        d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.2) * 0.35;
      }
    }
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = imp;
  }

  private ensure() {
    this.init();
    if (this.ctx?.state==='suspended') this.ctx.resume();
    return !!this.ctx;
  }

  // helpers
  env(gain:GainNode, t:number, a:{a:number,d:number,s:number,r:number, peak:number}) {
    const now = this.ctx!.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(a.peak, now + a.a);
    gain.gain.linearRampToValueAtTime(a.s, now + a.a + a.d);
    gain.gain.linearRampToValueAtTime(0, now + a.a + a.d + a.r);
  }
  noiseBuffer(duration:number) {
    const len = (this.ctx!.sampleRate * duration)|0;
    const buf = this.ctx!.createBuffer(1,len,this.ctx!.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    return buf;
  }

  playTone(freq:number, type:OscillatorType, dur:number, gainPeak:number, opts:{filterFreq?:number; slideTo?:number}={}) {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    osc.type=type; osc.frequency.value=freq;
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, this.ctx.currentTime + dur*0.7);
    if (opts.filterFreq) { f.type='lowpass'; f.frequency.value=opts.filterFreq; osc.connect(f); f.connect(g); } else osc.connect(g);
    g.connect(this.sfxGain!);
    g.gain.value=0;
    this.env(g, this.ctx.currentTime, {a:0.005,d:0.06,s:gainPeak*0.35,r:dur,peak:gainPeak});
    osc.start(); osc.stop(this.ctx.currentTime+dur+0.05);
  }
  playNoise(dur:number, gainPeak:number, filterFreq=2200, hp=false) {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer(dur+0.1);
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    f.type = hp? 'highpass':'bandpass';
    f.frequency.value = filterFreq;
    f.Q.value=0.9;
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    g.gain.value=0;
    this.env(g, this.ctx.currentTime, {a:0.002,d:0.02,s:gainPeak*0.18,r:dur*0.5,peak:gainPeak});
    src.start(); src.stop(this.ctx.currentTime+dur+0.12);
  }

  // Designed sounds
  sfxLightHit() {
    this.playTone(880,'square',0.08,0.22,{filterFreq:3200});
    this.playNoise(0.06,0.18,4200);
    this.playTone(140,'sine',0.09,0.5,{slideTo:70});
  }
  sfxHeavyHit() {
    this.playTone(520,'square',0.13,0.28,{filterFreq:2400});
    this.playTone(90,'sine',0.2,0.7,{slideTo:38});
    this.playNoise(0.12,0.28,1800);
    // sub thump
    this.playTone(48,'sine',0.22,0.9);
  }
  sfxBlock() {
    this.playNoise(0.07,0.16,1200,true);
    this.playTone(320,'triangle',0.08,0.18);
  }
  sfxDash() {
    this.playNoise(0.14,0.14,2600,true);
    this.playTone(600,'sawtooth',0.12,0.12,{filterFreq:1800, slideTo:220});
  }
  sfxJump() {
    this.playTone(320,'sine',0.12,0.2,{slideTo:560});
    this.playNoise(0.05,0.06,3400,true);
  }
  sfxSpecialCharge() {
    this.playTone(220,'sawtooth',0.22,0.18,{slideTo:480, filterFreq:2000});
    this.playNoise(0.18,0.10,3000);
  }
  sfxProjectile() {
    this.playTone(740,'square',0.10,0.18,{slideTo:380, filterFreq:2800});
    this.playNoise(0.06,0.14,5200,true);
  }
  sfxUltimateTrigger() {
    // swell
    if (!this.ensure() || !this.ctx || !this.sfxGain) return;
    const now=this.ctx.currentTime;
    // layered rise
    for(let i=0;i<3;i++){
      const o=this.ctx.createOscillator();
      const g=this.ctx.createGain();
      const f=this.ctx.createBiquadFilter();
      o.type='sawtooth'; o.frequency.value=110 + i*55;
      o.frequency.exponentialRampToValueAtTime(220 + i*90, now+0.45);
      f.type='lowpass'; f.frequency.value=1800; f.Q.value=1;
      o.connect(f); f.connect(g); g.connect(this.sfxGain);
      g.gain.value=0;
      g.gain.linearRampToValueAtTime(0.14, now+0.06);
      g.gain.linearRampToValueAtTime(0.08, now+0.32);
      g.gain.linearRampToValueAtTime(0, now+0.6);
      o.start(now); o.stop(now+0.65);
    }
    // hit at 0.5
    setTimeout(()=> this.sfxHeavyHit(), 480);
    setTimeout(()=> { this.playTone(62,'sine',0.5,0.9); this.playNoise(0.2,0.22,1600); }, 500);
  }
  sfxKO() {
    this.playTone(110,'sine',0.6,0.8,{slideTo:28});
    this.playNoise(0.32,0.24,900);
    setTimeout(()=> this.playTone(180,'square',0.22,0.18,{filterFreq:1200, slideTo:90}), 120);
  }
  sfxRoundStart() {
    this.playTone(520,'square',0.14,0.22,{filterFreq:2600});
    setTimeout(()=> this.playTone(660,'square',0.14,0.22,{filterFreq:2600}), 140);
    setTimeout(()=> this.playTone(880,'square',0.22,0.28,{filterFreq:3200}), 280);
  }
  sfxWin() {
    const seq=[0,4,7,12];
    seq.forEach((semi,i)=>{
      setTimeout(()=>{
        const f=440*Math.pow(2,semi/12);
        this.playTone(f,'triangle',0.24,0.22);
        this.playTone(f*2,'sine',0.18,0.12);
      }, i*110);
    });
  }
  sfxLose() {
    [0,-2,-5].forEach((semi,i)=>{
      setTimeout(()=> this.playTone(330*Math.pow(2,semi/12),'triangle',0.32,0.18), i*150);
    });
  }
  sfxMenuMove() { this.playTone(820,'sine',0.07,0.10); }
  sfxMenuConfirm() { this.playTone(660,'square',0.09,0.16,{filterFreq:2400}); setTimeout(()=>this.playTone(880,'square',0.07,0.14),70); }
  sfxMenuBack() { this.playTone(360,'triangle',0.10,0.14,{slideTo:260}); }
  sfxMenuError() { this.playTone(160,'sawtooth',0.16,0.14,{filterFreq:900}); }
  sfxHitConfirm() { this.playTone(1200,'sine',0.06,0.12); }

  // ambient loops - simple drone per stage stored as oscillator
  private ambientNodes: {osc?:OscillatorNode, gain?:GainNode, noise?:AudioBufferSourceNode}[] = [];
  startAmbience(stageId:string) {
    this.stopAmbience();
    if (!this.ensure() || !this.ctx || !this.musicGain) return;
    if (this.volumes.music < 0.02) return;
    const ctx=this.ctx;
    if (stageId==='rooftop') {
      // rain noise + distant pad
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(2);
      src.loop=true;
      const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1400; f.Q.value=0.7;
      const g = ctx.createGain(); g.gain.value=0.045;
      src.connect(f); f.connect(g); g.connect(this.musicGain);
      src.start();
      this.ambientNodes.push({noise:src,gain:g} as any);
      // pad
      const o=ctx.createOscillator(); const og=ctx.createGain(); const of=ctx.createBiquadFilter();
      o.type='triangle'; o.frequency.value=55; of.type='lowpass'; of.frequency.value=900;
      o.connect(of); of.connect(og); og.connect(this.musicGain); og.gain.value=0.035;
      o.start(); this.ambientNodes.push({osc:o,gain:og} as any);
    } else if (stageId==='warehouse') {
      const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sawtooth'; o.frequency.value=42;
      const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=500; f.Q.value=4;
      o.connect(f); f.connect(g); g.connect(this.musicGain); g.gain.value=0.028; o.start(); this.ambientNodes.push({osc:o,gain:g} as any);
      // wind noise
      const src=ctx.createBufferSource(); src.buffer=this.noiseBuffer(2.5); src.loop=true;
      const nf=ctx.createBiquadFilter(); nf.type='highpass'; nf.frequency.value=800;
      const ng=ctx.createGain(); ng.gain.value=0.022;
      src.connect(nf); nf.connect(ng); ng.connect(this.musicGain); src.start(); this.ambientNodes.push({noise:src,gain:ng} as any);
    } else if (stageId==='desert') {
      const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.value=38;
      o.connect(g); g.connect(this.musicGain); g.gain.value=0.03; o.start(); this.ambientNodes.push({osc:o,gain:g} as any);
      const o2=ctx.createOscillator(); const g2=ctx.createGain(); o2.type='triangle'; o2.frequency.value=110;
      const f2=ctx.createBiquadFilter(); f2.type='bandpass'; f2.frequency.value=1100; f2.Q.value=2;
      o2.connect(f2); f2.connect(g2); g2.connect(this.musicGain); g2.gain.value=0.015; o2.start(); this.ambientNodes.push({osc:o2,gain:g2} as any);
    }
  }
  stopAmbience() {
    for(const n of this.ambientNodes){
      try{ n.osc?.stop(); }catch{}
      try{ (n.noise as any)?.stop?.(); }catch{}
      try{ n.gain?.disconnect(); }catch{}
    }
    this.ambientNodes=[];
  }
}

export const audio = new AudioEngine();
