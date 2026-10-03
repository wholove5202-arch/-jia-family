import React from 'react';
import {View,Image} from 'react-native';
export default function XiaojiaArtwork({width=48,variant='full'}){
 if(variant==='avatar'){
  const scale=width/820;
  return <View pointerEvents="none" style={{width,height:width,alignItems:'center',justifyContent:'center'}}><View style={{width,height:620*scale,overflow:'hidden'}}><Image source={require('../assets/xiaojia-robot.png')} style={{position:'absolute',width:1254*scale,height:1254*scale,left:-215*scale,top:-65*scale}} resizeMode="stretch"/></View></View>
 }
 return <View pointerEvents="none" style={{width,height:width}}><Image source={require('../assets/xiaojia-robot.png')} style={{width,height:width}} resizeMode="contain"/></View>
}
