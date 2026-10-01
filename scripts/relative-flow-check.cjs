const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
function hooks(){let i=0;const slots=[];return {slots,reset(){i=0},useState(initial){const n=i++;if(!(n in slots))slots[n]=typeof initial==='function'?initial():initial;return [slots[n],v=>{slots[n]=typeof v==='function'?v(slots[n]):v}]},useRef(initial){const n=i++;return slots[n]||(slots[n]={current:initial})},useMemo:fn=>fn(),useEffect(){}}}
const createElement=(type,props,...children)=>({type,props:{...props,children:children.length===1?children[0]:children},children});
const native={StyleSheet:{create:x=>x,hairlineWidth:1},Platform:{OS:'web'},Alert:{alert(){}},PanResponder:{create:()=>({panHandlers:{}})}};
for(const n of ['View','Text','TouchableOpacity','TextInput','ScrollView','Modal','Image','SafeAreaView','KeyboardAvoidingView','ActivityIndicator'])native[n]=n;
function moduleAt(path,react,mocks={}){const out={};const code=babel.transformSync(fs.readFileSync(path,'utf8'),{babelrc:false,configFile:false,plugins:[[require('@babel/plugin-transform-react-jsx'),{runtime:'classic'}],require('@babel/plugin-transform-modules-commonjs')]}).code;vm.runInNewContext(code,{exports:out,require:n=>n==='react'?react:n==='react-native'?native:n==='./theme'?{theme:{bg:'#fff',brown:'#5089c8',deep:'#292e30',muted:'#929b97'}}:mocks[n]||{},console});return out;}
function flatten(node){if(Array.isArray(node))return node.flatMap(flatten);if(!node||typeof node!=='object')return [];if(typeof node.type==='function')return flatten(node.type(node.props));return [node,...flatten(node.children)]}
function text(node){if(Array.isArray(node))return node.map(text).join('');if(node&&typeof node==='object')return text(node.children);return node==null?'':String(node)}
function button(nodes,label){const found=nodes.find(n=>n.type==='TouchableOpacity'&&text(n)===label);assert(found,'missing button '+label);return found}
async function main(){
 const h=hooks(),react={...h,createElement};const domain=moduleAt('src/familyEditing.js',react);
 const ui=moduleAt('src/FamilyPeopleScreens.js',react,{'./familyEditing':domain,'./JiaIcon':()=>null,'./birthdayReminder':{birthdayCountdown:()=>''}});
 const members=[{id:'me',name:'我',gender:'男',spouseIds:['wife']},{id:'wife',name:'刘璐',gender:'女',spouseIds:['me']}];
 let saved,calls=0,resolveSave;const pending=new Promise(r=>resolveSave=r);
 const props={anchor:members[0],members,onBack(){},onSave:async(...args)=>{calls++;saved=args;await pending}};
 const render=()=>{h.reset();return flatten(ui.AddRelativeScreen(props))};
 let nodes=render();button(nodes,'儿子').props.onPress();nodes=render();
 assert(text(nodes).includes('我和刘璐的儿子'));assert(!text(nodes).includes('关联已有家人'));assert(!text(nodes).includes('生日（可不填）'));
 let inputs=nodes.filter(n=>n.type==='TextInput');assert.equal(inputs.length,1);inputs[0].props.onChangeText('张亲然');nodes=render();
 const operation=button(nodes,'保存').props.onPress();nodes=render();assert.equal(button(nodes,'保存中').props.disabled,true);assert.equal(saved[0].name,'张亲然');assert.equal(saved[0].gender,'男');assert.equal(saved[1],'son');assert.equal(saved[2].parentSide,'father');
 await button(nodes,'保存中').props.onPress();assert.equal(calls,1);resolveSave();await operation;
 console.log('PASS name-only son flow, automatic parents, awaited save and duplicate tap protection');
 h.slots.length=0;props.anchor=members[1];props.onSave=async(...args)=>{saved=args;throw Error('写入失败')};nodes=render();button(nodes,'女儿').props.onPress();nodes=render();nodes.find(n=>n.type==='TextInput').props.onChangeText('女儿测试');nodes=render();await button(nodes,'保存').props.onPress();nodes=render();assert.equal(saved[2].parentSide,'mother');assert.equal(saved[0].gender,'女');assert(text(nodes).includes('写入失败'));assert.equal(nodes.find(n=>n.type==='TextInput').props.value,'女儿测试');
 const optionState=hooks(),optionReact={...optionState,createElement};
 const optionUi=moduleAt('src/FamilyPeopleScreens.js',optionReact,{'./familyEditing':domain,'./JiaIcon':()=>null});
 const complete={...members[0],fatherId:'dad',motherId:'mom'};
 optionState.reset();const optionNodes=flatten(optionUi.AddRelativeScreen({...props,anchor:complete,members:[complete,members[1],{id:'dad',name:'爸爸'},{id:'mom',name:'妈妈'}]}));
 assert(!optionNodes.some(n=>n.type==='TouchableOpacity'&&['父亲','母亲','配偶','续配 / 再婚'].includes(text(n))));
 assert(text(optionNodes).includes('我和刘璐的儿子'));assert(text(optionNodes).includes('父亲：爸爸'));assert(text(optionNodes).includes('母亲：妈妈'));
 console.log('PASS occupied relation choices hidden and initial selection remains valid');
 console.log('PASS maternal anchor, daughter gender and save failure preserves draft');
 const hp=hooks(),rp={...hp,createElement};const profile=moduleAt('src/FamilyPeopleScreens.js',rp,{'./familyEditing':domain,'./JiaIcon':()=>null});
 let deletes=0;const person={id:'child',name:'测试孩子',claimed:false};const profileProps={person,members:[...members,person],family:{members:[...members,person]},onDelete:async()=>{deletes++;throw Error('删除写入失败')}};
 const renderProfile=()=>{hp.reset();return flatten(profile.PersonProfileScreen(profileProps))};
 nodes=renderProfile();button(nodes,'删除人物').props.onPress();nodes=renderProfile();assert.equal(nodes.find(n=>n.type==='Modal').props.visible,true);assert.equal(deletes,0);button(nodes,'取消').props.onPress();nodes=renderProfile();assert.equal(nodes.find(n=>n.type==='Modal').props.visible,false);
 button(nodes,'删除人物').props.onPress();nodes=renderProfile();await button(nodes,'确认删除').props.onPress();nodes=renderProfile();assert(text(nodes).includes('删除写入失败'));assert.equal(nodes.find(n=>n.type==='Modal').props.visible,true);
 profileProps.onDelete=async()=>{deletes++};nodes=renderProfile();await button(nodes,'确认删除').props.onPress();nodes=renderProfile();assert.equal(nodes.find(n=>n.type==='Modal').props.visible,false);
 console.log('PASS web/native delete confirmation, cancel, failure and retry');
 const ha=hooks(),ra={...ha,createElement};let state={activeFamilyId:'test',families:[{id:'test',name:'测试家',members:[...members,person],media:[{id:'photo',personIds:['child'],uri:'saved'}]}]};let resolveWrite,fail=false;const writes=[];
 const persistence={useSeparatedPersistence:()=>({pub:state,priv:{},ready:true,setPub(fn){state=fn(state)},savePublic:async fn=>{const next=fn(state);await new Promise((resolve,reject)=>{resolveWrite=()=>fail?reject(Error('storage failed')):resolve()});state=next;writes.push(JSON.parse(JSON.stringify(state)))}})};
 const app=moduleAt('src/IntegratedPhase1App.js',ra,{'./useSeparatedPersistence':persistence,'./FamilyPeopleScreens':{PersonProfileScreen:'PersonProfileScreen',AddRelativeScreen:'AddRelativeScreen',FamilyTreeScreen:'FamilyTreeScreen'},'./familyEditing':domain,'./Phase1StateModel':{assertPrivateIsolation(){},publicPersonAvatar:()=>null}}).default;
 const renderApp=()=>{ha.reset();return flatten(app())};renderApp();ha.slots[2]='person';ha.slots[3]=person;ha.slots[8].current='person';ha.slots[0]='child';
 nodes=renderApp();let profileNode=nodes.find(n=>n.type==='PersonProfileScreen');assert.equal(typeof profileNode.props.onDelete,'function');let deleting=profileNode.props.onDelete();assert(state.families[0].members.some(p=>p.id==='child'));assert.equal(ha.slots[2],'person');resolveWrite();await deleting;assert(!state.families[0].members.some(p=>p.id==='child'));assert.equal(ha.slots[2],'tree');assert.equal(ha.slots[0],'me');assert.equal(state.families[0].media[0].uri,'saved');
 console.log('PASS deletion wired to persisted family state, keeps photo and returns to tree after write');
 ha.slots[1]=members[0];ha.slots[2]='addRelative';ha.slots[8].current='addRelative';nodes=renderApp();const addNode=nodes.find(n=>n.type==='AddRelativeScreen');let adding=addNode.props.onSave({id:'new-son',name:'新儿子',claimed:false,gender:'男'},'son',{parentSide:'father'});assert.equal(ha.slots[2],'addRelative');resolveWrite();await adding;assert.equal(ha.slots[2],'person');assert.equal(ha.slots[3].motherId,'wife');assert.equal(ha.slots[3].id,'new-son');
 assert.equal(writes.at(-1).families[0].members.find(p=>p.id==='new-son').motherId,'wife');
 console.log('PASS successful add persists both parents before opening new profile');
 const links=[{id:'me',name:'我',spouseIds:['x'],fatherId:'x',siblingLinks:[{personId:'x'}],marriages:[{personId:'x',status:'married'}]},{id:'x',name:'亲人',claimed:false},{id:'child',motherId:'x',fatherId:'me'}];const detached=domain.removePerson(links,'x');assert.equal(detached.length,2);assert.equal(detached[0].fatherId,null);assert.equal(detached[0].spouseIds.length,0);assert.equal(detached[0].siblingLinks.length,0);assert.equal(detached[1].motherId,null);assert.equal(detached[1].fatherId,'me');assert.throws(()=>domain.removePerson(links,'me'));assert.throws(()=>domain.removePerson([{id:'claimed',claimed:true}],'claimed'));
 console.log('PASS delete detaches relations and preserves editing permissions');
}
main().catch(e=>{console.error(e);process.exitCode=1});
