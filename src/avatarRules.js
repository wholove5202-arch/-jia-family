
export function eligibleAnnualAvatarMedia(person,media,year){
 return media.filter(m=>!m.private && (m.personIds||[]).includes(person.id) &&
   String(m.takenAt||m.createdAt||"").startsWith(String(year)));
}
export function proposeAnnualAvatar(person,media,year){
 const list=eligibleAnnualAvatarMedia(person,media,year);
 if(!list.length) return null;
 return {id:`av_${Date.now()}`,personId:person.id,year,mediaId:list[0].id,status:"pending_owner_confirmation"};
}
export function acceptAnnualAvatar(proposal,actorId,history=[]){
 if(proposal.personId!==actorId) throw new Error("年度头像必须由本人确认");
 return {proposal:{...proposal,status:"confirmed",confirmedAt:new Date().toISOString()},
 history:[...history,{personId:proposal.personId,year:proposal.year,mediaId:proposal.mediaId,confirmedAt:new Date().toISOString()}]};
}
