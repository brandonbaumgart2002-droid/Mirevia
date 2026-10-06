import { Liquid, Tag } from 'liquidjs';
import fs from 'fs'; import path from 'path';
// Local preview without a store: renders templates/product.parapatrol.json with a mock product.
// Usage: npm run preview  (or: node preview.mjs [plans|noplans]) then open preview/index.html via a local server.
const ROOT = path.resolve('../shopify'), OUT = path.resolve('./preview'), MODE = process.argv[2] || 'plans';
fs.mkdirSync(OUT, { recursive: true });
const engine = new Liquid({ root: [path.join(ROOT,'snippets')], partials: path.join(ROOT,'snippets'), extname: '.liquid', jsTruthy: false });
// {% schema %} -> nothing
engine.registerTag('schema', class extends Tag { constructor(t, r, l){ super(t,r,l); this.tpls=[]; const s=l.parser.parseStream(r); s.on('tag:endschema',()=>s.stop()).on('template',()=>{}).on('end',()=>{throw new Error('no endschema')}); s.start(); } * render(){ return ''; } });
// {% form 'product', product, attrs %} ... {% endform %}
engine.registerTag('form', class extends Tag { constructor(t,r,l){ super(t,r,l); this.tpls=[]; const s=l.parser.parseStream(r); s.on('tag:endform',()=>s.stop()).on('template',x=>this.tpls.push(x)).on('end',()=>{throw new Error('no endform')}); s.start(); }
  * render(ctx, emitter){ emitter.write('<form method="post" action="/cart/add" accept-charset="UTF-8" enctype="multipart/form-data" data-pp-form><input type="hidden" name="form_type" value="product">'); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); emitter.write('</form>'); } });
const fmt = c => '$' + (c/100).toFixed(2);
engine.registerFilter('money', fmt);
engine.registerFilter('asset_url', f => '/assets/' + f);
engine.registerFilter('stylesheet_tag', u => `<link rel="stylesheet" href="${u}">`);
engine.registerFilter('json', v => JSON.stringify(v === undefined ? null : v));
engine.registerFilter('handleize', v => String(v).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
engine.registerFilter('image_url', (i) => i && i.src || '');
// keyword args arrive as [key, value] pairs; keep the ones the browser cares about
engine.registerFilter('image_tag', (u, ...a) => { const at = Object.fromEntries(a.filter(Array.isArray));
  const keep = ['alt','loading','fetchpriority','sizes','class'].filter(k => at[k] != null).map(k => `${k}="${String(at[k]).replace(/"/g,'&quot;')}"`);
  if (!('alt' in at)) keep.unshift('alt=""');
  return `<img src="${u}" width="2048" height="2048" ${keep.join(' ')}>`; });

// mock product
const plansMeta = [30,60,90].map((d,i)=>({ id: 1000+i, name: `Delivery every ${d} days`, group_id: 'g1', options:[{value:`${d} days`}] }));
const variant = { id: 42, title: 'Default Title', available: true, price: 3499,
  selling_plan_allocations: MODE==='plans' ? plansMeta.map(p=>({ selling_plan: p, price: 2974 })) : [] };
// PP_GALLERY=1 uses ../images/gallery/image1-7.png as the product media
const GALLERY = path.resolve('../images/gallery');
const media = process.env.PP_GALLERY && fs.existsSync(GALLERY)
  ? fs.readdirSync(GALLERY).filter(f => /\.(png|jpe?g|webp)$/.test(f)).sort().map((f, i) => ({ media_type: 'image', alt: `ParaPatrol image ${i + 1}`, preview_image: { src: '/gallery/' + f } }))
  : [];
const product = { id: 7, title: 'ParaPatrol™', variants:[variant], selected_or_first_available_variant: variant, media,
  selling_plan_groups: MODE==='plans' ? [{ id:'g1', selling_plans: plansMeta }] : [], requires_selling_plan:false,
  has_only_default_variant:true, options:['Title'], metafields:{ reviews:{ rating:{}, rating_count:{} } }, url:'/products/parapatrol', featured_image:null };
const globals = { product, shop:{ money_format:'${{amount}}' }, routes:{ cart_url:'/cart', cart_add_url:'/cart/add' }, request:{ design_mode: MODE!=='plans' } };

const tpl = JSON.parse(fs.readFileSync(path.join(ROOT,'templates/product.parapatrol.json'),'utf8'));
let html = '';
for (const key of tpl.order) {
  const sec = tpl.sections[key];
  const src = fs.readFileSync(path.join(ROOT,'sections',sec.type+'.liquid'),'utf8');
  const schema = JSON.parse(src.split('{% schema %}')[1].split('{% endschema %}')[0]);
  const defaults = s => Object.fromEntries((s||[]).filter(x=>x.id).map(x=>[x.id, x.default ?? (x.type==='product_list'? null : (x.type==='checkbox'?false:''))]));
  const settings = Object.assign(defaults(schema.settings), sec.settings);
  if ('products' in settings) settings.products = Object.assign([], { count: 0 });
  const blocks = (sec.block_order||[]).map(id => { const b = sec.blocks[id]; const bs = (schema.blocks||[]).find(x=>x.type===b.type);
    return { id, type:b.type, shopify_attributes:`data-block-id="${id}"`, settings: Object.assign(defaults(bs && bs.settings), b.settings) }; });
  engine.options.globals = { shop: globals.shop, routes: globals.routes, request: globals.request };
  const out = await engine.parseAndRender(src, { ...globals, section:{ id:'s-'+key, settings, blocks } });
  html += `<div id="shopify-section-${key}" class="shopify-section">${out}</div>\n`;
}
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ParaPatrol – JoySpring</title>
<style>/* hostile theme CSS, Dawn-like */ html{font-size:62.5%} body{margin:0;font-size:1.5rem;font-family:Georgia,serif;letter-spacing:.06rem;color:#333}
h1,h2,h3{font-size:4rem;margin:3rem 0;letter-spacing:.2rem} p{margin:1.5rem 0} ul{padding-left:4rem;list-style:disc} button{background:#f00;padding:1rem;border:2px solid #000} a{color:blue;text-decoration:underline} table{margin:2rem} .hidden{display:block}
.theme-header{height:60px;border-bottom:1px solid #ddd;display:flex;align-items:center;padding:0 16px;font:700 18px Georgia}</style></head>
<body><header class="theme-header">THEME HEADER <span class="cart-count-bubble" style="margin-left:auto"><span aria-hidden="true">0</span></span></header>${html}<footer style="padding:40px">THEME FOOTER</footer></body></html>`;
fs.writeFileSync(path.join(OUT,'index.html'), page);
fs.mkdirSync(path.join(OUT,'assets'),{recursive:true});
for (const f of ['parapatrol.css','parapatrol.js']) fs.copyFileSync(path.join(ROOT,'assets',f), path.join(OUT,'assets',f));
if (media.length) { fs.mkdirSync(path.join(OUT,'gallery'),{recursive:true}); for (const m of media) { const f = path.basename(m.preview_image.src); fs.copyFileSync(path.join(GALLERY,f), path.join(OUT,'gallery',f)); } }
console.log('rendered', html.length);
