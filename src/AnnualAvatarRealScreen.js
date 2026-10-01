import {theme} from './theme';

import React,{useMemo,useState} from "react";
import {ScrollView,View,Text,Image,TouchableOpacity,StyleSheet} from "react-native";
import {eligibleAnnualAvatarMedia} from "./avatarRules";
const C=theme;
export default function AnnualAvatarRealScreen({person,media,year=new Date().getFullYear(),onConfirm}){
 const list=useMemo(()=>eligibleAnnualAvatarMedia(person,media,year),[person,media,year]);
 const [selected,setSelected]=useState(list[0]?.id||null);
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>年度成长头像</Text>
  <Text style={s.sub}>从 {year} 年包含本人的公开照片中选择。只有本人确认才会更换。</Text>
  {!list.length?<View style={s.card}><Text style={s.h}>今年还没有可用候选照片</Text><Text style={s.sub}>先在家庭相册中确认“照片里有我”，之后这里才会出现。</Text></View>:
  <View style={s.grid}>{list.map(m=><TouchableOpacity key={m.id} onPress={()=>setSelected(m.id)} style={[s.item,selected===m.id&&s.sel]}><Image source={{uri:m.uri}} style={s.pic}/><Text style={s.check}>{selected===m.id?"✓ 已选择":"选择"}</Text></TouchableOpacity>)}</View>}
  {selected?<TouchableOpacity style={s.btn} onPress={()=>onConfirm?.({personId:person.id,mediaId:selected,year,confirmedAt:new Date().toISOString()})}><Text style={s.btnT}>✓ 本人确认使用这张</Text></TouchableOpacity>:null}
  <Text style={s.note}>🔒 私密空间照片不会出现在这里。历年已确认头像不会被删除。</Text>
 </ScrollView>
}
const s=StyleSheet.create({page:{padding:20,paddingBottom:100,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12},sub:{fontSize:13,color:C.muted,lineHeight:20,marginTop:6},
 card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:17,marginTop:15},h:{fontSize:17,fontWeight:"700",color:C.deep},grid:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:16},
 item:{width:"48%",borderWidth:2,borderColor:"transparent",borderRadius:14,padding:4},sel:{borderColor:C.brown},pic:{width:"100%",aspectRatio:1,borderRadius:10},check:{textAlign:"center",padding:7,color:C.deep},
 btn:{backgroundColor:C.brown,padding:15,borderRadius:15,alignItems:"center",marginTop:18},btnT:{color:"#fff",fontWeight:"700"},note:{fontSize:12,color:C.muted,lineHeight:19,marginTop:15}});
