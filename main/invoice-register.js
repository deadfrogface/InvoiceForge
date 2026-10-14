'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
function validateInvoice(x){
 if(!x||!['incoming','outgoing'].includes(x.direction))throw Error('Rechnungsrichtung fehlt');
 if(!['preformation','registered'].includes(x.phase))throw Error('Gründungsphase fehlt');
 if(x.direction==='outgoing'&&x.phase==='preformation')throw Error('Ausgangsrechnung der noch nicht gegründeten UG gesperrt');
 for(const k of ['number','counterparty'])if(typeof x[k]!=='string'||!x[k].trim()||x[k].length>200)throw Error('Pflichtfeld: '+k);
 if(!date(x.issueDate))throw Error('Ungültiges Rechnungsdatum');
 if(x.dueDate&&!date(x.dueDate))throw Error('Ungültiges Fälligkeitsdatum');
 if(!Number.isSafeInteger(x.grossCents)||x.grossCents<=0)throw Error('Ungültiger Bruttobetrag');
}
class InvoiceRegister{
 constructor(directory){fs.mkdirSync(directory,{recursive:true,mode:0o700});this.file=path.join(directory,'invoices.jsonl');}
 events(){return fs.existsSync(this.file)?fs.readFileSync(this.file,'utf8').split('\n').filter(Boolean).map(JSON.parse):[];}
 list(){const invoices=new Map();for(const e of this.events()){if(e.action==='create')invoices.set(e.id,{...e});else if(e.action==='status'){const invoice=invoices.get(e.target);if(!invoice)throw Error('Rechnung fehlt');invoice.status=e.status;invoice.statusUpdatedAt=e.recordedAt;}else throw Error('Unbekanntes Ereignis');}return [...invoices.values()];}
 add(input){validateInvoice(input);if(this.list().some(e=>e.direction===input.direction&&e.number===input.number&&e.phase===input.phase))throw Error('Rechnungsnummer bereits vorhanden');const event={action:'create',id:crypto.randomUUID(),recordedAt:new Date().toISOString(),direction:input.direction,phase:input.phase,number:input.number.trim(),counterparty:input.counterparty.trim(),issueDate:input.issueDate,dueDate:input.dueDate||'',grossCents:input.grossCents,status:'open',note:String(input.note||'').slice(0,500)};fs.appendFileSync(this.file,JSON.stringify(event)+'\n',{mode:0o600});return event;}
 setStatus(id,status){if(!['open','paid','cancelled'].includes(status))throw Error('Ungültiger Status');if(!this.list().some(e=>e.id===id))throw Error('Rechnung fehlt');const event={action:'status',target:id,status,recordedAt:new Date().toISOString()};fs.appendFileSync(this.file,JSON.stringify(event)+'\n');return event;}
}
module.exports={InvoiceRegister,validateInvoice};
