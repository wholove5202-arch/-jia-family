export function normalizePersonDate(value){const text=String(value||'').trim();return /^(不知道|未知|不详|暂不填写|未填写|无)$/.test(text)?'':text;}
export function personDateDays(year,month,lunar=false){return lunar?30:new Date(year,month,0).getDate();}
export function validPersonDate(value,lunar=false){
 const text=normalizePersonDate(value);if(!text)return true;
 const parts=text.split('-').map(Number),year=parts[0];if(!/^\d{4}(-\d{2}-\d{2})?$/.test(text)||year<1||year>new Date().getFullYear())return false;
 if(parts.length===1)return true;
 const [,month,day]=parts;if(month<1||month>12||day<1||day>personDateDays(year,month,lunar))return false;
 return lunar||text<=new Date().toISOString().slice(0,10);
}
