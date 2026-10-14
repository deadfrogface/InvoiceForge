const test=require('node:test');
const assert=require('node:assert/strict');
const {yearlyReport,classify}=require('../main/yearly-report');
test('project and nested categories retain dates, amounts and receipt reference',()=>{
 const rows=[{id:'x',date:'2026-09-01',type:'expense',description:'Cursor',amountCents:2000,businessPercent:100,project:'KarriereKrake',category:'Software / KI / Programmierung',documentReference:'cursor.pdf',paymentSource:'private',taxReviewRequired:true}];
 const report=yearlyReport(rows,2026);
 const item=report.projects.KarriereKrake.groups.Software.categories['KI / Programmierung'].rows[0];
 assert.equal(item.amountCents,2000);
 assert.equal(item.date,'2026-09-01');
 assert.equal(item.documentReference,'cursor.pdf');
 assert.equal(report.projects.KarriereKrake.expenseCents,2000);
});
test('missing receipt remains visible for review',()=>{
 const r=yearlyReport([{id:'1',date:'2026-01-01',type:'expense',description:'Strom',amountCents:10000,businessPercent:25,paymentSource:'private'}],2026);
 assert.equal(r.unresolved.length,1);
 assert.equal(r.rows[0].potentialBusinessCents,2500);
 assert.equal(classify({category:'Hardware / Laptop'}).group,'Hardware');
});
