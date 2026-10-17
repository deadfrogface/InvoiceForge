'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {toolPath}=require('./document-extraction');
function validateEInvoiceFile(filename){
 if(typeof filename!=='string'||path.extname(filename).toLowerCase()!=='.xml')throw Error('Nur XML-Dateien werden durch den Validator geprüft');
 const stat=fs.lstatSync(filename);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size>5_000_000)throw Error('Ungültige XML-Datei oder zu groß');
 const input=fs.readFileSync(filename,'utf8');
 if(/<!DOCTYPE|<!ENTITY/i.test(input))throw Error('DTD und externe Entitäten sind unzulässig');
 const {kositResources,runtimeEnvironment}=require('./bundled-runtime');
 const java=toolPath('java'),kosit=kositResources();
 if(java&&kosit){
  const os=require('node:os'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-validation-'));
  try{
   const result=cp.spawnSync(java,['-jar',kosit.jar,'-s',kosit.scenarios,'-r',kosit.directory,'-o',temporary,filename],{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024,windowsHide:true,shell:false,env:runtimeEnvironment(java)});
   const reports=fs.readdirSync(temporary).filter(name=>name.endsWith('.xml'));
   if(result.error||result.status!==0||reports.length!==1)return {valid:false,validated:false,readyForUse:false,errors:[String(result.error?.message||result.stderr||result.stdout||'XRechnung nicht akzeptiert').slice(0,2000)]};
   // KoSIT's exit code 0 means all supplied documents were accepted by the official scenarios.
   return {valid:true,validated:true,readyForUse:true,errors:[],validatorVersion:'KoSIT 1.6.3 / XRechnung 3.0.2 (2026-08-31)'};
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
 }
 const binary=toolPath('einvoice-validator');
 if(!binary) return {valid:false,validated:false,errors:['EN16931/XRechnung-Validator fehlt im InvoiceForge-Paket'],readyForUse:false};
 const r=cp.spawnSync(binary,['--input',filename,'--json'],{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024,windowsHide:true,shell:false});
 if(r.error||r.status!==0)return {valid:false,validated:false,errors:[String(r.error?.message||r.stderr||'Validator fehlgeschlagen').slice(0,500)],readyForUse:false};
 let data;try{data=JSON.parse(r.stdout);}catch{return {valid:false,validated:false,errors:['Validator lieferte kein gültiges JSON'],readyForUse:false};}
 if(!data||data.schemaValidated!==true||data.businessRulesValidated!==true||data.valid!==true||!Array.isArray(data.errors)||data.errors.length)return {valid:false,validated:false,errors:Array.isArray(data?.errors)?data.errors:['Validierung nicht vollständig bestätigt'],readyForUse:false};
 return {valid:true,validated:true,errors:[],readyForUse:true,validatorVersion:String(data.validatorVersion||'unbekannt')};
}
module.exports={validateEInvoiceFile};
