const test=require('node:test'),assert=require('node:assert/strict');
const {eBalanceReadiness,exportOfficialEBalance}=require('../main/e-balance');
test('E-Bilanz preflight blocks missing or unbalanced reports',()=>{
 assert.equal(eBalanceReadiness({}).ready,false);
 const r=eBalanceReadiness({companyName:'Muster UG',taxNumber:'test',fiscalYear:2026,taxonomyVersion:'test',balanceSheet:{assetsCents:100,liabilitiesCents:50,equityCents:30},profitAndLoss:{}});
 assert.ok(r.errors.some(x=>x.includes('nicht ausgeglichen')));
 assert.equal(r.canExportOfficialXbrl,false);
 assert.throws(()=>exportOfficialEBalance(),/nicht implementiert/);
});
