import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_OBJECTS, LIMITS, DOORWAY, createWorld, resetWorld, interact, nearbyObject, distanceToObject } from '../src/world.ts';
import {isPositionLegal,spawnBody,resetBody,stepBody} from '../src/simulation.ts';
const idle={side:0,forward:0,run:false};
function run(body,input,yaw=0,n=120,dt=1/60){for(let i=0;i<n;i++)stepBody(body,input,yaw,dt);}
test('room has stable IDs, recognisable furniture, and an open doorway',()=>{
  assert.equal(new Set(HOME_OBJECTS.map(o=>o.id)).size,HOME_OBJECTS.length);
  for(const kind of ['floor','wall','threshold','bed','table','chair','lamp'])
    assert.ok(HOME_OBJECTS.some(o=>o.kind===kind),kind);
  for(const o of HOME_OBJECTS){assert.ok(o.bounds.minX<o.bounds.maxX&&o.bounds.minZ<o.bounds.maxZ,o.id);assert.ok(o.height>0,o.id);}
  assert.equal(HOME_OBJECTS.find(o=>o.id==='doorway').solid,false);
  assert.ok(DOORWAY.minX<0&&DOORWAY.maxX>0);
});
test('legal indoor spawn, non-tunnelling furniture and physical walls',()=>{
 const b=spawnBody();assert.ok(isPositionLegal(b.x,b.z,b.radius));
 for(const id of ['bed','table','chair','lamp','cabinet','plant']){
   const box=HOME_OBJECTS.find(o=>o.id===id).bounds;
   assert.equal(isPositionLegal((box.minX+box.maxX)/2,(box.minZ+box.maxZ)/2),false,id);
 }
 const bed=HOME_OBJECTS.find(o=>o.id==='bed').bounds;
 const avatar=spawnBody();avatar.x=bed.maxX+avatar.radius+0.15;avatar.z=(bed.minZ+bed.maxZ)/2;
 run(avatar,{...idle,side:-1,run:true},0,220);
 assert.ok(avatar.x>=bed.maxX+avatar.radius-1e-6);
 assert.ok(isPositionLegal(avatar.x,avatar.z));
 for(let i=0;i<2500;i++)stepBody(b,{...idle,forward:1,run:true},0,1/60);
 assert.ok(isPositionLegal(b.x,b.z,b.radius));
 assert.ok(b.z>LIMITS.minZ);
});
test('door passage is physical, porch is limited, re-entry works',()=>{
 const b=spawnBody();
 run(b,{...idle,forward:-1},0,125);
 assert.ok(b.z>DOORWAY.z+0.45,'did not leave through door: '+b.z);
 assert.ok(isPositionLegal(b.x,b.z,b.radius));
 assert.ok(!isPositionLegal(2.1,5.12));
 assert.ok(!isPositionLegal(2.1,6.3));
 assert.ok(isPositionLegal(0,6.3));
 run(b,{...idle,forward:1},0,130);
 assert.ok(b.z<DOORWAY.z-0.3,'did not return inside: '+b.z);
});
test('affordances from world distance, lamp is manual and resettable',()=>{
 const w=createWorld(),p=spawnBody(),n=nearbyObject(w,p.x,p.z);
 assert.equal(n?.object.id,'lamp');
 assert.ok(n.distance<=1.65);
 assert.equal(w.lampOn,true);
 assert.ok(interact(w,p.x,p.z,'lamp'));assert.equal(w.lampOn,false);
 assert.equal(interact(w,p.x,p.z,'chair'),false);
 assert.equal(interact(w,4,0,'lamp'),false);
 assert.equal(w.lampOn,false);
 assert.ok(distanceToObject(4,0,n.object)>1.65);
 resetWorld(w);assert.equal(w.lampOn,true);
 const q=nearbyObject(w,p.x,p.z);
 assert.deepEqual(q,n);
});
test('body and home reset and replay deterministically',()=>{
 const w=createWorld(),a=spawnBody(),b=spawnBody();
 interact(w,a.x,a.z,'lamp');
 for(let i=0;i<240;i++) {
   const input=i<110?{...idle,forward:1}:i<170?{...idle,side:1}:{...idle,forward:-1};
   stepBody(a,input,0,i%3===0?0.017:0.016);
   stepBody(b,input,0,i%3===0?0.017:0.016);
 }
 assert.deepEqual(a,b);
 resetBody(a);resetWorld(w);
 assert.deepEqual(a,spawnBody());assert.equal(w.lampOn,true);
});
test('camera-relative walk/run and key release remain deterministic',()=>{
 const w=spawnBody(),s=spawnBody(),r=spawnBody();
 run(w,{...idle,forward:1},0,35);
 run(s,{...idle,forward:1},Math.PI/2,35);
 run(r,{...idle,forward:1,run:true},0,35);
 assert.ok(w.z<s.z-0.5);assert.ok(s.x<-0.5);
 assert.ok(r.z<w.z-0.4);
 run(w,idle,0,100);
 assert.equal(w.action,'IDLE');assert.ok(Math.hypot(w.vx,w.vz)<0.001);
});
