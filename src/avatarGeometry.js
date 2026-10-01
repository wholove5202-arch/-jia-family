export function cropGeometry(width,height,zoom=1,x=0,y=0,size=280,angle=0,freePosition=false){
 const radians=angle*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
 // Cover the whole square even after rotation; the visible avatar circle is inside it.
 const required=size*(Math.abs(c)+Math.abs(s)),z=Math.max(1,Math.min(6,zoom));
 const factor=Math.max(required/width,required/height)*z,w=width*factor,h=height*factor;
 const tx=Math.max(-(w-required)/2,Math.min((w-required)/2,x*c+y*s)),ty=Math.max(-(h-required)/2,Math.min((h-required)/2,-x*s+y*c));
 const dx=freePosition?Math.max(-(w+size)/2+size*.15,Math.min((w+size)/2-size*.15,x)):tx*c-ty*s,dy=freePosition?Math.max(-(h+size)/2+size*.15,Math.min((h+size)/2-size*.15,y)):tx*s+ty*c;
 return {w,h,left:(size-w)/2+dx,top:(size-h)/2+dy,x:dx,y:dy,zoom:z,width,height,size,angle};
}
