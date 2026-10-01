import {theme} from './theme';

import React,{useState} from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Alert} from "react-native";
import {pickImagesAndVideos} from "./mediaPicker";
import {makeChatMediaMessage,decideChatArchive} from "./ChatMediaArchive";
import {ChatArchiveCard} from "./Phase1CoreScreens";
const C=theme;
export default function FamilyChatMediaScreen({family,onPatch}){
 const [text,setText]=useState("");
 const sendText=()=>{if(!text.trim())return;onPatch({chat:[...(family.chat||[]),{id:`msg_${Date.now()}`,type:"text",senderId:"me",senderName:"我",text:text.trim(),createdAt:new Date().toISOString()}]});setText("")};
 const pick=async()=>{
  const r=await pickImagesAndVideos(); if(r.permissionDenied){Alert.alert("需要照片权限");return}
  if(!r.assets.length)return;
  const assets=r.assets.map((a,i)=>({id:`chatmedia_${Date.now()}_${i}`,uri:a.uri,type:a.type||"image",createdAt:new Date().toISOString(),personIds:[],private:false,source:"family_chat"}));
  const msg=makeChatMediaMessage("me","我",assets.map(x=>x.id));
  onPatch({media:[...(family.media||[]),...assets.map(x=>({...x,albumArchived:false}))],chat:[...(family.chat||[]),msg]});
 };
 const decide=(id,yes)=>{
  const chat=decideChatArchive(family.chat||[],id,yes);
  const msg=chat.find(x=>x.id===id), set=new Set(msg?.mediaIds||[]);
  const media=(family.media||[]).map(m=>set.has(m.id)?{...m,albumArchived:yes}:m);
  onPatch({chat,media});
 };
 return <View style={s.page}><Text style={s.title}>{family.name} · 家庭群</Text><ScrollView style={{flex:1}}>
  {(family.chat||[]).map(m=>m.type==="media"?<ChatArchiveCard key={m.id} message={m} onArchive={id=>decide(id,true)} onNoArchive={id=>decide(id,false)}/>:
   <View key={m.id} style={s.bubble}><Text style={s.who}>{m.senderName}</Text><Text>{m.text}</Text></View>)}</ScrollView>
  <View style={s.compose}><TouchableOpacity onPress={pick}><Text style={s.add}>＋</Text></TouchableOpacity><TextInput value={text} onChangeText={setText} style={s.input} placeholder="和家人说点什么…"/>
   <TouchableOpacity onPress={sendText}><Text style={s.send}>发送</Text></TouchableOpacity></View>
 </View>
}
const s=StyleSheet.create({page:{flex:1,padding:18,paddingBottom:92,backgroundColor:C.bg},title:{fontSize:23,fontWeight:"800",color:C.deep,marginVertical:12},bubble:{alignSelf:"flex-start",backgroundColor:C.card,padding:12,borderRadius:16,marginVertical:5,maxWidth:"82%"},
 who:{fontSize:11,color:C.muted,marginBottom:4},compose:{flexDirection:"row",alignItems:"center",gap:7},add:{fontSize:30,color:C.brown},input:{flex:1,backgroundColor:"#fff",borderWidth:1,borderColor:C.line,borderRadius:15,padding:11},send:{backgroundColor:C.brown,color:"#fff",padding:11,borderRadius:12,overflow:"hidden"}});
