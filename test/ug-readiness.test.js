const test=require('node:test');
const assert=require('node:assert/strict');
const {assessUGReadiness}=require('../main/ug-readiness');
test('unincorporated UG cannot be tax-ready',()=>{
 const result=assessUGReadiness({});
 assert.equal(result.ready,false);
 assert.equal(result.missing.length,6);
});
test('all explicit confirmations required',()=>{
 const checks={incorporated:true,accountsBalanced:true,receiptsComplete:true,bankReconciled:true,assetRegisterReviewed:true,taxReviewed:true};
 assert.equal(assessUGReadiness(checks).ready,true);
 assert.equal(assessUGReadiness({...checks,taxReviewed:false}).ready,false);
});
