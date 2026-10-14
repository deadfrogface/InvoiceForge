'use strict';
(()=>{
 const $=id=>document.getElementById(id),api=window.invoiceForge;
 const money=n=>(n/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 document.addEventListener('DOMContentLoaded',()=>{
  const message=$('deMessage'),output=$('deOutput');
  $('deDate').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  $('deForm').addEventListener('submit',async event=>{
   event.preventDefault();
   try{
    const cents=value=>{const n=Number(value);if(!Number.isFinite(n)||n<0||Math.abs(n*100-Math.round(n*100))>1e-7)throw Error('Ungültiger Centbetrag');return Math.round(n*100);};
    const lines=$('deLines').value.trim().split(/\r?\n/).map(row=>{
     const parts=row.split(';');if(parts.length!==3)throw Error('Format: Konto;Soll;Haben');
     return {account:parts[0].trim(),debitCents:cents(parts[1].trim()),creditCents:cents(parts[2].trim())};
    });
    const saved=await api.accountingPost({date:$('deDate').value,description:$('deDescription').value,reference:$('deReference').value,lines});
    message.textContent='Journalbuchung lokal gespeichert: '+saved.id;output.textContent='';
   }catch(e){message.textContent='Fehler: '+e.message;}
  });
  $('deReport').addEventListener('click',async()=>{
   try{
    const s=await api.accountingStatements(Number($('deYear').value));
    output.textContent='GuV '+s.year+'\nUmsatzerlöse: '+money(s.guv.revenueCents)+'\nAufwendungen: '+money(s.guv.expenseCents)+'\nJahresergebnis: '+money(s.guv.profitCents)+'\n\nBilanz\nAktiva: '+money(s.balanceSheet.assetsCents)+'\nFremdkapital: '+money(s.balanceSheet.liabilitiesCents)+'\nEigenkapital inkl. Ergebnis: '+money(s.balanceSheet.equityCents)+'\nBilanz ausgeglichen: '+(s.balanceSheet.balances?'Ja':'NEIN')+'\n\n'+s.disclaimer;
   }catch(e){message.textContent='Fehler: '+e.message;}
  });
  $('deTax').addEventListener('click',async()=>{
   try{const t=await api.accountingTaxClosing(Number($('deYear').value));output.textContent='Steuerlicher Abschlussstatus '+t.year+'\nErgebnis vor Steuern: '+money(t.profitBeforeTaxCents)+'\nVorsteuerkontosaldo: '+money(t.inputVatCents)+'\nUmsatzsteuerkontosaldo: '+money(t.outputVatCents)+'\nDifferenz: '+money(t.estimatedVatPayableCents)+'\n\nNoch erforderlich:\n'+t.missing.map(x=>'• '+x).join('\n')+'\n\n'+t.disclaimer;}catch(e){message.textContent='Fehler: '+e.message;}
  });
  $('deXml').addEventListener('click',async()=>{
   try{const result=await api.eInvoiceInspect();if(result)output.textContent=JSON.stringify(result,null,2);}catch(e){message.textContent='XML-Fehler: '+e.message;}
  });
 });
})();
