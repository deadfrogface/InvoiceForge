'use strict';
const REQUIRED=['companyName','taxNumber','fiscalYear','taxonomyVersion','balanceSheet','profitAndLoss'];
function eBalanceReadiness(data={}){
 const missing=REQUIRED.filter(k=>data[k]===undefined||data[k]===null||data[k]==='');
 const errors=[];
 if(!Number.isInteger(data.fiscalYear)||data.fiscalYear<2000||data.fiscalYear>2200)errors.push('Ungültiges Geschäftsjahr');
 for(const [name,obj] of [['balanceSheet',data.balanceSheet],['profitAndLoss',data.profitAndLoss]]){
  if(!obj||typeof obj!=='object'||Array.isArray(obj))errors.push(name+' fehlt oder ist kein Objekt');
 }
 if(data.balanceSheet&&typeof data.balanceSheet==='object'){
  const b=data.balanceSheet;
  if(![b.assetsCents,b.liabilitiesCents,b.equityCents].every(Number.isSafeInteger))errors.push('Bilanzbeträge fehlen oder sind keine Centbeträge');
  else if(b.assetsCents!==b.liabilitiesCents+b.equityCents)errors.push('Bilanz ist nicht ausgeglichen');
 }
 return {ready:false,canExportOfficialXbrl:false,missing,errors,requires:['Aktuelle amtliche Taxonomie und vollständiges Mapping','GuV-Taxonomiepositionen und Steuerbilanz-Überleitung','XBRL-Validierung gegen amtliche Regeln','Anhang und Berichtbestandteile je Fall'],message:'Keine amtliche E-Bilanz. Der Datencheck ist nur eine Vorprüfung.'};
}
function exportOfficialEBalance(){throw Error('Amtlicher E-Bilanz-XBRL-Export ist nicht implementiert. Keine Datei erzeugt.');}
module.exports={eBalanceReadiness,exportOfficialEBalance};
