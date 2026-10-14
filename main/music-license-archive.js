'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
class MusicLicenseArchive{
 constructor(directory){fs.mkdirSync(directory,{recursive:true,mode:0o700});this.file=path.join(directory,'music-licenses.jsonl');}
 events(){if(!fs.existsSync(this.file))return [];return fs.readFileSync(this.file,'utf8').split('\n').filter(Boolean).map(JSON.parse);}
 list(){const records=new Map();for(const e of this.events()){if(e.action==='create')records.set(e.id,{...e});else if(e.action==='status'){const r=records.get(e.target);if(!r)throw Error('Vertrag fehlt');r.status=e.status;r.statusUpdatedAt=e.recordedAt;}else throw Error('Unbekanntes Ereignis');}return [...records.values()];}
 add(draft){if(!draft||typeof draft.text!=='string'||!draft.text||draft.text.length>100000||typeof draft.project!=='string'||!Number.isSafeInteger(draft.feeCents)||draft.feeCents<0)throw Error('Ungültiger Vertragsentwurf');const event={id:crypto.randomUUID(),action:'create',project:draft.project.slice(0,200),feeCents:draft.feeCents,text:draft.text,status:'draft',recordedAt:new Date().toISOString(),requiresLegalReview:true};fs.appendFileSync(this.file,JSON.stringify(event)+'\n',{mode:0o600});return event;}
 setStatus(id,status){if(!['draft','signed','cancelled'].includes(status))throw Error('Ungültiger Vertragsstatus');if(!this.list().some(e=>e.id===id))throw Error('Vertrag fehlt');const event={action:'status',target:id,status,recordedAt:new Date().toISOString()};fs.appendFileSync(this.file,JSON.stringify(event)+'\n');return event;}
}
module.exports={MusicLicenseArchive};
