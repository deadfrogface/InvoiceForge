'use strict';
const assert=require('node:assert/strict');
function assessUGReadiness({incorporated,accountsBalanced,receiptsComplete,bankReconciled,assetRegisterReviewed,taxReviewed}){
 const checks=[
  ['Handelsregistereintragung',incorporated],
  ['Doppelte Buchführung abgestimmt',accountsBalanced],
  ['Originalbelege vollständig',receiptsComplete],
  ['Bankkonten abgestimmt',bankReconciled],
  ['Anlagevermögen geprüft',assetRegisterReviewed],
  ['Steuerliche Prüfung',taxReviewed]
 ];
 return {ready:checks.every(([,ok])=>ok===true),missing:checks.filter(([,ok])=>ok!==true).map(([name])=>name)};
}
module.exports={assessUGReadiness};
