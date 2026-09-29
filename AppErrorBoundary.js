
import React from "react";
import {SafeAreaView,Text,View,StyleSheet} from "react-native";
export default class AppErrorBoundary extends React.Component{
 state={error:null};
 static getDerivedStateFromError(error){return {error};}
 componentDidCatch(error,info){console.error("JIA_APP_ERROR",error,info);}
 render(){
  if(!this.state.error)return this.props.children;
  return <SafeAreaView style={s.page}><View style={s.card}><Text style={s.title}>「家」启动时遇到问题</Text>
   <Text style={s.body}>数据不会因此自动删除。请保留此页面并记录下面的信息，方便修复。</Text>
   <Text selectable style={s.err}>{String(this.state.error?.message||this.state.error)}</Text></View></SafeAreaView>
 }
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:"#FBF4E9",justifyContent:"center",padding:22},card:{backgroundColor:"#FFFAF2",padding:20,borderRadius:20},title:{fontSize:21,fontWeight:"800",color:"#5D321F"},body:{marginTop:10,lineHeight:21,color:"#8F7B6E"},err:{marginTop:14,fontSize:12,color:"#5D321F"}});
