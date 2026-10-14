'use strict';
const GROUPS = {
  'Software': ['Entwicklungskosten','Allgemeine Softwarekosten','KI / Programmierung','Lizenzen / Abonnements'],
  'Hardware': ['Computer / Laptop','Zubehör / Upgrades','Testgeräte'],
  'Betriebskosten': ['Strom','Internet / Telefon','Bürobedarf','Fahrtkosten'],
  'Vertrieb & Marketing': ['Werbung','Domains / Hosting','Verkaufsgebühren'],
  'Sonstiges': ['Gründungskosten','Weitere Kosten','Ungeklärt']
};
const clean = v => String(v || '').trim();
function classify(entry) {
  const raw = clean(entry.category);
  if (raw.includes(' / ')) {
    const [group, ...rest] = raw.split(' / ');
    return { group:clean(group)||'Sonstiges', category:clean(rest.join(' / '))||'Ungeklärt' };
  }
  for (const [group, cats] of Object.entries(GROUPS)) if (cats.includes(raw)) return {group,category:raw};
  return {group:'Sonstiges',category:raw||'Ungeklärt'};
}
function yearlyReport(entries, year) {
  if (!Number.isInteger(year) || year < 2000 || year > 2200) throw Error('Invalid year');
  const rows = entries.filter(e => e.date && e.date.startsWith(year+'-')).map(e => {
    const {group,category} = classify(e);
    return {
      id:e.id,date:e.date,project:clean(e.project)||'Nicht zugeordnet',
      group,category,description:e.description,amountCents:e.amountCents,
      businessPercent:e.businessPercent,potentialBusinessCents:e.type==='expense'?Math.round(e.amountCents*e.businessPercent/100):e.amountCents,
      type:e.type,paymentSource:e.paymentSource,documentReference:e.documentReference||'',receipt:e.receipt||null,
      needsReview:!e.receipt||!e.category||!e.project||e.taxReviewRequired===true
    };
  }).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
  const projects = {};
  for(const row of rows) {
    const p=projects[row.project]??={groups:{},expenseCents:0,incomeCents:0};
    const g=p.groups[row.group]??={categories:{},expenseCents:0,incomeCents:0};
    const c=g.categories[row.category]??={rows:[],expenseCents:0,incomeCents:0};
    c.rows.push(row);
    const key=row.type==='expense'?'expenseCents':'incomeCents';
    p[key]+=row.potentialBusinessCents;
    g[key]+=row.potentialBusinessCents;
    c[key]+=row.potentialBusinessCents;
  }
  return {year,projects,rows,unresolved:rows.filter(r=>r.needsReview),disclaimer:'Vorläufige Aufstellung; keine amtliche EÜR und keine Anerkennung als Betriebsausgabe.'};
}
module.exports={GROUPS,classify,yearlyReport};
