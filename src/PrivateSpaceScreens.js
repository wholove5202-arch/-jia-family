import {theme} from './theme';

import React,{useState} from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Alert} from "react-native";
import JiaIcon from "./JiaIcon";

const C=theme;
const Card=({children})=><View style={s.card}>{children}</View>;
const Btn=({title,onPress,secondary})=><TouchableOpacity onPress={onPress} style={[s.btn,secondary&&s.secondary]}><Text style={[s.btnT,secondary&&{color:C.deep}]}>{title}</Text></TouchableOpacity>;

export function PrivateNotebookScreen({notes=[],onAdd}){
 const [text,setText]=useState("");
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>🔒 个人记事本</Text>
  <Text style={s.sub}>仅本人可见 · 不进入AI · 家主不可查看</Text>
  <Card><TextInput value={text} onChangeText={setText} multiline placeholder="写下只属于自己的事情…" style={s.area}/>
   <Btn title="保存私密记事" onPress={()=>{if(text.trim()){onAdd?.({id:`pn_${Date.now()}`,text:text.trim(),aiAllowed:false,createdAt:new Date().toISOString()});setText("")}}}/></Card>
  {notes.map(n=><Card key={n.id}><Text style={s.small}>{String(n.createdAt||'').slice(0,10)}</Text><Text style={s.body}>{n.text}</Text></Card>)}
 </ScrollView>
}

export function MissYouScreen({deceased=[],entries=[],onAdd}){
 const [who,setWho]=useState(null),[text,setText]=useState("");
 return <ScrollView contentContainerStyle={s.missPage}><View style={s.missHead}><View style={s.missIcon}><JiaIcon name="remember" size={29} color="#378BCC"/></View><View style={{flex:1}}><Text style={s.missTitle}>想念TA</Text><Text style={s.missSub}>有些话，可以慢慢写给想念的人</Text></View></View>
  <View style={s.missCard}><Text style={s.missLabel}>写给谁</Text>{deceased.length?deceased.map(p=><TouchableOpacity key={p.id} style={[s.missPerson,who===p.id&&s.missPersonOn]} onPress={()=>setWho(p.id)}><View style={s.personDot}><Text style={s.personDotText}>{(p.name||"TA").slice(-1)}</Text></View><Text style={s.personText}>{p.name}</Text><Text style={s.choice}>{who===p.id?"✓":"○"}</Text></TouchableOpacity>):<Text style={s.missEmpty}>家庭中暂时没有已标记为逝者的成员</Text>}</View>
  <View style={s.missCard}><Text style={s.missLabel}>想对TA说</Text><TextInput value={text} onChangeText={setText} multiline placeholder="把想念、感谢，或没来得及说的话写在这里……" placeholderTextColor="#A99BAE" style={s.missArea}/><TouchableOpacity style={s.missSave} onPress={()=>{if(who&&text.trim()){onAdd?.({id:`miss_${Date.now()}`,deceasedPersonId:who,text:text.trim(),aiAllowed:false,release:"never",createdAt:new Date().toISOString()});setText("")}}}><Text style={s.missSaveText}>珍藏这段话</Text></TouchableOpacity></View>
  <View style={s.privacyLine}><JiaIcon name="shieldLock" size={17} color="#378BCC"/><Text style={s.privacyText}>默认永不公开 · 只有你明确授权的内容才可释放</Text></View>
 </ScrollView>
}

