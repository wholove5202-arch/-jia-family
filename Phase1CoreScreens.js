
import React,{useMemo,useState} from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,Image,StyleSheet} from "react-native";
import {indexMedia} from "./albumDomain";
import {siblingsOf} from "./relationshipRules";

const C={bg:"#FBF4E9",card:"#FFFAF2",brown:"#965331",deep:"#5D321F",muted:"#8F7B6E",line:"#EADBC8"};
const Card=({children,onPress})=><TouchableOpacity activeOpacity={onPress?.75:1} onPress={onPress} style={s.card}>{children}</TouchableOpacity>;
const Btn=({title,onPress})=><TouchableOpacity onPress={onPress} style={s.btn}><Text style={s.btnT}>{title}</Text></TouchableOpacity>;

export function FamilyManagerScreen({families=[],activeFamilyId,onCreate,onSwitch}){
 const [name,setName]=useState("");
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>我的家庭</Text><Text style={s.sub}>一个人可以属于多个家庭；切换后只显示当前家庭内容。</Text>
  {families.map(f=><Card key={f.id} onPress={()=>onSwitch?.(f.id)}><View style={s.row}>
   <View><Text style={s.h}>{f.name}</Text><Text style={s.sub}>{(f.members||[]).length}位家人</Text></View>
   <Text>{activeFamilyId===f.id?"✓ 当前家庭":"切换 ›"}</Text></View></Card>)}
  <Card><Text style={s.h}>创建新的家庭空间</Text><TextInput value={name} onChangeText={setName} placeholder="例如：我们的家" style={s.input}/>
   <Btn title="创建家庭" onPress={()=>{if(name.trim()){onCreate?.(name.trim());setName("")}}}/></Card>
 </ScrollView>
}

export function DynamicTreeScreen({family,onPerson}){
 const members=family?.members||[];
 const roots=members.filter(p=>!p.fatherId&&!p.motherId);
 const shown=new Set();
 const renderNode=(p,level=0)=>{
  if(shown.has(p.id)) return null; shown.add(p.id);
  const children=members.filter(x=>x.fatherId===p.id||x.motherId===p.id);
  return <View key={p.id} style={{marginLeft:Math.min(level*18,54)}}>
   <Card onPress={()=>onPerson?.(p)}><View style={s.row}><Text style={[s.avatar,p.dead&&{opacity:.35}]}>👤</Text>
    <View style={{flex:1}}><Text style={s.h}>{p.name}{p.dead?" 🕯":""}</Text><Text style={s.sub}>{p.relation||"家庭成员"}</Text></View><Text>›</Text></View></Card>
   {children.map(c=>renderNode(c,level+1))}
  </View>
 };
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>{family?.name||"家庭"} · 家族树</Text>
  <Text style={s.sub}>关系来自已确认资料；特殊家庭关系以手动确认事实为准。</Text>
  {(roots.length?roots:members).map(p=>renderNode(p,0))}</ScrollView>
}

export function IndexedAlbumScreen({media=[],members=[]}){
 const [tab,setTab]=useState("all");
 const idx=useMemo(()=>indexMedia(media,members),[media,members]);
 return <ScrollView contentContainerStyle={s.page}><Text style={s.title}>家庭相册</Text>
  <View style={s.tabs}>{[["all","全部"],["people","人物"],["events","事件"],["years","年份"]].map(([k,t])=>
   <TouchableOpacity key={k} onPress={()=>setTab(k)} style={[s.tab,tab===k&&s.tabOn]}><Text>{t}</Text></TouchableOpacity>)}</View>
  {tab==="all"&&<MediaGrid items={idx.all}/>}
  {tab==="people"&&members.map(p=><Card key={p.id}><Text style={s.h}>{p.name}{p.dead?" 🕯":""}</Text><Text style={s.sub}>{(idx.people[p.id]||[]).length}张/段相关记忆</Text><MediaGrid items={idx.people[p.id]||[]}/></Card>)}
  {tab==="events"&&Object.entries(idx.events).map(([k,v])=><Card key={k}><Text style={s.h}>{k}</Text><Text style={s.sub}>{v.length}张/段</Text><MediaGrid items={v}/></Card>)}
  {tab==="years"&&Object.entries(idx.years).sort().reverse().map(([k,v])=><Card key={k}><Text style={s.h}>{k}年</Text><MediaGrid items={v}/></Card>)}
 </ScrollView>
}
function MediaGrid({items}){return <View style={s.grid}>{items.map(m=>m.type==="video"?
 <View key={m.id} style={[s.pic,s.video]}><Text>▶ 视频</Text></View>:<Image key={m.id} source={{uri:m.uri}} style={s.pic}/>)}</View>}

export function ChatArchiveCard({message,onArchive,onNoArchive}){
 const count=(message?.mediaIds||[]).length;
 return <Card><Text style={s.h}>新的家庭照片</Text><Text style={s.sub}>{count}张/段 · 还没有归档到家庭相册</Text>
  {message?.archiveStatus==="pending_owner_decision"?<><Btn title="保存到家庭相册" onPress={()=>onArchive?.(message.id)}/>
   <TouchableOpacity onPress={()=>onNoArchive?.(message.id)}><Text style={s.skip}>不用保存</Text></TouchableOpacity></>:
   <Text style={s.ok}>{message?.archiveStatus==="archive"?"✓ 已归档":"已选择不归档"}</Text>}</Card>
}

export function PersonRelationSummary({person,members=[]}){
 const siblings=siblingsOf(members,person.id), byId=Object.fromEntries(members.map(x=>[x.id,x]));
 return <Card><Text style={s.h}>家庭关系</Text>
  <Text style={s.line}>父亲：{byId[person.fatherId]?.name||"未设置"}</Text>
  <Text style={s.line}>母亲：{byId[person.motherId]?.name||"未设置"}</Text>
  <Text style={s.line}>兄弟姐妹：{siblings.map(x=>x.name).join("、")||"未记录"}</Text></Card>
}

const s=StyleSheet.create({
 page:{padding:20,paddingBottom:100,backgroundColor:C.bg,minHeight:"100%"},title:{fontSize:25,fontWeight:"800",color:C.deep,marginTop:12},
 sub:{fontSize:13,color:C.muted,marginTop:4,lineHeight:20},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:16,marginVertical:7},
 row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},h:{fontSize:17,fontWeight:"700",color:C.deep},avatar:{fontSize:38},
 input:{backgroundColor:"#fff",borderWidth:1,borderColor:C.line,borderRadius:14,padding:13,marginTop:10},btn:{backgroundColor:C.brown,padding:14,borderRadius:15,alignItems:"center",marginTop:10},
 btnT:{color:"#fff",fontWeight:"700"},tabs:{flexDirection:"row",gap:6,marginVertical:14},tab:{paddingVertical:9,paddingHorizontal:13,borderRadius:16,backgroundColor:"#F3E8D8"},
 tabOn:{backgroundColor:"#E8CBA8"},grid:{flexDirection:"row",flexWrap:"wrap",gap:4,marginTop:8},pic:{width:"32%",aspectRatio:1,borderRadius:8,backgroundColor:"#ddd"},
 video:{alignItems:"center",justifyContent:"center"},skip:{textAlign:"center",color:C.muted,padding:12},ok:{color:C.brown,fontWeight:"700",marginTop:10},line:{paddingVertical:5,color:C.deep}
});
