
export function makeChatMediaMessage(senderId,senderName,mediaIds){
 return {id:`msgm_${Date.now()}`,type:"media",senderId,senderName,mediaIds,
  archiveStatus:"pending_owner_decision",createdAt:new Date().toISOString()};
}
export function decideChatArchive(messages,messageId,archive){
 return messages.map(m=>m.id===messageId?{...m,archiveStatus:archive?"archive":"do_not_archive",decidedAt:new Date().toISOString()}:m);
}
export function archivedMediaIds(messages){
 return [...new Set(messages.filter(m=>m.type==="media"&&m.archiveStatus==="archive").flatMap(m=>m.mediaIds||[]))];
}
