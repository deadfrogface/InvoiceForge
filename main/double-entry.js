'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ACCOUNTS={
 '1000':{name:'Kasse',type:'asset'},'1200':{name:'Bank',type:'asset'},
 '1400':{name:'Forderungen',type:'asset'},'1576':{name:'Vorsteuer 19%',type:'asset'},
 '1600':{name:'Verbindlichkeiten',type:'liability'},'1776':{name:'Umsatzsteuer 19%',type:'liability'},
 '0800':{name:'Gezeichnetes Kapital',type:'equity'},'0860':{name:'Gewinnvortrag',type:'equity'},
 '4000':{name:'Umsatzerlöse',type:'revenue'},'4900':{name:'Sonstige Erträge',type:'revenue'},
 '6000':{name:'Materialaufwand',type:'expense'},'6300':{name:'Sonstiger Aufwand',type:'expense'}
};
const isoDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
function validateJournal(x){
 if(!x||!isoDate(x.date)||typeof x.description!=='string'||!x.description.trim()||x.description.length>500)throw Error('Datum/Buchungstext ungültig');
 if(!Array.isArray(x.lines)||x.lines.length<2||x.lines.length>50)throw Error('Mindestens zwei Buchungszeilen erforderlich');
 let debit=0,credit=0;
 for(const line of x.lines){
  if(!Object.hasOwn(ACCOUNTS,String(line.account)))throw Error('Unbekanntes Konto: '+line.account);
  if(!Number.isSafeInteger(line.debitCents)||line.debitCents<0||!Number.isSafeInteger(line.creditCents)||line.creditCents<0||(line.debitCents>0)===(line.creditCents>0))throw Error('Genau eine positive Soll- oder Haben-Seite je Zeile');
  debit+=line.debitCents;credit+=line.creditCents;
 }
 if(!Number.isSafeInteger(debit)||debit!==credit)throw Error('Soll und Haben müssen übereinstimmen');
 return debit;
}
class DoubleEntryLedger{
 constructor(directory){fs.mkdirSync(directory,{recursive:true,mode:0o700});this.file=path.join(directory,'double-entry.jsonl');}
 events(){return fs.existsSync(this.file)?fs.readFileSync(this.file,'utf8').split('\n').filter(Boolean).map(JSON.parse):[];}
 verifyIntegrity(){let previous='GENESIS';const events=this.events();for(const event of events){if(event.previousHash!==previous)throw Error('Journal-Prüfkette unterbrochen');const {hash,...payload}=event;const expected=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');if(hash!==expected)throw Error('Journal-Prüfsumme fehlerhaft');previous=hash;}return {ok:true,count:events.length,lastHash:previous};}
 list(){return this.events().filter(e=>e.action==='post');}
 post(input){
  validateJournal(input);
  const entry={action:'post',id:crypto.randomUUID(),date:input.date,description:input.description.trim(),reference:String(input.reference||'').slice(0,200),lines:input.lines.map(l=>({account:String(l.account),debitCents:l.debitCents,creditCents:l.creditCents})),recordedAt:new Date().toISOString()};
  const state=this.verifyIntegrity();entry.previousHash=state.lastHash;entry.hash=crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
  fs.appendFileSync(this.file,JSON.stringify(entry)+'\n',{mode:0o600});return entry;
 }
 trialBalance(year){
  if(!Number.isInteger(year)||year<2000||year>2200)throw Error('Ungültiges Jahr');
  this.verifyIntegrity();
  const accounts=Object.fromEntries(Object.entries(ACCOUNTS).map(([number,info])=>[number,{...info,number,debitCents:0,creditCents:0,balanceCents:0}]));
  for(const entry of this.list().filter(e=>e.date.slice(0,4)<=String(year)))for(const line of entry.lines){const a=accounts[line.account];a.debitCents+=line.debitCents;a.creditCents+=line.creditCents;}
  for(const a of Object.values(accounts))a.balanceCents=a.debitCents-a.creditCents;
  return {year,accounts:Object.values(accounts),balanced:Object.values(accounts).reduce((sum,a)=>sum+a.balanceCents,0)===0};
 }
 statements(year){
  const tb=this.trialBalance(year);
  const current=this.list().filter(e=>e.date.startsWith(String(year)));
  const movements=Object.fromEntries(Object.keys(ACCOUNTS).map(a=>[a,0]));
  for(const entry of current)for(const l of entry.lines)movements[l.account]+=l.debitCents-l.creditCents;
  const revenueCents=-Object.keys(ACCOUNTS).filter(a=>ACCOUNTS[a].type==='revenue').reduce((s,a)=>s+movements[a],0);
  const expenseCents=Object.keys(ACCOUNTS).filter(a=>ACCOUNTS[a].type==='expense').reduce((s,a)=>s+movements[a],0);
  const profitCents=revenueCents-expenseCents;
  const sumType=type=>tb.accounts.filter(a=>a.type===type).reduce((s,a)=>s+(type==='asset'?a.balanceCents:-a.balanceCents),0);
  const assetsCents=sumType('asset'),liabilitiesCents=sumType('liability'),equityBookedCents=sumType('equity');
  const priorResultsCents=tb.accounts.filter(a=>['revenue','expense'].includes(a.type)).reduce((s,a)=>s-a.balanceCents,0)-profitCents;
  const equityCents=equityBookedCents+priorResultsCents+profitCents;
  return {year,trialBalance:tb,guv:{revenueCents,expenseCents,profitCents},balanceSheet:{assetsCents,liabilitiesCents,equityCents,balances:assetsCents===liabilitiesCents+equityCents},disclaimer:'Vorläufige interne Auswertung ohne Abschlussbuchungen, Kontenabstimmung, Inventur, HGB-Anhang, E-Bilanz oder steuerliche Prüfung.'};
 }
 taxClosing(year){
  const s=this.statements(year);
  const a=Object.fromEntries(s.trialBalance.accounts.map(x=>[x.number,x]));
  const inputCents=a['1576'].balanceCents,outputCents=-a['1776'].balanceCents;
  return {year,profitBeforeTaxCents:s.guv.profitCents,inputVatCents:inputCents,outputVatCents:outputCents,estimatedVatPayableCents:outputCents-inputCents,readyForFiling:false,missing:['Steuerliche Überleitungsrechnung','Abschluss- und Abgrenzungsbuchungen','Anlagenverzeichnis und Abschreibungen','Kontenabstimmung','Steuerliche Prüfung','E-Bilanz/XBRL-Export','Elektronische Übermittlung'],disclaimer:'Keine Steuerberechnung oder Steuererklärung. Umsatzsteuerwerte sind reine Kontensalden, keine UStVA.'};
 }
}
module.exports={DoubleEntryLedger,ACCOUNTS,validateJournal};
