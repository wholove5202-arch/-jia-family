const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
const root=process.cwd();
function moduleAt(path,mocks={}){const out={};const code=babel.transformSync(fs.readFileSync(path,'utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code;vm.runInNewContext(code,{exports:out,require:n=>mocks[n]||{},console});return out;}
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
