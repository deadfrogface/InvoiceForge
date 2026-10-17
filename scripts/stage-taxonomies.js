'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {loadTaxonomyManifest}=require('../main/e-balance-taxonomy');
const {createManifest}=require('./manifest-taxonomy');
const sources=require('../main/taxonomy-sources.json');
const root=path.resolve(__dirname,'..','vendor','taxonomies');
for(const [version,source] of Object.entries(sources)){
 const directory=path.join(root,version),manifest=path.join(directory,'manifest.json');
 if(!fs.existsSync(directory)){
  cp.execFileSync(process.platform==='win32'?'python':'python3',[
   path.join(__dirname,'fetch-official-taxonomies.py'),'--version',version,
   '--source','publisher','--output',directory
  ],{stdio:'inherit',shell:false,timeout:180000});
 }
 const provenance=JSON.parse(fs.readFileSync(path.join(directory,'provenance.json'),'utf8'));
 if(provenance.version!==version||provenance.archiveSha256!==source.sha256||provenance.source!==source.url)throw Error('Taxonomy provenance does not match pinned publisher archive: '+version);
 if(!fs.existsSync(manifest))fs.writeFileSync(manifest,JSON.stringify(createManifest(directory,version,source.url),null,2)+'\n');
 const checked=loadTaxonomyManifest(root,version==='6.9'?2026:2027,version);
 console.log('Verified offline taxonomy '+version+': '+checked.files+' files');
}
