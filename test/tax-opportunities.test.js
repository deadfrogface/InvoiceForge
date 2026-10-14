const test=require('node:test');
const assert=require('node:assert/strict');
const {assessExpense}=require('../main/tax-opportunities');
test('suit is reviewed as clothing, not automatically deductible',()=>{
 const result=assessExpense({type:'expense',description:'Anzug mit Firmenlogo',category:'Vertrieb & Marketing / Werbung',paymentSource:'private',businessPercent:100,receipt:null});
 assert.equal(result.status,'review');
 assert.ok(result.requirements.some(x=>x.includes('Alltagskleidung')));
 assert.ok(result.requirements.some(x=>x.includes('Privatzahlung')));
 assert.ok(result.requirements.some(x=>x.includes('Originalbeleg')));
});
test('electronics and mixed use need review',()=>{
 const result=assessExpense({type:'expense',description:'Laptop',category:'Hardware / Computer / Laptop',paymentSource:'business',businessPercent:70,receipt:{id:'x'}});
 assert.ok(result.requirements.some(x=>x.includes('Nutzungsanteil')));
 assert.ok(result.requirements.some(x=>x.includes('Abschreibung')));
});
test('income is not an expense opportunity',()=>assert.equal(assessExpense({type:'income'}).status,'not-applicable'));
