'use strict';
function monthClose(ledger,year,month){
 if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12)throw Error('Ungültiger Zeitraum');
 const prefix=String(year)+'-'+String(month).padStart(2,'0');
 const entries=ledger.list().filter(e=>e.date.startsWith(prefix));
 const missingReferences=entries.filter(e=>!e.reference.trim()).map(e=>e.id);
 const vat=Object.fromEntries(['1576','1776'].map(a=>[a,0]));
 for(const e of entries)for(const l of e.lines)if(Object.hasOwn(vat,l.account))vat[l.account]+=l.debitCents-l.creditCents;
 return {period:prefix,entryCount:entries.length,missingReferences,inputVatCents:vat['1576'],outputVatCents:-vat['1776'],vatDifferenceCents:-vat['1776']-vat['1576'],readyForFiling:false,checks:['Belegvollständigkeit und Zahlungseingänge abstimmen','Vorsteuerberechtigung und Umsatzsteuer-Tatbestände prüfen','Bank und Kasse abstimmen','Offene Posten abstimmen'],note:'Interne Monatsübersicht, keine USt-Voranmeldung.'};
}
function taxReconciliation(ledger,year,adjustments=[]){
 const report=ledger.statements(year);
 let total=0;
 const reviewed=adjustments.map((item,i)=>{
  if(!item||!Number.isSafeInteger(item.amountCents)||typeof item.reason!=='string'||!item.reason.trim()||!['add','deduct'].includes(item.type))throw Error('Ungültige steuerliche Korrektur '+i);
  const effect=item.type==='add'?item.amountCents:-item.amountCents;total+=effect;
  return {type:item.type,amountCents:item.amountCents,reason:item.reason.trim(),effectCents:effect};
 });
 return {year,accountingProfitCents:report.guv.profitCents,adjustments:reviewed,adjustmentTotalCents:total,preliminaryTaxProfitCents:report.guv.profitCents+total,readyForFiling:false,note:'Manuelle steuerliche Überleitungsrechnung; keine automatische Anerkennung, Verlustvorträge oder Körperschaft-/Gewerbesteuererklärung.'};
}
function depreciationSchedule(assets,year){
 if(!Array.isArray(assets))throw Error('Anlagenliste fehlt');
 return assets.map((asset,i)=>{
  if(!asset||typeof asset.name!=='string'||!asset.name.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(asset.acquired)||!Number.isSafeInteger(asset.costCents)||asset.costCents<0||!Number.isInteger(asset.usefulLifeYears)||asset.usefulLifeYears<1||asset.usefulLifeYears>100)throw Error('Anlage '+i+' unvollständig');
  const acquiredYear=Number(asset.acquired.slice(0,4)),acquiredMonth=Number(asset.acquired.slice(5,7));
  const monthly=Math.floor(asset.costCents/(asset.usefulLifeYears*12));
  const elapsedBefore=Math.max(0,Math.min(asset.usefulLifeYears*12,(year-acquiredYear)*12-(acquiredMonth-1)));
  const elapsedAfter=Math.max(0,Math.min(asset.usefulLifeYears*12,(year-acquiredYear+1)*12-(acquiredMonth-1)));
  const cumulativeBefore=Math.min(asset.costCents,monthly*elapsedBefore);
  const cumulativeAfter=elapsedAfter===asset.usefulLifeYears*12?asset.costCents:Math.min(asset.costCents,monthly*elapsedAfter);
  return {name:asset.name,acquired:asset.acquired,costCents:asset.costCents,usefulLifeYears:asset.usefulLifeYears,year,depreciationCents:cumulativeAfter-cumulativeBefore,bookValueCents:asset.costCents-cumulativeAfter,requiresReview:true,note:'Rechnerischer linearer Vorschlag; Nutzungsdauer, GWG, Sonderabschreibungen, HGB-/Steuerbilanzunterschiede prüfen.'};
 });
}
module.exports={monthClose,taxReconciliation,depreciationSchedule};
