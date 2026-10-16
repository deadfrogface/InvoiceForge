'use strict';
// Explicit native acceptance command; failures are never converted to skipped tests.
const assert=require('node:assert/strict'),path=require('node:path');
const {readDocument,capabilities}=require('../../main/document-extraction');
const root=path.resolve(process.argv[2]||'test/native/fixtures');
const supported=capabilities();
for(const name of ['pdftotext','pdftoppm','tesseract'])assert.equal(supported[name],true,'Bundled '+name+' must execute');
for(const [language,word,amount] of [['deu','RECHNUNG','119,00'],['eng','INVOICE','238.00']]){
 for(const suffix of ['.png','-scan.pdf']){
  const result=readDocument(path.join(root,language+suffix));
  assert.ok(result.text.includes(word),language+suffix+': missing '+word);
  assert.ok(result.text.includes(amount),language+suffix+': missing amount');
  assert.equal(result.requiresReview,true);
  console.log(language+suffix+': '+result.source+' recognised invoice and amount');
 }
}
const digital=readDocument(path.join(root,'digital.pdf'));
assert.equal(digital.source,'poppler-pdftotext');assert.match(digital.text,/357\.00/);
assert.throws(()=>readDocument(path.join(root,'damaged.pdf')),/fehlgeschlagen/);
console.log('Native OCR acceptance passed: DE/EN image and scan PDF, digital PDF, damaged PDF');
