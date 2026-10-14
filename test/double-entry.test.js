const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {DoubleEntryLedger,validateJournal}=require('../main/double-entry');
const {inspectEInvoice}=require('../main/e-invoice');
test('journal rejects unbalanced postings and unknown accounts',()=>{
 const sample={date:'2026-10-14',description:'Test',lines:[{account:'1200',debitCents:10000,creditCents:0},{account:'4000',debitCents:0,creditCents:9000}]};
 assert.throws(()=>validateJournal(sample),/Soll und Haben/);
 sample.lines[1].creditCents=10000;assert.equal(validateJournal(sample),10000);
 sample.lines[1].account='9999';assert.throws(()=>validateJournal(sample),/Unbekanntes Konto/);
});
test('balanced journal produces balance sheet, P&L and provisional tax review',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-double-'));
 try{
  const ledger=new DoubleEntryLedger(dir);
  ledger.post({date:'2026-01-10',description:'Einlage',lines:[{account:'1200',debitCents:2500000,creditCents:0},{account:'0800',debitCents:0,creditCents:2500000}]});
  ledger.post({date:'2026-02-10',description:'Umsatz',lines:[{account:'1200',debitCents:11900,creditCents:0},{account:'4000',debitCents:0,creditCents:10000},{account:'1776',debitCents:0,creditCents:1900}]});
  ledger.post({date:'2026-02-11',description:'Aufwand',lines:[{account:'6300',debitCents:3000,creditCents:0},{account:'1200',debitCents:0,creditCents:3000}]});
  const report=ledger.statements(2026);
  assert.equal(report.guv.profitCents,7000);
  assert.equal(report.balanceSheet.assetsCents,2508900);
  assert.equal(report.balanceSheet.liabilitiesCents,1900);
  assert.equal(report.balanceSheet.equityCents,2507000);
  assert.equal(report.balanceSheet.balances,true);
  assert.equal(ledger.taxClosing(2026).readyForFiling,false);
  assert.equal(new DoubleEntryLedger(dir).list().length,3);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('E-invoice inspection recognizes UBL and blocks DTD',()=>{
 const x='<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><ID>R-42</ID><IssueDate>2026-10-14</IssueDate><PayableAmount>119.00</PayableAmount></Invoice>';
 const result=inspectEInvoice(x);
 assert.equal(result.format,'UBL');assert.equal(result.invoiceNumber,'R-42');assert.equal(result.valid,false);
 assert.throws(()=>inspectEInvoice('<!DOCTYPE x><Invoice/>'),/Entitäten/);
});

test('audit chain detects modification of an already posted journal',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-integrity-'));
 try{
  const ledger=new DoubleEntryLedger(dir);
  ledger.post({date:'2026-03-01',description:'Original',lines:[{account:'1200',debitCents:100,creditCents:0},{account:'4000',debitCents:0,creditCents:100}]});
  assert.equal(ledger.verifyIntegrity().ok,true);
  const file=path.join(dir,'double-entry.jsonl');
  fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('Original','Manipuliert'));
  assert.throws(()=>ledger.verifyIntegrity(),/Prüfsumme/);
  assert.throws(()=>ledger.statements(2026),/Prüfsumme/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
