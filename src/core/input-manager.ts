export type Action = 'left'|'right'|'up'|'down'|'light'|'heavy'|'special1'|'special2'|'ultimate'|'dash'|'block';
export type InputEvent = { action: Action; pressed: boolean; frame: number };

export class InputManager {
  keys = new Set<string>();
  padIndex: number | null = null;
  buffer: InputEvent[] = [];
  frame = 0;
  keyMap: Record<string, Action> = {
    'a': 'left', 'arrowleft': 'left',
    'd': 'right', 'arrowright': 'right',
    'w': 'up', 'arrowup': 'up',
    's': 'down', 'arrowdown': 'down',
    'j': 'light', 'z': 'light',
    'k': 'heavy', 'x': 'heavy',
    'q': 'special1',
    'e': 'special2',
    'r': 'ultimate',
    'shift': 'dash', ' ': 'dash',
  };
  held: Record<Action, boolean> = {
    left:false,right:false,up:false,down:false,light:false,heavy:false,special1:false,special2:false,ultimate:false,dash:false,block:false
  };
  pressedThisFrame = new Set<Action>();
  bufferFrames = 8;

  constructor() {
    window.addEventListener('keydown', e => this.onKey(e, true));
    window.addEventListener('keyup', e => this.onKey(e, false));
    window.addEventListener('blur', () => this.keys.clear());
  }
  onKey(e: KeyboardEvent, down: boolean) {
    const k = e.key.toLowerCase();
    if (down) this.keys.add(k);
    else this.keys.delete(k);
    const act = this.keyMap[k];
    if (act) {
      if (down && !this.held[act]) {
        this.pressedThisFrame.add(act);
        this.buffer.push({ action: act, pressed: true, frame: this.frame });
      }
      if (!down) {
        this.held[act] = false;
        this.buffer.push({ action: act, pressed: false, frame: this.frame });
      } else {
        this.held[act] = true;
      }
      if ([' ', 'arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
    }
    // block is holding back relative to facing handled in fighter
  }
  update() {
    this.frame++;
    this.pressedThisFrame.clear();
    // gamepad poll
    const pads = navigator.getGamepads?.() || [];
    for (const pad of pads) {
      if (!pad) continue;
      // simple mapping: dpad + buttons
      const btnMap: Action[] = ['light','heavy','special1','special2','ultimate','dash'];
      pad.buttons.forEach((b,i) => {
        const act = btnMap[i];
        if (!act) return;
        const pressed = b.pressed;
        if (pressed && !this.held[act]) {
          this.pressedThisFrame.add(act);
          this.buffer.push({ action: act, pressed:true, frame:this.frame });
        }
        this.held[act] = pressed;
      });
      const ax0 = pad.axes[0] || 0;
      this.held.left = ax0 < -0.4 || pad.buttons[14]?.pressed;
      this.held.right = ax0 > 0.4 || pad.buttons[15]?.pressed;
      this.held.up = pad.axes[1] < -0.6;
      this.held.down = pad.axes[1] > 0.6;
    }
    // trim buffer
    this.buffer = this.buffer.filter(ev => this.frame - ev.frame <= this.bufferFrames + 6);
  }
  isHeld(a: Action) { return !!this.held[a]; }
  wasPressed(a: Action) { return this.pressedThisFrame.has(a); }
  consume(a: Action) {
    // remove earliest buffered press of action within window
    const idx = this.buffer.findIndex(ev => ev.action===a && ev.pressed && this.frame - ev.frame <= this.bufferFrames);
    if (idx>=0) { this.buffer.splice(idx,1); return true; }
    return false;
  }
  getAxis(): number {
    let v = 0;
    if (this.held.left) v -= 1;
    if (this.held.right) v += 1;
    return v;
  }
  reset() { this.buffer=[]; this.pressedThisFrame.clear(); }
}
