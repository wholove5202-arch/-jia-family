
export const newFamily=(name,ownerId)=>({
 id:`f_${Date.now()}`,name:name.trim(),ownerId,memberIds:[ownerId],
 createdAt:new Date().toISOString()
});

export const addPerson=(family,person)=>({
 ...family,
 members:[...(family.members||[]),{
   id:person.id||`p_${Date.now()}`,
   name:person.name.trim(),
   relation:person.relation.trim(),
   fatherId:person.fatherId||null,
   motherId:person.motherId||null,
   spouseIds:person.spouseIds||[],
   childIds:person.childIds||[],
   dead:!!person.dead,
   claimed:!!person.claimed
 }]
});

// Basic deterministic relationship inference.
// Manual parent IDs remain source of truth, allowing half-siblings / blended families.
export function inferRelations(members){
 const byId=Object.fromEntries(members.map(p=>[p.id,p]));
 return members.map(p=>({
   ...p,
   father:p.fatherId?byId[p.fatherId]?.name:null,
   mother:p.motherId?byId[p.motherId]?.name:null,
   spouses:(p.spouseIds||[]).map(id=>byId[id]?.name).filter(Boolean),
   children:(p.childIds||[]).map(id=>byId[id]?.name).filter(Boolean)
 }));
}
