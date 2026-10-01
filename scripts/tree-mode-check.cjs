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
 const h=hooks(),react={...h,createElement};let handlers;
 native.PanResponder={create:config=>{handlers=config;return {panHandlers:{onMoveShouldSetResponder:config.onMoveShouldSetPanResponder,onResponderMove:config.onPanResponderMove}}}};
 const layout=moduleAt('src/treeLayout.js',react);
 const editing=moduleAt('src/familyEditing.js',react);
 const rowHooks=hooks(),rowReact={...rowHooks,createElement};
 const row=moduleAt('src/FamilyMemberRow.js',rowReact);
 const ui=moduleAt('src/FamilyPeopleScreens.js',react,{'./treeLayout':layout,'./JiaIcon':()=>null,'./familyEditing':editing,'./FamilyMemberRow':{__esModule:true,default:props=>{rowHooks.reset();return row.default(props)}}});
 const family={name:'测试家',members:[{id:'dad',name:'爸爸'},{id:'mom',name:'妈妈'},{id:'me',name:'我',fatherId:'dad',motherId:'mom'}]};
 let switchCalls=[],failSwitch=false;const other={id:'f2',name:'我的小家庭',members:[]};family.id='f1'; const render=()=>{h.reset();return flatten(ui.FamilyTreeScreen({family,families:[family,other],onSelectFamily:async id=>{switchCalls.push(id);if(failSwitch)throw Error('failed')},onPerson(){}}))};
 const canvas=nodes=>nodes.find(n=>n.props.testID==='family-tree-canvas');
 let nodes=render();
 assert(!nodes.some(n=>n.props.accessibilityLabel==='居中家族树'));
 let viewport=nodes.find(n=>n.props.testID==='family-tree-viewport');
 assert(!viewport.props.onResponderMove);
 const gesture={dx:40,dy:30,numberActiveTouches:1},event={nativeEvent:{touches:[{pageX:0,pageY:0}]}};
 assert.equal(handlers.onMoveShouldSetPanResponder(event,gesture),false);
 handlers.onPanResponderMove(event,gesture);assert.equal(h.slots[3].x,0);
 h.slots[2]=4;h.slots[3]={x:90,y:70};nodes=render();let transform=canvas(nodes).props.style.transform;
 assert.equal(transform[0].translateX,0);assert.equal(transform[1].translateY,0);
 const lockedScale=transform[2].scale;h.slots[2]=2;nodes=render();assert.equal(canvas(nodes).props.style.transform[2].scale,lockedScale);
 viewport=nodes.find(n=>n.props.testID==='family-tree-viewport');viewport.props.onLayout({nativeEvent:{layout:{width:390,height:510}}});nodes=render();
 const style=canvas(nodes).props.style;assert.equal(style.left,(390-style.width)/2);assert.equal(style.top,(510-style.height)/2);
 console.log('PASS three generations stay centered, ignore stale pan/zoom and expose no gesture handlers or controls');
 nodes.find(n=>n.props.accessibilityLabel==='全部树状图').props.onPress();nodes=render();
 assert(nodes.some(n=>n.props.accessibilityLabel==='居中家族树'));assert(nodes.find(n=>n.props.testID==='family-tree-viewport').props.onResponderMove);
 assert.equal(handlers.onMoveShouldSetPanResponder(event,gesture),true);
 handlers.onPanResponderGrant(event);handlers.onPanResponderMove(event,gesture);nodes=render();
 assert.equal(canvas(nodes).props.style.transform[0].translateX,40);
 nodes.find(n=>n.props.accessibilityLabel==='放大家族树').props.onPress();assert.equal(h.slots[2],1.25);nodes=render();
 nodes.find(n=>n.props.accessibilityLabel==='居中家族树').props.onPress();nodes=render();assert.equal(h.slots[2],1);assert.equal(h.slots[3].x,0);
 const pinch={nativeEvent:{touches:[{pageX:0,pageY:0},{pageX:100,pageY:0}]}};handlers.onPanResponderGrant(pinch);handlers.onPanResponderMove({nativeEvent:{touches:[{pageX:0,pageY:0},{pageX:200,pageY:0}]}},{numberActiveTouches:2});assert.equal(h.slots[2],2);
 console.log('PASS full tree retains drag, pinch, zoom buttons and recenter');
 nodes=render();nodes.find(n=>n.props.accessibilityLabel==='三代').props.onPress();nodes=render();
 assert(!nodes.some(n=>n.props.accessibilityLabel==='居中家族树'));
 assert.equal(handlers.onMoveShouldSetPanResponder(event,gesture),false);handlers.onPanResponderMove(event,gesture);assert.equal(h.slots[3].x,0);
 nodes.find(n=>n.props.accessibilityLabel==='亲人列表').props.onPress();nodes=render();assert(!canvas(nodes));assert(!nodes.some(n=>n.props.accessibilityLabel==='居中家族树'));
 console.log('PASS returning to three generations locks gestures and list remains unaffected');
 nodes.find(n=>n.props.accessibilityLabel==='搜索家人').props.onPress();nodes=render();const input=nodes.find(n=>n.props.accessibilityLabel==='搜索家人姓名或称呼');assert(input);input.props.onChangeText('爸爸');nodes=render();assert(nodes.some(n=>n.props.accessibilityLabel==='查看爸爸'));assert(!nodes.some(n=>n.props.accessibilityLabel==='查看妈妈'));
 nodes.find(n=>n.props.accessibilityLabel==='三代').props.onPress();nodes=render();assert(!nodes.some(n=>n.props.accessibilityLabel==='搜索家人'));assert(canvas(nodes));
 await nodes.find(n=>n.props.accessibilityLabel==='切换到我的小家庭').props.onPress();assert.deepEqual(switchCalls,['f2']);nodes=render();
 failSwitch=true;await nodes.find(n=>n.props.accessibilityLabel==='切换到我的小家庭').props.onPress();nodes=render();assert(nodes.some(n=>text(n)==='切换失败，请再试一次'));failSwitch=false;await nodes.find(n=>n.props.accessibilityLabel==='切换到我的小家庭').props.onPress();assert.equal(switchCalls.length,3);
 console.log('PASS direct family switch awaits save, permits retry and search is confined to relative list');
}
main().catch(e=>{console.error(e);process.exitCode=1});

