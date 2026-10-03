const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
let slots=[],cursor=0,effects=[];
const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),useState:init=>{const i=cursor++;if(!(i in slots))slots[i]=typeof init==='function'?init():init;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v}]},useRef:init=>{const i=cursor++;if(!(i in slots))slots[i]={current:init};return slots[i]},useEffect:fn=>{const i=cursor++;if(!(i in slots)){slots[i]=true;effects.push(fn)}}};
const storage={getItem:async()=>null,setItem:async()=>{throw Error('disk full')}};
const out={};vm.runInNewContext(babel.transformSync(fs.readFileSync('src/XiaojiaChatScreen.js','utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code,{exports:out,require:n=>n==='react'?React:n==='react-native'?{View:'View',Text:'Text',TextInput:'Input',TouchableOpacity:'Button',ScrollView:'Scroll',StyleSheet:{create:x=>x}}:n==='@react-native-async-storage/async-storage'?storage:n==='./lifeInterview'?{interviewQuestions:[{id:'q',text:'童年问题',options:[['yes','是'],['no','不是']]}]}:{default:()=>null}});
const walk=n=>n&&typeof n==='object'?[n,...(n.props?.children||[]).flat(Infinity).flatMap(walk)]:[];
let tree;function render(){cursor=0;tree=out.default({family:{members:[]},bottomInset:72});return walk(tree)}
const get=label=>render().find(n=>n.props?.accessibilityLabel===label);
(async()=>{
 render();effects.splice(0).forEach(f=>f());await Promise.resolve();await Promise.resolve();
 assert.ok(walk(render().find(n=>n.type==='Scroll')).some(n=>n.props?.accessibilityLabel==='小家介绍'),'Introduction must scroll with the conversation');
 get('给小家的消息').props.onFocus();assert.ok(!get('小家介绍'),'Typing must remove the large introduction');
 get('给小家的消息').props.onChangeText('我的童年');assert.equal(get('发送给小家').props.disabled,false);
 get('给小家的消息').props.onBlur();assert.ok(!get('小家介绍'),'Draft must retain the conversation layout after keyboard dismissal');
 await get('发送给小家').props.onPress();assert.equal(get('给小家的消息').props.value,'我的童年','Failed save must retain draft');assert.ok(render().some(n=>n.props?.accessibilityRole==='alert'));
 console.log('PASS scrollable introduction, focused conversation space, send availability and failed-save draft retention');
})().catch(e=>{console.error(e);process.exitCode=1});
