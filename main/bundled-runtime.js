'use strict';
const fs=require('node:fs'),path=require('node:path');
function bundleRoot(){return path.join(process.resourcesPath||path.resolve(__dirname,'..','vendor'),'tools',process.platform,process.arch);}
function runtimeEnvironment(binary){
 const root=bundleRoot(),env={...process.env};
 if(process.platform==='win32')env.PATH=[path.join(root,'runtime','Library','bin'),path.dirname(binary),env.PATH||''].join(path.delimiter);
 if(process.platform==='linux')env.LD_LIBRARY_PATH=[path.join(path.dirname(binary),'lib'),env.LD_LIBRARY_PATH||''].filter(Boolean).join(':');
 return env;
}
function kositResources(){
 const root=bundleRoot(),jar=path.join(root,'validator','validator.jar'),directory=path.join(root,'validator','configuration'),scenarios=path.join(directory,'scenarios.xml');
 return fs.existsSync(jar)&&fs.existsSync(scenarios)?{jar,directory,scenarios}:null;
}
module.exports={bundleRoot,runtimeEnvironment,kositResources};
