import {theme} from './theme';

import React,{useState} from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,Alert,StyleSheet} from "react-native";

const C=theme;
const Btn=({title,onPress,secondary,danger})=><TouchableOpacity onPress={onPress} style={[s.btn,secondary&&s.secondary,danger&&s.danger]}><Text style={[s.btnText,secondary&&{color:C.deep}]}>{title}</Text></TouchableOpacity>;
const Card=({children})=><View style={s.card}>{children}</View>;

export function AnnualAvatarScreen({person,proposal,onConfirm,onSkip}){
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>年度成长头像</Text>
  <Text style={s.sub}>记录每一年真实的你</Text>
  <Card><Text style={s.h}>发现一张更适合作为 {proposal?.year||new Date().getFullYear()} 年头像的照片</Text>
   <Text style={s.p}>只有本人确认后才会更换。旧头像会保留在头像历史中。</Text>
   <Btn title="✓ 使用这张" onPress={()=>onConfirm?.(proposal,person?.id)}/>
   <Btn title="暂不更换" secondary onPress={onSkip}/>
  </Card>
  <Text style={s.notice}>🔒 私密空间照片永远不会参与头像推荐。</Text>
 </ScrollView>
}

export function DeathConfirmationScreen({person,caseData,currentMemberId,onConfirm,onObject}){
 const count=caseData?.confirmations?.length||0;
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>身故信息确认</Text>
  <Text style={s.sub}>{person?.name} · 这是敏感且重要的家庭资料</Text>
  <Card><Text style={s.h}>确认进度</Text>
   <Text style={s.big}>{count} / 2</Text>
   <Text style={s.p}>由 1 名家庭成员发起，还需要另外至少 2 名符合资格的成年家庭成员独立确认。</Text>
  </Card>
  <Card><Text style={s.h}>确认前请核实</Text>
   <Text style={s.p}>确认只代表“身故事实确认”，不会让任何人获得 TA 的账号、私密空间或未授权资料。</Text>
   <Btn title="我确认此信息属实" onPress={()=>onConfirm?.(currentMemberId)}/>
   <Btn title="信息有误 / 我有异议" danger onPress={()=>onObject?.(currentMemberId)}/>
  </Card>
  {caseData?.status==="disputed"?<Text style={s.warning}>已出现异议，系统不会自动切换为纪念状态。</Text>:null}
 </ScrollView>
}

export function LegacySettingsScreen({members=[],settings,onSave}){
 const [enabled,setEnabled]=useState(!!settings?.enabled);
 const [selected,setSelected]=useState([]);
 const [mode,setMode]=useState("after_death_confirmation");
 const toggle=id=>setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>身后传承设置</Text>
  <Text style={s.sub}>由本人决定：什么内容，在什么条件下，留给谁。</Text>
  <Card><Text style={s.h}>身故后开放</Text>
   <Btn title={enabled?"已开启 ✓":"开启"} onPress={()=>setEnabled(!enabled)} secondary={!enabled}/>
   <Text style={s.p}>不开启时，任何私密内容都不会因身故确认而自动公开。</Text>
  </Card>
  <Card><Text style={s.h}>选择传承人</Text>
   {members.map(m=><TouchableOpacity key={m.id} style={s.person} onPress={()=>toggle(m.id)}>
    <Text>{selected.includes(m.id)?"✓ ":"○ "}{m.name}</Text><Text style={s.small}>{m.relation||""}</Text>
   </TouchableOpacity>)}
  </Card>
  <Card><Text style={s.h}>开放条件</Text>
   <TouchableOpacity style={s.person} onPress={()=>setMode("after_death_confirmation")}><Text>{mode==="after_death_confirmation"?"✓ ":"○ "}身故确认完成后</Text></TouchableOpacity>
   <TouchableOpacity style={s.person} onPress={()=>setMode("date_after_death")}><Text>{mode==="date_after_death"?"✓ ":"○ "}指定日期后</Text></TouchableOpacity>
   <Text style={s.p}>具体照片、记事、信件和视频将逐项授权，不会把整个私密空间一次性开放。</Text>
  </Card>
  <Btn title="保存我的传承设置" onPress={()=>onSave?.({enabled,recipientIds:selected,releaseMode:mode})}/>
  <Text style={s.notice}>家庭成员、家主和确认人都不能扩大本人设置的权限。</Text>
 </ScrollView>
}

export function RelationshipEditor({person,members=[],onSave}){
 const [fatherId,setFather]=useState(person?.fatherId||null),[motherId,setMother]=useState(person?.motherId||null);
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>编辑家庭关系</Text><Text style={s.sub}>{person?.name}</Text>
  <Card><Text style={s.h}>父亲</Text>{members.filter(x=>x.id!==person?.id).map(m=><TouchableOpacity key={"f"+m.id} style={s.person} onPress={()=>setFather(m.id)}><Text>{fatherId===m.id?"✓ ":"○ "}{m.name}</Text></TouchableOpacity>)}</Card>
  <Card><Text style={s.h}>母亲</Text>{members.filter(x=>x.id!==person?.id).map(m=><TouchableOpacity key={"m"+m.id} style={s.person} onPress={()=>setMother(m.id)}><Text>{motherId===m.id?"✓ ":"○ "}{m.name}</Text></TouchableOpacity>)}</Card>
  <Text style={s.notice}>父母关系分别保存，因此可以准确表达同父异母、同母异父等真实家庭情况。</Text>
  <Btn title="确认关系" onPress={()=>onSave?.({fatherId,motherId})}/>
 </ScrollView>
}

const s=StyleSheet.create({
 page:{padding:20,paddingBottom:80,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12},sub:{fontSize:14,color:C.muted,marginTop:6,marginBottom:15},
 card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:16,marginVertical:8},h:{fontSize:17,fontWeight:"700",color:C.deep,marginBottom:8},
 p:{fontSize:14,color:C.muted,lineHeight:22},big:{fontSize:30,fontWeight:"800",color:C.brown,marginVertical:5},btn:{backgroundColor:C.brown,padding:14,borderRadius:15,alignItems:"center",marginTop:10},
 secondary:{backgroundColor:"#F3E5D3"},danger:{backgroundColor:C.danger},btnText:{color:"#fff",fontWeight:"700",fontSize:15},notice:{fontSize:12,color:C.muted,lineHeight:19,marginVertical:12},
 warning:{backgroundColor:"#F5DDD7",padding:13,borderRadius:13,color:C.danger,lineHeight:20},person:{paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:"row",justifyContent:"space-between"},
 small:{fontSize:12,color:C.muted}
});
