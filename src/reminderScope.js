import {familyTreeMembers} from './treeLayout';

export function defaultReminderIds(members,focusId='me'){
 const focus=members.find(p=>p.id===focusId)||members.find(p=>p.relation==='本人')||members[0];
 if(!focus)return new Set();
 const children=id=>members.filter(p=>p.fatherId===id||p.motherId===id);
 const descendants=children(focus.id).flatMap(p=>[p,...children(p.id)]);
 const own=new Set([focus.id,focus.fatherId,focus.motherId,...descendants.map(p=>p.id)].filter(Boolean));
 // Include partners and confirmed co-parents, without opening their ancestry.
 for(const p of descendants)for(const id of [p.fatherId,p.motherId])if(id)own.add(id);
 const base=new Set(own);
 for(const p of members){if(base.has(p.id))for(const id of p.spouseIds||[])own.add(id);else if((p.spouseIds||[]).some(id=>base.has(id)))own.add(p.id);}
 return own;
}

export function reminderMembers(members,focusId='me',preferences={}){
 const defaults=defaultReminderIds(members,focusId);
 return familyTreeMembers(members,focusId).filter(p=>Object.prototype.hasOwnProperty.call(preferences,p.id)?preferences[p.id]===true:defaults.has(p.id));
}
