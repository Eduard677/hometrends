import fs from 'node:fs/promises';
import sharp from 'sharp';
const media=JSON.parse(await fs.readFile('src/data/catalogue-media.json','utf8'));
const primary=process.argv.includes('--text')?JSON.parse(await fs.readFile('reports/image-text-audit.json','utf8')).filter(x=>x.text).map(x=>({id:x.key,src:'/media/catalogue/'+x.key+'.webp'})):Object.entries(media).map(([id,images])=>({id,...images[0]}));
await fs.mkdir('screenshots/media-audit',{recursive:true});
for(let start=0;start<primary.length;start+=100){
  const cells=await Promise.all(primary.slice(start,start+100).map(async(p,i)=>{
    const image=await sharp('public'+p.src).resize(100,125).toBuffer();
    const label=Buffer.from(`<svg width="100" height="20"><rect width="100" height="20" fill="#EFEAE1"/><text x="3" y="13" font-size="8">${p.id}</text></svg>`);
    return [{input:image,left:(i%10)*100,top:Math.floor(i/10)*145},{input:label,left:(i%10)*100,top:Math.floor(i/10)*145+125}];
  }));
  await sharp({create:{width:1000,height:Math.ceil(cells.length/10)*145,channels:3,background:'#EFEAE1'}}).composite(cells.flat()).jpeg({quality:85}).toFile(`screenshots/media-audit/${process.argv.includes('--text')?'text':'primary'}-${start}.jpg`);
}
console.log(`Contact sheets for ${primary.length} products`);
