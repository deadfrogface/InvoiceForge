const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Ledger } = require('../main/bookkeeping');

test('private business expense remains traceable and summary is provisional', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'invoiceforge-'));
  try {
    const ledger = new Ledger(dir);
    const item = ledger.add({date:'2026-10-14',type:'expense',description:'Laptop',amount:250,paymentSource:'private',businessPercent:80,project:'KarriereKrake',documentReference:'laptop.pdf'});
    assert.equal(ledger.summary(2026).potentialBusinessExpenseCents,20000);
    assert.equal(ledger.list()[0].documentReference,'laptop.pdf');
    assert.equal(ledger.summary(2026).requiresTaxReview,true);
    assert.match(ledger.csv(2026),/KarriereKrake/);
    ledger.void(item.id,'Falscher Beleg');
    assert.equal(ledger.list().length,0);
    assert.equal(ledger.events().length,2);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('invalid amounts and dates are rejected', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-'));
  try {
    const ledger=new Ledger(dir);
    const input={date:'2026-10-14',type:'expense',description:'Test',amount:12.345,paymentSource:'private',businessPercent:100};
    assert.throws(()=>ledger.add(input));
    assert.throws(()=>ledger.add({...input,amount:12,date:'2026-02-30'}));
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
