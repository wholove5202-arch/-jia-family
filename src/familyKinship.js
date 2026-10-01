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
