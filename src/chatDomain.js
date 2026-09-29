
export function textMessage(senderId,text){
 return {id:`msg_${Date.now()}`,type:"text",senderId,text:text.trim(),createdAt:new Date().toISOString()};
}
export function mediaMessage(senderId,mediaIds){
 return {id:`msg_${Date.now()}`,type:"media",senderId,mediaIds,archiveStatus:"pending_owner_decision",createdAt:new Date().toISOString()};
}
export function decideArchive(message,decision){
 return {...message,archiveStatus:decision?"archive":"do_not_archive"};
}
