import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Explicit opt-in: only the existing catalogue's Shopify CDN uploads.
const download = process.argv.includes('--download');
const live = JSON.parse(await fs.readFile('products-catalogue.json', 'utf8'));
const old = JSON.parse(await fs.readFile('src/data/ht-shop.json', 'utf8'));
const byId = new Map(old.map(p => [String(p.id), p]));
await fs.mkdir('.cache/catalogue-originals', { recursive: true });
await fs.mkdir('public/media/catalogue', { recursive: true });
await fs.mkdir('reports', { recursive: true });
let excluded = {};
try { excluded = JSON.parse(await fs.readFile('reports/excluded-images.json', 'utf8')); } catch { /* first run */ }
const manifest = {};
const report = [];
const tasks = live.flatMap(p => p.images.map((image, index) => ({ p, image, index })));
let done = 0;
function fullResolution(src) {
  const url = new URL(src);
  if (url.hostname !== 'cdn.shopify.com' || !url.pathname.startsWith('/s/files/1/0567/1377/3243/')) throw new Error('Unexpected image source');
  url.pathname = url.pathname.replace(/_\d+x\d*(?=\.[a-z]+$)/i, '');
  url.searchParams.delete('width');
  url.searchParams.delete('height');
  return url.toString();
}
async function creamBackground(input) {
  const { data, info } = await sharp(input).rotate().resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#EFEAE1' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const pale = i => {
    const r=data[i*c], g=data[i*c+1], b=data[i*c+2];
    return Math.min(r,g,b)>226 && Math.max(r,g,b)-Math.min(r,g,b)<18;
  };
  let edge=0, count=0;
  for(let x=0;x<w;x+=Math.max(1,Math.floor(w/40))) { edge+=Number(pale(x))+Number(pale((h-1)*w+x));count+=2; }
  for(let y=0;y<h;y+=Math.max(1,Math.floor(h/40))) { edge+=Number(pale(y*w))+Number(pale(y*w+w-1));count+=2; }
  const packshot = edge/count > .6;
  let changed=0;
  if(packshot) {
    // Edge-connected flood fill protects disconnected white upholstery/details.
    const seen=new Uint8Array(w*h), queue=new Int32Array(w*h);let head=0,tail=0;
    const add=i=>{if(!seen[i]&&pale(i)){seen[i]=1;queue[tail++]=i;}};
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
    for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
    while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);if(x) add(i-1);if(x<w-1)add(i+1);if(y)add(i-w);if(y<h-1)add(i+w);}
    for(let i=0;i<seen.length;i++)if(seen[i]){data[i*c]=239;data[i*c+1]=234;data[i*c+2]=225;changed++;}
  }
  return { pipeline: sharp(data,{raw:info}), packshot, changed, width:w, height:h };
}
async function processImage({p,image,index}) {
  const source=fullResolution(image.src), key=createHash('sha256').update(source).digest('hex').slice(0,16);
  const prefix=`/media/catalogue/${key}`;
  const row={product_id:p.id,title:p.title,index:index+1,source,output:prefix+'.webp',status:'',background_pixels:0};
  if(excluded[key] || excluded[image.src]) {row.status='excluded: '+(excluded[key]||excluded[image.src]);report.push(row);return;}
  const original=`.cache/catalogue-originals/${key}`;
  let input=original;
  try {
    if(!existsSync(original)) {
      if(download) {
        let response;
        for(let attempt=0;attempt<3;attempt++) { response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(response.ok)break; }
        if(!response?.ok) throw new Error(`CDN ${response?.status}`);
        await fs.writeFile(original,Buffer.from(await response.arrayBuffer()));
      } else {
        const local=index===0?byId.get(String(p.id))?.image:null;
        if(!local || !existsSync('public'+local)) throw new Error('Original not local; download not enabled');
        input='public'+local;
      }
    }
    let result;
    const cached=prefix+'.json';
    if(existsSync('public'+cached)) result=JSON.parse(await fs.readFile('public'+cached,'utf8'));
    if (!result || (download && !result.fullResolution)) {
      const processed=await creamBackground(input);
      let composition,webp,jpeg,width=800;
      for(const size of [800,640,480]) {
        width=size;
        composition=processed.pipeline.clone().resize(width,width*1.25,{fit:processed.packshot?'contain':'cover',background:'#EFEAE1'});
        for(let quality=82;quality>=28;quality-=9){
          webp=await composition.clone().webp({quality}).toBuffer();
          jpeg=await composition.clone().jpeg({quality,mozjpeg:true}).toBuffer();
          if(webp.length<200000&&jpeg.length<200000) break;
        }
        if(webp.length<200000&&jpeg.length<200000)break;
      }
      if(webp.length>=200000||jpeg.length>=200000)throw new Error('Image exceeds 200KB budget');
      await fs.writeFile('public'+prefix+'.webp',webp);await fs.writeFile('public'+prefix+'.jpg',jpeg);
      const blur=await composition.clone().resize(16,20).webp({quality:30}).toBuffer();
      result={src:prefix+'.webp',fallback:prefix+'.jpg',blur:'data:image/webp;base64,'+blur.toString('base64'),source,width,height:width*1.25,backgroundPixels:processed.changed,originalWidth:processed.width,originalHeight:processed.height,fullResolution:download};
      await fs.writeFile('public'+cached,JSON.stringify(result));
    }
    (manifest[p.id]??=[]).push({...result,position:index+1,alt:image.alt?.trim()||`${p.title} — product photograph ${index+1}, Home Trends Furniture, Ennis`});
    row.status=download?'processed original':'processed local';row.background_pixels=result.backgroundPixels;
  } catch(e) {row.status='missing: '+e.message;}
  report.push(row);
  done++;if(done%100===0)console.log(`${done}/${tasks.length} catalogue images`);
}
let cursor=0;
await Promise.all(Array.from({length:8},async()=>{while(cursor<tasks.length)await processImage(tasks[cursor++]);}));
for(const images of Object.values(manifest))images.sort((a,b)=>a.position-b.position);
await fs.writeFile('src/data/catalogue-media.json',JSON.stringify(manifest));
const cols=['product_id','title','index','source','output','status','background_pixels'];
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await fs.writeFile('reports/product-image-processing.csv',[cols.join(','),...report.sort((a,b)=>a.product_id-b.product_id||a.index-b.index).map(r=>cols.map(k=>csv(r[k])).join(','))].join('\n')+'\n');
console.log(JSON.stringify({products:Object.keys(manifest).length,images:Object.values(manifest).flat().length,backgroundsChanged:report.filter(r=>r.background_pixels>0).length,missing:report.filter(r=>r.status.startsWith('missing')).length,excluded:report.filter(r=>r.status.startsWith('excluded')).length}));
