'use strict';
(()=>{
 const titles={dashboard:['Dashboard & Finanzüberblick','Alles Wichtige auf einen Blick'],invoiceDetails:['Rechnung erstellen','Rechnung schreiben und als PDF speichern'],forgeCustomers:['Kunden','Rechnungspartner aus deinen Rechnungen'],invoiceRegister:['Rechnungen','Eingänge, Ausgänge und Zahlungen verwalten'],bookkeeping:['Belege & Ausgaben','Ausgaben und Einnahmen lokal erfassen'],doubleEntry:['Buchhaltung','Doppelte Buchführung und Auswertungen'],closingAssistant:['Jahresabschluss','Schritt für Schritt den Abschluss prüfen'],musicLicense:['Musiklizenzen','Verträge und Archiv'], 'section-company':['Einstellungen','Unternehmensdaten verwalten']};
 const euro=c=>(c/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 const $=id=>document.getElementById(id);
 const areas=['bookkeeping','closingAssistant','doubleEntry','invoiceRegister','musicLicense','invoiceDetails'];
 function navigate(key){
  const target=$(key);
  if(key!=='dashboard'&&!target)return;
  document.querySelectorAll('.forge-nav-link').forEach(b=>{const current=b.dataset.view===key;b.classList.toggle('active',current);if(current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('forgeDashboard').hidden=key!=='dashboard';
  $('forgeCustomers').hidden=key!=='forgeCustomers';
  areas.forEach(id=>{const el=$(id);if(!el)return;const shown=key===id||(key==='section-company'&&id==='invoiceDetails');el.hidden=!shown;if(shown&&el.tagName==='DETAILS')el.open=true;});
  if(key==='section-company'){$('invoiceDetails').open=true;target.scrollIntoView({block:'start'});}
  else document.querySelector('.forge-main').scrollTo({top:0,behavior:'instant'});
  $('forgePageTitle').textContent=titles[key][0];
  $('forgePageSubtitle').textContent=titles[key][1];
  if(key==='dashboard'||key==='forgeCustomers')refreshDashboard();
 }
 async function refreshDashboard(){
  const tbody=$('forgeRecentInvoices');
  try{
   const api=window.invoiceForge;
   if(!api||typeof api.invoicesList!=='function')throw Error('Rechnungsregister nicht erreichbar');
   const invoices=await api.invoicesList();
   const outgoing=invoices.filter(i=>i.direction==='outgoing'&&i.status!=='cancelled');
   const sum=items=>items.reduce((n,i)=>n+i.grossCents,0);
   $('forgeKpiRevenue').textContent=euro(sum(outgoing));
   const open=outgoing.filter(i=>i.status==='open');
   $('forgeKpiOpen').textContent=euro(sum(open));
   $('forgeKpiOpenCount').textContent=open.length+' offene Ausgangsrechnungen';
   $('forgeKpiPaid').textContent=euro(sum(outgoing.filter(i=>i.status==='paid')));
   $('forgeKpiCustomers').textContent=String(new Set(outgoing.map(i=>i.counterparty.trim().toLocaleLowerCase('de-DE'))).size);
   tbody.replaceChildren();
   const customers=$('forgeCustomerList');customers.replaceChildren();
   const parties=new Map();
   for(const item of invoices){const name=item.counterparty.trim();const id=name.toLocaleLowerCase('de-DE');if(!parties.has(id))parties.set(id,{name,count:0,outgoing:0});const row=parties.get(id);row.count++;if(item.direction==='outgoing'&&item.status!=='cancelled')row.outgoing+=item.grossCents;}
   if(!parties.size){const row=customers.insertRow();const cell=row.insertCell();cell.colSpan=3;cell.textContent='Noch keine Rechnungspartner erfasst.';}
   for(const item of [...parties.values()].sort((a,b)=>a.name.localeCompare(b.name,'de-DE'))){const row=customers.insertRow();for(const value of [item.name,String(item.count),euro(item.outgoing)])row.insertCell().textContent=value;}
   const recent=invoices.slice(-6).reverse();
   if(!recent.length){const row=tbody.insertRow();const cell=row.insertCell();cell.colSpan=4;cell.textContent='Noch keine Rechnungen erfasst. Starte mit deiner ersten Rechnung.';return;}
   for(const item of recent){
    const row=tbody.insertRow();
    for(const value of [item.number,item.counterparty,euro(item.grossCents)])row.insertCell().textContent=value;
    const status=row.insertCell();const badge=document.createElement('span');badge.className='forge-status '+(item.status==='paid'?'paid':item.status==='cancelled'?'cancelled':'open');badge.textContent=item.status==='paid'?'Bezahlt':item.status==='cancelled'?'Storniert':'Offen';status.append(badge);
   }
  }catch(e){
   tbody.replaceChildren();const row=tbody.insertRow();const cell=row.insertCell();cell.colSpan=4;cell.textContent='Rechnungen konnten nicht geladen werden: '+e.message;
   for(const id of ['forgeKpiRevenue','forgeKpiOpen','forgeKpiPaid','forgeKpiCustomers'])$(id).textContent='—';
  }
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const updatePreview=()=>{
   const read=id=>$(id)?.value||'';
   $('forgePreviewNumber').textContent=read('invoiceNumber')||'Noch keine Nummer';
   $('forgePreviewCustomer').textContent=read('customerName')||'Kunde noch nicht ausgewählt';
   $('forgePreviewCompany').textContent=read('companyName')||'Firmendaten ausstehend';
   for(const [target,source] of [['forgePreviewNet','subtotal'],['forgePreviewTax','taxAmount'],['forgePreviewGross','grandTotal']])$(target).textContent=$(source)?.textContent||'0,00 €';
  };
  document.querySelectorAll('#invoiceDetails input,#invoiceDetails textarea,#invoiceDetails select').forEach(el=>{el.addEventListener('input',()=>queueMicrotask(updatePreview));el.addEventListener('change',()=>queueMicrotask(updatePreview));});
  const totals=$('section-totals');if(totals&&typeof MutationObserver!=='undefined')new MutationObserver(updatePreview).observe(totals,{childList:true,subtree:true,characterData:true});
  updatePreview();
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
  document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.open)));
  document.querySelectorAll('.home-action[data-target]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.target)));
  window.invoiceForge?.getCompanyData?.().then(company=>{if(company?.name)$('forgeCompanyBadge').textContent=company.name;}).catch(()=>{});
  document.addEventListener('invoiceforge:invoices-changed',refreshDashboard);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(!$('forgeDashboard').hidden||!$('forgeCustomers').hidden))refreshDashboard();});
  navigate('dashboard');
 });
})();
