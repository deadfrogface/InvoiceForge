'use strict';
// Conservative guidance only: no automatic tax deduction or booking.
const RULES={
 'Bürobedarf':{status:'candidate',title:'Büromaterial',requirements:['Betriebliche Veranlassung dokumentieren','Originalbeleg aufbewahren']},
 'Computer / Laptop':{status:'review',title:'Elektronik und Anlagevermögen',requirements:['Betriebliche Nutzung nachweisen','Eigentum und Anschaffungsdatum prüfen','Aktivierung und Abschreibung prüfen']},
 'Zubehör / Upgrades':{status:'review',title:'Elektronikzubehör',requirements:['Betriebliche Nutzung und Zuordnung nachweisen','Anschaffung oder nachträgliche Herstellungskosten prüfen']},
 'Werbung':{status:'review',title:'Werbung und Firmenkleidung',requirements:['Konkreten Werbe- oder Produktionszweck dokumentieren','Bei Kleidung objektive Abgrenzung zu Alltagskleidung prüfen','Überlassung an Beschäftigte und möglichen Arbeitslohn prüfen']},
 'Gründungskosten':{status:'review',title:'Vorgründungskosten',requirements:['Zahlenden und Rechnungsadressaten dokumentieren','Übernahme durch die spätere UG rechtlich und steuerlich prüfen']}
};
function assessExpense(entry){
 if(!entry||entry.type!=='expense')return {status:'not-applicable',title:'Keine Ausgabe',requirements:[]};
 const category=String(entry.category||'').split(' / ').pop();
 const description=String(entry.description||'').toLowerCase();
 let rule=RULES[category]||{status:'review',title:'Steuerliche Einordnung offen',requirements:['Betrieblichen Anlass und Beleg prüfen']};
 if(/anzug|anzüge|kleidung|outfit|kostüm|uniform/.test(description))
  rule=RULES.Werbung;
 const requirements=[...rule.requirements];
 if(!entry.receipt)requirements.push('Originalbeleg archivieren');
 if(entry.paymentSource==='private')requirements.push('Privatzahlung und mögliche Übernahme durch UG klären');
 if(entry.businessPercent<100)requirements.push('Privaten und betrieblichen Nutzungsanteil belegen');
 return {status:rule.status,title:rule.title,requirements,disclaimer:'Nur Prüfhilfe, keine verbindliche steuerliche Anerkennung oder automatische Buchung.'};
}
module.exports={assessExpense};
