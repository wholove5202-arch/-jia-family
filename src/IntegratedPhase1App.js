
import React,{useMemo,useState} from "react";
import {SafeAreaView,View,Text,TouchableOpacity,ScrollView,StyleSheet,ActivityIndicator,Alert,ImageBackground} from "react-native";
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
 const [screen,setScreen]=useState("welcome"),[person,setPerson]=useState(null),[selectedMedia,setSelectedMedia]=useState(null),[deathCase,setDeathCase]=useState(null),[actingMemberId,setActingMemberId]=useState("me");
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

 const Home=()=> <ScrollView contentContainerStyle={s.homePage}>
  <View style={s.homeTop}><TouchableOpacity onPress={()=>setScreen("families")} style={s.familyHead}><Text style={s.familyBadge}>家</Text><View><Text style={s.family}>{family.name}⌄</Text><Text style={s.homeHint}>{family.members.length} 位家人 · 点击切换家庭</Text></View></TouchableOpacity><TouchableOpacity onPress={()=>setScreen("notes")} style={s.bell}><Text style={s.bellText}>♧</Text></TouchableOpacity></View>
  <FamilyCover family={family} onPress={()=>setScreen("tree")}/>
  <View style={s.quickGrid}>{[["♣","家族树","tree","#E8F1D8"],["▧","家庭相册","album","#DDE9F7"],["▤","家庭记事","notes","#FBE6CF"],["♥","家信/家讯","chat","#F9E4DF"],["✿","送给纪念","memorial","#EDE5F7"],["♜","私密空间","private","#F5DBDF"],["▣","老照片修复","restore","#E5EBE0"],["▶","AI回忆影片","film","#F6E3D5"]].map(([icon,title,key,color])=><TouchableOpacity key={key} style={s.quickItem} onPress={()=>setScreen(key)} accessibilityLabel={title}><View style={[s.quickIcon,{backgroundColor:color}]}><Text style={s.quickIconText}>{icon}</Text></View><Text style={s.quickLabel}>{title}</Text></TouchableOpacity>)}</View>
  <View style={s.sectionHead}><Text style={s.sectionTitle}>家庭动态</Text><TouchableOpacity onPress={()=>setScreen("notes")}><Text style={s.sectionMore}>查看全部 ›</Text></TouchableOpacity></View>
  <TouchableOpacity style={s.memoryCard} onPress={()=>setScreen(family.media?.length?"album":"add")}><View style={s.memorySymbol}><Text style={s.memorySymbolText}>▧</Text></View><View style={{flex:1}}><Text style={s.memoryTitle}>{family.media?.length?"最近留下的家庭照片":"从一张照片开始记录"}</Text><Text style={s.homeHint}>{family.media?.length?`${family.media.length} 张照片和视频，留在这个家` : "上传家人的合照，慢慢留下故事"}</Text></View><Text style={s.sectionMore}>›</Text></TouchableOpacity>
  <TouchableOpacity style={s.memoryCard} onPress={()=>setScreen("notes")}><View style={[s.memorySymbol,{backgroundColor:"#F3E8D8"}]}><Text style={s.memorySymbolText}>▤</Text></View><View style={{flex:1}}><Text style={s.memoryTitle}>家庭记事</Text><Text style={s.homeHint}>{family.notes?.length?`已有 ${family.notes.length} 条家人的故事` : "把今天值得记住的事写下来"}</Text></View><Text style={s.sectionMore}>›</Text></TouchableOpacity>
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
 if(screen==="welcome")body=<Welcome onStart={()=>setScreen("entry")}/>;
 else if(screen==="entry")body=<FamilyEntry onCreate={()=>setScreen("families")} onJoin={()=>setScreen("families")} onExisting={()=>setScreen("home")}/>;
 else if(screen==="home")body=<Home/>;
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

 return <SafeAreaView style={s.app}>{body}{!["welcome","entry"].includes(screen)&&<Bottom go={setScreen} active={screen}/>}</SafeAreaView>
}
function FamilyCover({family,onPress}){
 const firstPhoto=(family.media||[]).find(m=>m.type!=="video"&&m.uri)?.uri;
 const content=<><View style={s.coverLight}/><View style={s.coverAvatars}>{(family.members||[]).slice(0,5).map((p,i)=><View key={p.id} style={[s.coverAvatar,{marginLeft:i?-12:0,opacity:p.dead?0.55:1}]}><Text style={s.coverAvatarText}>{p.dead?"◌":p.name?.slice(0,1)||"家"}</Text></View>)}</View><Text style={s.coverTitle}>家，是我们一生的牵挂。</Text><Text style={s.coverSub}>在这里，把家人的故事慢慢留下来</Text></>;
 return <TouchableOpacity activeOpacity={.85} onPress={onPress} style={s.cover}>{firstPhoto?<ImageBackground source={{uri:firstPhoto}} style={s.coverPhoto} imageStyle={s.coverPhotoImage}>{content}</ImageBackground>:<View style={s.coverPhoto}>{content}</View>}</TouchableOpacity>
}
function Welcome({onStart}){return <View style={s.welcome}><View style={s.welcomeSky}><Text style={s.welcomeSun}>◯</Text><View style={s.welcomeHouse}><Text style={s.welcomeHouseText}>⌂</Text></View><View style={s.welcomePeople}><Text style={s.welcomePerson}>◉</Text><Text style={s.welcomePerson}>◉</Text><Text style={s.welcomePerson}>◉</Text></View></View><View style={s.welcomeCopy}><Text style={s.welcomeLogo}>家</Text><Text style={s.welcomeTagline}>把家人的故事，留给未来</Text></View><TouchableOpacity style={s.welcomeButton} onPress={onStart}><Text style={s.welcomeButtonText}>开始使用  ›</Text></TouchableOpacity></View>}
function FamilyEntry({onCreate,onJoin,onExisting}){return <ScrollView contentContainerStyle={s.entryPage}><Text style={s.entryWelcome}>欢迎来到「家」</Text><Text style={s.entryHint}>创建或加入一个家庭空间，和家人一起，记录值得珍藏的故事。</Text><View style={s.entryScene}><Text style={s.entrySceneText}>⌂</Text></View><TouchableOpacity style={s.entryCard} onPress={onCreate}><View style={[s.entryIcon,{backgroundColor:"#F8E6CF"}]}><Text style={s.entryIconText}>⌂</Text></View><View style={{flex:1}}><Text style={s.entryTitle}>创建家庭</Text><Text style={s.entryHintSmall}>作为家主，创建一个新的家庭空间</Text></View><Text style={s.sectionMore}>›</Text></TouchableOpacity><TouchableOpacity style={s.entryCard} onPress={onJoin}><View style={[s.entryIcon,{backgroundColor:"#E1EFDF"}]}><Text style={s.entryIconText}>♧</Text></View><View style={{flex:1}}><Text style={s.entryTitle}>加入家庭</Text><Text style={s.entryHintSmall}>从现有家庭列表中选择并切换</Text></View><Text style={s.sectionMore}>›</Text></TouchableOpacity><TouchableOpacity onPress={onExisting} style={s.entryContinue}><Text style={s.entryContinueText}>先看看已有的家庭  ›</Text></TouchableOpacity></ScrollView>}
function AlbumClickable({family,onMedia}){const media=(family.media||[]).filter(x=>x.albumArchived!==false);return <ScrollView contentContainerStyle={s.page}><Text style={s.heroT}>家庭相册</Text><Text style={s.muted}>点击照片可确认“照片里有谁”</Text>{!media.length?<View style={s.info}><Text>还没有家庭照片，点下方＋上传。</Text></View>:media.map(m=><TouchableOpacity key={m.id} style={s.mediaRow} onPress={()=>onMedia(m)}><Text style={s.mediaIcon}>{m.type==="video"?"▶":"▧"}</Text><View><Text>{m.fileName||"家庭照片/视频"}</Text><Text style={s.muted}>{m.peopleConfirmed?`已确认 ${m.personIds.length} 位家人`:"待确认人物"}</Text></View><Text>›</Text></TouchableOpacity>)}</ScrollView>}
function Action({title,onPress}){return <TouchableOpacity onPress={onPress} style={s.action}><Text style={s.actionT}>{title}</Text><Text>›</Text></TouchableOpacity>}
function Bottom({go,active}){return <View style={s.nav}>{[["⌂","首页","home"],["♧","家族","tree"],["＋","","add"],["▧","相册","album"],["◉","我的","private"]].map(([i,t,k])=><TouchableOpacity key={k} onPress={()=>go(k)} style={k==="add"?s.plus:s.navItem}><Text style={k==="add"?s.plusT:[s.navI,active===k&&s.navActive]}>{i}</Text>{t?<Text style={[s.navT,active===k&&s.navActive]}>{t}</Text>:null}</TouchableOpacity>)}</View>}
const s=StyleSheet.create({app:{flex:1,backgroundColor:C.bg},loading:{flex:1,backgroundColor:C.bg,alignItems:"center",justifyContent:"center",gap:10,padding:30},page:{padding:20,paddingBottom:105,backgroundColor:C.bg,minHeight:"100%"},top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:8},family:{fontSize:19,fontWeight:"800",color:C.deep},muted:{fontSize:13,color:C.muted,marginTop:4,lineHeight:20},hero:{backgroundColor:"#F8E1C4",padding:22,borderRadius:24,marginVertical:16},heroT:{fontSize:22,fontWeight:"800",color:C.deep},grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"},tile:{width:"23%",alignItems:"center",marginVertical:13},ico:{fontSize:27,backgroundColor:"#F5DFC3",width:58,height:58,borderRadius:18,textAlign:"center",paddingTop:13,overflow:"hidden"},center:{alignItems:"center",marginVertical:18},bigAvatar:{fontSize:72},back:{fontSize:16,color:C.brown,marginTop:10},action:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:18,padding:17,marginVertical:6,flexDirection:"row",justifyContent:"space-between"},actionT:{fontSize:16,color:C.deep,fontWeight:"600"},info:{backgroundColor:C.card,borderRadius:16,padding:15,marginVertical:10},mediaRow:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:17,padding:14,marginVertical:6,flexDirection:"row",alignItems:"center",gap:12},mediaIcon:{fontSize:28},nav:{position:"absolute",bottom:0,left:0,right:0,height:72,backgroundColor:"#FFF9F0",borderTopWidth:1,borderColor:C.line,flexDirection:"row",alignItems:"center",justifyContent:"space-around"},navItem:{alignItems:"center",width:62},navI:{fontSize:24,color:"#A59587"},navT:{fontSize:11,color:"#A59587"},navActive:{color:C.brown,fontWeight:"800"},plus:{width:52,height:52,borderRadius:26,backgroundColor:C.brown,alignItems:"center",justifyContent:"center",marginBottom:12,elevation:3},plusT:{fontSize:33,color:"#fff"},
 homePage:{paddingHorizontal:18,paddingTop:13,paddingBottom:104,backgroundColor:C.bg},homeTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:15},familyHead:{flexDirection:"row",alignItems:"center",gap:9},familyBadge:{width:36,height:36,borderRadius:18,overflow:"hidden",backgroundColor:"#E6C5A4",textAlign:"center",textAlignVertical:"center",paddingTop:5,fontSize:19,fontWeight:"800",color:C.deep},homeHint:{fontSize:12,color:C.muted,marginTop:4},bell:{width:35,height:35,borderRadius:18,borderWidth:1,borderColor:C.line,alignItems:"center",justifyContent:"center"},bellText:{fontSize:20,color:C.brown},cover:{borderRadius:22,overflow:"hidden",marginBottom:22,backgroundColor:"#C88A5A"},coverPhoto:{height:190,justifyContent:"flex-end",padding:19,backgroundColor:"#BA815B"},coverPhotoImage:{borderRadius:22},coverLight:{position:"absolute",top:-70,right:-50,width:220,height:190,borderRadius:110,backgroundColor:"#E9BB82",opacity:.6},coverAvatars:{flexDirection:"row",marginBottom:10,marginLeft:8},coverAvatar:{width:46,height:46,borderRadius:23,borderColor:"#FFF1DF",borderWidth:2,backgroundColor:"#A55E40",justifyContent:"center",alignItems:"center"},coverAvatarText:{color:"#FFF8EE",fontSize:18,fontWeight:"700"},coverTitle:{color:"#fff",fontSize:20,fontWeight:"800",textShadowColor:"#5D321F",textShadowRadius:4},coverSub:{color:"#FFF3E8",fontSize:12,marginTop:3},quickGrid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"},quickItem:{width:"25%",alignItems:"center",marginBottom:20},quickIcon:{height:55,width:55,borderRadius:18,justifyContent:"center",alignItems:"center",marginBottom:7},quickIconText:{fontSize:25,color:C.brown,fontWeight:"700"},quickLabel:{fontSize:11,color:C.deep,textAlign:"center"},sectionHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:8,marginTop:1},sectionTitle:{fontSize:18,fontWeight:"800",color:C.deep},sectionMore:{fontSize:14,color:C.brown},memoryCard:{flexDirection:"row",gap:11,alignItems:"center",backgroundColor:"#FFFAF3",borderRadius:17,padding:13,marginTop:9,borderWidth:1,borderColor:"#F1E5D7"},memorySymbol:{height:50,width:50,borderRadius:12,backgroundColor:"#E9F0EC",alignItems:"center",justifyContent:"center"},memorySymbolText:{fontSize:24,color:C.brown},memoryTitle:{fontWeight:"700",color:C.deep,fontSize:15},
 welcome:{flex:1,backgroundColor:"#F5E6D0",paddingHorizontal:28,justifyContent:"flex-end",paddingBottom:35},welcomeSky:{position:"absolute",top:0,left:0,right:0,height:"65%",backgroundColor:"#EBCBA5",overflow:"hidden"},welcomeSun:{position:"absolute",top:110,left:25,fontSize:170,color:"#FCE6B7",opacity:.75},welcomeHouse:{position:"absolute",right:-10,bottom:0,width:230,height:240,borderTopLeftRadius:150,backgroundColor:"#B7855A",alignItems:"center",justifyContent:"center"},welcomeHouseText:{fontSize:180,color:"#F6E6D1",opacity:.5},welcomePeople:{position:"absolute",left:20,bottom:5,flexDirection:"row",gap:2},welcomePerson:{fontSize:68,color:"#855A3B"},welcomeCopy:{alignItems:"center",marginBottom:65},welcomeLogo:{fontSize:90,fontWeight:"800",color:C.brown},welcomeTagline:{fontSize:18,letterSpacing:2,color:C.deep,marginTop:6},welcomeButton:{borderRadius:23,padding:17,backgroundColor:C.brown,alignItems:"center"},welcomeButtonText:{color:"#fff",fontWeight:"700",fontSize:18},entryPage:{flexGrow:1,backgroundColor:C.bg,padding:24,paddingTop:35},entryWelcome:{fontSize:27,fontWeight:"800",color:C.deep},entryHint:{fontSize:15,color:C.muted,lineHeight:23,marginTop:10},entryScene:{height:150,alignItems:"center",justifyContent:"center",backgroundColor:"#F3E5D2",marginVertical:24,borderRadius:24},entrySceneText:{fontSize:110,color:"#B98158"},entryCard:{flexDirection:"row",gap:12,alignItems:"center",backgroundColor:"#FFFBF6",padding:14,borderRadius:20,marginBottom:14,borderWidth:1,borderColor:C.line},entryIcon:{width:55,height:55,borderRadius:16,alignItems:"center",justifyContent:"center"},entryIconText:{fontSize:29,color:C.brown},entryTitle:{fontSize:17,fontWeight:"700",color:C.deep},entryHintSmall:{color:C.muted,fontSize:12,marginTop:4},entryContinue:{padding:17,alignItems:"center"},entryContinueText:{color:C.brown,fontWeight:"600"}
});
