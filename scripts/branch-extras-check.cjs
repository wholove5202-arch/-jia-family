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
 const h=hooks(),react={...h,createElement};native.Switch='Switch';
 const editing=moduleAt('src/familyEditing.js',react);
 const model=moduleAt('src/familyKinship.js',react,{'./familyEditing':editing,'./vendor/chineseKinship':require('../src/vendor/chineseKinship')});
 const members=[{id:'grandpa',name:'爷爷'},{id:'grandma',name:'奶奶'},{id:'dad',name:'爸爸',gender:'男',fatherId:'grandpa',motherId:'grandma'},{id:'mom',name:'妈妈',gender:'女'},{id:'me',name:'我',gender:'男',fatherId:'dad',motherId:'mom',spouseIds:['wife']},{id:'wife',name:'刘璐',gender:'女',spouseIds:['me']},{id:'sis',name:'姐姐',gender:'女',fatherId:'dad',motherId:'mom'},{id:'son',name:'刘子淮',gender:'男',fatherId:'me',motherId:'wife'},{id:'daughter',name:'刘子优',gender:'女',fatherId:'me',motherId:'wife'},{id:'niece',name:'张亲然',gender:'女',motherId:'sis'},{id:'unknown',name:'未知'}];
 for(const [a,b,want] of [['son','grandpa','曾祖父（太爷爷）'],['son','grandma','曾祖母（太奶奶）'],['grandpa','son','曾孙'],['grandma','daughter','曾孙女'],['me','grandpa','爷爷'],['son','sis','姑姑'],['son','wife','妈妈'],['sis','son','侄子'],['me','niece','外甥女'],['dad','son','孙子'],['wife','son','儿子'],['me','me','自己']])assert.equal(model.kinshipLabel(members,a,b),want);
 assert(model.kinshipLabel(members,'me','sis').includes('长幼待确认'));
 assert(model.kinshipLabel(members,'me','unknown').includes('无法确定'));
 assert(model.kinshipLabel(members.filter(p=>p.id!=='dad'),'son','grandpa').includes('无法确定'));
 assert(model.kinshipLabel([{id:'a',fatherId:'b'},{id:'b',fatherId:'a'},{id:'c'}],'a','c').includes('无法确定'));

 const extended=members.map(p=>({...p}));
 extended.find(p=>p.id==='son').birthday='2013-10-28';
 extended.find(p=>p.id==='niece').birthday='2015-02-28';
 extended.find(p=>p.id==='sis').spouseIds=['brotherInLaw'];
 extended.push({id:'brotherInLaw',gender:'男'}, {id:'brother',gender:'男',fatherId:'dad',motherId:'mom'}, {id:'cousin',gender:'男',fatherId:'brother',birthday:'2012-01-01'}, {id:'wifeDad',gender:'男'}, {id:'wifeMom',gender:'女'}, {id:'oldAncestor',gender:'男'});
 extended.find(p=>p.id==='wife').fatherId='wifeDad';extended.find(p=>p.id==='wife').motherId='wifeMom';
 extended.find(p=>p.id==='grandpa').fatherId='oldAncestor';
 for(const [a,b,want] of [['son','niece','表妹'],['niece','son','表哥'],['son','cousin','堂哥'],['me','wifeDad','岳父'],['wife','dad','公公'],['dad','wife','儿媳'],['son','brotherInLaw','姑丈'],['son','oldAncestor','高祖父']])assert.equal(model.kinshipLabel(extended,a,b),want);
 const missingAge=extended.map(p=>({...p,birthday:undefined}));
 assert.equal(model.kinshipLabel(missingAge,'son','niece'),'表姐妹（长幼待确认）');
 assert.equal(model.kinshipLabel(missingAge,'son','cousin'),'堂兄弟（长幼待确认）');
 const mixed=extended.map(p=>p.id==='niece'?{...p,lunarBirthday:false}:p);
 assert.equal(model.kinshipLabel(mixed,'son','niece'),'表姐妹（长幼待确认）');
 const renamed=extended.map(p=>({...p,id:'new-'+p.id,name:'家人',fatherId:p.fatherId&&'new-'+p.fatherId,motherId:p.motherId&&'new-'+p.motherId,spouseIds:(p.spouseIds||[]).map(id=>'new-'+id)}));
 assert.equal(model.kinshipLabel(renamed,'new-son','new-niece'),'表妹');
 assert.equal(model.kinshipPaths(extended,'son','niece').map(p=>p.join('的')).join(' / '),'爸爸的姐妹的女儿');
 const half=[{id:'m',gender:'女'},{id:'x',gender:'男',motherId:'m'},{id:'y',gender:'女',motherId:'m'},{id:'xc',gender:'男',fatherId:'x'},{id:'yc',gender:'女',motherId:'y'}];
 assert.equal(model.kinshipLabel(half,'xc','yc'),'表姐妹（长幼待确认）');
 const unknownSex=extended.map(p=>p.id==='niece'?{...p,gender:undefined}:p);
 assert.equal(model.kinshipLabel(unknownSex,'son','niece'),'表亲（性别、长幼待补充）');
 const family={id:'f1',name:'幸福家庭',members,notes:[{text:'秘密'}],media:[{uri:'SECRET'}]};
 assert.equal(model.branchSharingEnabled(family),true);
 const link={sourceFamilyId:'f1',targetFamilyId:'f2',status:'confirmed',sourceConfirmed:true,targetConfirmed:true,basicRelationshipsAllowed:true};
 assert.equal(model.canViewBranch(family,link),true);
 for(const patch of [{status:'pending'},{targetConfirmed:false},{sourceConfirmed:false},{basicRelationshipsAllowed:false},{sourceFamilyId:'other'}])assert.equal(model.canViewBranch(family,{...link,...patch}),false);
 assert.equal(model.canViewBranch({...family,branchSharing:{enabled:false}},link),false);
 const ui=moduleAt('src/FamilyTreeExtras.js',react,{'./JiaIcon':()=>null,'./familyKinship':model});
 let saved,fail=true;
 const settings=()=>{h.reset();return flatten(ui.FamilyBranchSettings({family,onSave:async value=>{if(fail)throw Error('disk full');saved=value}}))};
 let nodes=settings();assert.equal(nodes.find(n=>n.type==='Switch').props.value,true);
 nodes.find(n=>n.type==='Switch').props.onValueChange(false);nodes=settings();assert.equal(nodes.find(n=>n.type==='Switch').props.value,false);
 await nodes.find(n=>n.props.accessibilityLabel==='保存家庭分支设置').props.onPress();nodes=settings();assert(text(nodes).includes('保存失败'));assert.equal(saved,undefined);
 fail=false;await nodes.find(n=>n.props.accessibilityLabel==='保存家庭分支设置').props.onPress();assert.equal(saved.enabled,false);
 const h2=hooks(),r2={...h2,createElement};const ui2=moduleAt('src/FamilyTreeExtras.js',r2,{'./JiaIcon':()=>null,'./familyKinship':model});let settingsCount=0;
 const extras=()=>{h2.reset();return flatten(ui2.FamilyTreeExtras({family,onSettings:()=>settingsCount++}))};
 nodes=extras();assert(!text(nodes).includes('SECRET'));assert(!text(nodes).includes('秘密'));
 nodes.find(n=>n.props.accessibilityLabel==='选择称呼发起人').props.onPress();nodes=extras();nodes.find(n=>n.props.accessibilityLabel==='选择刘子淮').props.onPress();nodes=extras();
 nodes.find(n=>n.props.accessibilityLabel==='选择要称呼的家人').props.onPress();nodes=extras();nodes.find(n=>n.props.accessibilityLabel==='选择姐姐').props.onPress();nodes=extras();assert(text(nodes).includes('姑姑'));
 nodes.find(n=>n.props.accessibilityLabel==='交换两位家人').props.onPress();nodes=extras();assert(text(nodes).includes('侄子'));
 nodes.find(n=>n.props.accessibilityLabel==='选择称呼发起人').props.onPress();nodes=extras();nodes.find(n=>n.props.accessibilityLabel==='选择刘子淮').props.onPress();nodes=extras();
 nodes.find(n=>n.props.accessibilityLabel==='选择要称呼的家人').props.onPress();nodes=extras();nodes.find(n=>n.props.accessibilityLabel==='选择爷爷').props.onPress();nodes=extras();assert(text(nodes).includes('曾祖父（太爷爷）'));
 nodes.find(n=>n.props.accessibilityLabel==='交换两位家人').props.onPress();nodes=extras();assert(text(nodes).includes('曾孙'));
 nodes.find(n=>n.props.accessibilityLabel==='选择称呼发起人').props.onPress();nodes=extras();nodes.find(n=>n.props.accessibilityLabel==='选择刘子淮').props.onPress();nodes=extras();
 nodes.find(n=>n.props.accessibilityLabel==='选择要称呼的家人').props.onPress();nodes=extras();nodes.find(n=>n.props.accessibilityLabel==='选择张亲然').props.onPress();nodes=extras();assert(text(nodes).includes('表姐妹（长幼待确认）'));
 nodes.find(n=>n.props.accessibilityLabel==='交换两位家人').props.onPress();nodes=extras();assert(text(nodes).includes('表兄弟（长幼待确认）'));
 nodes.find(n=>n.props.accessibilityLabel==='设置家庭分支可见范围').props.onPress();assert.equal(settingsCount,1);
 console.log('PASS family-graph inference: paternal/maternal cousins, seniority, in-laws, deep ancestors, renamed identities, missing calendar/sex, half siblings, selectors and swap, uncertain relationship fallback, default-on preferences, denied unconfirmed/disabled grants, durable save failure/retry and private-content exclusion');
}
main().catch(e=>{console.error(e);process.exitCode=1});
