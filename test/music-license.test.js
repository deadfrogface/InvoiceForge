const test=require('node:test');
const assert=require('node:assert/strict');
const {buildMusicLicense}=require('../main/music-license');
const data={author:'Komponist',licensee:'Filmstudio',project:'Under the Orange Tree',artist:'Dead Frog Face',tracks:['Track 1','Track 2','Track 3','Track 4','Track 5'],feeCents:30000};
test('film license includes scoped rights, tracks, and fee',()=>{
 const draft=buildMusicLicense(data);
 assert.equal(draft.trackCount,5);
 assert.match(draft.text,/300,00/);
 assert.match(draft.text,/nicht unterlizenzierbares/);
 assert.match(draft.text,/Under the Orange Tree/);
 assert.doesNotMatch(draft.text,/2a\. Zahlungsbestätigung/);
});
test('payment confirmation only when explicitly selected',()=>{
 assert.match(buildMusicLicense({...data,paymentConfirmed:true}).text,/2a\. Zahlungsbestätigung/);
});
test('requires identifiable works',()=>assert.throws(()=>buildMusicLicense({...data,tracks:[]}),/Musikwerke/));
