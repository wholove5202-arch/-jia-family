import {theme} from './theme';

import React,{useState} from "react";
import {ScrollView,View,Text,Image,TouchableOpacity,StyleSheet} from "react-native";
const C=theme;
export default function MediaPeopleTagger({media,members,onSave}){
 const [ids,setIds]=useState(media?.personIds||[]);
 const toggle=id=>setIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 if(!media)return null;
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>照片里有谁？</Text>
  <Text style={s.sub}>由家人确认人物。确认后会用于人物分类和年度头像候选，不让AI替你决定家庭事实。</Text>
  {media.type==="image"?<Image source={{uri:media.uri}} style={s.photo}/>:<View style={s.video}><Text>▶ 视频</Text></View>}
  <View style={s.card}>{members.map(p=><TouchableOpacity key={p.id} style={s.person} onPress={()=>toggle(p.id)}>
   <Text>{ids.includes(p.id)?"✓ ":"○ "}{p.name}{p.dead?" 🕯":""}</Text><Text style={s.muted}>{p.relation||""}</Text></TouchableOpacity>)}</View>
  <TouchableOpacity style={s.btn} onPress={()=>onSave?.({...media,personIds:ids,peopleConfirmed:true,peopleConfirmedAt:new Date().toISOString()})}><Text style={s.btnT}>保存人物标记</Text></TouchableOpacity>
 </ScrollView>
}
const s=StyleSheet.create({page:{padding:20,paddingBottom:100,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12},sub:{fontSize:13,color:C.muted,lineHeight:20,marginVertical:8},
 photo:{width:"100%",aspectRatio:1,borderRadius:20,marginVertical:12},video:{height:220,borderRadius:20,backgroundColor:"#E9DED1",alignItems:"center",justifyContent:"center",marginVertical:12},
 card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,paddingHorizontal:15},person:{paddingVertical:14,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:"row",justifyContent:"space-between"},
 muted:{fontSize:12,color:C.muted},btn:{backgroundColor:C.brown,padding:15,borderRadius:15,alignItems:"center",marginTop:16},btnT:{color:"#fff",fontWeight:"700"}});
