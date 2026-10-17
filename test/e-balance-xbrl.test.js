const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {validateMappingAgainstTaxonomy,exportReviewXbrl}=require('../main/e-balance-xbrl');
test('taxonomy-aware mapping rejects unknown concepts and generates review-only XBRL',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'if-xbrl-mapping-'));
 try{
  const dir=path.join(root,'6.9');fs.mkdirSync(dir);
  const schema='<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"><xs:element name="bs.ass.cash"/></xs:schema>';
  fs.writeFileSync(path.join(dir,'taxonomy.xsd'),schema);
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({version:'6.9',files:[{path:'taxonomy.xsd',sha256:crypto.createHash('sha256').update(schema).digest('hex')}]}));
  const tb={accounts:[{number:'1200',name:'Bank',balanceCents:12345}]};
  assert.deepEqual(validateMappingAgainstTaxonomy(root,2026,'6.9',tb,{'1200':'not.in.taxonomy'}).unknownConcepts,['not.in.taxonomy']);
  assert.throws(()=>exportReviewXbrl({root,year:2026,version:'6.9',entityIdentifier:'Company',entityScheme:'https://example.invalid/id',namespace:'https://example.invalid/gaap',trialBalance:tb,mapping:{'1200':'not.in.taxonomy'}}),/Nicht alle Konten/);
  const result=exportReviewXbrl({root,year:2026,version:'6.9',entityIdentifier:'Company',entityScheme:'https://example.invalid/id',namespace:'https://example.invalid/gaap',trialBalance:tb,mapping:{'1200':'bs.ass.cash'}});
  assert.match(result.xml,/123\.45/);
  assert.equal(result.officiallyValidated,false);
  assert.equal(result.readyForFiling,false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
