
export function setParents(members,personId,{fatherId=null,motherId=null}){
  return members.map(p=>p.id===personId?{...p,fatherId,motherId}:p);
}
export function addSpouse(members,a,b){
  return members.map(p=>{
    if(p.id===a) return {...p,spouseIds:[...new Set([...(p.spouseIds||[]),b])]};
    if(p.id===b) return {...p,spouseIds:[...new Set([...(p.spouseIds||[]),a])]};
    return p;
  });
}
export function siblingsOf(members,id){
  const me=members.find(x=>x.id===id); if(!me) return [];
  return members.filter(x=>x.id!==id && (
    (me.fatherId && x.fatherId===me.fatherId) ||
    (me.motherId && x.motherId===me.motherId)
  ));
}
export function relationshipWarnings(members){
  const warnings=[];
  for(const p of members){
    if(p.fatherId===p.id||p.motherId===p.id) warnings.push(`${p.name}不能成为自己的父母`);
    if(p.fatherId && p.motherId && p.fatherId===p.motherId) warnings.push(`${p.name}的父母记录冲突`);
  }
  return warnings;
}
