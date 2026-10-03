import React from 'react';
import {Image,Platform} from 'react-native';
import glyphs from './ChatGlyphs';
export default function ChatIcon({name,size=26,color='#191919'}){
 const glyph=glyphs[name]||glyphs.plus;
 const uri=Platform.OS==='web'?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(glyph.svg.replace(/#000/g,color)):glyph.png;
 return <Image accessible={false} pointerEvents="none" source={{uri}} resizeMode="contain" style={{width:size,height:size,...(Platform.OS==='web'?{}:{tintColor:color})}}/>;
}
