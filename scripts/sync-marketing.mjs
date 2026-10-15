import fs from 'node:fs';
const base = new URL('../', import.meta.url);
const c = JSON.parse(fs.readFileSync(new URL('src/content/marketing.json', base), 'utf8'));
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const path = new URL('index.html', base);
let html = fs.readFileSync(path, 'utf8');
html = html.replace(/<title>.*?<\/title>/, '<title>'+esc(c.title)+'</title>');
for (const [key, value] of Object.entries({description:c.description,'og:title':c.title,'og:description':c.description,'og:image:alt':'Praisly — Good work. Great word of mouth.','twitter:title':c.title,'twitter:description':c.description})) {
  const attr = key.startsWith('og:') ? 'property' : 'name';
  html = html.replace(new RegExp('<meta '+attr+'="'+key+'" content="[^"]*" />'), '<meta '+attr+'="'+key+'" content="'+esc(value)+'" />');
}
const schema = {'@context':'https://schema.org','@graph':[
  {'@type':'Organization','@id':'https://praisly.in/#organization',name:'Praisly',url:'https://praisly.in/',logo:'https://praisly.in/icon-512.png'},
  {'@type':'WebSite',name:'Praisly',url:'https://praisly.in/',inLanguage:'en-IN',publisher:{'@id':'https://praisly.in/#organization'}},
  {'@type':'SoftwareApplication',name:'Praisly',applicationCategory:'BusinessApplication',operatingSystem:'Web',description:c.description,url:'https://praisly.in/',offers:[
    {'@type':'Offer',name:'Monthly plan — 1 location',priceCurrency:'INR',price:c.monthly,url:'https://praisly.in/#pricing'},
    {'@type':'Offer',name:'Annual plan — 1 location',priceCurrency:'INR',price:c.yearly,url:'https://praisly.in/#pricing'}]},
  {'@type':'FAQPage','@id':'https://praisly.in/#questions',mainEntity:c.questions.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
]};
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">'+JSON.stringify(schema,null,2).replaceAll('<','\\u003c')+'</script>');
const fallback = '<main style="max-width:960px;margin:auto;padding:48px 24px;font:18px/1.7 system-ui;color:#252a21;background:#faf8ef">'+
'<a href="/">Praisly</a><h1>Good work. Great word of mouth.</h1><p>'+esc(c.description)+'</p><p><a href="/signup">Start your 7-day free trial</a> · No card needed</p>'+
'<section id="features"><h2>A review link opens Google. Praisly helps with the rest.</h2><p>Give customers optional AI-assisted drafts they can edit and post themselves. Read private feedback and review activity in your dashboard, and compare up to 3 competitors per location.</p></section>'+
'<section id="pricing"><h2>One location. One clear price.</h2><p>₹'+c.monthly+'/month or ₹'+c.yearly+'/year. Extra locations: ₹'+c.extraLocation+'/month each with an active main plan. Download and print your QR code yourself; a physical stand is not included. The trial covers your first location and ends without an automatic charge.</p></section>'+
'<section id="questions"><h2>Frequently asked questions</h2>'+c.questions.map(([q,a])=>'<h3>'+esc(q)+'</h3><p>'+esc(a)+'</p>').join('')+'</section><footer><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/login">Log in</a></footer></main>';
html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*<script type="module"/, '<div id="root">'+fallback+'</div>\n    <script type="module"');
fs.writeFileSync(path, html);
console.log('Marketing metadata, structured data and static content synced.');
