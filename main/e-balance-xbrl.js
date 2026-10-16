'use strict';
const fs=require('node:fs'),path=require('node:path');
const {loadTaxonomyManifest,mapAccountBalances}=require('./e-balance-taxonomy');
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
function validateMappingAgainstTaxonomy(root,year,version,trialBalance,mapping){
 const manifest=loadTaxonomyManifest(root,year,version);
 const dir=path.resolve(root,manifest.version);
 const xsdFiles=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')).files.filter(f=>f.path.endsWith('.xsd'));
 const concepts=new Set();
 for(const item of xsdFiles){
  const xml=fs.readFileSync(path.join(dir,item.path),'utf8');
  for(const m of xml.matchAll(/<(?:xs:|xsd:)?element\b[^>]*\bname\s*=\s*["']([^"']+)["']/g))concepts.add(m[1]);
 }
 if(!concepts.size)throw Error('Keine Taxonomiekonzepte aus XSD-Dateien erkannt');
 const mapped=mapAccountBalances(trialBalance,mapping);
 const unknown=Object.values(mapping).filter(v=>typeof v!=='string'||!concepts.has(v));
 return {...mapped,taxonomy:manifest,unknownConcepts:[...new Set(unknown)],validMapping:mapped.complete&&unknown.length===0,conceptCount:concepts.size};
}
function exportReviewXbrl({entityIdentifier,entityScheme,year,namespace,trialBalance,mapping,root,version}){
 if(typeof entityIdentifier!=='string'||!entityIdentifier.trim()||typeof entityScheme!=='string'||!/^https?:\/\//.test(entityScheme)||!/^[0-9]{4}$/.test(String(year)))throw Error('Unternehmenskennung oder Jahr fehlt');
 if(typeof namespace!=='string'||!/^https?:\/\//.test(namespace))throw Error('Taxonomie-Namespace fehlt');
 const result=validateMappingAgainstTaxonomy(root,year,version,trialBalance,mapping);
 if(!result.validMapping)throw Error('Nicht alle Konten sind auf vorhandene Taxonomiekonzepte abgebildet: '+[...result.unmapped,...result.unknownConcepts].join(', '));
 const lines=['<?xml version="1.0" encoding="UTF-8"?>',
  '<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:iso4217="http://www.xbrl.org/2003/iso4217" xmlns:gaap="'+esc(namespace)+'">',
  '<xbrli:context id="year"><xbrli:entity><xbrli:identifier scheme="'+esc(entityScheme)+'">'+esc(entityIdentifier)+'</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:instant>'+year+'-12-31</xbrli:instant></xbrli:period></xbrli:context>',
  '<xbrli:unit id="EUR"><xbrli:measure>iso4217:EUR</xbrli:measure></xbrli:unit>'];
 for(const [concept,cents] of Object.entries(result.facts)){
  if(!/^[A-Za-z_][\w.-]*$/.test(concept))throw Error('Ungültiger XBRL-Konzeptname');
  if(!Number.isSafeInteger(cents))throw Error('Ungültiger Centbetrag');
  lines.push('<gaap:'+concept+' contextRef="year" unitRef="EUR" decimals="2">'+(cents/100).toFixed(2)+'</gaap:'+concept+'>');
 }
 lines.push('</xbrli:xbrl>');
 return {xml:lines.join('\n'),officiallyValidated:false,readyForFiling:false,accountProof:result.accountProof,warning:'Technischer XBRL-Entwurf ohne GCD-Modul, steuerliche Überleitung und amtliche ERiC-Validierung. Nicht einreichen.'};
}
module.exports={validateMappingAgainstTaxonomy,exportReviewXbrl};
