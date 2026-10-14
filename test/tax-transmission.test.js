const test=require('node:test'),assert=require('node:assert/strict');
const {transmissionReadiness,transmitTaxReturn}=require('../main/tax-transmission');
test('official tax submission stays blocked for all supported tax kinds',()=>{
 for(const kind of ['ustva','ust','kst','gewst','ebilanz']){
  const state=transmissionReadiness(kind);
  assert.equal(state.canTransmit,false);
  assert.ok(state.missing.includes('ericSdk'));
  assert.equal(transmissionReadiness(kind,{ericSdk:true,manufacturerId:'demo',certificate:true,officialSchema:true,validatedPayload:true,validatedXbrl:true,taxonomyVersion:'6.10'}).canTransmit,false);
 }
 assert.throws(()=>transmitTaxReturn(),/NICHT versendet/);
});
