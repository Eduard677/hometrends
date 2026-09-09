import { chromium } from "playwright";
const B="http://localhost:5417";
const TEMPLATES=[["home","/"],["shop","/shop"],["pdp-variants","/products/troy-cabinet"],
  ["pdp-plain","/products/new-york-storage-bed"],["collection","/collections/living-room"],
  ["cart","/bag"],["form","/contact"]];
const WIDTHS=[[320,568],[360,800],[390,844],[430,932],[844,390]];
const b=await chromium.launch();
const found={};
for(const [name,url] of TEMPLATES){
  for(const [w,h] of WIDTHS){
    const p=await b.newPage({viewport:{width:w,height:h}});
    await p.goto(B+url,{waitUntil:"networkidle"}).catch(()=>{});
    await p.evaluate(async()=>{scrollTo(0,document.body.scrollHeight);await new Promise(r=>setTimeout(r,700));scrollTo(0,0);});
    await p.waitForTimeout(400);
    const r=await p.evaluate(()=>{
      const cw=document.documentElement.clientWidth;
      const bad=[...document.querySelectorAll('*')].filter(el=>{
        const r=el.getBoundingClientRect();
        if(!r.width&&!r.height) return false;
        return r.right>cw+1||r.left<-1;
      }).map(el=>({tag:el.tagName,cls:(typeof el.className==="string"?el.className:"").slice(0,42),w:Math.round(el.getBoundingClientRect().width),right:Math.round(el.getBoundingClientRect().right)}));
      return {scrollW:document.documentElement.scrollWidth,clientW:cw,bad:bad.slice(0,6),total:bad.length};
    });
    const key=`${name}@${w}`;
    if(r.scrollW>r.clientW||r.total) found[key]={scroll:`${r.scrollW}>${r.clientW}`,count:r.total,worst:r.bad};
    await p.close();
  }
}
const keys=Object.keys(found);
console.log(keys.length?`OVERFLOW on ${keys.length} of 35 combos:`:"NO OVERFLOW anywhere (35 combos clean)");
for(const k of keys){const f=found[k];
  console.log(` ${k}  scrollW ${f.scroll}  offenders ${f.count}`);
  for(const o of f.worst) console.log(`    ${o.tag}.${o.cls||"(no class)"} w=${o.w} right=${o.right}`);}
await b.close();
