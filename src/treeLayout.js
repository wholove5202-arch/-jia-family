// Expand the focal family's ancestry and descendants, then include their
// partners as leaves. Never recurse upward through an added partner.
export function familyTreeMembers(members,focusId='me'){
 const byId=new Map(members.map(p=>[p.id,p]));
 const focus=byId.get(focusId)||members.find(p=>p.relation==='本人')||members[0];
 if(!focus)return [];
 const ancestors=new Set(),visitParents=id=>{
  if(!byId.has(id)||ancestors.has(id))return;
  ancestors.add(id);const p=byId.get(id);
  for(const pid of [p.fatherId,p.motherId])visitParents(pid);
 };
 visitParents(focus.id);
 const blood=new Set(),queue=[...ancestors];
 for(let i=0;i<queue.length;i++){
  const id=queue[i];if(!byId.has(id)||blood.has(id))continue;blood.add(id);
  const p=byId.get(id);
  queue.push(...(p.siblingLinks||[]).map(l=>l.personId));
  for(const q of members)if(q.fatherId===id||q.motherId===id||(q.siblingLinks||[]).some(l=>l.personId===id))queue.push(q.id);
 }
 const visible=new Set(blood);
 for(const p of members){
  if(blood.has(p.id)){
   for(const id of [...(p.spouseIds||[]),p.fatherId,p.motherId])if(byId.has(id))visible.add(id);
  }else if((p.spouseIds||[]).some(id=>blood.has(id)))visible.add(p.id);
 }
 return members.filter(p=>visible.has(p.id));
}

// Generations come from parent links; current spouses share a generation.
export function layoutFamily(members,all=false,options={}){
 const ids=new Set(members.map(p=>p.id)),parent=new Map(members.map(p=>[p.id,p.id]));
 const root=id=>{while(parent.get(id)!==id)id=parent.get(id);return id;};
 for(const p of members)for(const sid of [...(p.spouseIds||[]),...(p.siblingLinks||[]).map(l=>l.personId)])if(ids.has(sid)){const a=root(p.id),b=root(sid);if(a!==b)parent.set(b,a);}
 for(const p of members)if(ids.has(p.fatherId)&&ids.has(p.motherId)){const a=root(p.fatherId),b=root(p.motherId);if(a!==b)parent.set(b,a);}
 const groups=new Map();for(const p of members){const k=root(p.id);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p);}
 const levels=new Map(),visiting=new Set();
 function level(k){if(levels.has(k))return levels.get(k);if(visiting.has(k))return 0;visiting.add(k);let n=0;for(const p of groups.get(k)||[])for(const id of [p.fatherId,p.motherId])if(ids.has(id)&&root(id)!==k)n=Math.max(n,level(root(id))+1);visiting.delete(k);levels.set(k,n);return n;}
 for(const k of groups.keys())level(k);
 // Missing ancestors do not make somebody an older generation. Align parents
 // upward from their children's generation, then enforce downward ancestry.
 // The original levels give a bounded topological order (no iterative drift).
 const order=[...groups.keys()].sort((a,b)=>levels.get(b)-levels.get(a));
 for(const k of order)for(const p of groups.get(k))for(const id of [p.fatherId,p.motherId])if(ids.has(id)&&root(id)!==k){const pk=root(id);levels.set(pk,Math.max(levels.get(pk),levels.get(k)-1));}
 for(const k of order.slice().reverse())for(const p of groups.get(k))for(const id of [p.fatherId,p.motherId])if(ids.has(id)&&root(id)!==k)levels.set(k,Math.max(levels.get(k),levels.get(root(id))+1));
 const bottom=Math.max(0,...levels.values());
 const focus=members.find(p=>p.id===options.focusId),extra=new Set();
 const children=id=>members.filter(p=>p.fatherId===id||p.motherId===id);
 const grandchildren=id=>children(id).flatMap(p=>children(p.id));
 const hasGrandchildren=!!focus&&grandchildren(focus.id).length>0;
 const focalLevel=focus?levels.get(root(focus.id)):0;
 const minLevel=focus?Math.max(0,focalLevel-(hasGrandchildren?0:1)):Math.max(0,bottom-2);
 const maxLevel=focus?focalLevel+(hasGrandchildren?2:1):bottom;
 const includePerson=id=>{if(!ids.has(id))return;extra.add(id);const p=members.find(p=>p.id===id);for(const sid of p.spouseIds||[])if(ids.has(sid))extra.add(sid);for(const q of members)if((q.spouseIds||[]).includes(id))extra.add(q.id);};
 if(focus&&options.showParents)for(const id of [focus.fatherId,focus.motherId])if(ids.has(id))extra.add(id);
 if(focus)for(const id of options.expandedIds||[])if(ids.has(id)&&levels.get(root(id))===focalLevel)for(const p of grandchildren(id))includePerson(p.id);
 const shown=members.filter(p=>all||extra.has(p.id)||(levels.get(root(p.id))>=minLevel&&levels.get(root(p.id))<=maxLevel)),rows=[];
 const shownLevels=shown.map(p=>levels.get(root(p.id)));
 for(let i=Math.min(...shownLevels);i<=Math.max(...shownLevels);i++){const row=[];for(const [k,ps] of groups)if(levels.get(k)===i)row.push(...ps.filter(p=>shown.includes(p)));if(row.length)rows.push(row);}
 // Keep a parent between two partners, so each child's couple connector
 // does not run through the other partner's avatar.
 const partners=new Map(members.map(p=>[p.id,new Set()]));
 const pair=(a,b)=>{if(ids.has(a)&&ids.has(b)){partners.get(a).add(b);partners.get(b).add(a)}};
 for(const p of members){for(const id of p.spouseIds||[])pair(p.id,id);if(p.fatherId&&p.motherId)pair(p.fatherId,p.motherId)}
 for(const row of rows){
  const placed=new Set(),ordered=[];
  const place=p=>{if(!p||placed.has(p.id))return;placed.add(p.id);ordered.push(p);};
  for(const p of row){
   if(placed.has(p.id))continue;
   const mates=row.filter(q=>partners.get(p.id).has(q.id));
   if(mates.length===2){place(mates[0]);place(p);place(mates[1]);}
   else {place(p);for(const mate of mates)place(mate);}
  }
  row.splice(0,row.length,...ordered);
 }
 const width=Math.max(320,...rows.map(r=>r.length*112+32)),height=Math.max(220,(rows.length-1)*166+152),positions={};
 rows.forEach((row,i)=>row.forEach((p,j)=>positions[p.id]={x:(width-row.length*112)/2+j*112+56,y:i*166+20}));
 const expandablePeers=focus?members.filter(p=>p.id!==focus.id&&levels.get(root(p.id))===focalLevel&&grandchildren(p.id).some(q=>!shown.includes(q))):[];
 const hiddenParents=focus?[focus.fatherId,focus.motherId].filter(id=>ids.has(id)&&!shown.some(p=>p.id===id)):[];
 return {rows,width,height,positions,totalGenerations:bottom+1,hasGrandchildren,expandablePeers,hiddenParents};
}
