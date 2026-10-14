'use strict';
const fs=require('node:fs');
function inspectEInvoice(xml){
 if(typeof xml!=='string'||xml.length>5_000_000)throw Error('XML zu groß oder ungültig');
 if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(xml))throw Error('Externe XML-Entitäten/Stylesheets nicht erlaubt');
 const root=xml.match(/<([A-Za-z][\w.-]*:)?(Invoice|CreditNote|CrossIndustryInvoice)\b/);
 if(!root)throw Error('Keine unterstützte UBL- oder CII-Rechnung erkannt');
 const format=root[2]==='CrossIndustryInvoice'?'CII / ZUGFeRD-XML':'UBL';
 const first=tag=>{
  const match=xml.match(new RegExp('<(?:[\\w.-]+:)?'+tag+'(?:\\s[^>]*)?>([^<]{1,500})<\\/(?:[\\w.-]+:)?'+tag+'>','i'));
  return match?match[1].trim():'';
 };
 return {format,invoiceNumber:first(root[2]==='CrossIndustryInvoice'?'ID':'ID'),issueDate:first('IssueDate'),currency:first('DocumentCurrencyCode'),payableAmount:first('PayableAmount'),valid:false,validation:'Nur lokale Format-Erkennung und unverbindliche Feldauslese. Keine XRechnung-/EN16931-Schemaprüfung, keine Signaturprüfung und kein ZUGFeRD-PDF-Extraktor.'};
}
function inspectEInvoiceFile(filename){
 if(typeof filename!=='string'||!filename.toLowerCase().endsWith('.xml'))throw Error('Nur XML-Dateien; PDF/A-3 ZUGFeRD noch nicht unterstützt');
 const stat=fs.statSync(filename);if(stat.size>5_000_000)throw Error('XML-Datei zu groß');
 return inspectEInvoice(fs.readFileSync(filename,'utf8'));
}
module.exports={inspectEInvoice,inspectEInvoiceFile};
