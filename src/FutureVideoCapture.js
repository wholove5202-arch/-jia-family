import React,{useEffect,useRef,useState} from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Platform} from 'react-native';
import {VideoView,useVideoPlayer} from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import {File,Paths} from 'expo-file-system';
import {AudioModule} from 'expo-audio';

export function blobToVideoData(blob){
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('未能读取视频'));reader.readAsDataURL(blob)});
}
export async function keepVideoAsset(asset){
 if(Platform.OS==='web'){
  if(asset.uri.startsWith('data:'))return asset.uri;
  const response=await fetch(asset.uri);
  if(!response.ok)throw new Error('未能读取视频');
  return blobToVideoData(await response.blob());
 }
 const ext=(asset.fileName||asset.uri).split('.').pop()?.split('?')[0]||'mp4';
 const destination=new File(Paths.document,'future_video_'+Date.now()+'.'+ext);
 new File(asset.uri).copy(destination);
 return destination.uri;
}
function NativeReplay({uri}){
 const player=useVideoPlayer(uri);
 return <VideoView player={player} nativeControls contentFit="contain" style={s.preview}/>;
}
export function VideoReplay({uri}){
 if(!uri)return null;
 return Platform.OS==='web'?<video src={uri} controls playsInline preload="metadata" style={{width:'100%',height:'100%',objectFit:'contain',background:'#171717'}}/>:<NativeReplay uri={uri}/>;
}
export default function FutureVideoCapture({uri,onChange,onRecordingChange}){
 const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[seconds,setSeconds]=useState(0),[error,setError]=useState('');
 const stream=useRef(null),mediaRecorder=useRef(null),preview=useRef(null),mounted=useRef(true),onChangeRef=useRef(onChange),statusRef=useRef(onRecordingChange);
 onChangeRef.current=onChange;statusRef.current=onRecordingChange;
 const release=()=>{stream.current?.getTracks().forEach(track=>track.stop());stream.current=null};
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;const r=mediaRecorder.current;if(r&&r.state!=='inactive')r.stop();release();statusRef.current?.(false)}},[]);
 useEffect(()=>{statusRef.current?.(recording||busy)},[recording,busy]);
 useEffect(()=>{if(!recording)return;setSeconds(0);const clock=setInterval(()=>setSeconds(n=>n+1),1000);return()=>clearInterval(clock)},[recording]);
 useEffect(()=>{if(preview.current&&stream.current){preview.current.srcObject=stream.current;preview.current.play().catch(()=>{})}},[recording]);
 async function capture(){
  if(busy)return;
  if(recording){mediaRecorder.current?.stop();return;}
  setError('');setBusy(true);
  try{
   if(Platform.OS!=='web'){
    const permission=await ImagePicker.requestCameraPermissionsAsync();
    const microphone=await AudioModule.requestRecordingPermissionsAsync();
    if(!permission.granted||!microphone.granted)throw new Error('请允许相机和麦克风权限后再拍摄');
    const result=await ImagePicker.launchCameraAsync({mediaTypes:['videos'],quality:1,videoQuality:1});
    if(!result.canceled&&result.assets?.[0])onChangeRef.current(await keepVideoAsset(result.assets[0]));
    return;
   }
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('当前浏览器无法录制，请用 Safari 打开此页面');
   const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:true});
   if(!mounted.current){acquired.getTracks().forEach(t=>t.stop());return;}
   stream.current=acquired;
   const type=['video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
   const recorder=new MediaRecorder(acquired,{...(type?{mimeType:type}:{}),videoBitsPerSecond:1000000});
   mediaRecorder.current=recorder;
   const chunks=[];
   recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
   recorder.onerror=()=>{release();if(mounted.current){setRecording(false);setBusy(false);setError('录制未完成，请重新拍摄')}};
   recorder.onstop=async()=>{
    release();if(!mounted.current)return;
    setRecording(false);setBusy(true);
    try{
     if(!chunks.length)throw new Error('没有录到视频，请重新拍摄');
     const data=await blobToVideoData(new Blob(chunks,{type:recorder.mimeType||type||'video/mp4'}));
     if(mounted.current)onChangeRef.current(data);
    }catch(e){if(mounted.current)setError(e.message)}
    finally{if(mounted.current)setBusy(false)}
   };
   recorder.start(1000);setRecording(true);
  }catch(e){release();if(mounted.current)setError(e.name==='NotAllowedError'?'请允许相机和麦克风权限后再拍摄':e.message)}
  finally{if(mounted.current)setBusy(false)}
 }
 async function album(){
  if(recording||busy)return;
  setBusy(true);setError('');
  try{
   const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
   if(!permission.granted)throw new Error('请允许相册权限');
   const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['videos'],quality:1});
   if(!result.canceled&&result.assets?.[0]){const data=await keepVideoAsset(result.assets[0]);if(mounted.current)onChangeRef.current(data)}
  }catch(e){if(mounted.current)setError(e.message)}
  finally{if(mounted.current)setBusy(false)}
 }
 const time=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 return <View style={s.container}><View style={s.frame}>{recording&&Platform.OS==='web'?<video ref={preview} muted autoPlay playsInline style={{width:'100%',height:'100%',objectFit:'contain'}}/>:uri?<VideoReplay uri={uri}/>:<View style={s.empty}><Text style={s.emptyTitle}>留下这一刻</Text><Text style={s.hint}>轻触红色按钮，拍摄一段视频</Text></View>}</View><View style={s.controls}><TouchableOpacity disabled={recording||busy} onPress={album} style={s.side}><Text style={s.controlText}>相册</Text></TouchableOpacity><View style={s.recordCenter}><TouchableOpacity accessibilityLabel={recording?'停止录制':uri?'重新拍摄':'开始拍摄'} disabled={busy} onPress={capture} style={[s.recordRing,busy&&{opacity:.4}]}><View style={[s.recordDot,recording&&s.stopSquare]}/></TouchableOpacity><Text style={s.caption}>{recording?time:busy?'处理中…':uri?'重拍':'拍摄'}</Text></View><View style={s.side}><Text style={s.hint}>{uri&&!recording?'可回放':''}</Text></View></View>{error?<Text style={s.error}>{error}</Text>:null}</View>
}
const s=StyleSheet.create({
 container:{flex:1,paddingTop:12},frame:{flex:1,minHeight:180,backgroundColor:'#171717',borderRadius:16,overflow:'hidden'},preview:{width:'100%',height:'100%'},empty:{flex:1,justifyContent:'center',alignItems:'center',gap:8},emptyTitle:{fontSize:18,color:'#fff',fontWeight:'600'},hint:{fontSize:12,color:'#999'},controls:{height:112,flexDirection:'row',alignItems:'center',justifyContent:'space-around'},side:{width:65,alignItems:'center',paddingVertical:12},controlText:{fontSize:14,color:'#333'},recordCenter:{alignItems:'center',gap:5},recordRing:{width:60,height:60,borderRadius:30,borderWidth:3,borderColor:'#BDBDBD',alignItems:'center',justifyContent:'center'},recordDot:{width:46,height:46,borderRadius:23,backgroundColor:'#FF3B30'},stopSquare:{width:24,height:24,borderRadius:5},caption:{fontSize:12,color:'#666'},error:{fontSize:12,lineHeight:18,color:'#B8332B',textAlign:'center',paddingBottom:8}
});
