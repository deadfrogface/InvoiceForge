'use strict';
const {depreciationSchedule,monthClose,taxReconciliation}=require('./closing-assistant');
function annualCloseChecklist(ledger,assets,year,adjustments=[]){
 const preflight=ledger.preflight(year);
 const statement=ledger.statements(year);
 const months=Array.from({length:12},(_,i)=>monthClose(ledger,year,i+1));
 const depreciation=depreciationSchedule(assets,year);
 const bridge=taxReconciliation(ledger,year,adjustments);
 const issues=[...preflight.issues];
 if(!assets.length)issues.push({severity:'warning',code:'ASSET_REVIEW',message:'Anlagenverzeichnis auf Vollständigkeit prüfen (auch wenn keine Anlagen vorhanden)'});
 if(months.some(m=>m.missingReferences.length))issues.push({severity:'error',code:'RECEIPTS',message:'Buchungen ohne Belegreferenz vorhanden'});
 issues.push({severity:'warning',code:'RECONCILIATION',message:'Bank, Kasse, offene Posten, Rückstellungen, Rechnungsabgrenzung und Inventur manuell abstimmen'});
 issues.push({severity:'warning',code:'TAX_RULES',message:'Steuerliche Abweichungen, Verlustvorträge, nicht abzugsfähige Ausgaben und Gewerbesteuer-Hinzurechnungen prüfen'});
 issues.push({severity:'warning',code:'FILING',message:'Amtliche Steuererklärungen und E-Bilanz noch nicht generierbar'});
 return {year,preflight,statement,months,depreciation,bridge,issues,readyForFiling:false,readyForHgbClosing:false,disclaimer:'Interner Abschlussassistent; keine freigegebene HGB-Bilanz oder Steuererklärung.'};
}
module.exports={annualCloseChecklist};
