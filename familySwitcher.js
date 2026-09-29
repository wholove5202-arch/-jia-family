
export function createLocalFamily(name,ownerId){
 return {id:`fam_${Date.now()}`,name:name.trim(),ownerId,members:[],media:[],chat:[],notes:[],createdAt:new Date().toISOString()};
}
export function switchFamily(state,familyId){
 if(!(state.families||[]).some(f=>f.id===familyId)) throw new Error("家庭不存在");
 return {...state,activeFamilyId:familyId};
}
export function activeFamily(state){return (state.families||[]).find(f=>f.id===state.activeFamilyId)||null;}
