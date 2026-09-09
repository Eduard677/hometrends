import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const live=JSON.parse(await fs.readFile('products-catalogue.json','utf8'));
const shop=JSON.parse(await fs.readFile('src/data/ht-shop.json','utf8'));
const media=JSON.parse(await fs.readFile('src/data/catalogue-media.json','utf8'));
const byId=new Map(live.map(p=>[String(p.id),p]));
const baseline=new Map(JSON.parse(execFileSync('git',['show','829f45f:src/data/ht-shop.json'],{maxBuffer:10_000_000,encoding:'utf8'})).map(p=>[String(p.id),p]));
const report=[];
for(const p of shop){
  const current=byId.get(String(p.id));
  if(!current)continue;
  const variant=current.variants.reduce((min,v)=>Number(v.price)<Number(min.price)?v:min);
  const before=baseline.get(String(p.id))??p;
  report.push({id:p.id,title:p.name,old_price:before.fromPrice,live_price:variant.price,old_compare:before.compareAt??'',live_compare:variant.compare_at_price??'',action:variant.compare_at_price?'retain live compare-at':'remove empty compare-at',availability:'Showroom stock and lead time not supplied'});
  p.fromPrice=Number(variant.price);
  p.compareAt=Number(variant.compare_at_price)||undefined;
  p.priceVaries=new Set(current.variants.map(v=>v.price)).size>1;
  p.availability='';
  p.images=media[p.id]??[];
  p.image=p.images[0]?.src??'';
  p.imageAlt=`${p.name} — Home Trends Furniture, Ennis`;
}
const cols=Object.keys(report[0]);const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await fs.writeFile('reports/prices-and-availability.csv',[cols.join(','),...report.map(r=>cols.map(k=>csv(r[k])).join(','))].join('\n')+'\n');
await fs.writeFile('src/data/ht-shop.json',JSON.stringify(shop,null,2)+'\n');
console.log(`Updated ${report.length} matched products; ${live.filter(p=>p.variants.some(v=>v.compare_at_price)).length} live products have compare-at prices.`);
