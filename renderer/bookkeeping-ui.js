'use strict';
(() => {
 const api=window.invoiceForge;
 const $=id=>document.getElementById(id);
 const money=n=>(n/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 const categories={
  Software:['Entwicklungskosten','Allgemeine Softwarekosten','KI / Programmierung','Lizenzen / Abonnements'],
  Hardware:['Computer / Laptop','Zubehör / Upgrades','Testgeräte'],
  Betriebskosten:['Strom','Internet / Telefon','Bürobedarf','Fahrtkosten'],
  'Vertrieb & Marketing':['Werbung','Domains / Hosting','Verkaufsgebühren'],
  Sonstiges:['Gründungskosten','Weitere Kosten','Ungeklärt']
 };
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function populate(){
  const parent=$('bkGroup'); parent.replaceChildren();
  for(const name of Object.keys(categories))parent.append(el('option',name));
  populateSub();
 }
 function populateSub(){
  const sub=$('bkCategory');sub.replaceChildren();
  for(const name of categories[$('bkGroup').value]||[])sub.append(el('option',name));
 }
 function showError(e){$('bkMessage').textContent='Fehler: '+e.message;}
 async function refresh(){
  const year=Number($('bkYear').value);
  const report=await api.ledgerYear(year);
  const root=$('bkReport');root.replaceChildren();
  const heading=el('p',report.rows.length+' Buchungen · '+report.unresolved.length+' zur Prüfung · vorläufig, keine amtliche EÜR');
  root.append(heading);
  for(const [project,p] of Object.entries(report.projects)){
   const proj=el('details');proj.open=true;
   proj.append(el('summary',project+' · Ausgaben '+money(p.expenseCents)+' · Einnahmen '+money(p.incomeCents)));
   for(const [group,g] of Object.entries(p.groups)){
    const parent=el('details');parent.open=true;parent.append(el('summary',group+' · '+money(g.expenseCents)));
    for(const [cat,c] of Object.entries(g.categories)){
     const child=el('details');child.append(el('summary',cat+' · '+money(c.expenseCents)));
     const table=el('table'),head=el('tr');
     for(const h of ['Datum','Ausgabe / Einnahme','Betrag','Anteil','Beleg','Prüfung','Aktion'])head.append(el('th',h));
     table.append(head);
     for(const r of c.rows){
      const tr=el('tr');
      for(const v of [r.date,r.description,money(r.amountCents),r.businessPercent+' %',r.receipt?'Archiviert':r.documentReference||'Fehlt',r.needsReview?'Prüfen':'Erfasst'])tr.append(el('td',v));
      const actions=el('td');
      const btn=el('button',r.receipt?'Öffnen':'Anhängen');
      btn.type='button';
      btn.addEventListener('click',async()=>{try{if(r.receipt)await api.ledgerOpenReceipt(r.id);else {await api.ledgerAttach(r.id);await refresh();}}catch(e){showError(e);}});
      actions.append(btn);tr.append(actions);
      table.append(tr);
     }
     child.append(table);parent.append(child);
    }
    proj.append(parent);
   }
   root.append(proj);
  }
 }
 document.addEventListener('DOMContentLoaded',()=>{
  populate();
  $('bkGroup').addEventListener('change',populateSub);
  $('bkYear').value=new Date().getFullYear();
  $('bkDate').value=new Date().toLocaleDateString('en-CA');
  $('bkForm').addEventListener('submit',async ev=>{
   ev.preventDefault();
   try{
    await api.ledgerAdd({
     date:$('bkDate').value,type:$('bkType').value,description:$('bkDescription').value,
     amount:Number($('bkAmount').value),businessPercent:Number($('bkShare').value),
     paymentSource:$('bkPayment').value,project:$('bkProject').value,
     category:$('bkGroup').value+' / '+$('bkCategory').value,
     documentReference:$('bkReceipt').value
    });
    $('bkMessage').textContent='Buchung gespeichert. Originalbeleg sicher aufbewahren.';
    $('bkDescription').value='';$('bkAmount').value='';$('bkReceipt').value='';
    await refresh();
   }catch(e){showError(e);}
  });
  $('bkView').addEventListener('click',()=>refresh().catch(showError));
  $('bkExport').addEventListener('click',async()=>{try{const r=await api.ledgerExport(Number($('bkYear').value));$('bkMessage').textContent=r.ok?'CSV gespeichert':'Export abgebrochen';}catch(e){showError(e);}});
  refresh().catch(showError);
 });
})();
