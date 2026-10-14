'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 document.addEventListener('DOMContentLoaded',()=>{
  const form=$('musicLicenseForm'),preview=$('mlPreview'),save=$('mlSave'),message=$('mlMessage');
  form.addEventListener('submit',async event=>{
   event.preventDefault();save.disabled=true;message.textContent='';
   const val=id=>$(id).value.trim();
   const fee=Number(val('mlFee'));
   try{
    if(!Number.isFinite(fee)||fee<0||Math.abs(fee*100-Math.round(fee*100))>1e-7)throw Error('Vergütung bitte in Euro mit höchstens zwei Nachkommastellen angeben');
    const data={author:val('mlAuthor'),artist:val('mlArtist'),authorAddress:val('mlAuthorAddress'),licensee:val('mlLicensee'),licenseeAddress:val('mlLicenseeAddress'),representative:val('mlRepresentative'),project:val('mlProject'),tracks:val('mlTracks').split(/\r?\n/).map(s=>s.trim()).filter(Boolean),feeCents:Math.round(fee*100),paymentDue:val('mlDue'),territory:val('mlTerritory'),term:val('mlTerm'),additionalRights:val('mlRights'),paymentConfirmed:$('mlPaid').checked};
    const result=await window.invoiceForge.musicLicenseGenerate(data);
    preview.value=result.text;save.disabled=false;message.textContent='Entwurf erstellt. Vor Unterzeichnung prüfen.';
   }catch(e){message.textContent='Fehler: '+e.message;}
  });
  save.addEventListener('click',async()=>{try{const result=await window.invoiceForge.musicLicenseSave(preview.value);message.textContent=result.ok?'Entwurf gespeichert':'Speichern abgebrochen';}catch(e){message.textContent='Fehler: '+e.message;}});
 });
})();
