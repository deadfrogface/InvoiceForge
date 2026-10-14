'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 document.addEventListener('DOMContentLoaded',()=>{
  const form=$('musicLicenseForm'),preview=$('mlPreview'),save=$('mlSave'),message=$('mlMessage');
  let latest=null;
  const refreshArchive=async()=>{
   const root=$('mlArchiveList');root.replaceChildren();
   for(const record of await window.invoiceForge.musicArchiveList()){
    const row=document.createElement('p');
    row.textContent=record.project+' · '+(record.feeCents/100).toFixed(2)+' € · '+record.status+' ';
    const open=document.createElement('button');open.type='button';open.textContent='Anzeigen';
    open.addEventListener('click',()=>{preview.value=record.text;$('mlPdf').disabled=false;save.disabled=false;});
    row.append(open);
    if(record.status==='draft'){
     const signed=document.createElement('button');signed.type='button';signed.textContent='Als unterschrieben markieren';
     signed.addEventListener('click',async()=>{await window.invoiceForge.musicArchiveStatus(record.id,'signed');await refreshArchive();});
     row.append(signed);
    }
    root.append(row);
   }
  };
  refreshArchive().catch(e=>{message.textContent='Archivfehler: '+e.message;});
  form.addEventListener('submit',async event=>{
   event.preventDefault();save.disabled=true;message.textContent='';
   const val=id=>$(id).value.trim();
   const fee=Number(val('mlFee'));
   try{
    if(!Number.isFinite(fee)||fee<0||Math.abs(fee*100-Math.round(fee*100))>1e-7)throw Error('Vergütung bitte in Euro mit höchstens zwei Nachkommastellen angeben');
    const data={author:val('mlAuthor'),artist:val('mlArtist'),authorAddress:val('mlAuthorAddress'),licensee:val('mlLicensee'),licenseeAddress:val('mlLicenseeAddress'),representative:val('mlRepresentative'),project:val('mlProject'),tracks:val('mlTracks').split(/\r?\n/).map(s=>s.trim()).filter(Boolean),feeCents:Math.round(fee*100),paymentDue:val('mlDue'),territory:val('mlTerritory'),term:val('mlTerm'),additionalRights:val('mlRights'),paymentConfirmed:$('mlPaid').checked};
    const result=await window.invoiceForge.musicLicenseGenerate(data);
    preview.value=result.text;latest=result;save.disabled=false;$('mlPdf').disabled=false;$('mlArchive').disabled=false;message.textContent='Entwurf erstellt. Vor Unterzeichnung prüfen.';
   }catch(e){message.textContent='Fehler: '+e.message;}
  });
  $('mlArchive').addEventListener('click',async()=>{try{if(!latest)throw Error('Zuerst einen Entwurf erstellen');await window.invoiceForge.musicArchiveAdd(latest);message.textContent='Entwurf archiviert';await refreshArchive();}catch(e){message.textContent='Fehler: '+e.message;}});
  $('mlPdf').addEventListener('click',async()=>{
   try{
    const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
    const lines=doc.splitTextToSize(preview.value,170);
    let y=20;for(const line of lines){if(y>275){doc.addPage();y=20;}doc.text(line,20,y);y+=5;}
    const result=await window.invoiceForge.saveFile({content:doc.output('datauristring').split(',')[1],defaultName:'Musiklizenzvertrag.pdf'});
    message.textContent=result.ok?'PDF-Entwurf gespeichert':'Speichern abgebrochen';
   }catch(e){message.textContent='PDF-Fehler: '+e.message;}
  });
  save.addEventListener('click',async()=>{try{const result=await window.invoiceForge.musicLicenseSave(preview.value);message.textContent=result.ok?'Entwurf gespeichert':'Speichern abgebrochen';}catch(e){message.textContent='Fehler: '+e.message;}});
 });
})();
