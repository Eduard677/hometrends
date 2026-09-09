import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const live=JSON.parse(await fs.readFile('products-catalogue.json','utf8'));
const old=JSON.parse(execFileSync('git',['show','829f45f:src/data/ht-shop.json'],{encoding:'utf8',maxBuffer:10_000_000}));
const byId=new Map(old.map(p=>[String(p.id),p]));
const media=JSON.parse(await fs.readFile('src/data/catalogue-media.json','utf8'));
const labels={'sofas-chairs':'Sofas & Chairs','chairs-footstools':'Chairs & Footstools','beds':'Beds','mattresses':'Mattresses','bedroom-furniture':'Bedroom furniture','dining':'Dining','living-room':'Living Room','home-office':'Home office','rugs':'Rugs','lighting':'Lighting','accessories':'Accessories','flooring':'Flooring','garden-furniture':'Garden furniture','kids-furniture':'Kids Furniture','gift-vouchers':'Gift vouchers'};
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
async function writeCsv(file,rows,columns){await fs.writeFile('reports/'+file,[columns.join(','),...rows.map(row=>columns.map(key=>csv(row[key])).join(','))].join('\n')+'\n');}
export function cleanText(s){
  return String(s??'').replace(/<(script|style)[\s\S]*?<\/\1>/gi,'').replace(/<\/(?:p|div|li|h[1-6])>|<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;|\u00a0/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/draw[’']s attention/gi,'draws attention').replace(/warerobe/gi,'Wardrobe').replace(/Home Trend[’']s/gi,'Home Trends').replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim();
}
function skuTitle(name){return /^(?:[A-Z]{1,5}-?\d+[A-Z\d-]*(?=\s|$)|\d{3,}\s*-\s*)/i.test(name);}
export function cleanTitle(title){
  const name=cleanText(title);
  let value=name.replace(/(?:\s*[-–]\s*|\s+)(?:HJ|IM|WS|GA|DE|McN|BRE|HT|AL|GIE|GI|JB)\s*$/i,'').trim();
  if(skuTitle(value))return value;
  if(value===value.toUpperCase())value=value.toLowerCase().replace(/\b\p{L}/gu,c=>c.toUpperCase());
  return value;
}
const slugify=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').replace(/(?:^|-)copy(?=-|$)/g,'').replace(/--+/g,'-').replace(/^-|-$/g,'');
export function classify(p){
  const title=cleanTitle(p.title).toLowerCase();
  const tags=p.tags.join(' ').toLowerCase();
  const type=p.product_type.toLowerCase();
  // Specific product nouns outrank the live store's broad, sometimes incorrect type.
  const rules=[
    ['gift-vouchers',/gift.*(?:voucher|card)/],['rugs',/\brug\b|\brunner\b/],
    ['kids-furniture',/\bbunk\b|\bcabin\b|\bmid.?sleeper\b|\bhigh.?sleeper\b|\btriple sleeper\b/],
    ['sofas-chairs',/\bsofa\b|\bsofabed\b|\bsuite\b|\bsectional\b|\bseater\b/],
    ['mattresses',/\bmattress\b|\btopper\b/],
    ['bedroom-furniture',/wardrobe|\brobes?\b|bedside|\blockers?\b|headboard|dressing table|\btallboy\b|\bchest\b|blanket box/],
    ['beds',/bedframe|bed frame|\bbeds?\b|\bdivan\b|headboard.*base/],
    ['home-office',/\bdesk\b|\boffice\b|\bworkstation\b/],
    ['garden-furniture',/\bgarden\b|\boutdoor\b|\bpatio\b/],
    ['lighting',/\blamp\b|\bsconce\b|\blight\b|\bchandelier\b/],
    ['accessories',/\bmirror\b|wall art|wall decoration|\bpainting\b|\bcanvas\b|\bcushion\b|\bvase\b/],
    ['dining',/dining|\bbar stool\b|\bbarstool\b|\bbreakfast\b|\bbench\b|\bsideboard\b/],
    ['living-room',/coffee|\bconsole\b|\bnest\b|\bside table\b|\bend table\b|\boccasional table\b|\bbookcase\b|\bcabinet\b|\btv\b|\bmedia unit\b|\bdisplay unit\b/],
    ['chairs-footstools',/\barmchairs?\b|\barm chairs?\b|\baccent chairs?\b|\boccasional chairs?\b|\bfireside\b|\brecliner\b|\brocking\b|\bfootstools?\b|lift.*rise|\bbean bag\b/],
  ];
  if(/headboard.*base|base.*headboard/.test(title))return ['beds','title: headboard and base set'];
  for(const [category,pattern] of rules)if(pattern.test(title))return [category,'title: '+pattern.source];
  for(const [category,pattern] of rules)if(pattern.test(tags))return [category,'tags: '+pattern.source];
  const types={'beds':'beds','mattress':'mattresses','bedroom':'bedroom-furniture','dining':'dining','wall decoration':'accessories','chest':'bedroom-furniture','bedside locker':'bedroom-furniture','dressing table':'bedroom-furniture','dining table':'dining','side tables':'living-room','console table':'living-room','nest of tables':'living-room','kids furniture':'kids-furniture','gift voucher':'gift-vouchers'};
  if(types[type])return [types[type],'product_type: '+p.product_type];
  return ['', 'Owner classification required'];
}
function dimensions(p,text){
  const sizes=[...new Set(p.variants.flatMap(v=>[v.option1,v.option2,v.option3]).filter(v=>v&&/(?:\d\s*(?:ft|['′])|\d\s*[x×]\s*\d|\d\s*(?:cm|mm)\b)/i.test(v)))];
  const stated=text.match(/(?:dimensions?|measurements?|size)\s*[:-]\s*([^\n]{3,240})/i)?.[1]?.trim();
  const titleSize=p.title.match(/\d+(?:\.\d+)?\s*[x×]\s*\d+(?:\.\d+)?(?:\s*[x×]\s*\d+(?:\.\d+)?)?\s*(?:cm|mm)\b/i)?.[0];
  const axes=text.match(/\bW\s*:?\s*\d+\s*D\s*:?\s*\d+\s*H\s*:?\s*\d+\s*(?:cm|mm)/i)?.[0];
  return [...new Set([sizes.length?'Sizes: '+sizes.join('; '):'',stated&&/\d/.test(stated)?stated:'',titleSize,axes].filter(Boolean))].join('\n');
}
const titleDiff=[],collectionDiff=[],unclassified=[],skuNames=[],missingDimensions=[],collisions=[],redirectRows=[];
const used=new Set();
const slugOwners=new Map();
for(const p of live){const base=slugify(cleanTitle(p.title));const current=slugOwners.get(base);if(!current||p.handle===base||byId.get(String(p.id))?.slug===base)slugOwners.set(base,String(p.id));}
const products=live.map(p=>{
  const before=byId.get(String(p.id));
  const name=cleanTitle(p.title),description=cleanText(p.body_html||p.body_text);
  const [category,reason]=classify(p);
  const tags=category?[category]:[];
  if(category==='chairs-footstools')tags.push('sofas-chairs');
  if(['beds','mattresses'].includes(category))tags.push('beds-mattresses');
  if(category==='kids-furniture'&&/bed|bunk|sleeper/i.test(name))tags.push('beds','beds-mattresses');
  if(['accessories','lighting'].includes(category))tags.push('objects');
  if(category==='rugs'){const source=p.tags.join(' ');if(/shaggy/i.test(source))tags.push('rugs-shaggy');if(/traditional/i.test(source))tags.push('rugs-traditional');if(/modern/i.test(source))tags.push('rugs-modern');}
  let slug=slugify(name)||String(p.id);
  if(used.has(slug)||slugOwners.get(slug)!==String(p.id)){collisions.push({id:p.id,title:name,slug});slug+='-'+String(p.id).slice(-6);}
  used.add(slug);
  const dim=dimensions(p,description);
  const images=(media[p.id]??[]).map((im,i)=>({src:im.src,fallback:im.fallback,blur:im.blur,alt:`${name} — product photograph ${i+1}, Home Trends Furniture, Ennis`}));
  const priceVariant=p.variants.reduce((min,v)=>Number(v.price)<Number(min.price)?v:min);
  const material=description.match(/\bmaterials?\s*:\s*([^\n.]+)/i)?.[1]?.trim()??'';
  const item={id:String(p.id),slug,name,category:labels[category]??'',subcategory:labels[category]??'',shortDescription:description.replace(/\s+/g,' ').slice(0,180),description,material,dimensions:dim,availability:'',image:images[0]?.src??'',imageAlt:images[0]?.alt??name,images,featured:before?.featured??false,fromPrice:Number(priceVariant.price),compareAt:Number(priceVariant.compare_at_price)||undefined,priceVaries:new Set(p.variants.map(v=>v.price)).size>1,related:[],tags,sourceName:p.title,variants:p.variants.map(v=>({id:String(v.id),title:v.title,price:Number(v.price),compareAt:Number(v.compare_at_price)||undefined,available:v.available,options:[v.option1,v.option2,v.option3].filter(Boolean)}))};
  titleDiff.push({id:p.id,demo_title:before?.name??'',live_title:p.title,display_title:name,old_slug:before?.slug??'',live_handle:p.handle,new_slug:slug,finding:!before?'New live product':before.name===p.title?'Live title retained; live handle may be historic':'Demo differs from live; restored live title before requested cleanup'});
  collectionDiff.push({id:p.id,title:name,live_type:p.product_type,live_tags:p.tags.join(' | '),demo_collections:before?.tags.join(' | ')??'',collections:tags.join(' | '),reason});
  if(!category)unclassified.push({id:p.id,title:name,live_type:p.product_type,tags:p.tags.join(' | '),image:item.image,owner_collection:''});
  if(skuTitle(p.title))skuNames.push({id:p.id,title:p.title,image:item.image,collection:labels[category]??'',owner_title:''});
  if(!dim)missingDimensions.push({id:p.id,title:name,collection:labels[category]??'',image:item.image,options:p.variants.map(v=>v.option1).join(' | '),owner_dimensions:''});
  for(const oldSlug of new Set([before?.slug,p.handle].filter(Boolean)))if(oldSlug!==slug)redirectRows.push({source:'/products/'+oldSlug,destination:'/products/'+slug,id:p.id});
  return item;
});
const canonical=new Set(products.map(p=>'/products/'+p.slug));
const redirectMap={};
for(const row of redirectRows){
  if(canonical.has(row.source)){collisions.push({id:row.id,title:'Old path conflicts with a canonical product URL',slug:row.source});continue;}
  redirectMap[row.source.replace('/products/','')]=row.destination.replace('/products/','');
}
const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
const keep=(config.redirects??[]).filter(r=>!r.source.startsWith('/products/')||['/products/modular-sofa','/products/corner-sofa'].includes(r.source));
config.redirects=[...keep,...Object.entries(redirectMap).map(([source,destination])=>({source:'/products/'+source,destination:'/products/'+destination,statusCode:301}))];
await fs.writeFile('vercel.json',JSON.stringify(config,null,2)+'\n');
await fs.writeFile('src/data/product-redirects.json',JSON.stringify(redirectMap,null,2)+'\n');
await fs.writeFile('src/data/ht-shop.json',JSON.stringify(products,null,2)+'\n');
await writeCsv('catalogue-title-slug-diff.csv',titleDiff,Object.keys(titleDiff[0]));
await writeCsv('catalogue-collection-diff.csv',collectionDiff,Object.keys(collectionDiff[0]));
await writeCsv('unclassified-products.csv',unclassified,['id','title','live_type','tags','image','owner_collection']);
await writeCsv('sku-products-for-owners.csv',skuNames,['id','title','image','collection','owner_title']);
await writeCsv('missing-dimensions.csv',missingDimensions,['id','title','collection','image','options','owner_dimensions']);
await writeCsv('slug-collisions.csv',collisions,['id','title','slug']);
const summary={live:live.length,previous:old.length,added:live.filter(p=>!byId.has(String(p.id))).length,removed:old.filter(p=>!live.some(v=>String(v.id)===String(p.id))).map(p=>({id:p.id,slug:p.slug})),emptyLiveType:live.filter(p=>!p.product_type).length,unclassified:unclassified.length,skuNames:skuNames.length,missingDimensions:missingDimensions.length,withDimensions:products.filter(p=>p.dimensions).length,redirects:Object.keys(redirectMap).length,collisions:collisions.length,collections:Object.fromEntries(Object.keys(labels).map(k=>[k,products.filter(p=>p.tags.includes(k)).length]))};
await fs.writeFile('reports/catalogue-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(summary);
