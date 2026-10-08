// Offline component interaction test. Set JSDOM_MODULE to a local jsdom package.
const assert = require('node:assert/strict');
const path = require('node:path');
const { JSDOM } = require(process.env.JSDOM_MODULE || 'jsdom');

(async () => {
  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  const root = path.resolve(__dirname, '..');
  const modules = {
    entry: `import React,{act} from 'react'; import {createRoot} from 'react-dom/client';
      import Billing from '${root.replaceAll('\\','/')}/src/pages/Billing.jsx';
      globalThis.testAct=act; const root=createRoot(document.getElementById('root'));
      globalThis.mount=()=>root.render(React.createElement(Billing)); globalThis.unmount=()=>root.unmount();`,
    api: `export default { get:(...a)=>globalThis.testApi.get(...a),post:(...a)=>globalThis.testApi.post(...a) };
      export const authService={ getBusiness:()=>({plan:'yearly'}),setBusiness:()=>{} };`,
    toast: `export const useToast=()=>globalThis.testToast;`,
    locations: `export const PENDING_LOCATION_KEY='pending-location';export const PENDING_ADDON_QTY_KEY='pending-qty';`,
    router: `import {createElement} from 'react';export const useSearchParams=()=>[new URLSearchParams()];
      export const Link=({to,children,...props})=>createElement('a',{href:to,...props},children);`,
  };
  const bundle = await build({root,configFile:false,logLevel:'silent',plugins:[{
    name:'billing-test-fixtures', enforce:'pre',
    resolveId(id,importer) {
      if(id==='billing-test-entry' || id.replaceAll('\\','/').endsWith('/billing-test-entry')) return '\0entry';
      if(importer?.replaceAll('\\','/').endsWith('/pages/Billing.jsx')) {
        return {'../services/api':'\0api','../components/Toast':'\0toast',
          '../components/LocationSwitcher':'\0locations','react-router-dom':'\0router'}[id];
      }
    },load(id){if(id.startsWith('\0')) return modules[id.slice(1)]},
  },react()],define:{'process.env.NODE_ENV':'"development"'},
  build:{write:false,minify:false,lib:{entry:'billing-test-entry',name:'BillingTest',formats:['iife']}}});
  const code=(Array.isArray(bundle)?bundle[0]:bundle).output.find(o=>o.type==='chunk').code;
  let checks=0;
  async function scenario(status,{fail=false,confirm=true}={}) {
    const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test/billing',runScripts:'outside-only'});
    const w=dom.window;const requests=[];const toasts=[];
    w.IS_REACT_ACT_ENVIRONMENT=true;w.confirm=()=>confirm;
    w.MessageChannel=class { constructor(){this.port1={};this.port2={postMessage:()=>w.setTimeout(()=>this.port1.onmessage?.(),0)}} };
    w.testApi={get:async()=>{if(fail)throw Error('offline');return{data:status}},
      post:async(url,body)=>{requests.push({url,body});status.subscriptions[0].cancel_requested=true;
        return{data:{message:'Renewal cancelled'}}}};
    w.testToast=(...a)=>toasts.push(a);w.eval(code);
    await w.testAct(async()=>{w.mount();await new Promise(r=>setTimeout(r,5))});
    return{w,requests,toasts,close:async()=>{await w.testAct(()=>w.unmount());w.close()}};
  }
  const active=()=>({is_paid:true,plan:'monthly',allowed:true,is_trial:false,paid_until:'2030-12-31T00:00:00Z',
    subscriptions:[{subscription_id:'sub-main',kind:'base',plan_name:'monthly',status:'active',cancel_requested:false}]});
  let s=await scenario(active());
  assert.match(s.w.document.body.textContent,/Paid access through/);checks++;
  const button=[...s.w.document.querySelectorAll('button')].find(b=>b.textContent==='Cancel renewal');
  await s.w.testAct(async()=>{button.click();await new Promise(r=>setTimeout(r,5))});
  assert.equal(s.requests[0].url,'/api/payments/cancel');assert.equal(s.requests[0].body.subscription_id,'sub-main');checks++;
  assert.match(s.w.document.body.textContent,/Renewal cancelled/);checks++;
  await s.close();
  s=await scenario(active(),{confirm:false});
  await s.w.testAct(()=>[...s.w.document.querySelectorAll('button')].find(b=>b.textContent==='Cancel renewal').click());
  assert.equal(s.requests.length,0);checks++;await s.close();
  s=await scenario({is_paid:false,plan:'free',access_expired:true,is_trial:false,location_covered:true,subscriptions:[]});
  assert.match(s.w.document.body.textContent,/Your paid access has ended/);
  assert.doesNotMatch(s.w.document.body.textContent,/You're on the Yearly plan/);checks++;await s.close();
  s=await scenario({is_paid:true,plan:'monthly',access_expired:true,is_trial:false,location_covered:false,subscriptions:[]});
  assert.match(s.w.document.body.textContent,/outside your current paid capacity/);checks++;await s.close();
  s=await scenario(active(),{fail:true});
  assert.match(s.w.document.body.textContent,/Could not refresh subscription status/);
  assert.doesNotMatch(s.w.document.body.textContent,/You're on the Yearly plan/);checks++;
  assert.ok([...s.w.document.querySelectorAll('button')].find(b=>/Start Now/.test(b.textContent)).disabled);checks++;
  await s.close();console.log(`${checks} billing UI interaction checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1});
