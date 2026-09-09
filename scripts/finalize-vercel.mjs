import fs from 'node:fs/promises';
const file='.vercel/output/config.json';
const config=JSON.parse(await fs.readFile(file,'utf8'));
const source=JSON.parse(await fs.readFile('vercel.json','utf8'));
const rules=(source.redirects??[]).map(r=>({src:r.source,dest:r.destination,status:301}));
config.routes=[...rules,...(config.routes??[])];
await fs.writeFile(file,JSON.stringify(config,null,2)+'\n');
console.log(`Applied demo noindex header and ${rules.length} permanent redirects to prebuilt output.`);
await import('./prepare-deployment-media.mjs');
