
import React,{useMemo,useState} from "react";
import {SafeAreaView,View,Text,TouchableOpacity,ScrollView,StyleSheet,ActivityIndicator,Alert} from "react-native";
import {FamilyManagerScreen,DynamicTreeScreen,IndexedAlbumScreen,PersonRelationSummary} from "./Phase1CoreScreens";
import {DeathConfirmationScreen,RelationshipEditor} from "./Phase1WorkflowScreens";
import {PrivateNotebookScreen,MissYouScreen,LegacyGrantEditor} from "./PrivateSpaceScreens";
import AnnualAvatarRealScreen from "./AnnualAvatarRealScreen";
import FamilyChatMediaScreen from "./FamilyChatMediaScreen";
import {FamilyNotesScreen} from "./FamilyInteractionScreens";
import UploadScreen from "./UploadScreen";
import MediaPeopleTagger from "./MediaPeopleTagger";
import {useSeparatedPersistence} from "./useSeparatedPersistence";
import {appendAvatarHistory,publicPersonAvatar,assertPrivateIsolation} from "./Phase1StateModel";
import {startDeathConfirmation,confirm as confirmDeath,object as objectDeath} from "./deathLegacyWorkflow";
import {useAndroidBack} from "./PlatformNavigation";
import PrivateMediaScreen from "./PrivateMediaScreen";
import MemorialScreen from "./MemorialScreen";

const C={bg:"#FBF4E9",card:"#FFFAF2",brown:"#965331",deep:"#5D321F",muted:"#8F7B6E",line:"#EADBC8"};
const seedFamily={id:"f1",name:"我们的家",members:[
 {id:"p1",name:"爸爸",relation:"父亲",claimed:true,dead:false},
 {id:"p2",name:"妈妈",relation:"母亲",claimed:true,dead:false},
 {id:"me",name:"我",relation:"本人",claimed:true,dead:false,fatherId:"p1",motherId:"p2"},
 {id:"p4",name:"姐姐",relation:"姐姐",claimed:true,dead:false,fatherId:"p1",motherId:"p2"},
 {id:"p5",name:"爷爷",relation:"爷爷",claimed:false,dead:true}
],media:[],chat:[],notes:[]};

const defaultPub={schemaVersion:4,activeFamilyId:"f1",families:[seedFamily],avatarHistory:[],deathCases:[]};
const defaultPriv={schemaVersion:1,aiAllowed:false,privateNotes:[],missYou:[],legacyGrants:[],privateMedia:[]};

