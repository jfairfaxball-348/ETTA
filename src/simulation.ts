/** World-owned deterministic avatar physics — no renderer or LLM dependency. */
import { HOME_OBJECTS, LIMITS, type Bounds } from './world.ts';
export interface BodyState {
  x: number; z: number; vx: number; vz: number; yaw: number;
  radius: number; grounded: boolean; action: 'IDLE'|'WALK'|'RUN';
}
export interface ManualIntent { side: number; forward: number; run: boolean }
const WALK_SPEED=2.5, RUN_SPEED=4.4, ACCELERATION=13;
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const COLLIDERS=HOME_OBJECTS.filter(o=>o.solid);
function overlaps(x:number,z:number,radius:number,o:Bounds): boolean {
  return x>o.minX-radius && x<o.maxX+radius && z>o.minZ-radius && z<o.maxZ+radius;
}
export function isPositionLegal(x:number,z:number,radius=0.32):boolean {
  if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(radius) || radius<0) return false;
  if (x<LIMITS.minX+radius || x>LIMITS.maxX-radius || z<LIMITS.minZ+radius || z>LIMITS.maxZ-radius) return false;
  // Outside the open door Etta may only walk on the narrow porch, not in empty space.
  if (z > 5.05 && Math.abs(x) > 1.5-radius) return false;
  return !COLLIDERS.some(o=>overlaps(x,z,radius,o.bounds));
}
export function spawnBody():BodyState {
  return {x:0,z:3.40,vx:0,vz:0,yaw:0,radius:0.32,grounded:true,action:'IDLE'};
}
export function resetBody(body:BodyState):void { Object.assign(body,spawnBody()); }
/** Resolve X and Z separately for slides. Max 50ms movement cannot tunnel through a wall+avatar radius. */
export function stepBody(body:BodyState,intent:ManualIntent,cameraYaw:number,rawDt:number):void {
  const dt=clamp(Number.isFinite(rawDt)?rawDt:0,0,0.05);
  if (!dt) return;
  let side=clamp(Number.isFinite(intent.side)?intent.side:0,-1,1);
  let forward=clamp(Number.isFinite(intent.forward)?intent.forward:0,-1,1);
  const length=Math.hypot(side,forward);
  if(length>1){side/=length;forward/=length;}
  const yaw=Number.isFinite(cameraYaw)?cameraYaw:0;
  const dx=side*Math.cos(yaw)-forward*Math.sin(yaw);
  const dz=-side*Math.sin(yaw)-forward*Math.cos(yaw);
  const speed=intent.run?RUN_SPEED:WALK_SPEED;
  const blend=1-Math.exp(-ACCELERATION*dt);
  body.vx+=(dx*speed-body.vx)*blend;
  body.vz+=(dz*speed-body.vz)*blend;
  const nx=clamp(body.x+body.vx*dt,LIMITS.minX+body.radius,LIMITS.maxX-body.radius);
  if(isPositionLegal(nx,body.z,body.radius)) body.x=nx; else body.vx=0;
  const nz=clamp(body.z+body.vz*dt,LIMITS.minZ+body.radius,LIMITS.maxZ-body.radius);
  if(isPositionLegal(body.x,nz,body.radius)) body.z=nz; else body.vz=0;
  const motion=Math.hypot(body.vx,body.vz);
  if(motion>0.06){
    const target=Math.atan2(body.vx,-body.vz);
    const delta=Math.atan2(Math.sin(target-body.yaw),Math.cos(target-body.yaw));
    body.yaw+=delta*(1-Math.exp(-11*dt));
  }
  body.grounded=true;
  body.action=motion<0.08?'IDLE':intent.run&&length>0?'RUN':'WALK';
}
