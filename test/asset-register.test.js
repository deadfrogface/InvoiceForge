const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {AssetRegister}=require('../main/asset-register');
test('asset register persists locally and requires evidence reference',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'invoiceforge-assets-'));
 try{
  const assets=new AssetRegister(dir);
  assert.throws(()=>assets.add({name:'Laptop',acquired:'2026-01-01',costCents:120000,usefulLifeYears:3}),/Belegreferenz/);
  const entry=assets.add({name:'Laptop',acquired:'2026-01-01',costCents:120000,usefulLifeYears:3,reference:'B-1'});
  assert.equal(new AssetRegister(dir).list()[0].id,entry.id);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
