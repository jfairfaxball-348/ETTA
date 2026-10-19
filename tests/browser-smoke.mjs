/** S004: genuine headless Chromium actions against the built production preview.
 * Browser transport is pinned Playwright Core installed by the dedicated CI job.
 * No mocked DOM, simulation function calls or injected movement state.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const url = process.env.ETTA_BROWSER_URL || 'http://127.0.0.1:4173/';
const executablePath = process.env.ETTA_CHROME || ['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
assert.ok(executablePath, 'Chrome/Chromium is required for actual browser evidence');
const sleep = ms => new Promise(r => setTimeout(r,ms));
const results = [];
const errors = [];
const browser = await chromium.launch({executablePath, headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
mkdirSync('test-results',{recursive:true});

async function attempt(name, fn) {
  try {await fn();console.log('PASS '+name);results.push({name,result:'PASS'});}
  catch(error){console.error('FAIL '+name+': '+error.message);results.push({name,result:'FAIL',reason:error.message});}
}
function position(text) {
  const m=/POSITION X\s+(-?[\d.]+)\s+·\s+Z\s+(-?[\d.]+)/.exec(text);
  assert.ok(m, 'No physical state telemetry: '+text);
  return {x:Number(m[1]),z:Number(m[2])};
}
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
const context = await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});
const page = await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error') errors.push('console: '+m.text());});
const stage = page.locator('#scene');
async function telemetry(){return page.locator('#telemetry').innerText();}
async function state(){return position(await telemetry());}
async function reset(){await stage.focus();await page.keyboard.press('r');await sleep(220);}
async function moveUntil(key, predicate, timeoutMs=11000) {
  await stage.focus(); await page.keyboard.down(key);
  const started=Date.now(); let last=await state();
  try {
    do { await sleep(230); last=await state(); if(predicate(last)) return last; }
    while(Date.now()-started<timeoutMs);
    throw new Error('Timed out while moving '+key+': '+JSON.stringify(last));
  } finally { await page.keyboard.up(key); await sleep(120); }
}
async function walk(key='w',ms=600){await stage.focus();await page.keyboard.down(key);await sleep(ms);await page.keyboard.up(key);await sleep(100);return state();}
try {
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await attempt('WebGL scene rendered with explicit MANUAL provenance',async()=>{
    await page.waitForFunction(()=>document.querySelector('#render-status')?.textContent?.includes('BODY ONLINE'),{timeout:30000});
    assert.equal(await page.locator('#scene canvas').count(),1);
    const dimensions=await stage.locator('canvas').evaluate(el=>({width:el.width,height:el.height}));
    assert.ok(dimensions.width>200&&dimensions.height>200,'Invalid rendered canvas dimensions');
    assert.match(await page.locator('#mode-status').innerText(),/MANUAL.*NO AUTONOMY/);
  });
  const origin=await state();
  await attempt('W and D input actually change engine-owned coordinates',async()=>{
    const w=await moveUntil('w',p=>distance(p,origin)>0.45);assert.ok(distance(w,origin)>0.45,'W did not move Etta');
    await reset();const d=await moveUntil('d',p=>distance(p,origin)>0.4);assert.ok(distance(d,origin)>0.4,'D did not move Etta');
  });

  await attempt('Run modifier produces faster observed velocity',async()=>{
    async function observeSpeed(goal,run){
      await reset();await stage.focus();
      if(run)await page.keyboard.down('Shift');
      await page.keyboard.down('w');
      let speed=0;const started=Date.now();
      try{
        do{
          await sleep(160);
          const reading=/VELOCITY\s+([\d.]+)/.exec(await telemetry());
          speed=Number(reading?.[1]||0);
          if(speed>=goal)return speed;
        }while(Date.now()-started<11000);
        throw new Error('Observed velocity never reached '+goal+': '+speed);
      }finally{await page.keyboard.up('w');if(run)await page.keyboard.up('Shift');}
    }
    const walkSpeed=await observeSpeed(2.2,false);
    const runSpeed=await observeSpeed(3.6,true);
    assert.ok(runSpeed>walkSpeed*1.25,'Walk '+walkSpeed+' vs run '+runSpeed);
  });
  await attempt('R resets motion, body and camera',async()=>{
    await reset();assert.ok(distance(await state(),origin)<0.06,'Body did not return to spawn');
    assert.match(await telemetry(),/CAMERA 7\.4m/);
  });
  await attempt('Arrow keys and key release work',async()=>{
    // Wait for engine movement: software WebGL can render too slowly for a fixed 520ms hold.
    await reset();await moveUntil('ArrowUp',p=>distance(p,origin)>0.45);
    // Measure stability after the engine has decelerated, rather than from the
    // last held-key sample returned by moveUntil (which precedes keyup).
    await page.waitForFunction(()=>{
      const m=/VELOCITY\s+([\d.]+)/.exec(document.querySelector('#telemetry')?.textContent || '');
      return m && Number(m[1])<0.08;
    },null,{timeout:11000});
    const settled=await state();
    await sleep(800);assert.ok(distance(await state(),settled)<0.05,'Movement stuck after key release');
  });
  await attempt('F1 and on-screen control toggle the diagnostic HUD',async()=>{
    assert.equal(await page.locator('#debug-hud').evaluate(el=>el.hidden),true, 'HUD hidden by default');
    await stage.focus();await page.keyboard.press('F1');
    assert.equal(await page.locator('#debug-hud').evaluate(el=>el.hidden),false);
    await page.keyboard.press('F1');
    assert.equal(await page.locator('#debug-hud').evaluate(el=>el.hidden),true);
    await page.locator('#hud-toggle').click();
    assert.equal(await page.locator('#debug-hud').evaluate(el=>el.hidden),false);
    await page.locator('#hud-toggle').click();
    await reset();
  });
  await attempt('Wheel zoom respects both bounds',async()=>{
    const b=await stage.boundingBox();assert.ok(b);
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);
    await page.mouse.wheel(0,-1700);await sleep(200);
    assert.match(await telemetry(),/CAMERA (3\.4|3\.[5-9]|4\.[0-9]|5\.[0-9]|6\.[0-9])m/);
    await page.mouse.wheel(0,4000);await sleep(200);
    assert.match(await telemetry(),/CAMERA 12\.0m/);
  });
  await attempt('Mouse drag orbits and changes camera-relative walking',async()=>{
    await reset();const b=await stage.boundingBox();assert.ok(b);
    const x=b.x+b.width*0.5,y=b.y+b.height*0.56;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+220,y+25,{steps:8});await page.mouse.up();
    const rotated=await walk('w',600);
    await reset();const defaultWalk=await walk('w',600);
    assert.ok(distance(rotated,defaultWalk)>0.65,'Mouse orbit did not change movement direction');
  });
  await attempt('Window blur clears pressed movement',async()=>{
    await reset();await stage.focus();await page.keyboard.down('w');
    await sleep(260);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    await sleep(400);const a=await state();await sleep(460);const b=await state();
    await page.keyboard.up('w');
    assert.ok(distance(a,b)<0.05,'Movement continued after blur event');
  });

  await attempt('Visible studio and manual lamp affordance, reversible and resettable',async()=>{
    await reset();
    assert.match(await page.locator('#object-name').innerText(),/Standing lamp/);
    const action=page.locator('#interact-button');
    assert.equal(await action.isEnabled(),true);
    assert.match(await action.innerText(),/Turn light off/);
    await action.click();
    await page.waitForFunction(()=>document.querySelector('#interact-button')?.textContent?.includes('Turn light on'),null,{timeout:12000});
    assert.match(await action.innerText(),/Turn light on/);
    await stage.focus();await page.keyboard.press('e');
    await page.waitForFunction(()=>document.querySelector('#interact-button')?.textContent?.includes('Turn light off'),null,{timeout:12000});
    assert.match(await action.innerText(),/Turn light off/);
    await action.click();await reset();
    await page.waitForFunction(()=>document.querySelector('#interact-button')?.textContent?.includes('Turn light off'),null,{timeout:12000});
    assert.match(await action.innerText(),/Turn light off/);
  });
  await attempt('Door passage outside and back, without crossing physical front walls',async()=>{
    await reset();const porch=await moveUntil('s',p=>p.z>5.25);
    assert.ok(porch.z>5.25,'Could not exit studio: '+JSON.stringify(porch));
    assert.ok(Math.abs(porch.x)<1.18,'Exited through front wall');
    const inside=await moveUntil('w',p=>p.z<4.7);
    assert.ok(inside.z<4.7,'Could not re-enter studio: '+JSON.stringify(inside));
  });
  await attempt('Long movement halts against world-owned architecture',async()=>{
    await reset();await stage.focus();await page.keyboard.down('w');
    try{
      for(let i=0;i<26;i++){
        await sleep(180);const p=await state();
        assert.ok(p.x>=-5.48&&p.x<=5.48&&p.z>=-4.73&&p.z<=6.78,'World bounds violated: '+JSON.stringify(p));
        for(const o of [{a:-4.85,b:-2.5,c:-3.85,d:-1.1},{a:2.05,b:4.68,c:-3.8,d:-2.45},{a:2.62,b:3.45,c:-1.95,d:-1.06}])
          assert.ok(!(p.x>o.a-0.32&&p.x<o.b+0.32&&p.z>o.c-0.32&&p.z<o.d+0.32),'Walked into furniture');
      }
    } finally{await page.keyboard.up('w');}
  });
  await attempt('Screenshots capture desktop 3D result',async()=>{
    const bytes=await page.screenshot({path:'test-results/etta-desktop.png'});
    assert.ok(bytes.length>15000,'Very small screenshot indicates empty stage');
  });
  const mobile = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const phone=await mobile.newPage();
  phone.on('pageerror',e=>errors.push('mobile: '+e.message));
  await attempt('Mobile rendering fits viewport and touch movement is actionable',async()=>{
    await phone.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await phone.waitForFunction(()=>document.querySelector('#render-status')?.textContent?.includes('BODY ONLINE'),{timeout:30000});
    const width=await phone.evaluate(()=>document.documentElement.scrollWidth);
    assert.ok(width<=430,'Unexpected mobile horizontal overflow: '+width);
    const pad=phone.locator('[data-direction="forward"]');
    assert.equal(await pad.isVisible(),true,'Mobile pad hidden');
    await pad.scrollIntoViewIfNeeded();
    await sleep(350); // Headless SwiftShader renders slowly at mobile DPR; allow scene to resume.
    const before=position(await phone.locator('#telemetry').innerText());
    const bb=await pad.boundingBox();assert.ok(bb);
    await phone.evaluate(()=>{
      window.__ettaTouchTrace=[];
      for(const type of ['pointerdown','pointerup','pointercancel','touchstart','touchend','blur','focusout'])
        window.addEventListener(type,e=>window.__ettaTouchTrace.push({type,target:e.target?.getAttribute?.('data-direction')||e.target?.id||e.target?.tagName}),true);
    });
    console.log('MOBILE pad',JSON.stringify(bb),'hit',await phone.evaluate(([x,y])=>document.elementFromPoint(x,y)?.outerHTML?.slice(0,140),[bb.x+bb.width/2,bb.y+bb.height/2]));
    const cdp=await mobile.newCDPSession(phone);
    const point={x:bb.x+bb.width/2,y:bb.y+bb.height/2,id:1};
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
    await sleep(1700);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await sleep(100);
    const after=position(await phone.locator('#telemetry').innerText());
    assert.ok(distance(before,after)>0.35,'Touch forward did not move body: '+JSON.stringify({before,after,trace:await phone.evaluate(()=>window.__ettaTouchTrace),telemetry:await phone.locator('#telemetry').innerText()}));
  });
  await attempt('Screenshot captures mobile layout',async()=>{
    const bytes=await phone.screenshot({path:'test-results/etta-mobile.png'});
    assert.ok(bytes.length>10000);
  });
  await mobile.close();
  await attempt('WebGL-disabled browser shows explicit fallback',async()=>{
    const tab=await context.newPage();
    await tab.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args) {
        if(String(type).includes('webgl') || type==='experimental-webgl') return null;
        return original.call(this,type,...args);
      };
    });
    await tab.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await tab.waitForFunction(()=>document.querySelector('#render-status')?.textContent?.includes('WEBGL UNAVAILABLE'),{timeout:15000});
    assert.match(await tab.locator('.render-error').innerText(),/WebGL/i);await tab.close();
  });
  await attempt('No unexpected browser runtime exceptions',async()=>{
    const fatal=errors.filter(e=>!e.includes('WebGL')&&!e.includes('THREE.WebGLRenderer'));
    assert.deepEqual(fatal,[],JSON.stringify(errors));
  });
} finally {
  try {await page.screenshot({path:'test-results/etta-final.png'});}catch{}
  writeFileSync('test-results/browser-results.json',JSON.stringify({url,results,errors},null,2));
  await browser.close();
}
const failures=results.filter(r=>r.result!=='PASS');
console.log('S004 CHROMIUM:',results.length-failures.length,'PASS;',failures.length,'FAIL');
if(failures.length)process.exitCode=1;
