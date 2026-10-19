/** S007: deterministic, world-owned routes. Models select a name, never a position. */
import { HOME_OBJECTS, LIMITS } from './world.ts';
import { isPositionLegal, type BodyState } from './simulation.ts';

export type DestinationId = 'rug' | 'table';
export interface Destination { id: DestinationId; label: string; x: number; z: number }
export interface Point { x: number; z: number }
const GRID = 0.25;
const STEP_SPEED = 1.75;
const MAX_ROUTE_STEPS = 4500;
const MAX_WALK_SECONDS = 30;
const RADIUS = 0.32;

function object(id: string) {
  const found = HOME_OBJECTS.find(o => o.id === id);
  if (!found) throw new Error('Missing immutable home geometry.');
  return found;
}
export function destination(id: string): Destination | null {
  if (id === 'rug') {
    const b = object('rug').bounds;
    return { id, label: 'Centre of the woven rug', x: (b.minX + b.maxX) / 2, z: (b.minZ + b.maxZ) / 2 };
  }
  if (id === 'table') {
    const b = object('table').bounds;
    return { id, label: 'Beside the writing table', x: b.minX - RADIUS - 0.62, z: (b.minZ + b.maxZ) / 2 };
  }
  return null;
}
export const DESTINATION_IDS: readonly DestinationId[] = Object.freeze(['rug', 'table']);
export function segmentClear(a: Point, b: Point, radius = RADIUS): boolean {
  if (!isPositionLegal(a.x, a.z, radius) || !isPositionLegal(b.x, b.z, radius)) return false;
  const n = Math.max(1, Math.ceil(Math.hypot(b.x-a.x,b.z-a.z) / 0.06));
  for (let i = 1; i < n; i++) {
    const t = i/n;
    if (!isPositionLegal(a.x + (b.x-a.x)*t, a.z + (b.z-a.z)*t, radius)) return false;
  }
  return true;
}
function nearestAnchor(p: Point): { ix: number; iz: number; point: Point } | null {
  const cx = Math.round(p.x/GRID), cz = Math.round(p.z/GRID);
  const candidates = [];
  for (let dx=-2;dx<=2;dx++) for(let dz=-2;dz<=2;dz++) {
    const point = {x:(cx+dx)*GRID,z:(cz+dz)*GRID};
    if (segmentClear(p,point)) candidates.push({ix:cx+dx,iz:cz+dz,point});
  }
  candidates.sort((a,b)=>Math.hypot(a.point.x-p.x,a.point.z-p.z)-Math.hypot(b.point.x-p.x,b.point.z-p.z));
  return candidates[0] || null;
}
const DIRECTIONS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]] as const;
function key(x:number,z:number): string { return x+','+z; }
/** Finite 8-connected graph search, checked over the same swept body geometry as manual movement. */
export function planRoute(from: Point, id: string): Point[] | null {
  const goal = destination(id);
  if (!goal || !isPositionLegal(from.x,from.z) || !isPositionLegal(goal.x,goal.z)) return null;
  const finish = {x:goal.x,z:goal.z};
  if (segmentClear(from,finish)) return [from,finish];
  const start = nearestAnchor(from), end = nearestAnchor(finish);
  if (!start || !end) return null;
  const queue = [{ix:start.ix,iz:start.iz}];
  const previous = new Map<string,string|null>([[key(start.ix,start.iz),null]]);
  const target = key(end.ix,end.iz);
  let cursor=0;
  while (cursor < queue.length && cursor < MAX_ROUTE_STEPS) {
    const node=queue[cursor++];
    if(key(node.ix,node.iz)===target) break;
    for(const [dx,dz] of DIRECTIONS) {
      const ix=node.ix+dx, iz=node.iz+dz, k=key(ix,iz);
      if(previous.has(k) || ix*GRID < LIMITS.minX || ix*GRID > LIMITS.maxX ||
         iz*GRID < LIMITS.minZ || iz*GRID > LIMITS.maxZ) continue;
      const a={x:node.ix*GRID,z:node.iz*GRID}, b={x:ix*GRID,z:iz*GRID};
      if(!segmentClear(a,b)) continue; // Also rejects diagonal corner cutting.
      previous.set(k,key(node.ix,node.iz)); queue.push({ix,iz});
    }
  }
  if (!previous.has(target)) return null;
  const path: Point[]=[];
  let current: string|null=target;
  while (current!==null) {
    const [x,z]=current.split(',').map(Number);
    path.push({x:x*GRID,z:z*GRID});
    current=previous.get(current) ?? null;
  }
  path.reverse();
  const full=[from,...path,finish];
  const simplified: Point[]=[from];
  for(let i=0;i<full.length-1;) {
    let j=full.length-1;
    while(j>i+1 && !segmentClear(full[i],full[j])) j--;
    if(!segmentClear(full[i],full[j])) return null;
    simplified.push(full[j]); i=j;
  }
  return simplified;
}
export function reachableDestinations(from: Point): Destination[] {
  return DESTINATION_IDS.map(destination).filter((d):d is Destination=>d!==null)
    .filter(d=>planRoute(from,d.id)!==null);
}
export type WalkResult = 'MOVING' | 'ARRIVED' | 'BLOCKED';
export class NavigationRunner {
  private waypoints: Point[] | null=null;
  private next=0;
  private elapsed=0;
  private target: DestinationId | null=null;
  constructor(private readonly body: BodyState) {}
  get active(): boolean { return this.waypoints!==null; }
  start(id: string): boolean {
    this.cancel();
    const route=planRoute(this.body,id);
    if (!route || !destination(id)) return false;
    this.waypoints=route; this.next=1; this.elapsed=0; this.target=id as DestinationId;
    return true;
  }
  cancel():void {
    this.waypoints=null; this.next=0; this.target=null;
    this.body.vx=0; this.body.vz=0; this.body.action='IDLE';
  }
  step(rawDt:number): WalkResult {
    if (!this.waypoints || !this.target || !destination(this.target)) return 'BLOCKED';
    const dt=Number.isFinite(rawDt) ? Math.max(0,Math.min(0.05,rawDt)) : 0;
    this.elapsed+=dt;
    if (this.elapsed>MAX_WALK_SECONDS || !isPositionLegal(this.body.x,this.body.z,this.body.radius)) {
      this.cancel(); return 'BLOCKED';
    }
    if (!dt) return 'MOVING';
    const point=this.waypoints[this.next];
    if (!point) { this.cancel(); return 'ARRIVED'; }
    const dx=point.x-this.body.x,dz=point.z-this.body.z,dist=Math.hypot(dx,dz);
    if(dist<=0.025) {
      this.next++;
      if(this.next>=this.waypoints.length) { this.cancel(); return 'ARRIVED'; }
      return 'MOVING';
    }
    const distance=Math.min(STEP_SPEED*dt,dist);
    const newPosition={x:this.body.x+dx/dist*distance,z:this.body.z+dz/dist*distance};
    if(!segmentClear({x:this.body.x,z:this.body.z},newPosition,this.body.radius)) {
      this.cancel(); return 'BLOCKED';
    }
    this.body.vx=(newPosition.x-this.body.x)/dt;
    this.body.vz=(newPosition.z-this.body.z)/dt;
    this.body.x=newPosition.x; this.body.z=newPosition.z;
    const targetYaw=Math.atan2(this.body.vx,-this.body.vz);
    const delta=Math.atan2(Math.sin(targetYaw-this.body.yaw),Math.cos(targetYaw-this.body.yaw));
    this.body.yaw+=delta*(1-Math.exp(-11*dt));
    this.body.action='WALK';
    if(distance===dist && this.next===this.waypoints.length-1) {
      this.cancel(); return 'ARRIVED';
    }
    if(distance===dist) this.next++;
    return 'MOVING';
  }
}
