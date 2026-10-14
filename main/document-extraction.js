'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
function toolPath(name){
 const suffix=process.platform==='win32'?'.exe':'';
 const bundled=path.join(process.resourcesPath||path.resolve(__dirname,'..','vendor'),'tools',process.platform,process.arch,name+suffix);
 return fs.existsSync(bundled)?bundled:null;
}
function executable(name){
 const binary=toolPath(name);if(!binary)return false;const r=cp.spawnSync(binary,['--version'],{encoding:'utf8',timeout:5000,windowsHide:true});return !r.error&&r.status===0;}
function runLocal(name,args,timeout=30000){
 const binary=toolPath(name);
 if(!binary)throw Error('Benötigte Komponente '+name+' ist nicht im InvoiceForge-Paket enthalten. Installation ist unvollständig.');
 const r=cp.spawnSync(binary,args,{encoding:'utf8',timeout,maxBuffer:8*1024*1024,windowsHide:true,shell:false});
 if(r.error)throw Error(name+': '+r.error.message);
 if(r.status!==0)throw Error(name+' fehlgeschlagen: '+String(r.stderr||r.stdout).slice(0,1000));
 return String(r.stdout||'');
}
function readDocument(filename){
 const ext=path.extname(filename).toLowerCase();
 if(!['.pdf','.png','.jpg','.jpeg','.tif','.tiff','.webp','.txt','.xml'].includes(ext))throw Error('Dateityp nicht unterstützt');
 const stat=fs.lstatSync(filename);
 if(stat.isSymbolicLink())throw Error('Symbolische Verknüpfungen werden nicht importiert');
 if(!stat.isFile()||stat.size>25*1024*1024)throw Error('Beleg zu groß oder keine Datei');
 if(ext==='.xml')return {source:'xml',...require('./e-invoice').inspectEInvoiceFile(filename)};
 if(ext==='.txt')return {source:'text',text:fs.readFileSync(filename,'utf8').slice(0,200000),requiresReview:true};
 if(ext==='.pdf'){
  if(!executable('pdftotext'))throw Error('PDF-Textwerkzeug fehlt im InvoiceForge-Paket.');
  let text=runLocal('pdftotext',['-layout',filename,'-'],30000);
  if(text.trim().length>=20)return {source:'poppler-pdftotext',text:text.slice(0,200000),requiresReview:true};
  if(!executable('ocrmypdf'))throw Error('Scan-PDF erkannt: OCR-Komponente fehlt im InvoiceForge-Paket.');
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-ocr-'));
  try{
   const output=path.join(temp,'ocr.pdf');
   runLocal('ocrmypdf',['--skip-text','--language','deu+eng','--jobs','1','--tesseract-timeout','90',filename,output],120000);
   text=runLocal('pdftotext',['-layout',output,'-'],30000);
   return {source:'ocrmypdf',text:text.slice(0,200000),requiresReview:true};
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
 }
 if(!executable('tesseract'))throw Error('OCR-Komponente fehlt im InvoiceForge-Paket.');
 return {source:'tesseract',text:runLocal('tesseract',[filename,'stdout','-l','deu+eng'],60000).slice(0,200000),requiresReview:true};
}
function capabilities(){return {pdftotext:executable('pdftotext'),ocrmypdf:executable('ocrmypdf'),tesseract:executable('tesseract'),java:executable('java'),ericConfigured:false,einvoiceValidatorConfigured:false};}
module.exports={readDocument,capabilities,toolPath};
