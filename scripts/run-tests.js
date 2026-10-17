'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
function discoverTests(directory){
 const files=[];
 for(const entry of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const filename=path.join(directory,entry.name);
  if(entry.isDirectory())files.push(...discoverTests(filename));
  else if(entry.isFile()&&entry.name.endsWith('.test.js'))files.push(filename);
 }
 return files;
}
function runTests(directory,options=[]){
 const files=discoverTests(directory);
 if(!files.length)throw Error('No .test.js test files found in '+directory);
 // Explicit argument arrays work with cmd.exe, PowerShell and POSIX shells alike.
 // Native OCR acceptance remains in its own workflow after binaries and fixtures are staged.
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const result=spawnSync(process.execPath,['--test',...options,...files],{stdio:'inherit',shell:false,env});
 if(result.error)throw result.error;
 return result.status===null?1:result.status;
}
if(require.main===module){
 try{process.exitCode=runTests(path.resolve(__dirname,'..','test'),process.argv.slice(2));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={discoverTests,runTests};
