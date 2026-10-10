export type State<T extends string> = T;
export class StateMachine<T extends string> {
  private current: T;
  private transitions = new Map<T, Set<T>>();
  constructor(initial: T) { this.current = initial; }
  canTransition(to: T) { return this.transitions.get(this.current)?.has(to) ?? false; }
  addTransition(from: T, to: T) {
    if(!this.transitions.has(from)) this.transitions.set(from, new Set());
    this.transitions.get(from)!.add(to);
  }
  transition(to: T) {
    if(this.canTransition(to)) { this.current = to; return true; }
    return false;
  }
  get state() { return this.current; }
}
