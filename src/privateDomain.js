
export const PRIVATE_NAMESPACE="jia_private_v1";
export function privateRecord(ownerId,type,payload){
 return {id:`priv_${Date.now()}`,ownerId,type,payload,aiAllowed:false,createdAt:new Date().toISOString()};
}
export function assertNeverAI(record){
 if(record?.aiAllowed!==false) throw new Error("Private-space records must never enter AI.");
 return true;
}
export function legacyGrant(contentId,recipientIds,releaseMode,releaseAt=null){
 return {id:`grant_${Date.now()}`,contentId,recipientIds:[...new Set(recipientIds)],releaseMode,releaseAt};
}
