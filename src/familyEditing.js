export function mayEditPerson(person,actorId='me'){
 return person?.id===actorId||person?.claimed===false||person?.isDemo===true;
}
export function validateBirthday(value){
 if(!value)return true;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00Z');
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value&&value<=new Date().toISOString().slice(0,10);
}
export function validateParents(members,id,fatherId,motherId){
 if(fatherId&&fatherId===motherId)throw new Error('父亲和母亲不能是同一个人');
 const known=new Set(members.map(p=>p.id));
 for(const parent of [fatherId,motherId].filter(Boolean)){
  if(!known.has(parent))throw new Error('请从当前家庭选择父母');
  const seen=new Set(),stack=[parent];
  while(stack.length){const pid=stack.pop();if(pid===id)throw new Error('这个关系会形成循环，请重新选择');if(seen.has(pid))continue;seen.add(pid);const p=members.find(x=>x.id===pid);if(p)stack.push(...[p.fatherId,p.motherId].filter(Boolean));}
 }
}
export function addRelative(members,anchorId,relation,record,{half=false,parentSide='father',priorStatus='divorced'}={}){
 const anchor=members.find(p=>p.id===anchorId);
 if(!anchor)throw new Error('请先选择要添加关系的家人');
 if(!record?.id||!record.name?.trim())throw new Error('请填写姓名');
 if(record.id===anchorId)throw new Error('不能给自己添加与自己的关系');
 let next=members.map(p=>({...p}));
 if(!next.some(p=>p.id===record.id))next.push({...record,name:record.name.trim(),claimed:false});
 const a=next.find(p=>p.id===anchorId),b=next.find(p=>p.id===record.id);
 const assign=(p,field,value)=>{if(p[field]&&p[field]!==value)throw new Error('已有不同的父母资料，请到编辑关系中确认修改');p[field]=value;};
 if(relation==='father'||relation==='mother'){const key=relation==='father'?'fatherId':'motherId';assign(a,key,b.id);for(const l of a.siblingLinks||[]){if(l.kind==='full'||l.kind===relation){const sibling=next.find(p=>p.id===l.personId);if(sibling)assign(sibling,key,b.id);}}}
 else if(relation==='spouse'||relation==='remarry'){
  if([a.fatherId,a.motherId].includes(b.id)||[b.fatherId,b.motherId].includes(a.id))throw new Error('父母或子女不能添加为配偶');
  if(relation==='spouse'&&(a.spouseIds||[]).some(id=>id!==b.id))throw new Error('已有配偶，请选择续配 / 再婚');
  if((b.spouseIds||[]).some(id=>id!==a.id))throw new Error('对方已有配偶，请先确认其婚姻状态');
  if(relation==='remarry'){for(const id of a.spouseIds||[]){const old=next.find(p=>p.id===id);if(priorStatus==='widowed'&&!old?.dead)throw new Error('配偶尚未标记已故，请先确认状态');if(old){old.spouseIds=(old.spouseIds||[]).filter(id=>id!==a.id);old.marriages=[...(old.marriages||[]).filter(m=>m.personId!==a.id),{personId:a.id,status:priorStatus}];}a.marriages=[...(a.marriages||[]).filter(m=>m.personId!==id),{personId:id,status:priorStatus}];}a.spouseIds=[];}
  a.marriages=[...(a.marriages||[]).filter(m=>m.personId!==b.id),{personId:b.id,status:'married'}];b.marriages=[...(b.marriages||[]).filter(m=>m.personId!==a.id),{personId:a.id,status:'married'}];
  a.spouseIds=[...new Set([...(a.spouseIds||[]),b.id])];b.spouseIds=[...new Set([...(b.spouseIds||[]),a.id])];
 }else if(relation==='son'||relation==='daughter')assign(b,parentSide==='mother'?'motherId':'fatherId',a.id);
 else if(['sibling','brother','sister'].includes(relation)){
  const kind=half?parentSide:'full';a.siblingLinks=[...(a.siblingLinks||[]).filter(l=>l.personId!==b.id),{personId:b.id,kind}];b.siblingLinks=[...(b.siblingLinks||[]).filter(l=>l.personId!==a.id),{personId:a.id,kind}];
  if(half){const key=parentSide==='mother'?'motherId':'fatherId';if(!a[key])throw new Error('请先补充共同父亲或母亲');assign(b,key,a[key]);}
  else {if(a.fatherId)assign(b,'fatherId',a.fatherId);if(a.motherId)assign(b,'motherId',a.motherId);}
 }else throw new Error('请选择家庭关系');
 for(const p of next)validateParents(next,p.id,p.fatherId,p.motherId);
 return next;
}
export function treeRows(members,focusId='me'){
 const focus=members.find(p=>p.id===focusId)||members[0];if(!focus)return [];
 const byId=Object.fromEntries(members.map(p=>[p.id,p]));
 const unique=ids=>[...new Set(ids.filter(Boolean))].map(id=>byId[id]).filter(Boolean);
 const parents=unique([focus.fatherId,focus.motherId]);
 const siblings=members.filter(p=>p.id!==focus.id&&((focus.fatherId&&p.fatherId===focus.fatherId)||(focus.motherId&&p.motherId===focus.motherId)));
 const middle=unique([focus.id,...(focus.spouseIds||[]),...siblings.map(p=>p.id)]);
 const children=members.filter(p=>p.fatherId===focus.id||p.motherId===focus.id);
 const grandparents=unique(parents.flatMap(p=>[p.fatherId,p.motherId]));
 return !children.length&&grandparents.length?[grandparents,parents,middle]:[parents,middle,children];
}

export function endMarriage(members,aId,bId,status='divorced'){
 return members.map(p=>[aId,bId].includes(p.id)?{...p,spouseIds:(p.spouseIds||[]).filter(id=>id!==(p.id===aId?bId:aId)),marriages:[...(p.marriages||[]).filter(m=>m.personId!==(p.id===aId?bId:aId)),{personId:p.id===aId?bId:aId,status}]}:p);
}

// Removing a profile only detaches links. Shared photographs and other people's records remain.
export function removePerson(members,id){
 const person=members.find(p=>p.id===id);
 if(!person||id==='me'||!mayEditPerson(person))throw new Error('这个人物不能由你删除');
 return members.filter(p=>p.id!==id).map(p=>({...p,fatherId:p.fatherId===id?null:p.fatherId,motherId:p.motherId===id?null:p.motherId,spouseIds:(p.spouseIds||[]).filter(x=>x!==id),siblingLinks:(p.siblingLinks||[]).filter(x=>x.personId!==id),marriages:(p.marriages||[]).filter(x=>x.personId!==id)}));
}
