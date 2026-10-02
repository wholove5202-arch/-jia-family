// Catch advancing before a durable save or dropping a selection after failure.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
const questions=[{id:'q1',version:1,topic:'童年',text:'童年问题',options:[['yes','是'],['no','不是'],['skip','暂时不答']]},{id:'q2',version:1,topic:'经历',text:'经历问题',options:[['yes','是']]}];
let slots=[],cursor=0;
const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),useState:initial=>{const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v}]},useRef:initial=>{const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i]}};
const out={};
vm.runInNewContext(babel.transformSync(fs.readFileSync('src/LifeInterviewScreen.js','utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code,{exports:out,require:name=>name==='react'?React:name==='react-native'?{View:'View',Text:'Text',TouchableOpacity:'Button',ScrollView:'Scroll',StyleSheet:{create:x=>x}}:name==='./lifeInterview'?{interviewQuestions:questions}:name==='./theme'?{theme:{}}:{default:()=>null}});
const walk=n=>n&&typeof n==='object'?[n,...(n.props?.children||[]).flat(Infinity).flatMap(walk)]:[];
let pending,fail=false;
const props={record:{answers:{}},onSave:()=>new Promise((resolve,reject)=>{pending=()=>fail?reject(Error('disk')):resolve()})};
const render=()=>{cursor=0;return walk(out.default(props))};
const button=(label)=>{const found=render().find(n=>n.props?.accessibilityLabel===label);assert.ok(found,'missing '+label);return found};
(async()=>{
 button('答案：是').props.onPress();
 let saving=button('保存并继续').props.onPress();
 assert.ok(render().some(n=>n.props?.children?.includes('童年问题')),'must stay on the question until saved');
 fail=true;pending();await saving;
 assert.ok(render().some(n=>n.props?.accessibilityRole==='alert'));
 assert.equal(button('答案：是').props.accessibilityState.selected,true);
 fail=false;saving=button('保存并继续').props.onPress();pending();await saving;
 assert.ok(render().some(n=>n.props?.children?.includes('经历问题')),'move to next question after saving');
 console.log('PASS screen selection, awaited save, visible failure, retained answer and next question');
})().catch(e=>{console.error(e);process.exitCode=1});
