const DAY=86400000;
export function nextBirthday(person,now=new Date()){
 const match=/^\d{4}-(\d{2})-(\d{2})$/.exec(person.birthday||'');if(!match)return null;
 const month=+match[1],day=+match[2];if(month<1||month>12||day<1||day>31)return null;
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),start=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
 if(person.lunarBirthday!==false){
  try{
   const fmt=new Intl.DateTimeFormat('en-u-ca-chinese',{month:'numeric',day:'numeric',timeZone:'UTC'});
   if(fmt.resolvedOptions().calendar!=='chinese')return null;
   for(let days=0;days<800;days++){const candidate=new Date(start+days*DAY),parts=fmt.formatToParts(candidate),m=parts.find(p=>p.type==='month')?.value,d=parts.find(p=>p.type==='day')?.value;
    if(m===String(month)&&Number(d)===day)return {days,date:candidate.toISOString().slice(0,10)};
   }
  }catch{return null;}return null;
 }
 for(let year=today.getFullYear();year<=today.getFullYear()+8;year++){
  const candidate=new Date(Date.UTC(year,month-1,day));if(candidate.getUTCMonth()!==month-1||candidate.getUTCDate()!==day)continue;
  const days=(candidate.getTime()-start)/DAY;if(days>=0)return {days,date:candidate.toISOString().slice(0,10)};
 }return null;
}
export function birthdayCountdown(person,now=new Date()){
 if(person.dead)return '';const next=nextBirthday(person,now);
 return next?(next.days===0?'今天生日':'距生日还有 '+next.days+' 天'):/^\d{4}-\d{2}-\d{2}$/.test(person.birthday||'')?'暂无法计算生日倒计时':'填写完整生日后显示倒计时';
}
