const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {InvoiceRegister}=require('../main/invoice-register');
test('incoming invoices can be captured before formation',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-invoices-'));
 try{
 const register=new InvoiceRegister(dir);
 const data={direction:'incoming',phase:'preformation',number:'RE-12',counterparty:'Lieferant',issueDate:'2026-10-14',grossCents:11900};
 const invoice=register.add(data);
 assert.equal(register.list().length,1);
 assert.throws(()=>register.add(data),/bereits vorhanden/);
 register.setStatus(invoice.id,'paid');
 assert.equal(register.list()[0].status,'paid');
 assert.equal(register.events().length,2);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('outgoing UG invoices are blocked before registration',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-invoices-'));
 try{const register=new InvoiceRegister(dir);
 assert.throws(()=>register.add({direction:'outgoing',phase:'preformation',number:'1',counterparty:'Kunde',issueDate:'2026-10-14',grossCents:100}),/gesperrt/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
