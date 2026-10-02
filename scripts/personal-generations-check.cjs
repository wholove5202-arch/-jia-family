// Catch global deepest-generation cropping that hides the viewer's parents
// merely because a sibling has grandchildren.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
const out={};vm.runInNewContext(babel.transformSync(fs.readFileSync('src/treeLayout.js','utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-modules-commonjs')]}).code,{exports:out});
const people=[{id:'gp',name:'父母'},{id:'me',name:'本人',fatherId:'gp',siblingLinks:[{personId:'bro'}]},{id:'wife',name:'配偶',spouseIds:['me']},{id:'bro',name:'兄弟',fatherId:'gp'},{id:'son',name:'子女',fatherId:'me'},{id:'nephew',name:'侄子',fatherId:'bro'},{id:'greatNephew',name:'兄弟的孙辈',fatherId:'nephew'}];
const before=JSON.stringify(people),ids=l=>Object.keys(l.positions).sort();
assert.deepEqual(ids(out.layoutFamily(people,false,{focusId:'me'})),['bro','gp','me','nephew','son','wife']);
assert.deepEqual(ids(out.layoutFamily(people,false,{focusId:'me',expandedIds:['bro']})),['bro','gp','greatNephew','me','nephew','son','wife']);
const ownGrand=[...people,{id:'grand',name:'自己的孙辈',motherId:'son'}];
assert.deepEqual(ids(out.layoutFamily(ownGrand,false,{focusId:'me'})),['bro','grand','greatNephew','me','nephew','son','wife']);
assert.deepEqual(ids(out.layoutFamily(ownGrand,false,{focusId:'me',showParents:true})),['bro','gp','grand','greatNephew','me','nephew','son','wife']);
assert.deepEqual(ids(out.layoutFamily(people,false,{focusId:'bro'})),['bro','greatNephew','me','nephew','son','wife']);
assert.equal(out.layoutFamily(people,true,{focusId:'me'}).rows.length,4);
assert.equal(JSON.stringify(people),before);
assert.equal(out.layoutFamily([],false,{focusId:'me'}).rows.length,0);
console.log('PASS personal three generations, daughter-line grandchildren, independent sibling expansion, parents expansion and immutable focus switching');
