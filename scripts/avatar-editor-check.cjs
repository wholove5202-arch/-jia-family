const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
function load(path,mocks={},globals={}){const exports={};const code=babel.transformSync(fs.readFileSync(path,'utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code;vm.runInNewContext(code,{exports,require:n=>mocks[n]||{},console,...globals});return exports;}
const geometry=load('src/avatarGeometry.js').cropGeometry;
for(const [w,h] of [[1200,800],[800,1200],[900,900]])for(const z of [1,2,4]){const c=geometry(w,h,z,100000,-100000);assert(c.left<=0&&c.top<=0&&c.left+c.w>=280&&c.top+c.h>=280,'crop must cover every pixel with photo');}
let cursor=0,slots=[],saved=[],fail=false;
const react={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]},useRef:v=>({current:v})};
const native={View:'View',Text:'Text',TextInput:'TextInput',Image:'Image',TouchableOpacity:'TouchableOpacity',ScrollView:'ScrollView',KeyboardAvoidingView:'KeyboardAvoidingView',StyleSheet:{create:x=>x},Platform:{OS:'web'}};
const cropper=()=>null,uri='data:image/jpeg;base64,cGVyc2lzdGVudA==';
const screens=load('src/FamilyPeopleScreens.js',{'react':react,'react-native':native,'./theme':{theme:{bg:'#fff'}},'./AvatarCropper':cropper,'./avatarPicker':{pickAvatarAsset:async()=>({uri,width:1200,height:800})},'./familyEditing':{mayEditPerson:()=>true,validateBirthday:()=>true}});
const person={id:'dad',name:'爸爸',avatarUri:uri,fatherId:'grandpa'};
const props={person,onSave:async p=>{if(fail)throw Error('disk full');saved.push(JSON.parse(JSON.stringify(p)))},onBack:()=>{}};
const flat=x=>Array.isArray(x)?x.flatMap(flat):x&&typeof x==='object'?[x,...flat(x.children||[])]:[];
function render(){cursor=0;return flat(screens.PersonEditorScreen(props));}
const label=(nodes,key)=>nodes.find(n=>n.props.accessibilityLabel===key);
(async()=>{
 let nodes=render();await label(nodes,'调整头像').props.onPress();nodes=render();let modal=nodes.find(n=>n.type===cropper);assert.equal(modal.props.asset.uri,uri,'existing avatar opens crop rather than file picker');
 modal.props.onConfirm({avatarUri:uri,avatarSourceUri:uri,avatarCrop:null});nodes=render();label(nodes,'姓名').props.onChangeText('爸爸新名字');nodes=render();fail=true;await label(nodes,'保存资料').props.onPress();nodes=render();assert(nodes.some(n=>n.children.includes('保存失败，资料和头像仍保留，请重试。')));assert.equal(label(nodes,'姓名').props.value,'爸爸新名字');
 fail=false;await label(nodes,'保存资料').props.onPress();assert.equal(saved[0].avatarUri,uri);assert.equal(saved[0].fatherId,'grandpa');assert.equal(saved[0].name,'爸爸新名字');
 let didRead=false;const picker=load('src/avatarPicker.js',{'react-native':{Platform:{OS:'web'}}},{fetch:async()=>({ok:true,blob:async()=>({})}),FileReader:class{readAsDataURL(){didRead=true;this.result=uri;this.onload();}}});const a=await picker.persistAvatarAsset({uri:'blob:temporary-photo',width:1200});assert(didRead);assert.equal(a.uri,uri);assert.equal(a.width,1200);
 console.log('PASS crop bounds, existing-avatar adjustment, failed save retains draft, saved avatar survives JSON reload, temporary web URI becomes durable data');
})().catch(e=>{console.error(e);process.exitCode=1});
