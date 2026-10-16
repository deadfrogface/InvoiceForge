'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {loadTaxonomyManifest,mapAccountBalances}=require('../main/e-balance-taxonomy');
const {readDocument,toolPath}=require('../main/document-extraction');
test('taxonomy manifests reject duplicate paths and symlinked schemas',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if-manifest-'));
 try{
  const dir=path.join(root,'6.9');fs.mkdirSync(dir);
  const content='<schema/>';const item={path:'a.xsd',sha256:crypto.createHash('sha256').update(content).digest('hex')};
  fs.writeFileSync(path.join(dir,'a.xsd'),content);
  const manifest=files=>fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({version:'6.9',files}));
  manifest([item,item]);assert.throws(()=>loadTaxonomyManifest(root,2026),/Doppelter/);
  fs.renameSync(path.join(dir,'a.xsd'),path.join(root,'outside.xsd'));
  fs.symlinkSync(path.join(root,'outside.xsd'),path.join(dir,'a.xsd'));
  manifest([item]);assert.throws(()=>loadTaxonomyManifest(root,2026),/Verknüpfungen/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('account aggregation rejects unsafe integer sums and inherited mappings',()=>{
 const tb={accounts:[{number:'1',balanceCents:Number.MAX_SAFE_INTEGER},{number:'2',balanceCents:1}]};
 assert.throws(()=>mapAccountBalances(tb,{'1':'bs.cash','2':'bs.cash'}),/Centbereich/);
 assert.equal(mapAccountBalances({accounts:[{number:'1',balanceCents:1}]},Object.create({'1':'bs.cash'})).complete,false);
});
test('tool lookup rejects traversal and arbitrary executables',()=>{
 assert.throws(()=>toolPath('../../payload'),/Unbekanntes/);
});
test('scan PDF path probes Poppler with -v, sorts pages and joins actual newlines',()=>{
 const cp=require('node:child_process');const oldSpawn=cp.spawnSync,oldResources=process.resourcesPath;
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if-ocr-'));
 const calls=[];
 try{
  process.resourcesPath=root;
  const dir=path.join(root,'tools',process.platform,process.arch);fs.mkdirSync(path.join(dir,'tessdata'),{recursive:true});
  for(const name of ['pdftotext','pdftoppm','tesseract'])fs.writeFileSync(path.join(dir,name+(process.platform==='win32'?'.exe':'')),'fixture');
  for(const lang of ['deu','eng'])fs.writeFileSync(path.join(dir,'tessdata',lang+'.traineddata'),'fixture');
  cp.spawnSync=(binary,args,options)=>{
   calls.push({binary,args,options});
   const name=path.basename(binary).replace('.exe','');
   if(args[0]==='-v'||args[0]==='--version')return {status:args[0]===(name==='tesseract'?'--version':'-v')?0:1,stdout:''};
   if(name==='pdftotext')return {status:0,stdout:''};
   if(name==='pdftoppm'){const prefix=args.at(-1);for(const n of [10,2,1])fs.writeFileSync(prefix+'-'+n+'.png','page');return {status:0,stdout:''};}
   return {status:0,stdout:path.basename(args[0])};
  };
  const file=path.join(root,'scan.pdf');fs.writeFileSync(file,'%PDF-fixture');
  const result=readDocument(file);
  assert.equal(result.text,'page-1.png\npage-2.png\npage-10.png');
  assert.equal(result.source,'bundled-pdf-ocr');
  const render=calls.find(c=>c.args.includes('-png'));assert.equal(fs.existsSync(path.dirname(render.args.at(-1))),false);
  assert.ok(calls.every(c=>c.options.shell===false));
 }finally{cp.spawnSync=oldSpawn;if(oldResources===undefined)delete process.resourcesPath;else process.resourcesPath=oldResources;fs.rmSync(root,{recursive:true,force:true});}
});
