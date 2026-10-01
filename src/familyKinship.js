import {currentSpouseIds} from './familyEditing';

// Use only relationships within the currently visible family. Never search other families.
export function kinshipLabel(members,fromId,toId){
 const byId=new Map(members.map(p=>[p.id,p])),a=byId.get(fromId),b=byId.get(toId);
 if(!a||!b)return '请选两位家人';
 if(a.id===b.id)return '自己';
 const sex=p=>p.gender==='男'?'男':p.gender==='女'?'女':/^(姐姐|妹妹|姐妹|母亲|妈妈|女儿|妻子|奶奶|外婆)$/.test(p.relation||'')?'女':/^(兄弟|哥哥|弟弟|父亲|爸爸|儿子|丈夫|爷爷|外公)$/.test(p.relation||'')?'男':null;
 const pair=(male,female,unknown)=>sex(b)==='男'?male:sex(b)==='女'?female:unknown;
 const parents=p=>[p?.fatherId,p?.motherId].filter(Boolean);
 const siblings=(x,y)=>x&&y&&x.id!==y.id&&(parents(x).some(id=>parents(y).includes(id))||(x.siblingLinks||[]).some(l=>l.personId===y.id)||(y.siblingLinks||[]).some(l=>l.personId===x.id));
 if(a.fatherId===b.id)return '爸爸';if(a.motherId===b.id)return '妈妈';
 if(currentSpouseIds(a).includes(b.id)||currentSpouseIds(b).includes(a.id))return pair('丈夫','妻子','配偶');
 if(parents(b).includes(a.id))return pair('儿子','女儿','子女');
 if(siblings(a,b))return pair('兄弟（长幼待确认）','姐妹（长幼待确认）','兄弟姐妹');
 const father=byId.get(a.fatherId),mother=byId.get(a.motherId);
 if(father?.fatherId===b.id)return '爷爷';if(father?.motherId===b.id)return '奶奶';
 if(mother?.fatherId===b.id)return '外公';if(mother?.motherId===b.id)return '外婆';
 // Follow parent IDs from the selected person; names such as “爷爷” belong to
 // the original person's viewpoint and must not be reused as kinship labels.
 const thirdGenerationPath=(person,targetId,path=[],seen=new Set())=>{
  if(!person||seen.has(person.id))return null;
  if(path.length===3)return person.id===targetId?path:null;
  const visited=new Set([...seen,person.id]);
  for(const key of ['fatherId','motherId']){
   const found=thirdGenerationPath(byId.get(person[key]),targetId,[...path,key],visited);
   if(found)return found;
  }
  return null;
 };
 const ancestorPath=thirdGenerationPath(a,b.id);
 if(ancestorPath){
  const male=ancestorPath[2]==='fatherId';
  if(ancestorPath[0]==='fatherId'&&ancestorPath[1]==='fatherId')return male?'曾祖父（太爷爷）':'曾祖母（太奶奶）';
  const first=ancestorPath[0]==='fatherId'?'爸爸':'妈妈';
  const grand=ancestorPath[1]==='fatherId'?(male?'爷爷':'奶奶'):(male?'外公':'外婆');
  return `${male?'曾祖父':'曾祖母'}（${first}的${grand}）`;
 }
 if(thirdGenerationPath(b,a.id))return pair('曾孙','曾孙女','曾孙辈');
 if(siblings(father,b))return pair('伯伯或叔叔（长幼待确认）','姑姑','爸爸的兄弟姐妹');
 if(siblings(mother,b))return pair('舅舅','姨妈','妈妈的兄弟姐妹');
 for(const parentId of parents(b))if(siblings(a,byId.get(parentId))){const parent=byId.get(parentId);return parent.id===b.motherId?pair('外甥','外甥女','外甥或外甥女'):pair('侄子','侄女','侄子或侄女');}
 for(const child of members.filter(p=>parents(p).includes(a.id)))if(parents(b).includes(child.id))return b.fatherId===child.id?pair('孙子','孙女','孙辈'):pair('外孙','外孙女','孙辈');
 return '暂时无法确定称呼，可在个人页面核对关系';
}

// An enabled preference is not an access grant. Missing confirmations always deny access.
export function branchSharingEnabled(family){return family?.branchSharing?.enabled!==false;}
export function canViewBranch(family,link){
 return branchSharingEnabled(family)&&link?.status==='confirmed'&&link?.sourceConfirmed===true&&link?.targetConfirmed===true&&link?.sourceFamilyId===family?.id&&link?.targetFamilyId!==family?.id&&Boolean(link?.targetFamilyId)&&link?.basicRelationshipsAllowed===true;
}
