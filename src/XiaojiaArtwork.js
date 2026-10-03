import React from 'react';
import {View,Image} from 'react-native';
// Render only the approved illustration areas; UI remains native and interactive.
export default function XiaojiaArtwork({kind='robot',width=48}){
 const rect=kind==='photo'?{x:45,y:161,w:435,h:204}:{x:378,y:811,w:88,h:95};
 const scale=width/rect.w;
 return <View pointerEvents="none" style={{width,height:rect.h*scale,overflow:'hidden',borderRadius:kind==='photo'?14:0}}><Image source={require('../assets/xiaojia-reference.png')} style={{position:'absolute',width:1536*scale,height:1024*scale,left:-rect.x*scale,top:-rect.y*scale}} resizeMode="stretch"/></View>
}
