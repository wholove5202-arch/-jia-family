const fs=require('node:fs'),assert=require('node:assert/strict');
const dataModule=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
async function main(){
 const editingUrl=dataModule(fs.readFileSync(process.argv[2]||'src/familyEditing.js','utf8'));
 const {addRelative,completeCoupleParents}=await import(editingUrl);
 const migrationCode=fs.readFileSync(process.argv[3]||'src/familyDataMigration.js','utf8').replace("'./familyEditing'",JSON.stringify(editingUrl)).replace("'./familyEditing.mjs'",JSON.stringify(editingUrl));
 const {migrateSeedAncestor}=await import(dataModule(migrationCode));
 const couple=()=>[{id:'me',name:'我',spouseIds:['wife']},{id:'wife',name:'刘璐',spouseIds:['me']}];
 const son={id:'son',name:'刘子淮',fatherId:'me'};
 const get=(list,id='son')=>list.find(p=>p.id===id);
 let count=0;const check=(label,fn)=>{fn();count++;console.log('PASS '+label)};
 check('child before spouse',()=>{const list=addRelative([{id:'me',name:'我'},son],'me','spouse',{id:'wife',name:'刘璐'});assert.equal(get(list).motherId,'wife')});
 check('child after spouse',()=>assert.equal(get(addRelative(couple(),'me','son',{id:'son',name:'刘子淮'})).motherId,'wife'));
 check('maternal anchor',()=>{const child=get(addRelative(couple(),'wife','son',{id:'son',name:'刘子淮'},{parentSide:'mother'}));assert.equal(child.motherId,'wife');assert.equal(child.fatherId,'me')});
 check('old persisted family repaired despite earlier migration',()=>{const input={seedAncestorMigration:1,families:[{id:'custom',members:[...couple(),son]}]};const output=migrateSeedAncestor(input);assert.equal(get(output.families[0].members).motherId,'wife');assert.equal(get(input.families[0].members).motherId,undefined);assert.equal(migrateSeedAncestor(output),output)});
 check('manual single parent preserved',()=>assert.equal(get(completeCoupleParents([...couple(),{...son,parentageManual:true}])).motherId,undefined));
 check('explicit other parent preserved',()=>assert.equal(get(completeCoupleParents([...couple(),{id:'other'}, {...son,motherId:'other'}])).motherId,'other'));
 check('ambiguous spouses preserved',()=>{const list=couple();list[0].spouseIds.push('other');assert.equal(get(completeCoupleParents([...list,{id:'other',spouseIds:['me']},son])).motherId,undefined)});
 check('nonreciprocal spouse preserved',()=>{const list=couple();list[1].spouseIds=[];assert.equal(get(completeCoupleParents([...list,son])).motherId,undefined)});
 check('past marriage preserved',()=>{const list=couple();list[0].marriages=[{personId:'ex',status:'divorced'}];assert.equal(get(completeCoupleParents([...list,son])).motherId,undefined)});
 check('remarriage does not assign old children',()=>{const list=couple();const result=addRelative([...list,son],'me','remarry',{id:'new',name:'新配偶'});assert.equal(get(result).motherId,undefined)});
 check('missing spouse preserved',()=>assert.equal(get(completeCoupleParents([{id:'me',spouseIds:['missing']},son])).motherId,undefined));
 check('cyclic inference rejected',()=>{const list=couple();list[1].fatherId='son';assert.equal(get(completeCoupleParents([...list,son])).motherId,undefined)});
 check('unparented child preserved',()=>assert.equal(get(completeCoupleParents([...couple(),{id:'son'}])).fatherId,undefined));
 check('repeat completion is stable',()=>{const once=completeCoupleParents([...couple(),son]);assert.deepEqual(completeCoupleParents(once),once)});
 check('demo ancestor repair still works',()=>{const input={families:[{id:'f1',members:[{id:'me',fatherId:'p1'},{id:'p1'},{id:'p5',isDemo:true}]}]};assert.equal(get(migrateSeedAncestor(input).families[0].members,'p1').fatherId,'p5')});
 console.log(count+' relationship regression checks passed');
}
main().catch(error=>{console.error(error);process.exitCode=1});
