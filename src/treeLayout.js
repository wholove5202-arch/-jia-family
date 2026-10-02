// Generations come from parent links; current spouses share a generation.
export function layoutFamily(members,all=false){
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
 const shown=members.filter(p=>all||levels.get(root(p.id))>=bottom-2),rows=[];
 for(let i=all?0:Math.max(0,bottom-2);i<=bottom;i++){const row=[];for(const [k,ps] of groups)if(levels.get(k)===i)row.push(...ps.filter(p=>shown.includes(p)));if(row.length)rows.push(row);}
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
 return {rows,width,height,positions,totalGenerations:bottom+1};
}
