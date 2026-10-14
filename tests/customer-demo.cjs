// Offline interaction checks: no backend, Google, or clipboard permissions required.
const assert = require('node:assert/strict');
const path = require('node:path');
const { JSDOM } = require(process.env.JSDOM_MODULE || 'jsdom');

(async () => {
  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  const root = path.resolve(__dirname, '..');
  const entry = `import React,{act} from 'react';import {createRoot} from 'react-dom/client';
    import Demo from '${root.replaceAll('\\', '/')}/src/components/CustomerFlowDemo.jsx';
    const root=createRoot(document.getElementById('root'));window.testAct=act;
    window.mount=()=>root.render(React.createElement(Demo));window.unmount=()=>root.unmount();`;
  const bundle = await build({ root, configFile: false, logLevel: 'silent', plugins: [{
    name: 'demo-test', resolveId(id) { if (id.endsWith('demo-test-entry')) return '\0demo-entry'; },
    load(id) { if (id === '\0demo-entry') return entry; },
  }, react()], define: { 'process.env.NODE_ENV': '"development"' },
  build: { write: false, minify: false, lib: { entry: 'demo-test-entry', name: 'DemoTest', formats: ['iife'] } } });
  const code = (Array.isArray(bundle) ? bundle[0] : bundle).output.find(item => item.type === 'chunk').code;
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.IS_REACT_ACT_ENVIRONMENT = true;
  w.MessageChannel = class { constructor() { this.port1 = {}; this.port2 = { postMessage: () => w.setTimeout(() => this.port1.onmessage?.(), 0) }; } };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  let copied = '', copyFails = false, networkCalls = 0;
  w.fetch = () => { networkCalls++; throw Error('The demo must stay offline'); };
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => { if (copyFails) throw Error('denied'); copied = text; } } });
  w.eval(code);
  await w.testAct(() => w.mount());
  const button = name => [...w.document.querySelectorAll('button')].find(el => el.textContent.includes(name));
  const click = async name => w.testAct(async () => button(name).click());
  const fill = async (id, value) => w.testAct(() => {
    const field = w.document.getElementById(id);
    Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype, 'value').set.call(field, value);
    field.dispatchEvent(new w.Event('input', { bubbles: true }));
  });
  assert.equal(button('Preview your draft').disabled, true);
  await w.testAct(() => w.document.querySelector('input[value="1"]').click());
  await fill('demo-experience', '   ');
  assert.equal(button('Preview your draft').disabled, true);
  await fill('demo-experience', 'The wait was too long.');
  await click('Preview your draft');
  assert.equal(w.document.getElementById('demo-draft').value, 'The wait was too long.');
  await fill('demo-draft', '');
  assert.equal(button('See posting steps').disabled, true);
  await fill('demo-draft', 'The coffee was good, but I waited too long.');
  await click('Back');
  await click('Preview your draft');
  assert.equal(w.document.getElementById('demo-draft').value, 'The coffee was good, but I waited too long.');
  await click('See posting steps');
  await click('Copy sample text');
  assert.equal(copied, 'The coffee was good, but I waited too long.');
  assert.match(w.document.querySelector('[role="status"]').textContent, /Copied/);
  copyFails = true;
  await click('Copy sample text');
  assert.match(w.document.querySelector('[role="status"]').textContent, /unavailable/);
  assert.doesNotMatch(w.document.querySelector('[role="status"]').textContent, /Copied/);
  await click('Edit draft');
  assert.equal(w.document.getElementById('demo-draft').value, copied);
  await click('See posting steps');
  await click('Start again');
  assert.equal(w.document.querySelector('input:checked'), null);
  assert.equal(w.document.getElementById('demo-experience').value, '');
  assert.equal(button('Preview your draft').disabled, true);
  // Every rating takes the same sample path, including critical feedback.
  for (let rating = 1; rating <= 5; rating++) {
    await w.testAct(() => w.document.querySelector(`input[value="${rating}"]`).click());
    await fill('demo-experience', `Sample visit ${rating}`);
    await click('Preview your draft');
    await click('See posting steps');
    assert.ok(button('Copy sample text'));
    await click('Start again');
  }
  assert.equal(networkCalls, 0);
  await w.testAct(() => w.unmount());
  w.close();
  console.log('Demo checks passed: validation, editing, back navigation, clipboard success/failure, reset, and all five ratings.');
})().catch(error => { console.error(error); process.exitCode = 1; });
