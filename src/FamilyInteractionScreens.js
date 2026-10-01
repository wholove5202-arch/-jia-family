import {theme} from './theme';

import React,{useState} from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet} from "react-native";
const C=theme;
export function FamilyChatScreen({family,onSend}){
 const [text,setText]=useState("");
 return <View style={s.full}><Text style={s.title}>{family.name} · 家庭群</Text><Text style={s.sub}>当前家庭的聊天与其他家庭完全分开</Text>
  <ScrollView style={{flex:1}} contentContainerStyle={{paddingVertical:10}}>{(family.chat||[]).map(m=><View key={m.id} style={s.bubble}><Text style={s.who}>{m.senderName||"家人"}</Text><Text>{m.text}</Text></View>)}</ScrollView>
  <View style={s.compose}><TextInput value={text} onChangeText={setText} placeholder="和家人说点什么…" style={s.input}/>
   <TouchableOpacity onPress={()=>{if(text.trim()){onSend?.({id:`msg_${Date.now()}`,type:"text",senderId:"me",senderName:"我",text:text.trim(),createdAt:new Date().toISOString()});setText("")}}}><Text style={s.send}>发送</Text></TouchableOpacity></View>
  <Text style={s.foot}>群聊照片不会自动进入家庭相册，由照片提供者决定是否归档。</Text>
 </View>
}
export function FamilyNotesScreen({family,onAdd}){
 const [text,setText]=useState("");
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>家庭记事</Text><Text style={s.sub}>属于当前家庭的共同记忆</Text>
  <View style={s.card}><TextInput multiline value={text} onChangeText={setText} placeholder="记录今天发生的家庭故事…" style={[s.input,{minHeight:110,textAlignVertical:"top"}]}/>
   <TouchableOpacity onPress={()=>{if(text.trim()){onAdd?.({id:`note_${Date.now()}`,text:text.trim(),authorId:"me",createdAt:new Date().toISOString()});setText("")}}}><Text style={s.save}>保存家庭记事</Text></TouchableOpacity></View>
  {(family.notes||[]).map(n=><View style={s.card} key={n.id}><Text style={s.who}>{String(n.createdAt||'').slice(0,10)}</Text><Text style={{lineHeight:23}}>{n.text}</Text></View>)}
 </ScrollView>
}
const s=StyleSheet.create({full:{flex:1,padding:20,paddingBottom:90,backgroundColor:C.bg},page:{padding:20,paddingBottom:100,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:24,fontWeight:"800",color:C.deep,marginTop:12},
 sub:{fontSize:12,color:C.muted,marginTop:5},bubble:{alignSelf:"flex-start",maxWidth:"82%",backgroundColor:C.card,borderRadius:16,padding:12,marginVertical:5},who:{fontSize:11,color:C.muted,marginBottom:4},
 compose:{flexDirection:"row",gap:8,alignItems:"center"},input:{flex:1,backgroundColor:"#fff",borderWidth:1,borderColor:C.line,borderRadius:14,padding:12},send:{backgroundColor:C.brown,color:"#fff",padding:12,borderRadius:13,overflow:"hidden"},
 foot:{fontSize:11,color:C.muted,textAlign:"center",marginTop:8},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:18,padding:15,marginVertical:7},save:{backgroundColor:C.brown,color:"#fff",textAlign:"center",padding:13,borderRadius:13,overflow:"hidden",marginTop:10}});
