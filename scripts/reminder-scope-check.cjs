// Catch tree cropping accidentally excluding parents' reminders, or collateral
// grandchildren being enabled by default; saved overrides must survive reload.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
function load(path,mocks={}){const out={};vm.runInNewContext(babel.transformSync(fs.readFileSync(path,'utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code,{exports:out,require:n=>mocks[n]||{}});return out;}
const people=[{id:'gp',name:'父母'},{id:'me',name:'本人',fatherId:'gp'},{id:'wife',name:'配偶',spouseIds:['me']},{id:'daughter',name:'女儿',motherId:'me'},{id:'husband',name:'女婿',spouseIds:['daughter']},{id:'grand',name:'外孙女',motherId:'daughter'},{id:'bro',name:'兄弟',fatherId:'gp'},{id:'nephew',name:'侄子',fatherId:'bro'},{id:'grandNephew',name:'兄弟孙辈',fatherId:'nephew'},{id:'hf',name:'女婿父亲'}].map(p=>p.id==='husband'?{...p,fatherId:'hf'}:p);
const scope=load('src/reminderScope.js',{'./treeLayout':load('src/treeLayout.js')});
const ids=list=>Array.from(list).map(p=>p.id).sort();
assert.deepEqual(ids(scope.reminderMembers(people,'me')),['daughter','gp','grand','husband','me','wife']);
assert.deepEqual(ids(scope.reminderMembers(people,'me',{bro:true,grandNephew:true,hf:true})),['bro','daughter','gp','grand','grandNephew','husband','me','wife']);
assert.deepEqual(ids(scope.reminderMembers(people,'me',{gp:false})),['daughter','grand','husband','me','wife']);
assert.equal(scope.reminderMembers([], 'me').length,0);
console.log('PASS reminder scope preserves direct four generations, treats daughters equally, defaults collateral off, respects individual choices and excludes in-law families');
let cursor=0;const slots=[],react={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){const n=cursor++;if(!(n in slots))slots[n]=typeof initial==='function'?initial():initial;return [slots[n],v=>slots[n]=typeof v==='function'?v(slots[n]):v]},useRef:v=>({current:v}),useEffect(){}};
const native={StyleSheet:{create:x=>x},Platform:{OS:'web'}};for(const n of ['View','Text','TextInput','TouchableOpacity','ScrollView','Switch','KeyboardAvoidingView','Image'])native[n]=n;
const ui=load('src/ImportantDaysScreen.js',{'react':react,'react-native':native,'./reminderScope':scope,'./treeLayout':load('src/treeLayout.js'),'./birthdayReminder':{nextBirthday:()=>null}});
function flatten(n){return Array.isArray(n)?n.flatMap(flatten):n&&typeof n==='object'?[n,...flatten(n.children||[])]:[]}
function text(n){return Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.children):n==null?'':String(n)}
async function checkScreen(){
 const family={members:people},before=JSON.stringify(people);let fail=false,saved;
 const render=()=>{cursor=0;return flatten(ui.default({family,onSaveReminderPreferences:async prefs=>{if(fail)throw Error('disk failure');saved=JSON.parse(JSON.stringify(prefs));family.dayReminderPreferences={me:saved}},onPerson(){}}))};
 let nodes=render();assert(!nodes.some(n=>n.type==='Text'&&text(n)==='兄弟的生日'),'collateral birthdays must default off in the real screen');
 const settings=nodes.find(n=>n.props.accessibilityLabel==='设置亲人提醒范围');assert(settings,'reminder settings must be available');settings.props.onPress();nodes=render();let toggle=nodes.find(n=>n.props.accessibilityLabel==='提醒兄弟的重要日子');assert.equal(toggle.props.value,false);
 fail=true;await toggle.props.onValueChange(true);nodes=render();assert(nodes.some(n=>n.props.accessibilityRole==='alert'));assert(!saved);assert.equal(nodes.find(n=>n.props.accessibilityLabel==='提醒兄弟的重要日子').props.value,false);
 fail=false;await nodes.find(n=>n.props.accessibilityLabel==='提醒兄弟的重要日子').props.onValueChange(true);nodes=render();assert.equal(saved.bro,true);assert(nodes.some(n=>n.type==='Text'&&text(n)==='兄弟的生日'));
 slots.length=0;nodes=render();assert(nodes.some(n=>n.type==='Text'&&text(n)==='兄弟的生日'),'saved preference survives remount');assert.equal(JSON.stringify(people),before);
 console.log('PASS real important-days filtering, durable preference save, failed-save retry and remount without modifying people');
}
checkScreen().catch(e=>{console.error(e);process.exitCode=1});
