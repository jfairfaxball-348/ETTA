import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionHandler } from '../server/decision.ts';
import { parseVision } from '../server/vision.ts';
import { AUTH_SCRIPT } from '../server/auth.ts';
import { spawnBody } from '../src/simulation.ts';
import { createWorld } from '../src/world.ts';
import { snapshot } from '../src/mind/protocol.ts';

const env = {ETTA_MIND_ENABLED:'true',ETTA_ACCESS_PIN:'4827',ETTA_ACCESS_TOKEN:'fixture-access-code-never-a-real-secret',
 GEMINI_API_KEY:'fixture-google-secret',UPSTASH_REDIS_REST_URL:'https://fixture.upstash.io',
 UPSTASH_REDIS_REST_TOKEN:'fixture-redis-secret',VERCEL_ENV:'production'};
const imageBytes = Buffer.concat([Buffer.from([
  0xff,0xd8,0xff,0xe0,0,4,0,0,0xff,0xc0,0,17,8,0,216,1,128,3,1,0,2,0,3,0
]),Buffer.alloc(110,0),Buffer.from([0xff,0xd9])]);
const vision={mimeType:'image/jpeg',width:384,height:216,data:imageBytes.toString('base64')};
const snap=snapshot(spawnBody(),createWorld());
function req(pin='4827',body={kind:'unlock'},ip='192.0.2.25',header='x-vercel-forwarded-for') {
 return new Request('https://etta.test/api/decision',{method:'POST',
  headers:{origin:'https://etta.test','content-type':'application/json',Authorization:'Bearer '+pin,[header]:ip},
  body:JSON.stringify(body)});
}
function transport() {
 let wrongTotal=0;const wrongPerClient=new Map();const calls=[];
 const fetcher=async (url,options)=>{
  calls.push({url,options});
  if(String(url).includes('upstash.io')) {
   const [cmd,script,_keys,_prefix,client,valid]=JSON.parse(options.body);
   assert.equal(cmd,'EVAL');
   if(script===AUTH_SCRIPT){
    const n=wrongPerClient.get(client)||0;
    if(n>=6 || wrongTotal>=60)return Response.json({result:2});
    if(valid==='0'){wrongTotal++;wrongPerClient.set(client,n+1);return Response.json({result:1});}
    return Response.json({result:0});
   }
   return Response.json({result:0});
  }
  const choice={perception:'The standing lamp is nearby.',intent:'I will wait.',action:{type:'WAIT'},reason:'Pause here.'};
  return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(choice)}]}}]});
 };
 return {fetcher,calls,get wrongTotal(){return wrongTotal;}};
}
test('JPEG envelope checks decoded dimensions, MIME and base64 boundaries',()=>{
 assert.deepEqual(parseVision(vision),vision);
 for(const bad of [
  {...vision,width:385},{...vision,mimeType:'image/png'},
  {...vision,data:'a'.repeat(175000)},
  {...vision,data:Buffer.from(imageBytes).fill(0).toString('base64')},
  {...vision,data:Buffer.concat([imageBytes.subarray(0,14),Buffer.from([0,200]),imageBytes.subarray(16)]).toString('base64')}
 ]) assert.throws(()=>parseVision(bad));
});
test('PIN mode has priority over legacy code, unlock is free of model budget, no PIN leaks',async()=>{
 const t=transport(),handle=createDecisionHandler(env,t.fetcher);
 const ready=await (await handle(new Request('https://etta.test/api/decision'))).json();
 assert.equal(ready.status,'READY');assert.equal(ready.accessMode,'PIN');
 assert.doesNotMatch(JSON.stringify(ready),/4827|fixture-access-code/);
 assert.equal((await handle(req('4827'))).status,200);
 assert.equal(t.calls.length,1,'PIN-only Redis admission; zero provider reservations');
 assert.equal((await handle(req(env.ETTA_ACCESS_TOKEN))).status,401);
 assert.equal(t.calls.length,2,'Legacy token cannot bypass PIN mode');
});
test('one multimodal Gemma call includes world text AND bounded image; one provider budget',async()=>{
 const t=transport(),res=await createDecisionHandler(env,t.fetcher)(req('4827',{snapshot:snap,vision}));
 assert.equal(res.status,200);
 const data=await res.json();
 assert.equal(data.providerCalls,1);assert.equal(data.provenance,'MODEL_DECISION');
 assert.equal(data.perception,'The standing lamp is nearby.');
 assert.equal(data.proposal.action.type,'WAIT');
 assert.equal(t.calls.length,3,'PIN check, shared model budget, one Google call');
 const provider=t.calls[2],payload=JSON.parse(provider.options.body);
 assert.match(payload.contents[0].parts[0].text,/validActions|canonical/i);
 assert.deepEqual(payload.contents[0].parts[1].inlineData,{mimeType:'image/jpeg',data:vision.data});
 assert.equal(payload.generationConfig.candidateCount,1);
 assert.doesNotMatch(JSON.stringify(data),/4827|fixture-google-secret|fixture-redis-secret/);
});
test('PIN mode disallows text-only and malformed image before any model budget',async()=>{
 const t=transport(),handle=createDecisionHandler(env,t.fetcher);
 for(const payload of [{snapshot:snap},{snapshot:snap,vision:{...vision,width:100}},
 {snapshot:snap,vision,extra:'override'}, {snapshot:snap,vision:{...vision,data:'bad'}}]) {
  const response=await handle(req('4827',payload));
  assert.equal(response.status,400);assert.equal(t.calls.at(-1).url,env.UPSTASH_REDIS_REST_URL);
 }
 assert.equal(t.calls.length,4);
});
test('shared failed-attempt limits across handlers; per-client and aggregate; no model spent',async()=>{
 const t=transport(),a=createDecisionHandler(env,t.fetcher),b=createDecisionHandler(env,t.fetcher);
 const result=await Promise.all(Array.from({length:10},(_,i)=>(i%2?a:b)(req('0000'))));
 assert.equal(result.filter(x=>x.status===401).length,6);
 assert.equal(result.filter(x=>x.status===429).length,4);
 assert.equal(t.wrongTotal,6);
 const correct=await b(req('4827'));
 assert.equal(correct.status,429,'Locked client cannot bypass with correct PIN');
 const other=await a(req('4827',{kind:'unlock'},'192.0.2.26'));
 assert.equal(other.status,200,'Per-client lockout does not lock other users');
 for(let i=0;i<54;i++) await a(req('bad',{kind:'unlock'},'2001:db8::'+i.toString(16)));
 assert.equal(t.wrongTotal,60);
 assert.equal((await a(req('4827',{kind:'unlock'},'192.0.2.200'))).status,429,'Global failed-attempt cap');
 assert.ok(t.calls.every(c=>c.url===env.UPSTASH_REDIS_REST_URL),'No provider or model-budget attempt');
});
test('unknown client headers cannot evade lockout and unavailable Redis fails closed',async()=>{
 const t=transport(),handler=createDecisionHandler({...env,VERCEL_ENV:undefined},t.fetcher);
 for(let i=0;i<6;i++)assert.equal((await handler(req('0000',{kind:'unlock'},'192.0.2.'+i,'x-forwarded-for'))).status,401);
 assert.equal((await handler(req('4827',{kind:'unlock'},'192.0.2.200','x-forwarded-for'))).status,429);
 const offline=createDecisionHandler(env,async()=>{throw Error('offline secret');});
 const res=await offline(req());
 assert.equal(res.status,503);
 assert.doesNotMatch(await res.text(),/offline secret/);
});
