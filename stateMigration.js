
export const CURRENT_SCHEMA=3;
export function migrateState(raw){
 let s=raw&&typeof raw==="object"?{...raw}:{};
 const v=s.schemaVersion||1;
 if(v<2){
   s.families=s.families||[];
   s.activeFamilyId=s.activeFamilyId||s.families?.[0]?.id||null;
 }
 if(v<3){
   s.deathCases=s.deathCases||[];
   s.avatarHistory=s.avatarHistory||[];
   s.legacyGrants=s.legacyGrants||[];
 }
 s.schemaVersion=CURRENT_SCHEMA;
 return s;
}
export function validateState(s){
 const errors=[];
 if(!Array.isArray(s.families)) errors.push("families must be an array");
 if(s.activeFamilyId && !s.families.some(f=>f.id===s.activeFamilyId)) errors.push("activeFamilyId not found");
 return {ok:errors.length===0,errors};
}
