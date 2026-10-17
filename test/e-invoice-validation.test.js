const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {validateEInvoiceFile}=require('../main/e-invoice-validation');
test('official e-invoice validation never passes without bundled validator',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-validation-'));
 try{
  const file=path.join(dir,'invoice.xml');fs.writeFileSync(file,'<Invoice/>');
  const r=validateEInvoiceFile(file);
  assert.equal(r.valid,false);assert.equal(r.readyForUse,false);
  assert.throws(()=>validateEInvoiceFile(path.join(dir,'invoice.pdf')),/XML/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
