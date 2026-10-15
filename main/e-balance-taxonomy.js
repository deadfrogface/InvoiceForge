'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const SUPPORTED={'6.9':{firstYear:2025,normalFirstYear:2026},'6.10':{firstYear:2026,normalFirstYear:2027}};
function selectTaxonomy(year,version){
 if(!Number.isInteger(year)||year<2000||year>2200)throw Error('Ungültiges Geschäftsjahr');
 const v=version|| (year>=2027?'6.10':year>=2026?'6.9':null);
 if(!v||!SUPPORTED[v]||year<SUPPORTED[v].firstYear)throw Error('Taxonomie für dieses Geschäftsjahr nicht hinterlegt');
 return {version:v,year,earlyUse:year<SUPPORTED[v].normalFirstYear};
}
function loadTaxonomyManifest(root,year,version){
 const selected=selectTaxonomy(year,version);
 const directory=path.resolve(root,selected.version);
 const manifestFile=path.join(directory,'manifest.json');
 if(!fs.existsSync(manifestFile))throw Error('Amtliches Taxonomiepaket '+selected.version+' fehlt offline');
 const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
 if(manifest.version!==selected.version||!Array.isArray(manifest.files)||!manifest.files.length)throw Error('Taxonomiemanifest unvollständig');
 for(const file of manifest.files){
  if(typeof file.path!=='string'||!/^[-\w./]+$/.test(file.path)||file.path.startsWith('/')||file.path.split('/').includes('..')||!/^([a-f0-9]{64})$/.test(file.sha256))throw Error('Ungültiger Taxonomieeintrag');
  const location=path.join(directory,file.path);
  if(!fs.existsSync(location)||!fs.statSync(location).isFile())throw Error('Taxonomiedatei fehlt: '+file.path);
  const digest=crypto.createHash('sha256').update(fs.readFileSync(location)).digest('hex');
  if(digest!==file.sha256)throw Error('Taxonomie-Prüfsumme stimmt nicht: '+file.path);
 }
 return {...selected,files:manifest.files.length,source:manifest.source||null,verifiedHashes:true};
}
function mapAccountBalances(trialBalance,mapping){
 if(!trialBalance||!Array.isArray(trialBalance.accounts)||!mapping||typeof mapping!=='object')throw Error('Konten oder Mapping fehlen');
 const facts=new Map(),unmapped=[];
 for(const account of trialBalance.accounts){
  if(!Number.isSafeInteger(account.balanceCents))throw Error('Ungültiger Kontensaldo');
  if(account.balanceCents===0)continue;
  const concept=mapping[account.number];
  if(typeof concept!=='string'||!/^([a-zA-Z][\w-]*\.)+[\w.-]+$/.test(concept)){unmapped.push(account.number);continue;}
  facts.set(concept,(facts.get(concept)||0)+account.balanceCents);
 }
 return {facts:Object.fromEntries(facts),unmapped,complete:unmapped.length===0,accountProof:trialBalance.accounts.filter(a=>a.balanceCents!==0).map(a=>({number:a.number,name:a.name,balanceCents:a.balanceCents,concept:mapping[a.number]||null}))};
}
module.exports={SUPPORTED,selectTaxonomy,loadTaxonomyManifest,mapAccountBalances};
