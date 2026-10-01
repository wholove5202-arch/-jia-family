const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const root=process.cwd(),babel=require(root+'/node_modules/@babel/core');
let slots=[],cursor=0,effects=[],storage={},fail=false;
const react={useState(initial){let i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]},useRef(initial){let i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i]},useEffect(fn,deps){let i=cursor++;let old=slots[i];if(!old||deps.some((d,j)=>d!==old[j]))effects.push(fn);slots[i]=deps}};
const hookExports={};
const code=babel.transformSync(fs.readFileSync(root+'/src/useSeparatedPersistence.js','utf8'),{configFile:false,babelrc:false,plugins:[require(root+'/node_modules/@babel/plugin-transform-modules-commonjs')]}).code;
vm.runInNewContext(code,{exports:hookExports,require:n=>n==='react'?react:n.includes('async-storage')?{getItem:async k=>storage[k]||null,setItem:async(k,v)=>{if(fail)throw Error('disk full');storage[k]=v}}:n.includes('familyDataMigration')?{migrateSeedAncestor:x=>x}:n.includes('securePrivateStorage')?{readPrivate:async()=>null,writePrivate:async()=>{}}:{updateFutureSettings:()=>{}},console});
function render(){cursor=0;return hookExports.useSeparatedPersistence({activeFamilyId:'f',families:[{id:'f',media:[{id:'a',uri:'original-a'},{id:'b',uri:'original-b'},{id:'c',uri:'original-c'}]}]},{});}
async function flush(){let f=effects.splice(0);for(let fn of f)fn();await new Promise(r=>setImmediate(r));}
(async()=>{
let h=render();await flush();h=render();await flush();
const source=fs.readFileSync(root+'/src/IntegratedPhase1App.js','utf8');
const handlers=source.slice(source.indexOf(' const deleteMedia='),source.indexOf(' const saveAvatar='));
const context={savePublic:h.savePublic,family:{id:'f'},Array};vm.createContext(context);vm.runInContext(handlers+'\nglobalThis.remove=deleteMedia;globalThis.update=updateAlbumMedia;',context);
await context.update({id:'a',takenAt:'2026-10-01',event:'家庭聚会',uri:'wrong'});h=render();await flush();
let saved=JSON.parse(storage.jia_phase1_public_v4);assert.equal(saved.families[0].media[0].uri,'original-a');assert.equal(saved.families[0].media[0].event,'家庭聚会');
await context.remove(['a','b']);h=render();await flush();saved=JSON.parse(storage.jia_phase1_public_v4);assert.deepEqual(saved.families[0].media.map(x=>x.id),['c']);
fail=true;await assert.rejects(context.remove(['c']));h=render();assert.equal(h.pub.families[0].media.length,1);fail=false;
slots=[];h=render();await flush();h=render();assert.equal(h.pub.families[0].media[0].id,'c');
console.log('PASS metadata persisted; original media preserved; batch deletion persisted; failed deletion retained data; reload restored saved state');
})().catch(e=>{console.error(e);process.exit(1)});
