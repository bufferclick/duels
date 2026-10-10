export interface AABB { x:number; y:number; w:number; h:number; }

export function intersect(a:AABB, b:AABB) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class Hitbox implements AABB {
  constructor(public x:number, public y:number, public w:number, public h:number, public damage:number, public hitId:number) {}
  getAABB(): AABB { return { x:this.x, y:this.y, w:this.w, h:this.h }; }
}
export class Hurtbox implements AABB {
  constructor(public x:number, public y:number, public w:number, public h:number) {}
  getAABB(): AABB { return { x:this.x, y:this.y, w:this.w, h:this.h }; }
}
