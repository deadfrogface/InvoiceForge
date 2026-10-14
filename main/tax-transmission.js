'use strict';
// Explicit fail-closed capability gate. This is NOT an ERiC implementation.
const REQUIRED={
 ustva:['ericSdk','manufacturerId','certificate','officialSchema','validatedPayload'],
 ust:['ericSdk','manufacturerId','certificate','officialSchema','validatedPayload'],
 kst:['ericSdk','manufacturerId','certificate','officialSchema','validatedPayload'],
 gewst:['ericSdk','manufacturerId','certificate','officialSchema','validatedPayload'],
 ebilanz:['ericSdk','manufacturerId','certificate','officialSchema','validatedXbrl','taxonomyVersion']
};
function transmissionReadiness(kind,config={}){
 if(!Object.hasOwn(REQUIRED,kind))throw Error('Unbekannte Steuerdatenart');
 const missing=REQUIRED[kind].filter(key=>!config[key]);
 return {kind,ready:false,missing,canTransmit:false,message:missing.length?'Amtliche Übermittlung gesperrt: '+missing.join(', ')+' fehlt':'Übermittlung gesperrt: ERiC-Adapter und End-to-End-Test noch nicht implementiert'};
}
function transmitTaxReturn(){throw Error('Keine amtliche Übermittlung implementiert. Steuerdaten wurden NICHT versendet.');}
module.exports={transmissionReadiness,transmitTaxReturn};
