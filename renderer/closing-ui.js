'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),api=window.invoiceForge;
 const run=async(fn)=>{
  try{$('caMessage').textContent='';const result=await fn();$('caOutput').textContent=JSON.stringify(result,null,2);}
  catch(e){$('caMessage').textContent='Fehler: '+e.message;}
 };
 const year=()=>Number($('caYear').value),month=()=>Number($('caMonth').value);
 $('caRecurring').addEventListener('click',()=>run(()=>api.assistantRecurring()));
 $('caMonthly').addEventListener('click',()=>run(()=>api.closingMonth(year(),month())));
 $('caTaxBridge').addEventListener('click',()=>run(()=>api.closingTaxBridge(year(),[])));
 $('caPropose').addEventListener('click',()=>run(()=>api.assistantProposeDocument(JSON.parse($('caDocument').value))));
 $('caSaveAssets').addEventListener('click',()=>run(async()=>{const assets=JSON.parse($('caAssets').value);if(!Array.isArray(assets))throw Error('Anlagenliste muss ein Array sein');const result=[];for(const asset of assets)result.push(await api.assetsAdd(asset));return result;}));
 $('caListAssets').addEventListener('click',()=>run(()=>api.assetsList()));
 $('caDepreciation').addEventListener('click',()=>run(()=>api.closingDepreciation(JSON.parse($('caAssets').value),year())));
});
