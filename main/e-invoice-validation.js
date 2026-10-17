'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {toolPath}=require('./document-extraction');
function validateEInvoiceFile(filename){
 if(typeof filename!=='string'||path.extname(filename).toLowerCase()!=='.xml')throw Error('Nur XML-Dateien werden durch den Validator geprüft');
 const stat=fs.lstatSync(filename);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size>5_000_000)throw Error('Ungültige XML-Datei oder zu groß');
 const binary=toolPath('einvoice-validator');
 if(!binary) return {valid:false,validated:false,errors:['EN16931/XRechnung-Validator fehlt im InvoiceForge-Paket'],readyForUse:false};
 const r=cp.spawnSync(binary,['--input',filename,'--json'],{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024,windowsHide:true,shell:false});
 if(r.error||r.status!==0)return {valid:false,validated:false,errors:[String(r.error?.message||r.stderr||'Validator fehlgeschlagen').slice(0,500)],readyForUse:false};
 let data;try{data=JSON.parse(r.stdout);}catch{return {valid:false,validated:false,errors:['Validator lieferte kein gültiges JSON'],readyForUse:false};}
 if(!data||data.schemaValidated!==true||data.businessRulesValidated!==true||data.valid!==true||!Array.isArray(data.errors)||data.errors.length)return {valid:false,validated:false,errors:Array.isArray(data?.errors)?data.errors:['Validierung nicht vollständig bestätigt'],readyForUse:false};
 return {valid:true,validated:true,errors:[],readyForUse:true,validatorVersion:String(data.validatorVersion||'unbekannt')};
}
module.exports={validateEInvoiceFile};
