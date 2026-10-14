'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
function executable(name){const r=cp.spawnSync(name,['--version'],{encoding:'utf8',timeout:5000,windowsHide:true});return !r.error&&r.status===0;}
function runLocal(name,args,timeout=30000){
 const r=cp.spawnSync(name,args,{encoding:'utf8',timeout,maxBuffer:8*1024*1024,windowsHide:true,shell:false});
 if(r.error)throw Error(name+': '+r.error.message);
 if(r.status!==0)throw Error(name+' fehlgeschlagen: '+String(r.stderr||r.stdout).slice(0,1000));
 return String(r.stdout||'');
}
function readDocument(filename){
 const ext=path.extname(filename).toLowerCase();
 if(!['.pdf','.png','.jpg','.jpeg','.tif','.tiff','.webp','.txt','.xml'].includes(ext))throw Error('Dateityp nicht unterstützt');
 const stat=fs.statSync(filename);
 if(!stat.isFile()||stat.size>25*1024*1024)throw Error('Beleg zu groß oder keine Datei');
 if(ext==='.xml')return {source:'xml',...require('./e-invoice').inspectEInvoiceFile(filename)};
 if(ext==='.txt')return {source:'text',text:fs.readFileSync(filename,'utf8').slice(0,200000),requiresReview:true};
 if(ext==='.pdf'){
  if(!executable('pdftotext'))throw Error('PDF-Textwerkzeug pdftotext (Poppler) fehlt. Lokale Installation erforderlich.');
  let text=runLocal('pdftotext',['-layout',filename,'-'],30000);
  if(text.trim().length>=20)return {source:'poppler-pdftotext',text:text.slice(0,200000),requiresReview:true};
  if(!executable('ocrmypdf'))throw Error('Scan-PDF erkannt: OCRmyPDF fehlt. Bitte lokal installieren.');
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-ocr-'));
  try{
   const output=path.join(temp,'ocr.pdf');
   runLocal('ocrmypdf',['--skip-text','--language','deu+eng',filename,output],120000);
   text=runLocal('pdftotext',['-layout',output,'-'],30000);
   return {source:'ocrmypdf',text:text.slice(0,200000),requiresReview:true};
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
 }
 if(!executable('tesseract'))throw Error('Tesseract OCR fehlt. Bitte lokal installieren.');
 return {source:'tesseract',text:runLocal('tesseract',[filename,'stdout','-l','deu+eng'],60000).slice(0,200000),requiresReview:true};
}
function capabilities(){return {pdftotext:executable('pdftotext'),ocrmypdf:executable('ocrmypdf'),tesseract:executable('tesseract'),java:executable('java'),ericConfigured:false,einvoiceValidatorConfigured:false};}
module.exports={readDocument,capabilities};
