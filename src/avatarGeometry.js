export function cropGeometry(width,height,zoom=1,x=0,y=0,size=280){
 const factor=Math.max(size/width,size/height)*Math.max(1,Math.min(4,zoom));
 const w=width*factor,h=height*factor;
 const dx=Math.max(-(w-size)/2,Math.min((w-size)/2,x)),dy=Math.max(-(h-size)/2,Math.min((h-size)/2,y));
 return {w,h,left:(size-w)/2+dx,top:(size-h)/2+dy,x:dx,y:dy,zoom:Math.max(1,Math.min(4,zoom)),width,height,size};
}
