// Only metadata changes here: keep the original recording, text and item identity.
export function updateFutureSettings(items,id,settings){
 if(!items.some(item=>item.id===id))throw new Error('这份内容已不存在，请返回列表刷新');
 const recipient=String(settings.recipient||'').trim(),openAt=String(settings.openAt||'').trim();
 if(openAt){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(openAt))throw new Error('请选择有效日期');
  const [year,month,day]=openAt.split('-').map(Number),date=new Date(year,month-1,day);
  if(date.getFullYear()!==year||date.getMonth()+1!==month||date.getDate()!==day)throw new Error('请选择有效日期');
 }
 return items.map(item=>item.id===id?{...item,recipient,openAt,updatedAt:new Date().toISOString()}:item);
}
