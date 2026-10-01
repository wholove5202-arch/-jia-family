import {completeCoupleParents} from './familyEditing';

// Repair unambiguous couple parentage and the known demo ancestor edge; never match relatives by names.
export function migrateSeedAncestor(data){
 if(data.seedAncestorMigration===1&&data.coupleParentMigration===1&&data.defaultFamilyNameMigration===1)return data;
 return {...data,seedAncestorMigration:1,coupleParentMigration:1,defaultFamilyNameMigration:1,families:(data.families||[]).map(f=>{
  if(data.defaultFamilyNameMigration!==1&&f.id==='f1'&&f.name==='我们的家')f={...f,name:'幸福家庭'};
  if(data.coupleParentMigration!==1)f={...f,members:completeCoupleParents(f.members||[])};
  if(data.seedAncestorMigration===1||f.id!=='f1')return f;
  const father=f.members?.find(p=>p.id==='p1'),grandfather=f.members?.find(p=>p.id==='p5'),me=f.members?.find(p=>p.id==='me');
  const knownDemo=grandfather?.isDemo||(grandfather?.name==='爷爷'&&grandfather?.relation==='爷爷'&&!grandfather?.claimed);
  if(!father||!grandfather||!knownDemo||grandfather.ownerId||father.fatherId||me?.fatherId!=='p1')return f;
  return {...f,members:f.members.map(p=>p.id==='p1'?{...p,fatherId:'p5'}:p)};
 })};
}
