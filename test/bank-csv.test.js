const test=require('node:test');
const assert=require('node:assert/strict');
const {preview}=require('../main/bank-csv');
test('German bank CSV recognizes expense and income',()=>{
 const rows=preview('Buchungstag;Verwendungszweck;Betrag\n14.10.2026;Software;-12,50\n15.10.2026;Kunde;100,00');
 assert.equal(rows.length,2);
 assert.deepEqual(rows[0],{date:'2026-10-14',description:'Software',type:'expense',amount:12.5});
 assert.equal(rows[1].amount,100);
});
test('English decimals stay decimals',()=>{
 assert.equal(preview('date,description,amount\n2026-10-14,Software,-12.50')[0].amount,12.5);
});
