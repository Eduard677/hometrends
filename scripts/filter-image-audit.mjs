import fs from 'node:fs/promises';
const audit=JSON.parse(await fs.readFile('reports/image-text-audit.json','utf8'));
const exclusions=JSON.parse(await fs.readFile('reports/excluded-images.json','utf8'));
const supplier=/natural\s*(?:\|\s*)?sleep|sleep co\b|serenity sleep|\bGIE\b|aurorabeds|aurora\s*(?:\|\s*)?beds|clarke.s|gannons|honey b|wholesale beds|taralane/i;
const sale=/\bsale\b|[€£]\s*\d|\d\s*%\s*off/i;
for(const row of audit){if(supplier.test(row.text??'')||sale.test(row.text??''))exclusions[row.key]=(sale.test(row.text)?'Sale/price signage':'Supplier branding/watermark')+': '+row.text;}
await fs.writeFile('reports/excluded-images.json',JSON.stringify(exclusions,null,2)+'\n');
console.log(`${Object.keys(exclusions).length} images excluded; originals retained in the local cache.`);
