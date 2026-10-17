const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createManifest}=require('../scripts/manifest-taxonomy');
const {loadTaxonomyManifest}=require('../main/e-balance-taxonomy');
test('official taxonomy directory is indexed deterministically and verified offline',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if-xbrl-'));
 try{
  const dir=path.join(root,'6.9');fs.mkdirSync(path.join(dir,'gaap'),{recursive:true});
  fs.writeFileSync(path.join(dir,'gaap','taxonomy.xsd'),'<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"/>');
  const manifest=createManifest(dir,'6.9','https://www.esteuer.de/');
  assert.equal(manifest.files.length,1);
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest));
  assert.equal(loadTaxonomyManifest(root,2026).verifiedHashes,true);
  fs.writeFileSync(path.join(dir,'gaap','taxonomy.xsd'),'changed');
  assert.throws(()=>loadTaxonomyManifest(root,2026),/Prüfsumme/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('taxonomy staging refuses arbitrary files and symlinks',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if-xbrl-'));
 try{
  fs.writeFileSync(path.join(root,'payload.exe'),'not taxonomy');
  assert.throws(()=>createManifest(root,'6.9','https://www.esteuer.de/'),/Unexpected/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
