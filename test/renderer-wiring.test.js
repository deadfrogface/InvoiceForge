const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('invoice register form and controller are wired',()=>{
 const html=read('renderer/index.html'),ui=read('renderer/invoice-register-ui.js'),preload=read('preload/preload.js');
 assert.match(html,/id="irForm"/);
 assert.match(html,/src="invoice-register-ui.js"/);
 assert.match(ui,/api\.invoicesAdd/);
 assert.match(ui,/api\.invoicesStatus/);
 assert.match(preload,/invoicesAdd:/);
});
test('music contract UI is loaded and PDF archive controls exist',()=>{
 const html=read('renderer/index.html'),ui=read('renderer/music-license-ui.js');
 assert.match(html,/src="music-license-ui.js"/);
 for(const id of ['mlPdf','mlArchive','mlArchiveList'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(ui,/musicArchiveAdd/);
 assert.match(ui,/musicArchiveList/);
 assert.match(ui,/jspdf/);
});
