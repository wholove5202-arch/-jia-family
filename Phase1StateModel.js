
export const defaultPublicState={
 schemaVersion:4,activeFamilyId:"f1",families:[],avatarHistory:[],deathCases:[]
};
export const defaultPrivateState={
 schemaVersion:1,aiAllowed:false,privateNotes:[],missYou:[],legacyGrants:[],privateMedia:[]
};
export function appendAvatarHistory(pub,entry){
 return {...pub,avatarHistory:[...(pub.avatarHistory||[]),entry]};
}
export function publicPersonAvatar(pub,personId){
 return [...(pub.avatarHistory||[])].filter(x=>x.personId===personId).sort((a,b)=>(b.year||0)-(a.year||0))[0]||null;
}
export function assertPrivateIsolation(priv){
 if(priv.aiAllowed!==false) throw new Error("PRIVATE namespace must never allow AI");
 return true;
}
