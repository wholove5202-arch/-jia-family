import React,{useState,useRef} from 'react';
import {View,Text,TouchableOpacity,ScrollView,StyleSheet} from 'react-native';
import {interviewQuestions} from './lifeInterview';
import {theme} from './theme';

export default function LifeInterviewScreen({record,onSave}){
 const answers=record?.answers||{};
 const [index,setIndex]=useState(()=>{const first=interviewQuestions.findIndex(q=>!answers[q.id]);return first<0?0:first});
 const [review,setReview]=useState(false),[selected,setSelected]=useState(()=>answers[interviewQuestions[index].id]?.optionId||null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const saving=useRef(false),question=interviewQuestions[index];
 const count=interviewQuestions.filter(q=>answers[q.id]&&!['skip','unsure'].includes(answers[q.id].optionId)).length;
 const chooseQuestion=i=>{if(saving.current)return;setIndex(i);setSelected(answers[interviewQuestions[i].id]?.optionId||null);setError('');setReview(false)};
 async function save(remove=false){
  if(saving.current||!remove&&!selected)return;
  saving.current=true;setBusy(true);setError('');
  try{
   await onSave(question.id,remove?null:selected);
   if(remove){setSelected(null);setReview(true)}
   else if(index<interviewQuestions.length-1)chooseNext(index+1);
   else setReview(true);
  }catch(e){setError('保存失败，已选答案仍保留，请重试。')}
  finally{saving.current=false;setBusy(false)}
 }
 function chooseNext(i){setIndex(i);setSelected(answers[interviewQuestions[i].id]?.optionId||null);setError('')}
 return <ScrollView style={s.root} contentContainerStyle={s.page}>
  <Text style={s.title}>让 AI 了解我</Text>
  <Text style={s.intro}>不用写长篇，慢慢留下你的经历和想法。</Text>
  <Text style={s.notice}>目前保存本人回答，尚未接入 AI 分析。回答仅自己查看，未来用于陪伴或影片时再单独授权。</Text>
  <View style={s.progress}><Text style={s.small}>已回答 {count} / {interviewQuestions.length} 题</Text><TouchableOpacity disabled={busy} accessibilityRole="button" accessibilityLabel={review?'继续回答':'查看我的回答'} onPress={()=>{setReview(v=>!v);setError('')}}><Text style={s.link}>{review?'继续回答':'我的回答'}</Text></TouchableOpacity></View>
  {review?<View>{interviewQuestions.map((q,i)=>{const answer=answers[q.id],label=q.options.find(([id])=>id===answer?.optionId)?.[1];return <TouchableOpacity key={q.id} accessibilityRole="button" accessibilityLabel={'修改回答：'+q.text} disabled={busy} onPress={()=>chooseQuestion(i)} style={s.reviewRow}><Text style={s.reviewQuestion}>{q.text}</Text><Text style={s.link}>{label||'尚未回答'}　›</Text></TouchableOpacity>})}</View>:<>
   <Text style={s.topic}>{question.topic} · 第 {index+1} 题</Text><Text accessibilityRole="header" style={s.question}>{question.text}</Text>
   <View style={s.options}>{question.options.map(([id,label])=><TouchableOpacity key={id} accessibilityRole="button" accessibilityLabel={'答案：'+label} accessibilityState={{selected:selected===id,disabled:busy}} disabled={busy} onPress={()=>{setSelected(id);setError('')}} style={[s.option,selected===id&&s.optionSelected]}><Text style={[s.optionText,selected===id&&s.selectedText]}>{label}</Text><Text style={s.check}>{selected===id?'✓':'○'}</Text></TouchableOpacity>)}</View>
   {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="保存并继续" disabled={busy||!selected} onPress={()=>save()} style={[s.save,(busy||!selected)&&{opacity:.5}]}><Text style={s.saveText}>{busy?'保存中…':index===interviewQuestions.length-1?'保存并查看回答':'保存并继续'}</Text></TouchableOpacity>
   <View style={s.tools}>{index>0&&<TouchableOpacity disabled={busy} accessibilityRole="button" accessibilityLabel="上一题" onPress={()=>chooseQuestion(index-1)} style={s.tool}><Text style={s.link}>上一题</Text></TouchableOpacity>}{answers[question.id]&&<TouchableOpacity disabled={busy} accessibilityRole="button" accessibilityLabel="删除这一题的回答" onPress={()=>save(true)} style={s.tool}><Text style={s.small}>删除此回答</Text></TouchableOpacity>}</View>
   <Text style={s.small}>不确定或暂时不答都可以；每个答案随时可修改。选项不能代表一个人的全部。</Text>
  </>}
 </ScrollView>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#FFFFFF'},page:{padding:22,paddingBottom:110,width:'100%',maxWidth:600,alignSelf:'center'},title:{fontSize:25,lineHeight:34,fontWeight:'600',color:theme.deep},intro:{fontSize:15,lineHeight:24,color:theme.muted,marginTop:8},notice:{fontSize:12,lineHeight:20,color:'#81928A',marginTop:14},progress:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:22,marginBottom:22},small:{fontSize:12,lineHeight:21,color:theme.muted},link:{fontSize:14,lineHeight:24,color:'#398ACA'},topic:{fontSize:12,lineHeight:20,color:'#789685',marginBottom:9},question:{fontSize:22,lineHeight:33,fontWeight:'600',color:theme.deep,marginBottom:20},options:{gap:10},option:{minHeight:52,paddingHorizontal:16,paddingVertical:13,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderRadius:15,borderWidth:1,borderColor:'#E5EBE7',backgroundColor:'#FAFCFA'},optionSelected:{backgroundColor:'#EAF4ED',borderColor:'#AAC8B2'},optionText:{fontSize:16,lineHeight:25,color:theme.deep,flex:1},selectedText:{color:'#39714C',fontWeight:'600'},check:{color:'#739982',fontSize:18,paddingLeft:12},save:{marginTop:24,minHeight:48,padding:12,borderRadius:16,backgroundColor:theme.brown,alignItems:'center',justifyContent:'center'},saveText:{color:'#FFFFFF',fontSize:15,fontWeight:'600'},tools:{flexDirection:'row',justifyContent:'space-between',marginVertical:12},tool:{paddingVertical:10},error:{fontSize:13,lineHeight:21,color:'#B84C45',marginTop:14},reviewRow:{paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#EEF1EE',gap:8},reviewQuestion:{fontSize:16,lineHeight:25,color:theme.deep}});
