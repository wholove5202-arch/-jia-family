import React,{useEffect,useRef,useState} from 'react';
import {View,Text,TouchableOpacity,Modal,StyleSheet,PanResponder,useWindowDimensions,Platform,Animated} from 'react-native';
import XiaojiaArtwork from './XiaojiaArtwork';
import XiaojiaChatScreen from './XiaojiaChatScreen';
export default function XiaojiaAssistant({screen,onGo,family,shouldGreet,onGreetingShown}){
 const {width,height}=useWindowDimensions(),[open,setOpen]=useState(false),[hidden,setHidden]=useState(false),[welcome,setWelcome]=useState(false),[arrival,setArrival]=useState(false);
 const bubbleAnimation=useRef(new Animated.Value(0)).current;
 const dimensions=useRef({width,height}),moved=useRef(false),origin=useRef({x:0,y:0});
 const [greetingHeight,setGreetingHeight]=useState(300);
 const [position,setPosition]=useState({x:width-72,y:height-180}),pos=useRef(position);
 dimensions.current={width,height};
 const bound=(x,y)=>({x:Math.max(8,Math.min(dimensions.current.width-80,x)),y:Math.max(75,Math.min(dimensions.current.height-175,y))});
 const move=p=>{pos.current=p;setPosition(p)};
 useEffect(()=>{move(bound(pos.current.x,pos.current.y))},[width,height]);
 useEffect(()=>{if(screen==='home'&&shouldGreet){setArrival(true);setWelcome(true);setOpen(true);onGreetingShown?.()}},[screen,shouldGreet]);
 useEffect(()=>{setHidden(false);if(screen!=='home'){setOpen(false);setWelcome(false)}},[screen]);
 useEffect(()=>{
  if(!open||!welcome)return;
  bubbleAnimation.setValue(0);
  const animation=Animated.spring(bubbleAnimation,{toValue:1,friction:7,tension:80,useNativeDriver:Platform.OS!=='web'});
  animation.start();
  return()=>animation.stop();
 },[open,welcome,arrival]);
 useEffect(()=>{
  if(!open||!welcome||!arrival)return;
  let fade;
  const timer=setTimeout(()=>{fade=Animated.timing(bubbleAnimation,{toValue:0,duration:180,useNativeDriver:Platform.OS!=='web'});fade.start(({finished})=>{if(finished)setArrival(false)})},2200);
  return()=>{clearTimeout(timer);fade?.stop()};
 },[open,welcome,arrival]);
 const close=()=>{setWelcome(false);setOpen(false)};
 const openChat=()=>{setWelcome(false);setOpen(true)};
 const start=()=>{origin.current=pos.current;moved.current=false};
 const drag=(dx,dy)=>{if(Math.abs(dx)+Math.abs(dy)>6)moved.current=true;if(moved.current)move(bound(origin.current.x+dx,origin.current.y+dy))};
 const finish=()=>{if(moved.current)move(bound(pos.current.x<dimensions.current.width/2?8:dimensions.current.width-80,pos.current.y));else openChat()};
 const pan=useRef(PanResponder.create({onStartShouldSetPanResponder:()=>true,onMoveShouldSetPanResponder:()=>true,onPanResponderGrant:start,onPanResponderMove:(_,g)=>drag(g.dx,g.dy),onPanResponderRelease:finish,onPanResponderTerminate:()=>move(bound(pos.current.x,pos.current.y))})).current;
 const pointer=useRef(null);
 const webDrag={onPointerDown:e=>{if(e.nativeEvent.isPrimary===false||pointer.current)return;pointer.current={id:e.nativeEvent.pointerId,x:e.nativeEvent.clientX,y:e.nativeEvent.clientY};e.currentTarget.setPointerCapture?.(e.nativeEvent.pointerId);start()},onPointerMove:e=>{if(pointer.current&&pointer.current.id===e.nativeEvent.pointerId)drag(e.nativeEvent.clientX-pointer.current.x,e.nativeEvent.clientY-pointer.current.y)},onPointerUp:()=>{if(pointer.current){pointer.current=null;finish()}},onPointerCancel:()=>{pointer.current=null;move(bound(pos.current.x,pos.current.y))}};
 return <>
 {screen==='home'&&hidden&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="显示小家" onPress={()=>setHidden(false)} style={s.restore}><Text style={s.link}>显示小家</Text></TouchableOpacity>}
 {!hidden&&<View style={[s.floating,{left:position.x,top:position.y}]}><View accessibilityRole="button" accessibilityLabel="打开小家浮动窗口" tabIndex={0} onKeyDown={e=>{if(e.nativeEvent.key==='Enter')openChat()}} style={[s.orb,Platform.OS==='web'&&{touchAction:'none',cursor:'grab',userSelect:'none'}]} {...(Platform.OS==='web'?webDrag:pan.panHandlers)}><XiaojiaArtwork width={65}/></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="隐藏小家" onPress={()=>{setHidden(true);close()}} style={s.hide}><Text style={s.link}>×</Text></TouchableOpacity></View>}

 {open&&welcome&&<Animated.View onLayout={e=>setGreetingHeight(e.nativeEvent.layout.height)} style={[s.greetingBubble,{opacity:bubbleAnimation,transform:[{scale:bubbleAnimation.interpolate({inputRange:[0,1],outputRange:[.88,1]})}],width:arrival?Math.min(220,width-24):Math.min(340,width-24),left:Math.max(12,Math.min(width-Math.min(arrival?220:340,width-24)-12,position.x<width/2?position.x:position.x-Math.min(arrival?220:340,width-24)+70)),top:Math.max(80,Math.min(height-greetingHeight-90,position.y-greetingHeight-12))}]}><>{arrival?<View style={s.arrivalBalloon}><Text style={{fontSize:21,fontWeight:"600",color:"#172236"}}>欢迎回家！</Text><View pointerEvents="none" style={[s.bubbleTail,position.x<width/2&&{right:undefined,left:30}]}/></View>:<XiaojiaChatScreen family={family} compact tailSide={position.x<width/2?"left":"right"} onBack={close}/>}</></Animated.View>}
 <Modal visible={open&&!welcome} transparent animationType="fade" onRequestClose={close}><View style={s.backdrop}><View accessibilityViewIsModal style={[s.window,{height:welcome?undefined:'80%'}]}><XiaojiaChatScreen family={family} compact={welcome} onBack={close}/>{!welcome&&<View style={{flexDirection:'row',padding:12,gap:12}}><TouchableOpacity onPress={()=>{close();onGo('lifeInterview')}}><Text style={s.link}>展开聊天</Text></TouchableOpacity><TouchableOpacity onPress={()=>{close();onGo('album')}}><Text style={s.link}>家庭相册</Text></TouchableOpacity></View>}</View></View></Modal>
 </>
}
const s=StyleSheet.create({greetingBubble:{position:'absolute',zIndex:40},arrivalBalloon:{backgroundColor:'#FFFFFF',borderRadius:36,borderWidth:2,borderColor:'#A5CAF0',paddingHorizontal:24,paddingVertical:18,alignItems:'center',shadowColor:'#4D86B9',shadowOpacity:.12,shadowRadius:12,shadowOffset:{width:0,height:4},elevation:4},bubbleTail:{position:'absolute',bottom:-8,right:30,width:18,height:18,backgroundColor:'#FFFFFF',transform:[{rotate:'45deg'}],borderRightWidth:2,borderBottomWidth:2,borderColor:'#A5CAF0'},prompt:{position:'absolute',top:15,width:200,backgroundColor:'#F0F6FF',borderWidth:1,borderColor:'#CBDFF9',borderRadius:24,padding:12},promptText:{fontSize:13,color:'#172236'},floating:{position:'absolute',zIndex:30,width:70,alignItems:'center'},orb:{width:70,height:74,alignItems:'center',justifyContent:'center'},hideButton:{},face:{fontSize:31},hide:{position:'absolute',right:-2,top:-6,padding:6,backgroundColor:'#FFFFFF',borderRadius:16},restore:{position:'absolute',right:12,bottom:86,padding:10,backgroundColor:'#EEF6FC',borderRadius:16},link:{fontSize:15,color:'#287CB8'},backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.18)',justifyContent:'center',alignItems:'center',padding:20},window:{width:'100%',maxWidth:480,maxHeight:'80%',backgroundColor:'#FFFFFF',borderRadius:24,overflow:'hidden'},header:{padding:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:'#EDF0F3'},title:{fontSize:21,fontWeight:'600',color:'#292E30'},close:{padding:8},content:{padding:18,gap:16},greeting:{fontSize:18,lineHeight:28,color:'#292E30'},looks:{flexDirection:'row',flexWrap:'wrap',gap:8},look:{minWidth:75,padding:10,borderRadius:15,alignItems:'center',borderWidth:1,borderColor:'#E5EBEF'},selected:{backgroundColor:'#ECF5FE',borderColor:'#378BCC'},emoji:{fontSize:28},label:{fontSize:13,color:'#292E30',marginTop:6},note:{fontSize:13,lineHeight:21,color:'#6F7E88'},routes:{flexDirection:'row',flexWrap:'wrap',gap:10},route:{paddingVertical:12,paddingHorizontal:15,backgroundColor:'#F1F7FC',borderRadius:14},error:{color:'#B84C45',fontSize:14}});
