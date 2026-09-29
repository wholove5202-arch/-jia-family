
import React,{useState} from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Alert} from "react-native";

const C={bg:"#F8F2FB",card:"#FFFBFF",brown:"#965331",deep:"#5D321F",muted:"#8F7B6E",line:"#E7DDE9"};
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
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>🪻 想念TA</Text>
  <Text style={s.sub}>写给逝去家人的文字，只属于你。默认永不公开。</Text>
  <Card><Text style={s.h}>写给谁</Text>{deceased.map(p=><TouchableOpacity key={p.id} style={s.person} onPress={()=>setWho(p.id)}><Text>{who===p.id?"✓ ":"○ "}{p.name} 🕯</Text></TouchableOpacity>)}</Card>
  <Card><TextInput value={text} onChangeText={setText} multiline placeholder="想对TA说的话…" style={s.area}/>
   <Btn title="保存给TA的话" onPress={()=>{if(who&&text.trim()){onAdd?.({id:`miss_${Date.now()}`,deceasedPersonId:who,text:text.trim(),aiAllowed:false,release:"never",createdAt:new Date().toISOString()});setText("")}}}/></Card>
  <Text style={s.notice}>以后即使设置身后传承，也只有你明确选择的这一条内容才可以释放。</Text>
 </ScrollView>
}

export function LegacyGrantEditor({privateItems=[],members=[],onSave}){
 const [contentId,setContent]=useState(null),[recipients,setRecipients]=useState([]),[mode,setMode]=useState("after_death_confirmation");
 const toggle=id=>setRecipients(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>身后传承 · 逐项授权</Text>
  <Text style={s.sub}>不是开放整个私密空间，而是由你一项一项决定。</Text>
  <Card><Text style={s.h}>① 选择要留下的内容</Text>{privateItems.map(x=><TouchableOpacity key={x.id} style={s.person} onPress={()=>setContent(x.id)}><Text>{contentId===x.id?"✓ ":"○ "}{x.title||x.text?.slice(0,16)||"私密内容"}</Text></TouchableOpacity>)}</Card>
  <Card><Text style={s.h}>② 指定给谁</Text>{members.map(m=><TouchableOpacity key={m.id} style={s.person} onPress={()=>toggle(m.id)}><Text>{recipients.includes(m.id)?"✓ ":"○ "}{m.name}</Text><Text style={s.small}>{m.relation||""}</Text></TouchableOpacity>)}</Card>
  <Card><Text style={s.h}>③ 什么时候开放</Text>
   <TouchableOpacity style={s.person} onPress={()=>setMode("after_death_confirmation")}><Text>{mode==="after_death_confirmation"?"✓ ":"○ "}身故多人确认完成后</Text></TouchableOpacity>
   <TouchableOpacity style={s.person} onPress={()=>setMode("date_after_death")}><Text>{mode==="date_after_death"?"✓ ":"○ "}身故后指定日期</Text></TouchableOpacity></Card>
  <Btn title="确认这项传承设置" onPress={()=>{if(contentId&&recipients.length)onSave?.({id:`grant_${Date.now()}`,contentId,recipientIds:recipients,releaseMode:mode})}}/>
  <Text style={s.notice}>未选择、未授权的私密内容继续永久私密。确认身故的人也不会自动获得查看权。</Text>
 </ScrollView>
}

const s=StyleSheet.create({
 page:{padding:20,paddingBottom:90,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12},
 sub:{fontSize:13,color:C.muted,lineHeight:20,marginVertical:8},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:16,marginVertical:8},
 h:{fontSize:17,fontWeight:"700",color:C.deep,marginBottom:8},area:{minHeight:125,backgroundColor:"#fff",borderWidth:1,borderColor:C.line,borderRadius:15,padding:13,textAlignVertical:"top"},
 btn:{backgroundColor:C.brown,padding:14,borderRadius:15,alignItems:"center",marginTop:10},secondary:{backgroundColor:"#F0E5F2"},btnT:{color:"#fff",fontWeight:"700"},
 person:{paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:"row",justifyContent:"space-between"},small:{fontSize:12,color:C.muted},
 body:{fontSize:16,lineHeight:24,color:C.deep,marginTop:6},notice:{fontSize:12,color:C.muted,lineHeight:19,marginVertical:12}
});
