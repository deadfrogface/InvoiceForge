'use strict';
function preview(text) {
 const lines=String(text).replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 if(lines.length<2) throw Error('CSV is empty');
 const delimiter=lines[0].includes(';')?';':',';
 const headers=lines.shift().split(delimiter).map(x=>x.trim().toLowerCase());
 const column=names=>headers.findIndex(x=>names.includes(x));
 const date=column(['datum','buchungstag','date']);
 const description=column(['verwendungszweck','beschreibung','description']);
 const amount=column(['betrag','amount']);
 if([date,description,amount].includes(-1))throw Error('CSV needs date, description and amount columns');
 return lines.map(line=>{
  const fields=line.split(delimiter);
  const raw=fields[amount].trim().replace(/\./g,'').replace(',','.');
  const value=Number(raw);
  if(!Number.isFinite(value)||value===0)throw Error('Invalid amount');
  const d=fields[date].trim();
  const match=d.match(/^(\d\d)\.(\d\d)\.(\d{4})$/);
  const normalized=match?match[3]+'-'+match[2]+'-'+match[1]:d;
  return {date:normalized,description:fields[description].trim(),type:value<0?'expense':'income',amount:Math.abs(value)};
 });
}
module.exports={preview};
