import fs from 'node:fs';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1').replace(/\/$/, '');
const dir = new URL('../../.content-preview/', import.meta.url);
fs.mkdirSync(dir, { recursive: true });
const entry = "import React from 'react';import {createRoot} from 'react-dom/client';import QRCode from '"+root+"/src/pages/QRCode.jsx';import '"+root+"/src/index.css';import '"+root+"/src/components/AppBrand.css';createRoot(document.getElementById('root')).render(<div className='workspace-shell' style={{padding:32,maxWidth:1050,margin:'auto'}}><QRCode /></div>);";
const api = "export default {get:async(url)=>({data:url.includes('/qr/info')?{review_url:'https://www.praisly.in/#demo',business_name:'Bloom Coffee (sample)'}:url.includes('/stats')?{rating_distribution:{}}:{total:0,reviews:[]}})};";
const result = await build({ root, configFile:false, logLevel:'silent', plugins:[{
  name:'offline-product-preview', enforce:'pre',
  resolveId(id) { if(id.endsWith('fixture-entry'))return '\0fixture.jsx';if(/services[\\/]api(?:\.js)?$/.test(id))return '\0mock-api'; },
  load(id) { if(id==='\0fixture.jsx')return entry;if(id==='\0mock-api')return api; }
},react(),tailwindcss()],build:{write:false,minify:false,lib:{entry:'fixture-entry',name:'Preview',formats:['iife']}}});
const output = (Array.isArray(result)?result[0]:result).output;
for(const item of output)fs.writeFileSync(new URL(item.fileName,dir),item.type==='chunk'?item.code:item.source);
fs.writeFileSync(new URL('index.html',dir), '<!doctype html><meta charset="utf-8"><title>Praisly QR product screenshot fixture</title><link rel="stylesheet" href="/'+output.find(x=>x.fileName.endsWith('.css')).fileName+'"><div id="root"></div><script type="module" src="/'+output.find(x=>x.type==='chunk').fileName+'"></script>');
console.log('Offline QR screen built with fictional data; no live API client.');

fs.appendFileSync(new URL("index.html",dir), "<style>body{background:#faf7ec}.workspace-shell{padding:20px!important;max-width:960px!important}.fade-up>h1,.fade-up>p,.qr-stats-grid{display:none!important}.fade-up>div:last-child>div:last-child{display:none}.fade-up>div:last-child{display:block!important;max-width:483px;margin:auto}.fade-up>div:last-child>div:first-child>div:first-child{max-width:380px!important;display:block!important;margin:auto}.fade-up{animation:none!important}body:before{content:'PRAISLY / QR CODE DOWNLOAD — FICTIONAL SAMPLE BUSINESS';display:block;text-align:center;padding:18px 10px 0;color:#606957;font:12px system-ui;letter-spacing:1px}</style><style>.workspace-shell{zoom:.88}</style>\r\n<style>.fade-up>div:last-child>div:last-child{display:none!important}</style>\r\n");
