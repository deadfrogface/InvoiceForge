'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..','vendor','tools',process.platform,process.arch);
const required=process.platform==='win32'?['pdftotext.exe','pdftoppm.exe','tesseract.exe']:['pdftotext','pdftoppm','tesseract'];
const missing=required.filter(file=>!fs.existsSync(path.join(base,file)));
for(const lang of ['deu','eng'])if(!fs.existsSync(path.join(base,'tessdata',lang+'.traineddata')))missing.push('tessdata/'+lang+'.traineddata');
if(process.env.INVOICEFORGE_OCR_ONLY!=='1'&&!fs.existsSync(path.join(base,process.platform==='win32'?'einvoice-validator.exe':'einvoice-validator')))missing.push('einvoice-validator');
if(missing.length){console.error('InvoiceForge installer cannot be released: bundled offline tools missing: '+missing.join(', '));process.exitCode=1;}
else console.log('Bundled OCR executables found; runtime functionality must still be tested.');
