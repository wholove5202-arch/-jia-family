const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
const root=process.cwd();
function moduleAt(path,mocks={}){const out={};const code=babel.transformSync(fs.readFileSync(path,'utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code;vm.runInNewContext(code,{exports:out,require:n=>n==='./theme'?{theme:{bg:'#fff'}}:mocks[n]||{},console});return out;}
const layoutModule=moduleAt(root+'/src/treeLayout.js');
const react={createElement:(type,props,...children)=>({type,props:props||{},children}),useState:x=>[x,()=>{}],useRef:x=>({current:x})};
const native={View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',Image:'Image',ScrollView:'ScrollView',StyleSheet:{create:x=>x},PanResponder:{create:()=>({panHandlers:{}})},Platform:{OS:'web'}};
const screenModule=moduleAt(root+'/src/FamilyPeopleScreens.js',{'react':react,'react-native':native,'./treeLayout':layoutModule});
function flatten(node){return Array.isArray(node)?node.flatMap(flatten):node&&typeof node==='object'?[node,...flatten(node.children||[])]:[];}
function segments(members){const nodes=flatten(screenModule.FamilyTreeScreen({family:{name:'测试家庭',members}}));return nodes.filter(n=>/^(spouse|trunk|branch|child):/.test(n.props.key||'')).map(n=>{const s=n.props.style;return {key:n.props.key,x:s.left,y:s.top,w:s.width,h:s.height}});}
function touch(a,b){return a.x<=b.x+b.w+.1&&b.x<=a.x+a.w+.1&&a.y<=b.y+b.h+.1&&b.y<=a.y+a.h+.1;}
function connected(lines,a,b){const seen=new Set([a]);let changed=true;while(changed){changed=false;for(let i=0;i<lines.length;i++)if(!seen.has(i)&&[...seen].some(j=>touch(lines[i],lines[j]))){seen.add(i);changed=true}}return seen.has(b);}
const sample=[{id:'dad',name:'爸爸',fatherId:'grandpa'},{id:'mom',name:'妈妈'},{id:'me',name:'我',fatherId:'dad',motherId:'mom'},{id:'sis',name:'姐姐',fatherId:'dad',motherId:'mom'},{id:'grandpa',name:'爷爷',dead:true}];
let lines=segments(sample),trunk=lines.findIndex(e=>e.key==='trunk:grandpa'),child=lines.findIndex(e=>e.key==='child:grandpa:0');
assert(trunk>=0&&child>=0,'single parent connectors must exist');assert(connected(lines,trunk,child),'grandfather-to-father connector must be continuous even with different x coordinates');
assert(lines.some(e=>e.key==='spouse:dad:mom'),'two confirmed parents must share a couple line even without redundant spouseIds');
for(const ids of [['dad','mom'],['grandpa']]){const key=ids.sort().join(':');const ti=lines.findIndex(e=>e.key==='trunk:'+key);for(let i=0;i<lines.length;i++)if(lines[i].key.startsWith('child:'+key+':'))assert(connected(lines,ti,i),'every child must connect to its own parents');}
const half=[{id:'dad',name:'爸爸',spouseIds:['a','b']},{id:'a',name:'妈妈A'},{id:'b',name:'妈妈B'},{id:'one',name:'孩子A',fatherId:'dad',motherId:'a'},{id:'two',name:'孩子B',fatherId:'dad',motherId:'b'}];
const hp=layoutModule.layoutFamily(half).positions;assert(hp.a.x<hp.dad.x&&hp.dad.x<hp.b.x,'parent must lie between partners so couple lines avoid unrelated avatars');
lines=segments(half);assert(lines.some(e=>e.key==='trunk:a:dad'));assert(lines.some(e=>e.key==='trunk:b:dad'));assert.equal(lines.filter(e=>e.key.startsWith('child:a:dad:')).length,1);assert.equal(lines.filter(e=>e.key.startsWith('child:b:dad:')).length,1);
const generations=[{id:'g0',name:'祖辈'},{id:'g1',name:'一代',fatherId:'g0'},{id:'g2',name:'二代',fatherId:'g1'},{id:'g3',name:'三代',fatherId:'g2'}];assert.equal(layoutModule.layoutFamily(generations).rows.length,3);assert.equal(layoutModule.layoutFamily(generations,true).rows.length,4);
console.log('PASS rendered lineage continuity; inferred couple line; correct half-sibling parent groups; default three generations and full tree');

// Adding a spouse's parents must not promote them to the grandparent row,
// or visually join their lineage to the other couple's children.
const editing=moduleAt(root+'/src/familyEditing.js');
let inlaws=[
 {id:'gp',name:'爷爷'},{id:'gm',name:'奶奶'},
 {id:'mgp',name:'外公'},{id:'mgm',name:'外婆'},
 {id:'dad',name:'爸爸',fatherId:'gp',motherId:'gm'},
 {id:'mom',name:'妈妈',fatherId:'mgp',motherId:'mgm'},
 {id:'me',name:'刘鹏程',fatherId:'dad',motherId:'mom'},
 {id:'sis',name:'姐姐',fatherId:'dad',motherId:'mom'}
];
inlaws=editing.addRelative(inlaws,'me','spouse',{id:'wife',name:'刘璐'});
inlaws=editing.addRelative(inlaws,'me','son',{id:'son',name:'刘子淮'});
inlaws=editing.addRelative(inlaws,'me','son',{id:'son2',name:'刘子优'});
inlaws=editing.addRelative(inlaws,'sis','spouse',{id:'husband',name:'张希伟'});
inlaws=editing.addRelative(inlaws,'sis','daughter',{id:'niece',name:'张亲然'},{parentSide:'mother'});
inlaws=editing.addRelative(inlaws,'wife','father',{id:'fil',name:'岳父'});
inlaws=editing.addRelative(inlaws,'wife','mother',{id:'mil',name:'岳母'});
const before=JSON.stringify(inlaws),full=layoutModule.layoutFamily(inlaws,true),p=full.positions;
assert.equal(p.fil.y,p.dad.y,'wife parents must share the parents generation despite missing grandparents');
assert.equal(p.mil.y,p.mom.y);
assert.equal(p.wife.y,p.me.y);
assert(p.gp.y<p.fil.y&&p.fil.y<p.wife.y);
assert.equal(Math.abs(p.me.x-p.wife.x),112,'couples stay adjacent even when a spouse was added after a sibling');
assert.equal(Math.abs(p.sis.x-p.husband.x),112);
const three=layoutModule.layoutFamily(inlaws).positions;
assert(three.fil&&three.mil,'in-laws remain visible in the three-generation view');
assert(!three.gp);
assert.equal(JSON.stringify(inlaws),before,'layout must preserve stored parentage and member order');
for(const list of [inlaws.slice().reverse(),[...inlaws,{id:'wg',name:'妻子的爷爷'}].map(q=>q.id==='fil'?{...q,fatherId:'wg'}:q)]){
 const pos=layoutModule.layoutFamily(list,true).positions;
 assert.equal(pos.fil.y,pos.dad.y,'generation alignment follows identities and links, not insertion order or which family has more ancestors');
 assert.equal(pos.wife.y,pos.me.y);
 for(const q of list)for(const id of [q.fatherId,q.motherId])if(pos[id])assert.equal(pos[q.id].y-pos[id].y,166,'ordinary parentage stays exactly one generation apart');
}
lines=segments(inlaws);
const own=lines.filter(e=>/^(trunk|branch|child):dad:mom(?=:|$)/.test(e.key));
const spouseParents=lines.filter(e=>/^(trunk|branch|child):fil:mil(?=:|$)/.test(e.key));
assert(own.length&&spouseParents.length);
assert(!own.some(a=>spouseParents.some(b=>touch(a,b))),'independent parent branches must not visually join');
console.log('PASS spouse-parent generations, late-added adjacent couples, three-generation visibility and separate rendered lineages');
