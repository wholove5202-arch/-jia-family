import React from 'react';
import {View,Image} from 'react-native';
export default function XiaojiaArtwork({width=48}){
 return <View pointerEvents="none" style={{width,height:width}}><Image source={require('../assets/xiaojia-robot.png')} style={{width,height:width}} resizeMode="contain"/></View>
}
