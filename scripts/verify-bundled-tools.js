'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..','vendor','tools',process.platform,process.arch);
const required=process.platform==='win32'?['pdftotext.exe','tesseract.exe']:['pdftotext','tesseract'];
const missing=required.filter(file=>!fs.existsSync(path.join(base,file)));
if(missing.length){console.error('InvoiceForge installer cannot be released: bundled offline tools missing: '+missing.join(', '));process.exitCode=1;}
else console.log('Bundled OCR executables found; runtime functionality must still be tested.');
