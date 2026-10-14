const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {readDocument,capabilities}=require('../main/document-extraction');
test('offline document extraction reads plain text and refuses unsupported files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-doc-'));
 try{
  const filename=path.join(dir,'beleg.txt');fs.writeFileSync(filename,'Rechnung 2026');
  const result=readDocument(filename);
  assert.equal(result.source,'text');assert.match(result.text,/Rechnung/);
  assert.equal(result.requiresReview,true);
  assert.throws(()=>readDocument(path.join(dir,'bad.exe')),/nicht unterstützt/);
  assert.equal(typeof capabilities().tesseract,'boolean');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
