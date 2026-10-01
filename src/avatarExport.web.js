export async function exportAvatar(uri,crop){
 const image=await new Promise((resolve,reject)=>{const image=new window.Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('照片无法读取，请重新选择'));image.src=uri;});
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const ratio=512/crop.size,context=canvas.getContext('2d');
 context.fillStyle='#FFFFFF';context.fillRect(0,0,512,512);
 context.translate((crop.size/2+crop.x)*ratio,(crop.size/2+crop.y)*ratio);
 context.rotate((crop.angle||0)*Math.PI/180);
 context.drawImage(image,-crop.w*ratio/2,-crop.h*ratio/2,crop.w*ratio,crop.h*ratio);
 return {avatarUri:canvas.toDataURL('image/jpeg',.88),avatarCrop:null};
}
