'use strict';
(()=>{
 const $=id=>document.getElementById(id),api=window.invoiceForge;
 const money=c=>(c/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 document.addEventListener('DOMContentLoaded',()=>{
  const message=$('irMessage');
  async function refresh(){
   const root=$('irList');root.replaceChildren();
   const entries=await api.invoicesList();
   const heading=document.createElement('p');heading.textContent=entries.length+' Rechnungen registriert';root.append(heading);
   for(const entry of entries.slice().reverse()){
    const row=document.createElement('div');row.className='card';
    const description=document.createElement('p');
    description.textContent=[entry.direction==='incoming'?'Eingang':'Ausgang',entry.number,entry.counterparty,money(entry.grossCents),entry.status,entry.note||''].join(' · ');
    row.append(description);
    if(entry.status!=='cancelled'){
     const select=document.createElement('select');
     for(const [value,label] of [['open','Offen'],['paid','Bezahlt'],['cancelled','Storniert']]){
      const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);
     }
     select.value=entry.status;
     select.addEventListener('change',async()=>{
      try{
       if(select.value==='cancelled'&&!confirm('Rechnung wirklich als storniert markieren?')){select.value=entry.status;return;}
       await api.invoicesStatus(entry.id,select.value);await refresh();
      }catch(e){message.textContent='Fehler: '+e.message;select.value=entry.status;}
     });
     row.append(select);
    }
    root.append(row);
   }
  }
  $('irDate').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  $('irForm').addEventListener('submit',async event=>{
   event.preventDefault();
   try{
    const gross=Number($('irGross').value);
    if(!Number.isFinite(gross)||gross<=0||Math.abs(gross*100-Math.round(gross*100))>1e-7)throw Error('Ungültiger Eurobetrag');
    await api.invoicesAdd({direction:$('irDirection').value,phase:$('irPhase').value,number:$('irNumber').value,counterparty:$('irCounterparty').value,issueDate:$('irDate').value,dueDate:$('irDue').value,grossCents:Math.round(gross*100),note:$('irNote').value});
    message.textContent='Rechnung lokal registriert';$('irNumber').value='';$('irGross').value='';await refresh();
   }catch(e){message.textContent='Fehler: '+e.message;}
  });
  refresh().catch(e=>{message.textContent='Fehler beim Laden: '+e.message;});
 });
})();
