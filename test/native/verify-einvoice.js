'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
if(process.env.INVOICEFORGE_TEST_RESOURCES)process.resourcesPath=path.resolve(process.env.INVOICEFORGE_TEST_RESOURCES);
const {validateEInvoiceFile}=require('../../main/e-invoice-validation');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-real-validator-'));
try{
 const filename=path.join(root,'invoice.xml');
 const valid=fs.readFileSync(path.join(__dirname,'../fixtures/xrechnung/01.01a-INVOICE_ubl.xml'),'utf8');
 fs.writeFileSync(filename,valid);
 const result=validateEInvoiceFile(filename);
 assert.equal(result.valid,true,JSON.stringify(result));assert.equal(result.validated,true);
 console.log('Official XRechnung positive fixture accepted');
 // Mandatory invoice identifier removed: XSD/Schematron must reject this document.
 fs.writeFileSync(filename,valid.replace(/<cbc:ID>123456XX<\/cbc:ID>/,''));
 assert.equal(validateEInvoiceFile(filename).valid,false);
 fs.writeFileSync(filename,'<Invoice/>');assert.equal(validateEInvoiceFile(filename).valid,false);
 fs.writeFileSync(filename,'<!DOCTYPE Invoice SYSTEM "https://example.invalid/entity"><Invoice/>');
 assert.throws(()=>validateEInvoiceFile(filename),/DTD/);
 console.log('Missing invoice ID, invalid document and external DTD correctly rejected');
}finally{fs.rmSync(root,{recursive:true,force:true});}
