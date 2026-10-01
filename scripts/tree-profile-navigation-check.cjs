const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
const root=process.cwd();function load(path,mocks){const result={};const code=babel.transformSync(fs.readFileSync(root+'/'+path,'utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code;vm.runInNewContext(code,{exports:result,require:n=>mocks[n]||{},console});return result;}
let rootMode=true,index=0,slots=[];
const react={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){if(!rootMode)return[initial,()=>{}];const i=index++;if(!(i in slots))slots[i]=initial==='welcome'?'tree':initial;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]},useRef:x=>({current:x==='welcome'?'tree':x}),useMemo:fn=>fn(),useEffect:()=>{}};
const native={View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity',Image:'Image',ScrollView:'ScrollView',SafeAreaView:'SafeAreaView',StyleSheet:{create:x=>x},Platform:{OS:'web'},PanResponder:{create:()=>({panHandlers:{}})}};
const screens=load('src/FamilyPeopleScreens.js',{'react':react,'react-native':native,'./familyEditing':{mayEditPerson:()=>true}});
const dad={id:'dad',name:'爸爸'},me={id:'me',name:'我',fatherId:'dad'},family={id:'f',name:'测试家庭',members:[dad,me],media:[],notes:[]};
const app=load('src/IntegratedPhase1App.js',{'react':react,'react-native':native,'./FamilyPeopleScreens':screens,'./useSeparatedPersistence':{useSeparatedPersistence:()=>({pub:{families:[family],activeFamilyId:'f'},priv:{},setPub:()=>{},ready:true})},'./Phase1StateModel':{publicPersonAvatar:()=>null,assertPrivateIsolation:()=>{}}});
function flat(x){return Array.isArray(x)?x.flatMap(flat):x&&typeof x==='object'?[x,...flat(x.children||[])]:[];}
function render(){rootMode=true;index=0;return app.default();}
let tree=flat(render()).find(e=>e.type===screens.FamilyTreeScreen);assert(tree,'Tree screen should render');tree.props.onPerson(dad);
const personContainer=flat(render()).find(e=>e.type?.name==='Person');assert(personContainer,'Avatar action should open person route');const profile=personContainer.type();assert.equal(profile.type,screens.PersonProfileScreen);rootMode=false;
const shown=flat(screens.PersonProfileScreen(profile.props));assert(shown.some(e=>e.children.includes('基本信息')),'Person basic information must render after opening from tree');assert.equal(profile.props.family.id,family.id);
console.log('PASS real tree onPerson handler opens profile with family data and renders basic information');
