// Saving failures must retain the previous private answers and allow retry;
// concurrent private edits must survive a slow interview write.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
let stored,fail=false,duringWrite;
const effects=[];
const mockReact={useEffect:work=>effects.push(work),useRef:v=>({current:v}),useState:v=>[v,()=>{}]};
const exportsObject={};
vm.runInNewContext(babel.transformSync(fs.readFileSync('src/useSeparatedPersistence.js','utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-modules-commonjs')]}).code,{exports:exportsObject,require:name=>name==='react'?mockReact:name==='./securePrivateStorage'?{readPrivate:async()=>null,writePrivate:async(_,text)=>{if(fail)throw Error('disk full');stored=JSON.parse(text);if(duringWrite){const work=duringWrite;duringWrite=null;work();}}}:name==='./familyDataMigration'?{migrateSeedAncestor:x=>x}:name==='./futureItemSettings'?{updateFutureSettings:x=>x}:{default:{getItem:async()=>null,setItem:async()=>{}}}});
(async()=>{
 const hook=exportsObject.useSeparatedPersistence({families:[]},{aiAllowed:false,privateNotes:[]});
 assert.equal(typeof hook.savePrivate,'function','private answer saving must await durable storage');
 fail=true;await assert.rejects(hook.savePrivate(s=>({...s,lifeInterviews:{me:{answer:'yes'}}})),/disk full/);
 fail=false;
 await hook.savePrivate(s=>{assert.equal(s.lifeInterviews,undefined);return {...s,lifeInterviews:{me:{answer:'no'}}}});
 assert.equal(stored.lifeInterviews.me.answer,'no');
 duringWrite=()=>hook.setPriv(s=>({...s,privateNotes:[{text:'new diary'}]}));
 await hook.savePrivate(s=>({...s,lifeInterviews:{me:{answer:'yes'}}}));
 assert.equal(stored.lifeInterviews.me.answer,'yes');assert.equal(stored.privateNotes[0].text,'new diary');assert.equal(stored.aiAllowed,false);
 effects[0]();await new Promise(resolve=>setImmediate(resolve));
 duringWrite=()=>effects[2]();
 await hook.savePrivate(s=>({...s,lifeInterviews:{me:{answer:'latest'}}}));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(stored.lifeInterviews?.me?.answer,'latest','a queued autosave must not restore a stale snapshot');
 console.log('PASS awaited private interview save, failure/retry, concurrent diary preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
