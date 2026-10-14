'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
class AssetRegister{
 constructor(directory){fs.mkdirSync(directory,{recursive:true});this.file=path.join(directory,'fixed-assets.jsonl');}
 list(){return fs.existsSync(this.file)?fs.readFileSync(this.file,'utf8').split('\n').filter(Boolean).map(JSON.parse):[];}
 add(asset){
  if(!asset||typeof asset.name!=='string'||!asset.name.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(asset.acquired)||!Number.isSafeInteger(asset.costCents)||asset.costCents<=0||!Number.isInteger(asset.usefulLifeYears)||asset.usefulLifeYears<1||asset.usefulLifeYears>100||typeof asset.reference!=='string'||!asset.reference.trim())throw Error('Anlage benötigt Name, Anschaffungsdatum, Centbetrag, Nutzungsdauer und Belegreferenz');
  const entry={id:crypto.randomUUID(),name:asset.name.trim(),acquired:asset.acquired,costCents:asset.costCents,usefulLifeYears:asset.usefulLifeYears,reference:asset.reference.trim(),createdAt:new Date().toISOString(),reviewed:false};
  fs.appendFileSync(this.file,JSON.stringify(entry)+'\n',{mode:0o600});return entry;
 }
}
module.exports={AssetRegister};
