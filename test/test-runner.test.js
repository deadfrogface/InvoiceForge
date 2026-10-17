'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {discoverTests,runTests}=require('../scripts/run-tests');
test('test discovery includes nested test files and excludes native acceptance helpers',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if test runner '));
 try{
  fs.mkdirSync(path.join(root,'nested'));fs.mkdirSync(path.join(root,'native'));
  for(const file of ['a.test.js','nested/b.test.js','native/verify-ocr.js','helper.js'])fs.writeFileSync(path.join(root,file),'');
  assert.deepEqual(discoverTests(root).map(p=>path.relative(root,p)),['a.test.js',path.join('nested','b.test.js')]);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('runner preserves failures and handles paths with spaces without shell expansion',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if test runner '));
 try{
  assert.throws(()=>runTests(root),/No .test.js/);
  const file=path.join(root,'example.test.js');
  fs.writeFileSync(file,"require('node:test')('passing fixture',()=>{});");
  assert.equal(runTests(root),0);
  fs.writeFileSync(file,"require('node:test')('failing fixture',()=>{throw Error('expected failure');});");
  assert.equal(runTests(root),1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
