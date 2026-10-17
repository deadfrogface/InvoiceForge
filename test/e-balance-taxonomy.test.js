const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {selectTaxonomy,loadTaxonomyManifest,mapAccountBalances}=require('../main/e-balance-taxonomy');
test('fiscal year selects official taxonomy generation',()=>{
 assert.equal(selectTaxonomy(2026).version,'6.9');
 assert.equal(selectTaxonomy(2027).version,'6.10');
 assert.throws(()=>selectTaxonomy(2024,'6.9'));
});
test('offline taxonomy manifest validates every SHA256 and rejects changes',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if-taxonomy-'));
 try{
  const dir=path.join(root,'6.9');fs.mkdirSync(dir);
  const content='<schema/>';fs.writeFileSync(path.join(dir,'sample.xsd'),content);
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({version:'6.9',files:[{path:'sample.xsd',sha256:crypto.createHash('sha256').update(content).digest('hex')}]}));
  assert.equal(loadTaxonomyManifest(root,2026).verifiedHashes,true);
  fs.writeFileSync(path.join(dir,'sample.xsd'),'tampered');
  assert.throws(()=>loadTaxonomyManifest(root,2026),/Prüfsumme/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('every nonzero account requires mapping and uncompressed account proof',()=>{
 const trialBalance={accounts:[{number:'1200',name:'Bank',balanceCents:100},{number:'1776',name:'VAT',balanceCents:-100}]};
 const partial=mapAccountBalances(trialBalance,{'1200':'bs.ass.currAss.cashEquiv'});
 assert.deepEqual(partial.unmapped,['1776']);
 assert.equal(partial.complete,false);
 const full=mapAccountBalances(trialBalance,{'1200':'bs.ass.currAss.cashEquiv','1776':'bs.eqLiab.otherLiab'});
 assert.equal(full.complete,true);
 assert.equal(full.accountProof.length,2);
});
