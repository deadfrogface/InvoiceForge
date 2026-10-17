const test=require('node:test'),assert=require('node:assert/strict');
const {estimateCorporateTaxes}=require('../main/corporate-tax-estimate');
test('simple UG indicative taxes use integer cents',()=>{
 const x=estimateCorporateTaxes({taxableProfitCents:1000000,municipalMultiplier:400});
 assert.equal(x.corporationTaxCents,150000);
 assert.equal(x.solidaritySurchargeCents,8250);
 assert.equal(x.tradeTaxCents,140000);
 assert.equal(x.totalEstimatedTaxCents,298250);
 assert.equal(x.readyForFiling,false);
});
test('tax estimate rejects invalid inputs and never claims filing readiness',()=>{
 assert.throws(()=>estimateCorporateTaxes({taxableProfitCents:-1}));
 assert.throws(()=>estimateCorporateTaxes({taxableProfitCents:100,municipalMultiplier:0}));
 assert.equal(estimateCorporateTaxes({taxableProfitCents:0}).totalEstimatedTaxCents,0);
});
