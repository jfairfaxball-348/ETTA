import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnBody, isPositionLegal, stepBody } from '../src/simulation.ts';
import { destination, segmentClear, planRoute, reachableDestinations, NavigationRunner } from '../src/navigation.ts';
import { createWorld } from '../src/world.ts';
import { snapshot, observe, parseProposal } from '../src/mind/protocol.ts';
import { MindController } from '../src/mind/controller.ts';

test('named destinations derive from immutable home geometry and are reachable from spawn', () => {
  const origin=spawnBody();
  const options=reachableDestinations(origin);
  assert.deepEqual(options.map(o=>o.id), ['rug','table']);
  for(const option of options) {
    assert.equal(isPositionLegal(option.x,option.z),true,option.id);
    const route=planRoute(origin,option.id);
    assert.ok(route && route.length >= 2);
    assert.deepEqual(route.at(-1), {x:option.x,z:option.z});
    for(let i=1;i<route.length;i++) assert.ok(segmentClear(route[i-1],route[i]),option.id);
  }
});
test('routing finds a collision-free detour around the solid writing table', () => {
  const from={x:4,z:-4.4}, goal=destination('rug');
  assert.ok(isPositionLegal(from.x,from.z));
  assert.equal(segmentClear(from,goal),false);
  const path=planRoute(from,'rug');
  assert.ok(path && path.length>2,'The route must bend around the table');
  for(let i=1;i<path.length;i++) assert.ok(segmentClear(path[i-1],path[i]));
});
test('unreachable, forged and invalid destinations fail closed', () => {
  assert.equal(destination('garden'),null);
  assert.equal(planRoute(spawnBody(),'garden'),null);
  assert.equal(planRoute({x:-4,z:-2},'rug'),null);
  assert.equal(planRoute({x:Infinity,z:0},'table'),null);
  const observation=observe(snapshot(spawnBody(),createWorld()));
  assert.deepEqual(observation.destinations.map(d=>d.id), ['rug','table']);
  assert.ok(observation.validActions.some(a=>a.type==='MOVE_TO' && a.targetId==='rug'));
  assert.ok(observation.validActions.some(a=>a.type==='MOVE_TO' && a.targetId==='table'));
  for(const bad of [
    {type:'MOVE_TO',targetId:'garden'},
    {type:'MOVE_TO',targetId:'rug',x:50},
    {type:'MOVE_TO',targetId:'table',path:[{x:0,z:0}]},
    {type:'TELEPORT',targetId:'rug'},
    {type:'TOGGLE_LAMP',targetId:'table'}
  ]) assert.throws(()=>parseProposal({action:bad,reason:'fixture'},snapshot(spawnBody(),createWorld())));
});
test('world-owned walk makes bounded visible movement and a real legal arrival', () => {
  const body=spawnBody(), navigation=new NavigationRunner(body);
  assert.equal(navigation.start('table'),true);
  let frames=0, translated=false, turned=false, result='MOVING';
  while(result==='MOVING' && frames++<2000) {
    const before={x:body.x,z:body.z,yaw:body.yaw};
    result=navigation.step(0.02);
    assert.ok(isPositionLegal(body.x,body.z,body.radius),'Cannot clip a collider');
    assert.ok(Math.hypot(body.x-before.x,body.z-before.z)<=1.75*0.02+1e-8);
    if(body.x!==before.x || body.z!==before.z) translated=true;
    if(body.yaw!==before.yaw) turned=true;
  }
  assert.equal(result,'ARRIVED'); assert.ok(frames>20 && frames<1500);
  assert.ok(translated && turned); assert.equal(navigation.active,false);
  assert.ok(Math.hypot(body.x-destination('table').x,body.z-destination('table').z)<0.03);
  assert.equal(body.action,'IDLE');
});
test('cancel and manual override stop walking without snapping to destination', () => {
  const body=spawnBody(), nav=new NavigationRunner(body);
  assert.ok(nav.start('rug'));
  for(let i=0;i<10;i++) nav.step(0.02);
  const paused={x:body.x,z:body.z};
  nav.cancel(); assert.equal(nav.active,false);
  assert.equal(body.action,'IDLE'); assert.equal(body.vx,0); assert.equal(body.vz,0);
  assert.deepEqual({x:body.x,z:body.z},paused);
  stepBody(body,{side:1,forward:0,run:false},0,0.04);
  assert.notEqual(body.x,paused.x);
  assert.equal(nav.start('garden'),false);
  assert.equal(nav.active,false);
});
test('approval is single-use, walking blocks extra requests, Stop wins and arrival re-enables Ask', async () => {
  const body=spawnBody(),world=createWorld(),nav=new NavigationRunner(body);
  let requests=0;
  const proposal={action:{type:'MOVE_TO',targetId:'rug'},reason:'I want to visit the rug.'};
  const fake=async()=>{requests++;return Response.json({provenance:'TEST_FIXTURE',proposal,model:'fixture',elapsedMs:0});};
  const controller=new MindController({snapshot:()=>snapshot(body,world),navigation:nav,
    stop:()=>{body.vx=body.vz=0;},apply:()=>{throw Error('Movement may not be applied directly');},changed:()=>{}},fake,()=>0);
  controller.configure(true,'Ready');
  await controller.ask('abcdefghijklmnopqrstuvwxyz012345');
  assert.ok(controller.view.decision);
  assert.equal(body.z,3.4);
  controller.approve(); controller.approve();
  assert.equal(controller.view.moving,true);
  assert.equal(controller.hasWork,true);
  await controller.ask('abcdefghijklmnopqrstuvwxyz012345'); assert.equal(requests,1);
  controller.tick(0.02); assert.equal(body.action,'WALK');
  controller.cancel('Stopped by user');
  assert.equal(controller.view.moving,false); assert.equal(nav.active,false);
  await controller.ask('abcdefghijklmnopqrstuvwxyz012345');
  assert.equal(requests,2);
  controller.approve();
  for(let i=0;i<2000 && controller.view.moving;i++) controller.tick(0.02);
  assert.equal(controller.view.moving,false); assert.match(controller.view.message,/Arrived at/);
  assert.ok(Math.hypot(body.x-destination('rug').x,body.z-destination('rug').z)<0.03);
});
