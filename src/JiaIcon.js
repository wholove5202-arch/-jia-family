import React from 'react';
import {View} from 'react-native';

// Native geometry keeps the same line icons on iOS, Android and web.
export default function JiaIcon({name,size=24,color='#965331'}){
 const scale=size/24;
 const line=(x,y,w,h,extra={})=><View key={`${x}-${y}-${w}-${h}`} style={{position:'absolute',left:x*scale,top:y*scale,width:w*scale,height:h*scale,backgroundColor:color,borderRadius:scale,...extra}}/>;
 const box=(x,y,w,h,r=3,extra={})=><View key={`b${x}-${y}-${w}-${h}`} style={{position:'absolute',left:x*scale,top:y*scale,width:w*scale,height:h*scale,borderWidth:1.7*scale,borderColor:color,borderRadius:r*scale,...extra}}/>;
 const circle=(x,y,d,filled=false)=>filled?line(x,y,d,d,{borderRadius:d*scale/2}):box(x,y,d,d,d/2);
 let shapes;
 switch(name){
 case 'calendar':shapes=[box(2,4,20,18),line(2,9,20,1.6),line(7,1,1.6,6),line(16,1,1.6,6),circle(6,13,3,true),circle(12,13,3,true),circle(6,18,3,true)];break;
 case 'tree':shapes=[box(9,1,6,6,2),line(11.2,7,1.6,5),line(4,11,16,1.6),line(4,11,1.6,5),line(18.4,11,1.6,5),box(1,16,8,7,2),box(15,16,8,7,2)];break;
 case 'album':shapes=[box(2,3,20,18),circle(6,7,4),line(5,15,8,1.8,{transform:[{rotate:'-40deg'}]}),line(11,14,8,1.8,{transform:[{rotate:'40deg'}]})];break;
 case 'notes':shapes=[box(4,2,16,20),line(7,7,10,1.6),line(7,11,10,1.6),line(7,15,7,1.6)];break;
 case 'chat':shapes=[box(2,3,20,15,5),line(5,17,1.8,5,{transform:[{rotate:'25deg'}]}),line(6,20,5,1.8,{transform:[{rotate:'-30deg'}]}),circle(6,9,2,true),circle(11,9,2,true),circle(16,9,2,true)];break;
 case 'lock':shapes=[box(6,1,12,12,6),box(3,10,18,13,3,{backgroundColor:'#FBF4E9'}),circle(10.4,14,3.2,true),line(11.3,17,1.5,3)];break;
 case 'letter':shapes=[box(2,5,20,15,3),line(3.5,7,10,1.7,{transform:[{rotate:'35deg'}]}),line(10.5,12,10,1.7,{transform:[{rotate:'-35deg'}]}),circle(17,2,5,true)];break;
 case 'privateAlbum':shapes=[box(2,5,16,15,3),circle(5,8,3),line(4,15,7,1.7,{transform:[{rotate:'-38deg'}]}),box(13,12,9,10,3,{backgroundColor:'#FBF4E9'}),box(15,9,5,7,3)];break;
 case 'remember':shapes=[circle(8,2,8),box(3,12,18,10,7),circle(18,2,4,true),line(19.2,0,1.5,8)];break;
 case 'shieldLock':shapes=[box(5,2,14,18,6),box(8,10,8,9,2,{backgroundColor:'#FBF4E9'}),box(10,7,4,6,2),circle(11,13,2,true)];break;
 case 'memorial':shapes=[box(6,10,12,12,2),line(11.2,6,1.6,4),circle(9,1,6),line(3,22,18,1.6)];break;
 case 'scan':shapes=[line(2,2,6,1.7),line(2,2,1.7,6),line(16,2,6,1.7),line(20.3,2,1.7,6),line(2,20.3,6,1.7),line(2,16,1.7,6),line(16,20.3,6,1.7),line(20.3,16,1.7,6),box(6,6,12,12,2),line(1,11.2,22,1.6)];break;
 case 'film':shapes=[box(2,3,20,18,3),line(7,3,1.6,18),line(15.4,3,1.6,18),line(2,8,5,1.6),line(2,15,5,1.6),line(17,8,5,1.6),line(17,15,5,1.6)];break;
 case 'home':shapes=[line(1,6,13,1.8,{transform:[{rotate:'-40deg'}]}),line(10,6,13,1.8,{transform:[{rotate:'40deg'}]}),box(4,10,16,12,2),box(10,15,4,7,1)];break;
 case 'person':shapes=[circle(8,2,8),box(3,13,18,10,7)];break;
 case 'bell':shapes=[box(5,4,14,15,7),line(3,18,18,1.7),circle(10,21,4,true),line(11.2,1,1.6,3)];break;
 case 'plus':shapes=[line(11,3,2,18),line(3,11,18,2)];break;
 case 'edit':shapes=[box(9,1,6,18,1,{transform:[{rotate:'40deg'}]}),line(4,21,17,1.7)];break;
 case 'delete':shapes=[box(6,7,12,15,2),line(4,5,16,1.8),line(9,2,6,1.8),line(9,10,1.6,8),line(14,10,1.6,8)];break;
 case 'download':shapes=[line(11,2,2,13),line(7,10,8,1.8,{transform:[{rotate:'45deg'}]}),line(11,10,8,1.8,{transform:[{rotate:'-45deg'}]}),line(4,20,16,1.8)];break;
 case 'share':shapes=[box(4,9,16,13,3),line(11,2,2,13),line(7,5,7,1.8,{transform:[{rotate:'-45deg'}]}),line(11,5,7,1.8,{transform:[{rotate:'45deg'}]})];break;
 case 'back':shapes=[line(5,7,10,1.8,{transform:[{rotate:'-45deg'}]}),line(5,14,10,1.8,{transform:[{rotate:'45deg'}]})];break;
 default:shapes=[circle(3,3,18),circle(10,10,4,true)];
 }
 return <View pointerEvents="none" accessible={false} style={{width:size,height:size}}>{shapes}</View>;
}
