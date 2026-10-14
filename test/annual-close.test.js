const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {DoubleEntryLedger}=require('../main/double-entry');
const {annualCloseChecklist}=require('../main/annual-close');
test('annual closing aggregates all months and stays blocked for filing',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-annual-'));
 try{
  const ledger=new DoubleEntryLedger(dir);
  ledger.post({date:'2026-04-01',description:'Erlös',reference:'R-42',lines:[{account:'1200',debitCents:11900,creditCents:0},{account:'4000',debitCents:0,creditCents:10000},{account:'1776',debitCents:0,creditCents:1900}]});
  const result=annualCloseChecklist(ledger,[],2026);
  assert.equal(result.months.length,12);
  assert.equal(result.months[3].outputVatCents,1900);
  assert.equal(result.statement.guv.profitCents,10000);
  assert.equal(result.readyForFiling,false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
