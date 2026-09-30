// Only repairs the known initial demo's missing ancestor edge. Never infers users' relatives by names.
export function migrateSeedAncestor(data){
 if(data.seedAncestorMigration===1)return data;
 return {...data,seedAncestorMigration:1,families:(data.families||[]).map(f=>{
  if(f.id!=='f1')return f;
  const father=f.members?.find(p=>p.id==='p1'),grandfather=f.members?.find(p=>p.id==='p5'),me=f.members?.find(p=>p.id==='me');
  const knownDemo=grandfather?.isDemo||(grandfather?.name==='爷爷'&&grandfather?.relation==='爷爷'&&!grandfather?.claimed);
  if(!father||!grandfather||!knownDemo||grandfather.ownerId||father.fatherId||me?.fatherId!=='p1')return f;
  return {...f,members:f.members.map(p=>p.id==='p1'?{...p,fatherId:'p5'}:p)};
 })};
}
