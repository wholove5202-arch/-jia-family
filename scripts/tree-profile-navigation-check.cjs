const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
const root=process.cwd();function load(path,mocks){const result={};const code=babel.transformSync(fs.readFileSync(root+'/'+path,'utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code;vm.runInNewContext(code,{exports:result,require:n=>n==='./theme'?{theme:{bg:'#fff'}}:mocks[n]||{},console});return result;}
let rootMode=true,index=0,slots=[];
const react={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){if(!rootMode)return[initial,()=>{}];const i=index++;if(!(i in slots))slots[i]=initial==='welcome'?'tree':initial;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]},useRef:x=>({current:x==='welcome'?'tree':x}),useMemo:fn=>fn(),useEffect:()=>{}};
const native={View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',Image:'Image',ScrollView:'ScrollView',SafeAreaView:'SafeAreaView',StyleSheet:{create:x=>x},Platform:{OS:'web'},PanResponder:{create:()=>({panHandlers:{}})}};
const screens=load('src/FamilyPeopleScreens.js',{'react':react,'react-native':native,'./familyEditing':load('src/familyEditing.js',{})});
const dad={id:'dad',name:'爸爸'},me={id:'me',name:'我',fatherId:'dad'},family={id:'f',name:'测试家庭',members:[dad,me],media:[],notes:[]};
const app=load('src/IntegratedPhase1App.js',{'react':react,'react-native':native,'./FamilyPeopleScreens':screens,'./useSeparatedPersistence':{useSeparatedPersistence:()=>({pub:{families:[family],activeFamilyId:'f'},priv:{},setPub:()=>{},ready:true})},'./Phase1StateModel':{publicPersonAvatar:()=>null,assertPrivateIsolation:()=>{}}});
function flat(x){return Array.isArray(x)?x.flatMap(flat):x&&typeof x==='object'?[x,...flat(x.children||[])]:[];}
function render(){rootMode=true;index=0;return app.default();}
let tree=flat(render()).find(e=>e.type===screens.FamilyTreeScreen);assert(tree,'Tree screen should render');tree.props.onPerson(dad);
const personContainer=flat(render()).find(e=>e.type?.name==='Person');assert(personContainer,'Avatar action should open person route');const profile=personContainer.type();assert.equal(profile.type,screens.PersonProfileScreen);rootMode=false;
const shown=flat(screens.PersonProfileScreen(profile.props));assert(shown.some(e=>e.children.includes('基本信息')),'Person basic information must render after opening from tree');assert.equal(profile.props.family.id,family.id);
console.log('PASS real tree onPerson handler opens profile with family data and renders basic information');
profile.props.onRelation(me);
const relativeContainer=flat(render()).find(e=>e.type?.name==='Person');
assert(relativeContainer,'tapping a relative must open their profile, not the relation editor');
assert.equal(relativeContainer.type().props.person.id,'me');
// A prefilled person stays visible, but their profile must not imply that
// they have registered or conceal who created their basic information.
const pending={id:'pending',name:'待认领家人',claimed:false,createdById:'me',dead:true};
const profileNodes=p=>flat(screens.PersonProfileScreen({...profile.props,person:p,members:[me,p],family:{...family,members:[me,p]}}));
const pendingNodes=profileNodes(pending);
assert(pendingNodes.some(n=>n.children.includes('家人代建 · 待认领')),'pending status must appear on the profile');
assert(pendingNodes.some(n=>n.children.includes('由我代填')),'recorded creator should be identified');
assert(pendingNodes.some(n=>n.children.includes('查看纪念档案 ›')),'deceased and unclaimed are independent states');
const historicalNodes=profileNodes({...pending,createdById:undefined});
assert(historicalNodes.some(n=>n.children.includes('代填来源未记录')),'historical sources must not be fabricated');
const claimedNodes=profileNodes({...pending,claimed:true,dead:false});
assert(!claimedNodes.some(n=>n.children.includes('家人代建 · 待认领')));
assert(claimedNodes.some(n=>n.children.includes('已认领 · 本人维护')));
console.log('PASS pending profile status, factual creator attribution, historical fallback and independent deceased status');
