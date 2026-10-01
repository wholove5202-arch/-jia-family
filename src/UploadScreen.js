import React from "react";
import {View,Text,TouchableOpacity,StyleSheet,Alert} from "react-native";
import {pickImagesAndVideos} from "./mediaPicker";
import JiaIcon from "./JiaIcon";
const C={bg:"#FFFDF9",card:"#FFFFFF",brown:"#A85E37",deep:"#2D1B14",muted:"#8D7E75",line:"#EEE7E0"};
export default function UploadScreen({onAdd,onOldPhoto,isMember=false}){
 async function pick(mode="manual"){
  if(mode==="ai"&&!isMember){Alert.alert("AI 智能上传 · 会员","开通会员后，可自动识别人像、时间、地点并分类。");return}
  const r=await pickImagesAndVideos();
  if(r.permissionDenied){Alert.alert("需要照片权限","允许访问照片后才能选择照片或视频。");return}
  if(!r.assets.length)return;
  const now=new Date().toISOString();
  onAdd?.(r.assets.map((a,i)=>({id:`m_${Date.now()}_${i}`,uri:a.uri,type:a.type||"image",width:a.width,height:a.height,fileName:a.fileName||"",createdAt:now,takenAt:now,event:"未分类",personIds:[],private:false,source:"device_picker",aiMode:mode==="ai"})));
 }
 return <View style={s.screen}><View style={s.dim}/><View style={s.sheet}><View style={s.handle}/><Text style={s.title}>选择上传方式</Text>
  <TouchableOpacity style={s.row} onPress={()=>pick("manual")}><View style={[s.icon,{backgroundColor:"#E9F5FF"}]}><JiaIcon name="album" size={25} color="#2695E8"/></View><View style={s.flex}><Text style={s.h}>手动上传</Text><Text style={s.p}>从手机相册选择照片或视频</Text></View><Text style={s.arrow}>›</Text></TouchableOpacity>
  <TouchableOpacity style={s.row} onPress={()=>pick("ai")}><View style={[s.icon,{backgroundColor:"#F1ECFF"}]}><JiaIcon name="sparkles" size={25} color="#8067E8"/></View><View style={s.flex}><View style={s.inline}><Text style={s.h}>AI 智能上传（会员）</Text><Text style={s.crown}>♛</Text></View><Text style={s.p}>自动识别人像、时间、地点并分类</Text></View><Text style={s.arrow}>›</Text></TouchableOpacity>
  <TouchableOpacity style={s.row} onPress={()=>isMember?onOldPhoto?.():Alert.alert("扫描老照片 · 会员功能","开通会员后可使用扫描老照片与修复功能。")}><View style={[s.icon,{backgroundColor:"#FFF0EA"}]}><JiaIcon name="scan" size={25} color="#F06448"/></View><View style={s.flex}><Text style={s.h}>扫描老照片</Text><Text style={s.p}>拍照或扫描旧照片，可自动修复</Text></View><Text style={s.arrow}>›</Text></TouchableOpacity>
  <TouchableOpacity style={s.cancel}><Text style={s.cancelText}>取消</Text></TouchableOpacity>
 </View></View>;
}
const s=StyleSheet.create({screen:{flex:1,justifyContent:"flex-end",backgroundColor:"#F7F1E8"},dim:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(0,0,0,.38)"},sheet:{backgroundColor:C.bg,borderTopLeftRadius:24,borderTopRightRadius:24,paddingHorizontal:16,paddingTop:9,paddingBottom:24},handle:{width:38,height:4,borderRadius:2,backgroundColor:"#D8D0C9",alignSelf:"center",marginBottom:11},title:{fontSize:18,fontWeight:"800",color:C.deep,textAlign:"center",marginBottom:12},row:{minHeight:72,backgroundColor:C.card,borderRadius:14,paddingHorizontal:12,marginBottom:8,flexDirection:"row",alignItems:"center",gap:12,borderWidth:1,borderColor:C.line},icon:{width:45,height:45,borderRadius:12,alignItems:"center",justifyContent:"center"},flex:{flex:1},inline:{flexDirection:"row",alignItems:"center",gap:6},h:{fontSize:15,fontWeight:"800",color:C.deep},p:{fontSize:11,color:C.muted,marginTop:4},arrow:{fontSize:25,color:"#A89B92"},crown:{fontSize:16,color:"#E4A118"},cancel:{height:50,borderRadius:14,backgroundColor:"#fff",alignItems:"center",justifyContent:"center",marginTop:3},cancelText:{fontSize:15,fontWeight:"700",color:C.deep}});