export function LegacyGrantEditor({privateItems=[],members=[],onSave}){
 const [aiFilmAllowed,setFilm]=useState(false),[date,setDate]=useState(""),[contentId,setContent]=useState(null),[recipients,setRecipients]=useState([]),[mode,setMode]=useState("after_death_confirmation");
 const toggle=id=>setRecipients(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>身后传承 · 逐项授权</Text>
  <Text style={s.sub}>不是开放整个私密空间，而是由你一项一项决定。</Text>
  <Card><Text style={s.h}>① 选择要留下的内容</Text>{privateItems.map(x=><TouchableOpacity key={x.id} style={s.person} onPress={()=>{setContent(x.id);setFilm(false);}}><Text>{contentId===x.id?"✓ ":"○ "}{x.title||x.text?.slice(0,16)||"私密内容"}</Text></TouchableOpacity>)}</Card>
  <Card><Text style={s.h}>② 指定给谁</Text>{members.map(m=><TouchableOpacity key={m.id} style={s.person} onPress={()=>toggle(m.id)}><Text>{recipients.includes(m.id)?"✓ ":"○ "}{m.name}</Text><Text style={s.small}>{m.relation||""}</Text></TouchableOpacity>)}</Card>
  <Card><Text style={s.h}>③ 什么时候开放</Text>
   <TouchableOpacity style={s.person} onPress={()=>setMode("after_death_confirmation")}><Text>{mode==="after_death_confirmation"?"✓ ":"○ "}身故多人确认完成后</Text></TouchableOpacity>
   <TouchableOpacity style={s.person} onPress={()=>setMode("date_after_death")}><Text>{mode==="date_after_death"?"✓ ":"○ "}身故后指定日期</Text></TouchableOpacity></Card>
  {mode==='date_after_death'&&<TextInput style={s.area} value={date} onChangeText={setDate} placeholder="开放日期 YYYY-MM-DD"/>}<Card><Text style={s.h}>④ AI 故事与影片用途</Text><TouchableOpacity style={s.person} onPress={()=>setFilm(v=>!v)}><Text>{aiFilmAllowed?'✓ ':'○ '}允许这项内容用于身后故事 / 影片</Text></TouchableOpacity><Text style={s.notice}>仅对这一项授权。实际 AI 服务尚未接入。</Text></Card><Btn title="确认这项传承设置" onPress={()=>{if(!contentId||!recipients.length){Alert.alert("请选择内容和接收人");return;}if(mode==="date_after_death"&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)){Alert.alert("请填写有效开放日期");return;}onSave?.({id:`grant_${Date.now()}`,contentId,recipientIds:recipients,releaseMode:mode,releaseDate:mode==="date_after_death"?date:null,aiFilmAllowed})}}/>
  <Text style={s.notice}>未选择、未授权的私密内容继续永久私密。确认身故的人也不会自动获得查看权。</Text>
 </ScrollView>
}

const s=StyleSheet.create({missPage:{paddingHorizontal:18,paddingTop:8,paddingBottom:110,backgroundColor:'#FFFFFF',minHeight:'100%'},missHead:{flexDirection:'row',alignItems:'center',gap:13,paddingVertical:10},missIcon:{width:50,height:50,borderRadius:17,backgroundColor:'#EDF4FA',alignItems:'center',justifyContent:'center'},missTitle:{fontSize:24,fontWeight:'800',color:'#292E30'},missSub:{fontSize:12,color:'#929B97',marginTop:4},missCard:{backgroundColor:'#FFFFFF',borderRadius:22,borderWidth:1,borderColor:'#E9ECEB',padding:16,marginTop:13},missLabel:{fontSize:15,fontWeight:'700',color:'#292E30',marginBottom:8},missPerson:{minHeight:58,borderRadius:15,paddingHorizontal:10,flexDirection:'row',alignItems:'center',gap:10},missPersonOn:{backgroundColor:'#EEF5FB'},personDot:{width:38,height:38,borderRadius:19,backgroundColor:'#EDF4FA',alignItems:'center',justifyContent:'center'},personDotText:{fontSize:15,fontWeight:'700',color:'#378BCC'},personText:{flex:1,fontSize:15,fontWeight:'600',color:'#292E30'},choice:{fontSize:19,color:'#378BCC'},missEmpty:{fontSize:12,color:'#929B97',paddingVertical:12},missArea:{minHeight:220,maxHeight:420,borderWidth:1,borderColor:'#E9ECEB',borderRadius:17,backgroundColor:'#fff',padding:14,fontSize:16,lineHeight:25,textAlignVertical:'top',color:'#292E30'},missSave:{height:50,borderRadius:16,backgroundColor:'#378BCC',alignItems:'center',justifyContent:'center',marginTop:12},missSaveText:{color:'#fff',fontSize:15,fontWeight:'700'},privacyLine:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,marginTop:16},privacyText:{fontSize:11,color:'#929B97'},
 page:{padding:20,paddingBottom:90,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12},
 sub:{fontSize:13,color:C.muted,lineHeight:20,marginVertical:8},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:16,marginVertical:8},
 h:{fontSize:17,fontWeight:"700",color:C.deep,marginBottom:8},area:{minHeight:125,backgroundColor:"#fff",borderWidth:1,borderColor:C.line,borderRadius:15,padding:13,textAlignVertical:"top"},
 btn:{backgroundColor:C.brown,padding:14,borderRadius:15,alignItems:"center",marginTop:10},secondary:{backgroundColor:"#F0E5F2"},btnT:{color:"#fff",fontWeight:"700"},
 person:{paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:"row",justifyContent:"space-between"},small:{fontSize:12,color:C.muted},
 body:{fontSize:16,lineHeight:24,color:C.deep,marginTop:6},notice:{fontSize:12,color:C.muted,lineHeight:19,marginVertical:12}
});
