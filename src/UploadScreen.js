import React from "react";
import {ScrollView,Text,TouchableOpacity,StyleSheet,Alert,View} from "react-native";
import {pickImagesAndVideos} from "./mediaPicker";
import JiaIcon from "./JiaIcon";
const C={bg:"#FFF9F2",card:"#FFFFFF",brown:"#8E583B",deep:"#4F3428",muted:"#8C7B71",line:"#EEE2D5",soft:"#F7EDE1"};

export default function UploadScreen({onAdd,onOldPhoto,onMemory,personName,isMember=false}){
 async function pick(mode="manual"){
  if(mode==="ai"&&!isMember){Alert.alert("AI智能上传 · 会员功能","开通会员后，AI可以帮助识别人物、时间并整理家庭照片。");return}
  const r=await pickImagesAndVideos();
  if(r.permissionDenied){Alert.alert("需要照片权限","允许访问照片后才能选择家庭照片/视频。");return}
  if(!r.assets.length)return;
  const now=new Date().toISOString();
  onAdd?.(r.assets.map((a,i)=>({id:`m_${Date.now()}_${i}`,uri:a.uri,type:a.type||"image",width:a.width,height:a.height,fileName:a.fileName||"",createdAt:now,takenAt:now,event:"未分类",personIds:[],private:false,source:"device_picker",aiMode:mode==="ai"})));
 }
 function scan(){
  if(!isMember){Alert.alert("扫描老照片 · 会员功能","扫描、自动裁切与老照片修复仅向会员开放。");return}
  onOldPhoto?.();
 }
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>{personName?"添加到"+personName+"的相册":"添加到家庭相册"}</Text>
  <Text style={s.intro}>选择一种上传方式</Text>
  <View style={s.primaryRow}>
   <TouchableOpacity style={s.primary} onPress={()=>pick("manual")}><View style={s.icon}><JiaIcon name="album" size={25}/></View><Text style={s.h}>手动上传</Text><Text style={s.p}>免费 · 照片 / 视频</Text></TouchableOpacity>
   <TouchableOpacity style={s.primary} onPress={()=>pick("ai")}><View style={s.icon}><JiaIcon name="sparkles" size={25}/></View><Text style={s.h}>AI智能上传</Text><Text style={s.p}>{isMember?"会员已开启":"会员功能"}</Text></TouchableOpacity>
  </View>
  <TouchableOpacity style={s.scan} onPress={scan}><View style={s.scanIcon}><JiaIcon name="scan" size={24}/></View><View style={{flex:1}}><Text style={s.h}>扫描老照片</Text><Text style={s.p}>会员 · 扫描、裁切、修复老照片</Text></View><Text style={s.arrow}>›</Text></TouchableOpacity>
  <View style={s.divide}/>
  <TouchableOpacity style={s.memory} onPress={onMemory}><View style={s.scanIcon}><JiaIcon name="notes" size={24}/></View><View style={{flex:1}}><Text style={s.h}>添加一段记忆</Text><Text style={s.p}>写下故事，也可以加入照片、视频</Text></View><Text style={s.arrow}>›</Text></TouchableOpacity>
 </ScrollView>
}
const s=StyleSheet.create({page:{padding:20,paddingBottom:110,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12},intro:{fontSize:13,color:C.muted,marginTop:7,marginBottom:20},primaryRow:{flexDirection:"row",gap:12},primary:{flex:1,minHeight:145,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:22,padding:17,justifyContent:"center"},icon:{width:48,height:48,borderRadius:16,backgroundColor:C.soft,alignItems:"center",justifyContent:"center",marginBottom:14},h:{fontSize:16,fontWeight:"700",color:C.deep},p:{fontSize:12,color:C.muted,lineHeight:18,marginTop:5},scan:{marginTop:13,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:15,flexDirection:"row",alignItems:"center",gap:12},scanIcon:{width:44,height:44,borderRadius:14,backgroundColor:C.soft,alignItems:"center",justifyContent:"center"},arrow:{fontSize:25,color:"#B59A88"},divide:{height:1,backgroundColor:C.line,marginVertical:22},memory:{backgroundColor:"#F5E5D5",borderRadius:20,padding:16,flexDirection:"row",alignItems:"center",gap:12}});
