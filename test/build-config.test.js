'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('single builder configuration includes application and offline resources on all platforms',()=>{
 const pkg=require('../package.json');
 assert.equal(pkg.build,undefined,'Avoid competing package.json and electron-builder.yml configuration');
 // JSON is a YAML subset; parse without introducing a runtime dependency.
 const config=JSON.parse(fs.readFileSync(path.join(root,'electron-builder.yml'),'utf8'));
 assert.equal(config.appId,'com.invoiceforge.app');
 for(const dir of ['main','preload','renderer','assets'])assert.ok(config.files.includes(dir+'/**/*'));
 for(const dir of ['tools','taxonomies'])assert.ok(config.extraResources.some(r=>r.from==='vendor/'+dir&&r.to===dir));
 for(const [platform,target] of [['win','nsis'],['mac','dmg'],['linux','AppImage']])assert.ok(config[platform].target.includes(target));
 assert.equal(config.nsis.allowToChangeInstallationDirectory,true);
});
test('release cannot publish before tests and offline resource verification',()=>{
 const files=fs.readdirSync(path.join(root,'.github/workflows')).filter(n=>n.endsWith('.yml'));
 const workflow=files.map(n=>fs.readFileSync(path.join(root,'.github/workflows',n),'utf8')).find(s=>s.startsWith('name: Build and Release'));
 const publish=workflow.indexOf('uses: softprops/action-gh-release');
 for(const command of ['npm test','npm run verify:taxonomies','npm run verify:bundle']){
  assert.ok(workflow.indexOf(command)>=0&&workflow.indexOf(command)<publish,command+' must gate publishing');
 }
});
