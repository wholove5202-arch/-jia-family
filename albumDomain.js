
export function indexMedia(items,members=[]){
 const people=Object.fromEntries(members.map(p=>[p.id,[]]));
 const events={}, years={}, recent=[...items].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
 for(const m of items.filter(x=>!x.private)){
   const y=(m.takenAt||m.createdAt||"未知").slice(0,4);
   (years[y]??=[]).push(m);
   (events[m.event||"未分类"]??=[]).push(m);
   for(const id of (m.personIds||[])) (people[id]??=[]).push(m);
 }
 return {all:items.filter(x=>!x.private),people,events,years,recent};
}
export function attachPeople(item,personIds){return {...item,personIds:[...new Set(personIds)]};}
export function attachEvent(item,event){return {...item,event:event?.trim()||"未分类"};}
