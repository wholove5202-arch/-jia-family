
import React from "react";
import {ScrollView,Text,TouchableOpacity,StyleSheet,Alert} from "react-native";
import {pickImagesAndVideos} from "./mediaPicker";
const C={bg:"#FBF4E9",card:"#FFFAF2",brown:"#965331",deep:"#5D321F",muted:"#8F7B6E",line:"#EADBC8"};
export default function UploadScreen({onAdd,onOldPhoto,onNote}){
 async function pick(mode="manual"){
  const r=await pickImagesAndVideos();
  if(r.permissionDenied){Alert.alert("需要照片权限","允许访问照片后才能选择家庭照片/视频。");return}
  if(!r.assets.length)return;
  const now=new Date().toISOString();
  onAdd?.(r.assets.map((a,i)=>({id:`m_${Date.now()}_${i}`,uri:a.uri,type:a.type||"image",width:a.width,height:a.height,
   fileName:a.fileName||"",createdAt:now,takenAt:now,event:"未分类",personIds:[],private:false,source:"device_picker",aiMode:mode==="ai"})));
 }
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>记录家庭的美好瞬间</Text>
  <TouchableOpacity style={s.hero} onPress={()=>pick("ai")}><Text style={s.h}>✨ AI上传照片/视频</Text><Text style={s.p}>现在真实选择手机照片/视频；第一阶段先保存原始资料，AI接口后续接入。</Text></TouchableOpacity>
  <TouchableOpacity style={s.card} onPress={()=>pick("manual")}><Text style={s.h}>🖼️ 手动上传照片/视频</Text><Text style={s.p}>不依赖AI，直接进入当前家庭相册。</Text></TouchableOpacity>
  <TouchableOpacity style={s.card} onPress={onOldPhoto}><Text style={s.h}>📷 扫描老照片</Text></TouchableOpacity>
  <TouchableOpacity style={s.card} onPress={onNote}><Text style={s.h}>📝 记录家庭事件</Text></TouchableOpacity>
 </ScrollView>
}
const s=StyleSheet.create({page:{padding:20,paddingBottom:100,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12,marginBottom:14},
 hero:{backgroundColor:"#F8E1C4",borderRadius:22,padding:20,marginVertical:8},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:18,marginVertical:7},
 h:{fontSize:17,fontWeight:"700",color:C.deep},p:{fontSize:13,color:C.muted,lineHeight:20,marginTop:6}});
