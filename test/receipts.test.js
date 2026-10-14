const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {Ledger}=require('../main/bookkeeping');
test('receipt is archived and linked to its booking',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-receipt-'));
 try {
  const source=path.join(dir,'invoice.pdf');
  fs.writeFileSync(source,'%PDF-1.4\nTEST');
  const ledger=new Ledger(path.join(dir,'data'));
  const booking=ledger.add({date:'2026-10-14',type:'expense',description:'Laptop',amount:100,paymentSource:'private',businessPercent:100});
  const receipt=ledger.attachReceipt(booking.id,source);
  assert.equal(receipt.action,'receipt');
  assert.equal(ledger.list()[0].receipt.filename,receipt.filename);
  assert.equal(fs.readFileSync(ledger.receiptPath(booking.id),'utf8'),'%PDF-1.4\nTEST');
  assert.equal(ledger.events().length,2);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
