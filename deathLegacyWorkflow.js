
export function startDeathConfirmation(personId,initiatorId){
 return {id:`dc_${Date.now()}`,personId,initiatorId,status:"pending",
  confirmations:[],objections:[],audit:[{action:"started",actorId:initiatorId,at:new Date().toISOString()}]};
}
export function confirm(caseData,actorId,{adult=true,eligible=true}={}){
 if(!caseData||caseData.status==="confirmed"||!actorId||!adult||!eligible||actorId===caseData.initiatorId||caseData.confirmations.includes(actorId)||caseData.objections.includes(actorId)) return caseData;
 if(caseData.status==="disputed") return caseData;
 const confirmations=[...caseData.confirmations,actorId];
 const done=confirmations.length>=2;
 return {...caseData,confirmations,status:done?"confirmed":"pending",
  audit:[...caseData.audit,{action:"confirmed",actorId,at:new Date().toISOString()}]};
}
export function object(caseData,actorId){
 if(!caseData||!actorId||caseData.status==="confirmed") return caseData;
 return {...caseData,status:"disputed",objections:[...new Set([...caseData.objections,actorId])],
  audit:[...caseData.audit,{action:"objected",actorId,at:new Date().toISOString()}]};
}
export function resolveLegacyAccess(settings,deathCase,viewerId,now=new Date()){
 if(!settings?.enabled||deathCase?.status!=="confirmed") return [];
 return (settings.grants||[]).filter(g=>{
   if(!(g.recipientIds||[]).includes(viewerId)) return false;
   if(g.releaseMode==="after_death_confirmation") return true;
   if(g.releaseMode==="date_after_death"&&g.releaseAt) return now>=new Date(g.releaseAt);
   return false;
 });
}
