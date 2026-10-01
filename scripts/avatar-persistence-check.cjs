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
const avatar='data:image/jpeg;base64,YXZhdGFy';
let h=render();await flush();h=render();await flush();
await h.savePublic(state=>({...state,families:state.families.map(f=>({...f,members:[{id:'dad',name:'爸爸',fatherId:'grandpa',avatarUri:'old-image'},{id:'me',name:'我',fatherId:'dad'}]}))}));h=render();await flush();
const source=fs.readFileSync(root+'/src/IntegratedPhase1App.js','utf8');
const handler=source.slice(source.indexOf(' const savePerson='),source.indexOf(' const personAvatar='));
let finished=null,blocked=false,release;
const save=h.savePublic;
const context={savePublic:updater=>blocked?new Promise(resolve=>release=async()=>{await save(updater);resolve()}):save(updater),family:{id:'f'},finishPerson:p=>finished=p};
vm.createContext(context);vm.runInContext(handler+'\nglobalThis.savePersonHandler=savePerson;',context);
const edited={id:'dad',name:'爸爸',fatherId:'grandpa',avatarUri:avatar,avatarSourceUri:avatar};
blocked=true;const saving=context.savePersonHandler(edited);assert.equal(finished,null,'navigation waits for durable save');await release();await saving;assert.equal(finished.avatarUri,avatar);blocked=false;
let saved=JSON.parse(storage.jia_phase1_public_v4);assert.equal(saved.families[0].members[0].avatarUri,avatar);assert.equal(saved.families[0].members[1].id,'me');assert.equal(saved.families[0].media[0].uri,'original-a');
finished=null;fail=true;await assert.rejects(context.savePersonHandler({...edited,avatarUri:'replacement'}));assert.equal(finished,null,'failed save stays in editor');assert.equal(JSON.parse(storage.jia_phase1_public_v4).families[0].members[0].avatarUri,avatar);fail=false;
slots=[];h=render();await flush();h=render();assert.equal(h.pub.families[0].members[0].avatarUri,avatar,'new app load reads saved avatar');assert.equal(h.pub.families[0].members[0].fatherId,'grandpa');
console.log('PASS real app save handler awaits storage; successful avatar survives app reload; failure retains previous image and blocks navigation; family photos and other members preserved');
})().catch(e=>{console.error(e);process.exit(1)});
