'use strict';
// Indicative German corporation tax calculation, NOT an official tax return.
function estimateCorporateTaxes({taxableProfitCents,tradeTaxBaseCents=taxableProfitCents,municipalMultiplier=400,lossCarryforwardCents=0}={}){
 for(const [name,value] of Object.entries({taxableProfitCents,tradeTaxBaseCents,lossCarryforwardCents})){
  if(!Number.isSafeInteger(value)||value<0)throw Error(name+' must be a non-negative integer in cents');
 }
 if(!Number.isInteger(municipalMultiplier)||municipalMultiplier<200||municipalMultiplier>1000)throw Error('Invalid municipal trade tax multiplier');
 // Loss carryforwards, minimum taxation, exemptions and adjustments require separate review.
 const profit=Math.max(0,taxableProfitCents-lossCarryforwardCents);
 const tradeBase=Math.max(0,tradeTaxBaseCents-lossCarryforwardCents);
 const corporationTaxCents=Math.round(profit*15/100);
 const solidaritySurchargeCents=Math.round(corporationTaxCents*5.5/100);
 const tradeTaxCents=Math.round(tradeBase*3.5/100*municipalMultiplier/100);
 return {taxableProfitCents,tradeTaxBaseCents,municipalMultiplier,lossCarryforwardCents,corporationTaxCents,solidaritySurchargeCents,tradeTaxCents,totalEstimatedTaxCents:corporationTaxCents+solidaritySurchargeCents+tradeTaxCents,readyForFiling:false,requiresReview:true,limitations:['No legal tax determination','No minimum taxation or trade tax additions/reductions','No special tax rates, prepayments or foreign tax credits','No official KSt/GewSt filing or E-Bilanz']};
}
module.exports={estimateCorporateTaxes};
