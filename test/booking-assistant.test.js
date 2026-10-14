const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {proposeDocument,recurringSuggestions,moneyCents}=require('../main/booking-assistant');
const {monthClose,taxReconciliation,depreciationSchedule}=require('../main/closing-assistant');
const {DoubleEntryLedger}=require('../main/double-entry');
test('invoice suggestions never auto-post, flag tax review and assign fiscal year',()=>{
 const doc={invoiceNumber:'R-1',issueDate:'2026-10-14',payableAmount:'119,00',currency:'EUR',taxRate:19,valid:false};
 const p=proposeDocument(doc);
 assert.equal(p.year,2026);assert.equal(p.grossCents,11900);assert.equal(p.vatCents,1900);
 assert.equal(p.requiresApproval,true);assert.equal(p.automaticPosting,false);
 assert.ok(p.issues.some(x=>x.includes('Steuersatz')));
 assert.ok(proposeDocument(doc,[p]).issues.some(x=>x.includes('doppelter')));
 assert.equal(moneyCents('1.234,56'),123456);
});
test('recurring patterns are suggestions only',()=>{
 const lines=[{account:'6300',debitCents:1000,creditCents:0},{account:'1200',debitCents:0,creditCents:1000}];
 const result=recurringSuggestions([{date:'2026-01-01',description:'Miete',lines},{date:'2026-02-01',description:'Miete',lines}]);
 assert.equal(result.length,1);assert.equal(result[0].automaticPosting,false);
});
test('monthly review, tax bridge and depreciation remain provisional',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-close-'));
 try{
  const ledger=new DoubleEntryLedger(dir);
  ledger.post({date:'2026-10-14',description:'Erlös',reference:'INV-1',lines:[{account:'1200',debitCents:11900,creditCents:0},{account:'4000',debitCents:0,creditCents:10000},{account:'1776',debitCents:0,creditCents:1900}]});
  assert.equal(monthClose(ledger,2026,10).outputVatCents,1900);
  assert.equal(taxReconciliation(ledger,2026,[{type:'add',amountCents:500,reason:'Nicht abzugsfähig'}]).preliminaryTaxProfitCents,10500);
  const a=depreciationSchedule([{name:'Laptop',acquired:'2026-01-01',costCents:120000,usefulLifeYears:3}],2026);
  assert.equal(a[0].depreciationCents,39996);assert.equal(a[0].requiresReview,true);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('incomplete or invalid invoice metadata must not produce postable lines',()=>{
 const base={invoiceNumber:'R-1',issueDate:'2026-10-14',payableAmount:'119.00',currency:'EUR',taxRate:19};
 assert.equal(proposeDocument({...base,issueDate:'2026-02-30'}).lines.length,0);
 assert.equal(proposeDocument({...base,currency:'USD'}).lines.length,0);
 assert.equal(proposeDocument({...base,invoiceNumber:''}).lines.length,0);
 assert.equal(proposeDocument({...base,payableAmount:'0.00'}).lines.length,0);
 assert.equal(proposeDocument(base).lines.length,3);
});

test('unconfirmed VAT never produces bookable entries',()=>{
 const doc={invoiceNumber:'R-2',issueDate:'2026-10-14',payableAmount:'119.00',currency:'EUR'};
 const p=proposeDocument(doc);
 assert.equal(p.lines.length,0);
 assert.equal(p.vatCents,null);
 assert.ok(p.issues.some(x=>x.includes('Steuersatz')));
 assert.equal(proposeDocument({...doc,taxRate:7}).lines.length,0);
});
