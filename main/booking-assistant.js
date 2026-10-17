'use strict';
const crypto=require('node:crypto');
const {ACCOUNTS}=require('./double-entry');
const {validateJournal}=require('./double-entry');
function moneyCents(raw){
 const text=String(raw??'').trim().replace(/\s/g,'');
 const normalized=text.includes(',')?text.replace(/\./g,'').replace(',','.'):text;
 if(!/^\d+(?:\.\d{1,2})?$/.test(normalized))return null;
 const [whole,fraction='']=normalized.split('.');
 const result=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(result)?result:null;
}
function proposeDocument(doc,history=[]){
 if(!doc||typeof doc!=='object')throw Error('Beleg fehlt');
 const date=String(doc.issueDate||'');
 const year=/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date?Number(date.slice(0,4)):null;
 const grossCents=moneyCents(doc.payableAmount);
 const issues=[];
 if(!year)issues.push('Rechnungsdatum fehlt oder ist ungültig');
 if(grossCents===null||grossCents===0)issues.push('Rechnungsbetrag fehlt oder ist ungültig');
 if(!doc.invoiceNumber)issues.push('Rechnungsnummer fehlt');
 if(!doc.currency||doc.currency!=='EUR')issues.push('Währung prüfen: keine bestätigte EUR-Rechnung');
 const fingerprint=crypto.createHash('sha256').update(JSON.stringify([doc.invoiceNumber||'',date,grossCents,doc.supplier||''])).digest('hex');
 if(history.some(h=>h.fingerprint===fingerprint))issues.push('Möglicher doppelter Beleg');
 const taxRate=[0,7,19].includes(doc.taxRate)?doc.taxRate:null;
 const netCents=grossCents===null||taxRate===null?null:Math.round(grossCents*100/(100+taxRate));
 const vatCents=netCents===null?null:grossCents-netCents;
 if(taxRate===null)issues.push('Steuersatz fehlt oder ist nicht bestätigt');
 const direction=doc.direction==='outgoing'?'outgoing':'incoming';
 const lines=grossCents===null||grossCents===0||taxRate!==19?[]:direction==='incoming'
  ?[{account:'6300',debitCents:netCents,creditCents:0},{account:'1576',debitCents:vatCents,creditCents:0},{account:'1600',debitCents:0,creditCents:grossCents}]
  :[{account:'1400',debitCents:grossCents,creditCents:0},{account:'4000',debitCents:0,creditCents:netCents},{account:'1776',debitCents:0,creditCents:vatCents}];
 issues.push('Steuersatz und Vorsteuerabzug müssen geprüft werden; Kontierung nur für bestätigte 19 Prozent vorbereitet');
 if(grossCents!==null&&grossCents>0&&lines.length){try{validateJournal({date:year?date:'2026-01-01',description:'Buchungsvorschlag',lines});}catch(error){issues.push('Buchungsvorschlag rechnerisch ungültig: '+error.message);lines.length=0;}}
 if(!year||!doc.invoiceNumber||doc.currency!=='EUR')lines.length=0;
 if(doc.format==='CII / ZUGFeRD-XML'||doc.valid===false)issues.push('E-Rechnung noch nicht gegen EN16931/XRechnung validiert');
 return {fingerprint,year,period:date.slice(0,7),direction,lines,reference:String(doc.invoiceNumber||''),grossCents,vatCents,issues,requiresApproval:true,automaticPosting:false};
}
function recurringSuggestions(entries,minimum=2){
 const groups=new Map();
 for(const entry of entries){
  if(!entry||entry.reversalOf||!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)||!Array.isArray(entry.lines))continue;
  const key=JSON.stringify([entry.description.trim().toLowerCase(),entry.lines.map(l=>[l.account,l.debitCents,l.creditCents])]);
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(entry);
 }
 const result=[];
 for(const items of groups.values()){
  const months=[...new Set(items.map(x=>x.date.slice(0,7)))].sort();
  if(months.length<minimum)continue;
  result.push({description:items[0].description,lines:items[0].lines,months,reference:items[0].reference,requiresApproval:true,automaticPosting:false,reason:'Wiederkehrendes Muster in mindestens '+minimum+' Monaten'});
 }
 return result;
}
module.exports={moneyCents,proposeDocument,recurringSuggestions};