export default function IntegratedPhase1App(){
 const {pub,setPub,priv,setPriv,ready}=useSeparatedPersistence(defaultPub,defaultPriv);
 const [screen,setScreen]=useState("home"),[person,setPerson]=useState(null),[selectedMedia,setSelectedMedia]=useState(null),[deathCase,setDeathCase]=useState(null),[actingMemberId,setActingMemberId]=useState("me");
 useAndroidBack(screen,setScreen);
 const family=useMemo(()=>pub.families.find(f=>f.id===pub.activeFamilyId)||pub.families[0],[pub]);
 const patchFamily=patch=>setPub(p=>({...p,families:p.families.map(f=>f.id===family.id?{...f,...patch}:f)}));
 const updateMembers=members=>patchFamily({members});
 const deceased=family?.members?.filter(x=>x.dead)||[];
 const createFamily=name=>{const id=`f_${Date.now()}`;setPub(p=>({...p,activeFamilyId:id,families:[...p.families,{id,name,members:[{id:"me",name:"我",relation:"本人",claimed:true,dead:false}],media:[],chat:[],notes:[]}]}));setScreen("home")};
 const switchFamily=id=>{setPub(p=>({...p,activeFamilyId:id}));setPerson(null);setScreen("home")};
 const openPerson=p=>{setPerson(p);setScreen("person")};
 const openMedia=m=>{setSelectedMedia(m);setScreen("tagMedia")};
 const saveTagged=m=>{patchFamily({media:family.media.map(x=>x.id===m.id?m:x)});setSelectedMedia(m);setScreen("album")};
 const addMedia=items=>patchFamily({media:[...(family.media||[]),...items.map(x=>({...x,albumArchived:true}))]});
 const saveAvatar=entry=>{setPub(p=>appendAvatarHistory(p,entry));Alert.alert("已更换","年度头像已保存到历史记录。");setScreen("person")};
 const avatarFor=p=>publicPersonAvatar(pub,p.id);

 if(!ready)return <SafeAreaView style={s.loading}><ActivityIndicator/><Text style={s.muted}>正在恢复「家」的数据…</Text></SafeAreaView>;
 try{assertPrivateIsolation(priv)}catch(e){return <SafeAreaView style={s.loading}><Text>私密数据安全检查未通过，已停止加载。</Text></SafeAreaView>}
 if(!family)return <SafeAreaView style={s.loading}><Text style={s.heroT}>还没有家庭</Text><Action title="创建家庭" onPress={()=>createFamily("我们的家")}/></SafeAreaView>;

 const Home=()=> <ScrollView contentContainerStyle={s.page}><View style={s.top}><TouchableOpacity onPress={()=>setScreen("families")}><Text style={s.family}>{family.name}⌄</Text><Text style={s.muted}>切换家庭</Text></TouchableOpacity><Text>🔔</Text></View>
  <View style={s.hero}><Text style={s.heroT}>把家人的故事，留给未来</Text><Text style={s.muted}>关系、照片、故事与思念，都在这里慢慢留下来。</Text></View>
  <View style={s.grid}>{[["🌳","家族树","tree"],["🖼️","家庭相册","album"],["💬","家庭群","chat"],["📝","家庭记事","notes"],["🪻","逝者纪念","memorial"],["🔒","私密空间","private"],["📷","老照片","restore"],["🎞️","AI回忆","film"]].map(([i,t,k])=><TouchableOpacity key={k} style={s.tile} onPress={()=>setScreen(k)}><Text style={s.ico}>{i}</Text><Text>{t}</Text></TouchableOpacity>)}</View>
 </ScrollView>;

 const Person=()=> <ScrollView contentContainerStyle={s.page}><Text onPress={()=>setScreen("tree")} style={s.back}>‹ 家族树</Text><View style={s.center}><Text style={[s.bigAvatar,person.dead&&{opacity:.35}]}>👤</Text><Text style={s.heroT}>{person.name}{person.dead?" 🕯":""}</Text><Text style={s.muted}>{person.relation}</Text></View>
  {avatarFor(person)?<View style={s.info}><Text>年度头像：{avatarFor(person).year} 年已确认</Text></View>:null}
  <PersonRelationSummary person={person} members={family.members}/>
  <Action title="编辑家庭关系" onPress={()=>setScreen("relation")}/>
  {!person.dead&&person.id==="me"?<Action title="年度成长头像" onPress={()=>setScreen("avatar")}/>:null}
  {!person.dead&&person.id!=="me"?<Action title="发起身故信息确认" onPress={()=>{const c=startDeathConfirmation(person.id,"me");setActingMemberId(family.members.find(m=>m.id!==person.id&&m.id!=="me"&&!m.dead)?.id||"me");setDeathCase(c);setPub(p=>({...p,deathCases:[...(p.deathCases||[]),c]}));setScreen("death")}}/>:null}
  {person.dead?<Action title="进入纪念页" onPress={()=>setScreen("memorial")}/>:null}
 </ScrollView>;

 const Private=()=> <ScrollView contentContainerStyle={[s.page,{backgroundColor:"#F8F2FB"}]}><Text style={s.heroT}>🔒 私密空间</Text><Text style={s.muted}>独立保存 · 家主不可查看 · AI不可访问</Text>
  <Action title="🔐 非公开相册" onPress={()=>setScreen("privateMedia")}/>
  <Action title="📓 个人记事本" onPress={()=>setScreen("privateNotes")}/><Action title="🪻 想念TA" onPress={()=>setScreen("miss")}/><Action title="🕊️ 身后传承设置" onPress={()=>setScreen("legacy")}/>
 </ScrollView>;

 let body;
 if(screen==="home")body=<Home/>;
 else if(screen==="families")body=<FamilyManagerScreen families={pub.families} activeFamilyId={pub.activeFamilyId} onCreate={createFamily} onSwitch={switchFamily}/>;
 else if(screen==="tree")body=<DynamicTreeScreen family={family} onPerson={openPerson}/>;
 else if(screen==="album")body=<AlbumClickable family={family} onMedia={openMedia}/>;
 else if(screen==="tagMedia")body=<MediaPeopleTagger media={selectedMedia} members={family.members} onSave={saveTagged}/>;
 else if(screen==="person")body=<Person/>;
 else if(screen==="relation")body=<RelationshipEditor person={person} members={family.members} onSave={r=>{const np={...person,...r};updateMembers(family.members.map(p=>p.id===person.id?np:p));setPerson(np);setScreen("person")}}/>;
 else if(screen==="avatar")body=<AnnualAvatarRealScreen person={person} media={family.media||[]} onConfirm={saveAvatar}/>;
 else if(screen==="death")body=<><ScrollView horizontal contentContainerStyle={{paddingHorizontal:20,paddingTop:12,gap:8}}>{family.members.filter(m=>m.id!==person?.id&&!m.dead).map(m=>{const isInitiator=m.id===deathCase?.initiatorId;const already=deathCase?.confirmations?.includes(m.id);return <TouchableOpacity key={m.id} onPress={()=>setActingMemberId(m.id)} style={[s.info,actingMemberId===m.id&&{borderWidth:2,borderColor:C.brown}]}><Text>{m.name}{isInitiator?" · 发起人":already?" · 已确认":""}</Text></TouchableOpacity>})}</ScrollView><DeathConfirmationScreen person={person} caseData={deathCase} currentMemberId={actingMemberId} onConfirm={id=>setDeathCase(v=>{const n=confirmDeath(v,id);setPub(p=>({...p,deathCases:(p.deathCases||[]).map(x=>x.id===n.id?n:x)}));if(n.status==="confirmed"){const np={...person,dead:true,memorializedAt:new Date().toISOString()};updateMembers(family.members.map(x=>x.id===person.id?np:x));setPerson(np)}return n})} onObject={id=>setDeathCase(v=>{const n=objectDeath(v,id);setPub(p=>({...p,deathCases:(p.deathCases||[]).map(x=>x.id===n.id?n:x)}));return n})}/></>;
 else if(screen==="add")body=<UploadScreen onAdd={addMedia} onOldPhoto={()=>setScreen("restore")} onNote={()=>setScreen("notes")}/>;
 else if(screen==="chat")body=<FamilyChatMediaScreen family={family} onPatch={patchFamily}/>;
 else if(screen==="notes")body=<FamilyNotesScreen family={family} onAdd={n=>patchFamily({notes:[n,...(family.notes||[])]})}/>;
 else if(screen==="private")body=<Private/>;
 else if(screen==="privateMedia")body=<PrivateMediaScreen items={priv.privateMedia||[]} onAdd={items=>setPriv(p=>({...p,aiAllowed:false,privateMedia:[...items,...(p.privateMedia||[])]}))}/>;
 else if(screen==="privateNotes")body=<PrivateNotebookScreen notes={priv.privateNotes} onAdd={n=>setPriv(p=>({...p,privateNotes:[n,...p.privateNotes]}))}/>;
 else if(screen==="miss")body=<MissYouScreen deceased={deceased} entries={priv.missYou} onAdd={x=>setPriv(p=>({...p,missYou:[x,...p.missYou]}))}/>;
 else if(screen==="legacy")body=<LegacyGrantEditor privateItems={[...priv.privateNotes,...priv.missYou]} members={family.members.filter(x=>x.id!=="me")} onSave={g=>{setPriv(p=>({...p,legacyGrants:[...p.legacyGrants,g]}));Alert.alert("已保存","仅释放你明确指定的这一项内容。")}}/>;
 else if(screen==="memorial")body=<MemorialScreen person={person||deceased[0]} media={family.media||[]}/>;
 else body=<ScrollView contentContainerStyle={s.page}><Text style={s.heroT}>{screen==="restore"?"老照片扫描修复":"AI回忆影片"}</Text><Text style={s.muted}>该能力保留正式入口，外部服务将在后续阶段对接。</Text></ScrollView>;

 return <SafeAreaView style={s.app}>{body}<Bottom go={setScreen}/></SafeAreaView>
}
function AlbumClickable({family,onMedia}){const media=(family.media||[]).filter(x=>x.albumArchived!==false);return <ScrollView contentContainerStyle={s.page}><Text style={s.heroT}>家庭相册</Text><Text style={s.muted}>点击照片可确认“照片里有谁”</Text>{!media.length?<View style={s.info}><Text>还没有家庭照片，点下方＋上传。</Text></View>:media.map(m=><TouchableOpacity key={m.id} style={s.mediaRow} onPress={()=>onMedia(m)}><Text style={s.mediaIcon}>{m.type==="video"?"▶":"▧"}</Text><View><Text>{m.fileName||"家庭照片/视频"}</Text><Text style={s.muted}>{m.peopleConfirmed?`已确认 ${m.personIds.length} 位家人`:"待确认人物"}</Text></View><Text>›</Text></TouchableOpacity>)}</ScrollView>}
function Action({title,onPress}){return <TouchableOpacity onPress={onPress} style={s.action}><Text style={s.actionT}>{title}</Text><Text>›</Text></TouchableOpacity>}
function Bottom({go}){return <View style={s.nav}>{[["⌂","首页","home"],["♧","家族","tree"],["＋","","add"],["▧","相册","album"],["●","我的","private"]].map(([i,t,k])=><TouchableOpacity key={k} onPress={()=>go(k)} style={k==="add"?s.plus:s.navItem}><Text style={k==="add"?s.plusT:s.navI}>{i}</Text>{t?<Text style={s.navT}>{t}</Text>:null}</TouchableOpacity>)}</View>}
const s=StyleSheet.create({app:{flex:1,backgroundColor:C.bg},loading:{flex:1,backgroundColor:C.bg,alignItems:"center",justifyContent:"center",gap:10,padding:30},page:{padding:20,paddingBottom:105,backgroundColor:C.bg,minHeight:"100%"},top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:8},family:{fontSize:21,fontWeight:"800",color:C.deep},muted:{fontSize:13,color:C.muted,marginTop:4,lineHeight:20},hero:{backgroundColor:"#F8E1C4",padding:22,borderRadius:24,marginVertical:16},heroT:{fontSize:22,fontWeight:"800",color:C.deep},grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"},tile:{width:"23%",alignItems:"center",marginVertical:13},ico:{fontSize:27,backgroundColor:"#F5DFC3",width:58,height:58,borderRadius:18,textAlign:"center",paddingTop:13,overflow:"hidden"},center:{alignItems:"center",marginVertical:18},bigAvatar:{fontSize:72},back:{fontSize:16,color:C.brown,marginTop:10},action:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:18,padding:17,marginVertical:6,flexDirection:"row",justifyContent:"space-between"},actionT:{fontSize:16,color:C.deep,fontWeight:"600"},info:{backgroundColor:C.card,borderRadius:16,padding:15,marginVertical:10},mediaRow:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:17,padding:14,marginVertical:6,flexDirection:"row",alignItems:"center",gap:12},mediaIcon:{fontSize:28},nav:{position:"absolute",bottom:0,left:0,right:0,height:82,backgroundColor:"#FFFAF3",borderTopWidth:1,borderColor:C.line,flexDirection:"row",alignItems:"center",justifyContent:"space-around"},navItem:{alignItems:"center",width:62},navI:{fontSize:23,color:C.deep},navT:{fontSize:11,color:C.muted},plus:{width:58,height:58,borderRadius:29,backgroundColor:C.brown,alignItems:"center",justifyContent:"center"},plusT:{fontSize:35,color:"#fff"}});
