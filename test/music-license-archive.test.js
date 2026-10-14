const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {MusicLicenseArchive}=require('../main/music-license-archive');
test('contract archive persists drafts and status events',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-music-'));
 try{
  const archive=new MusicLicenseArchive(dir);
  const record=archive.add({text:'MUSIKLIZENZVERTRAG',project:'Under the Orange Tree',feeCents:30000});
  assert.equal(new MusicLicenseArchive(dir).list()[0].status,'draft');
  archive.setStatus(record.id,'signed');
  assert.equal(new MusicLicenseArchive(dir).list()[0].status,'signed');
  assert.equal(archive.events().length,2);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('archive rejects empty contracts',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-music-'));
 try{assert.throws(()=>new MusicLicenseArchive(dir).add({text:'',project:'Film',feeCents:1}),/Ungültiger/);}
 finally{fs.rmSync(dir,{recursive:true,force:true});}
});
