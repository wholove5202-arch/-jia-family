import {currentSpouseIds} from './familyEditing';
import relationship from './vendor/chineseKinship';

function familySex(members){
 const roles=new Map();
 for(const p of members)for(const [key,sex] of [['fatherId','男'],['motherId','女']]){
  if(p[key]){const values=roles.get(p[key])||new Set();values.add(sex);roles.set(p[key],values);}
 }
 return p=>{
  if(p.gender==='男'||p.gender==='女')return p.gender;
  const values=roles.get(p.id);if(values?.size===1)return [...values][0];
  if(/^(姐姐|妹妹|姐妹|母亲|妈妈|女儿|妻子|奶奶|外婆)$/.test(p.relation||''))return '女';
  if(/^(兄弟|哥哥|弟弟|父亲|爸爸|儿子|丈夫|爷爷|外公)$/.test(p.relation||''))return '男';
  return null;
 };
}

function birthOrder(a,b){
 // Unlike calendars or incomplete birth dates cannot establish seniority.
 if((a.lunarBirthday!==false)!==(b.lunarBirthday!==false))return 0;
 const valid=p=>/^\d{4}-\d{2}-\d{2}$/.test(p.birthday||'')&&Number(p.birthday.slice(0,4))>1800&&Number(p.birthday.slice(5,7))>=1&&Number(p.birthday.slice(5,7))<=12&&Number(p.birthday.slice(8,10))>=1&&Number(p.birthday.slice(8,10))<=31;
 if(!valid(a)||!valid(b)||a.birthday===b.birthday)return 0;
 return b.birthday<a.birthday?-1:1;
}

// Bidirectional graph restricted to the selected family. Names do not create
// relationships. Shared parents and explicit sibling links create sibling edges.
export function kinshipPaths(members,fromId,toId){
 const byId=new Map(members.map(p=>[p.id,p]));
 if(!byId.has(fromId)||!byId.has(toId))return [];
 if(fromId===toId)return [[]];
 const sex=familySex(members),graph=new Map(members.map(p=>[p.id,[]]));
 const add=(from,to,label)=>{if(from===to||!graph.has(from)||!graph.has(to))return;const edges=graph.get(from);if(!edges.some(e=>e.id===to&&e.label===label))edges.push({id:to,label});};
 const gendered=(p,m,f,u)=>sex(p)==='男'?m:sex(p)==='女'?f:u;
 for(const p of members){
  for(const [key,label] of [['fatherId','爸爸'],['motherId','妈妈']]){
   add(p.id,p[key],label);add(p[key],p.id,gendered(p,'儿子','女儿','子女'));
  }
  for(const id of currentSpouseIds(p))if(byId.has(id)){
   add(p.id,id,gendered(byId.get(id),'丈夫','妻子','配偶'));
   add(id,p.id,gendered(p,'丈夫','妻子','配偶'));
  }
 }
 for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++){
  const a=members[i],b=members[j];
  const shared=(a.fatherId&&a.fatherId===b.fatherId&&byId.has(a.fatherId))||(a.motherId&&a.motherId===b.motherId&&byId.has(a.motherId));
  const linked=(a.siblingLinks||[]).some(l=>l.personId===b.id)||(b.siblingLinks||[]).some(l=>l.personId===a.id);
  if(!shared&&!linked)continue;
  const label=(x,y)=>{const order=birthOrder(x,y);return gendered(y,order<0?'哥哥':order>0?'弟弟':'兄弟',order<0?'姐姐':order>0?'妹妹':'姐妹','兄弟姐妹');};
  add(a.id,b.id,label(a,b));add(b.id,a.id,label(b,a));
 }
 const distance=new Map([[fromId,0]]),previous=new Map(),queue=[fromId];
 for(let i=0;i<queue.length;i++){
  const id=queue[i],depth=distance.get(id);if(depth>=12)continue;
  for(const edge of graph.get(id)){
   if(!distance.has(edge.id)){distance.set(edge.id,depth+1);queue.push(edge.id);}
   if(distance.get(edge.id)===depth+1){const entries=previous.get(edge.id)||[];entries.push({from:id,label:edge.label});previous.set(edge.id,entries);}
  }
 }
 const paths=[];
 function collect(id,path){if(paths.length>=32)return;if(id===fromId){paths.push(path);return;}for(const edge of previous.get(id)||[])collect(edge.from,[edge.label,...path]);}
 if(distance.has(toId))collect(toId,[]);
 return paths;
}

function displayTerms(terms,a,b,sex){
 const aliases={姑妈:'姑姑',曾祖父:'曾祖父（太爷爷）',曾祖母:'曾祖母（太奶奶）'};
 let names=[...new Set(terms.filter(x=>x!=='自己').map(x=>aliases[x]||x.replace(/^(姑表|舅表|姨表|姨)(哥|弟|姐|妹)$/,'表$2')))];
 // Cousin seniority depends on these two people, not their parents' ages.
 const order=birthOrder(a,b);
 if(order)names=names.filter(x=>!(/^(堂|表)?(哥|弟|姐|妹)(哥|弟|姐|妹)?$/.test(x))||(order<0?/[哥姐]/.test(x):/[弟妹]/.test(x)));
 const has=(...xs)=>xs.every(x=>names.includes(x));
 const generic=has('哥哥','弟弟')?'兄弟':has('姐姐','妹妹')?'姐妹':has('堂哥','堂弟')?'堂兄弟':has('堂姐','堂妹')?'堂姐妹':has('表哥','表弟')?'表兄弟':has('表姐','表妹')?'表姐妹':null;
 if(generic&&names.length===2)return `${generic}（长幼待确认）`;
 if(has('伯父','叔叔')&&names.length===2)return '伯伯或叔叔（长幼待确认）';
 if(!sex&&names.some(x=>/^(堂|表)[哥弟姐妹]$/.test(x)))return `${names.every(x=>x.startsWith('堂'))?'堂亲':'表亲'}（性别、长幼待补充）`;
 return names.join(' / ');
}

export function kinshipLabel(members,fromId,toId){
 const a=members.find(p=>p.id===fromId),b=members.find(p=>p.id===toId);
 if(!a||!b)return '请选两位家人';if(fromId===toId)return '自己';
 const paths=kinshipPaths(members,fromId,toId);
 if(!paths.length)return '暂时无法确定称呼，可在个人页面核对关系';
 const sex=familySex(members),terms=new Set();
 for(const path of paths)for(const name of relationship({text:path.join('的'),sex:sex(a)==='男'?1:sex(a)==='女'?0:-1}))terms.add(name);
 const label=displayTerms([...terms],a,b,sex(b));
 // An uncommon or incompletely specified relationship still has a known path.
 return label||paths[0].join('的');
}

// An enabled preference is not an access grant. Missing confirmations deny access.
export function branchSharingEnabled(family){return family?.branchSharing?.enabled!==false;}
export function canViewBranch(family,link){
 return branchSharingEnabled(family)&&link?.status==='confirmed'&&link?.sourceConfirmed===true&&link?.targetConfirmed===true&&link?.sourceFamilyId===family?.id&&link?.targetFamilyId!==family?.id&&Boolean(link?.targetFamilyId)&&link?.basicRelationshipsAllowed===true;
}
