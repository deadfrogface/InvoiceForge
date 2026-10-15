'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function createManifest(directory,version,source){
 if(!/^6\.(9|10)$/.test(version))throw Error('Unsupported taxonomy version');
 if(!fs.statSync(directory).isDirectory())throw Error('Taxonomy directory missing');
 const files=[];
 function walk(folder){
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
   const absolute=path.join(folder,entry.name);
   if(entry.isSymbolicLink())throw Error('Taxonomy symlinks are forbidden');
   if(entry.isDirectory())walk(absolute);
   else if(entry.isFile()){
    const relative=path.relative(directory,absolute).split(path.sep).join('/');
    if(relative==='manifest.json')continue;
    if(!/\.(xsd|xml|xbrl|xlink|txt|json)$/i.test(relative))throw Error('Unexpected taxonomy file: '+relative);
    const sha256=crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
    files.push({path:relative,sha256});
   }
  }
 }
 walk(directory);
 if(!files.some(f=>f.path.endsWith('.xsd')))throw Error('No XSD files in taxonomy');
 files.sort((a,b)=>a.path.localeCompare(b.path));
 return {version,source,files};
}
if(require.main===module){
 const [version,directory,source]=process.argv.slice(2);
 if(!version||!directory||!source||!/^https:\/\//.test(source))throw Error('Usage: node scripts/manifest-taxonomy.js <6.9|6.10> <unpacked official directory> <official source URL>');
 const manifest=createManifest(path.resolve(directory),version,source);
 fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('Taxonomy files indexed: '+manifest.files.length);
}
module.exports={createManifest};
