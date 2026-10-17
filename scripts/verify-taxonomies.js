'use strict';
const path=require('node:path'),fs=require('node:fs');
const {loadTaxonomyManifest}=require('../main/e-balance-taxonomy');
const root=path.resolve(__dirname,'..','vendor','taxonomies');
let failed=false;
for(const version of ['6.9','6.10']){
 try{
  const year=version==='6.9'?2026:2027;
  const report=loadTaxonomyManifest(root,year,version);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,version,'manifest.json'),'utf8'));
  if(!manifest.source||!/^https:\/\//.test(manifest.source)||!manifest.files.some(x=>x.path.endsWith('.xsd')))throw Error('No official source URL or XSD schema');
  console.log(version+': '+report.files+' hashed taxonomy files');
 }catch(e){console.error(version+': '+e.message);failed=true;}
}
if(failed)process.exitCode=1;
