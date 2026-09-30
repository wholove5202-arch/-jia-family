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
 const bottom=Math.max(0,...levels.values());
 const shown=members.filter(p=>all||levels.get(root(p.id))>=bottom-2),rows=[];
 for(let i=all?0:Math.max(0,bottom-2);i<=bottom;i++){const row=[];for(const [k,ps] of groups)if(levels.get(k)===i)row.push(...ps.filter(p=>shown.includes(p)));if(row.length)rows.push(row);}
 const width=Math.max(320,...rows.map(r=>r.length*104+32)),height=Math.max(220,rows.length*158+36),positions={};
 rows.forEach((row,i)=>row.forEach((p,j)=>positions[p.id]={x:(width-row.length*104)/2+j*104+52,y:i*158+36}));
 return {rows,width,height,positions,totalGenerations:bottom+1};
}
