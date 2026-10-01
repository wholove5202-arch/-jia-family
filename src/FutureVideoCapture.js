import React,{useEffect,useRef,useState} from 'react';
import {View,Text,TouchableOpacity,StyleSheet,Platform} from 'react-native';
import {VideoView,useVideoPlayer} from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import {File,Paths} from 'expo-file-system';
import {AudioModule} from 'expo-audio';

export function blobToVideoData(blob){
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('未能读取视频'));reader.readAsDataURL(new Blob([blob],{type:blob.type.split(';')[0]||'video/mp4'}))});
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
function NativeReplay({uri,autoReplay=false}){
 const player=useVideoPlayer(uri,p=>{p.loop=autoReplay;if(autoReplay)p.play()});
 return <VideoView player={player} nativeControls contentFit="contain" style={s.preview}/>;
}
export function videoDataBlob(uri){
 const base64=uri.indexOf(';base64,'),comma=base64>=0?base64+7:uri.indexOf(','),header=uri.slice(0,comma),encoded=uri.slice(comma+1);
 if(comma<0)throw new Error('Invalid video data');
 const bytes=header.includes(';base64')?atob(encoded):decodeURIComponent(encoded);
 const content=new Uint8Array(bytes.length);
 for(let i=0;i<bytes.length;i++)content[i]=bytes.charCodeAt(i);
 return new Blob([content],{type:header.slice(5).split(';')[0]||'video/mp4'});
}
function WebReplay({uri,autoReplay=false}){
 const videoRef=useRef(null),[source,setSource]=useState(''),[playing,setPlaying]=useState(false),[error,setError]=useState(''),[muted,setMuted]=useState(false);
 useEffect(()=>{
  setError('');setPlaying(false);
  let objectUrl;
  try{objectUrl=uri.startsWith('data:')?URL.createObjectURL(videoDataBlob(uri)):null;setSource(objectUrl||uri)}
  catch(e){setError('视频未能读取，请重新选择或拍摄')}
  return()=>{if(objectUrl)URL.revokeObjectURL(objectUrl)};
 },[uri]);
 async function beginReplay(){
  if(!autoReplay)return;
  const element=videoRef.current;if(!element)return;
  try{await element.play()}catch(e){element.muted=true;setMuted(true);element.play().catch(()=>{})}
 }
 async function play(){
  const element=videoRef.current;if(!element)return;
  setError('');
  try{element.srcObject=null;element.muted=false;setMuted(false);if(element.ended)element.currentTime=0;await element.play()}
  catch(e){setError('未能播放，请再点一次播放')}
 }
 return <View style={s.replayContainer}>{source?<video key={source} ref={videoRef} src={source} controls playsInline autoPlay={autoReplay} loop={autoReplay} muted={muted} onLoadedData={beginReplay} preload="auto" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError('这段视频暂时无法播放，请重新拍摄或从相册选择')} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',background:'#171717'}}/>:null}{muted?<TouchableOpacity accessibilityLabel="开启回放声音" onPress={play} style={s.soundButton}><Text style={s.replayText}>开启声音</Text></TouchableOpacity>:null}{!playing&&!error?<TouchableOpacity accessibilityLabel="播放视频" onPress={play} style={s.playOverlay}><Text style={s.playGlyph}>▶</Text><Text style={s.replayText}>播放</Text></TouchableOpacity>:null}{error?<Text style={s.replayError}>{error}</Text>:null}</View>
}
export function VideoReplay({uri,autoReplay=false}){
 if(!uri)return null;
 return Platform.OS==='web'?<WebReplay uri={uri} autoReplay={autoReplay}/>:<NativeReplay uri={uri} autoReplay={autoReplay}/>;
}
export async function createSwitchableRecording(cameraStream){
 const video=document.createElement('video');
 video.muted=true;video.playsInline=true;video.srcObject=cameraStream;
 await video.play();
 const canvas=document.createElement('canvas');
 canvas.width=video.videoWidth||720;canvas.height=video.videoHeight||1280;
 if(!canvas.captureStream){return {stream:cameraStream,canSwitch:false,dispose:()=>{video.pause();video.srcObject=null}}}
 const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('未能初始化拍摄画面');
 let frame=0,disposed=false;
 const draw=()=>{if(disposed)return;if(video.readyState>=2){ctx.drawImage(video,0,0,canvas.width,canvas.height)}frame=requestAnimationFrame(draw)};
 draw();
 const captured=canvas.captureStream(30);
 const recordingStream=new MediaStream([...captured.getVideoTracks(),...cameraStream.getAudioTracks()]);
 return {stream:recordingStream,canSwitch:true,change:async next=>{video.srcObject=next;await video.play()},dispose:()=>{disposed=true;cancelAnimationFrame(frame);video.pause();video.srcObject=null;captured.getTracks().forEach(t=>t.stop())}};
}

export default function FutureVideoCapture({uri,onChange,onRecordingChange}){
 const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[seconds,setSeconds]=useState(0),[error,setError]=useState(''),[facing,setFacing]=useState('environment'),[cameraReady,setCameraReady]=useState(0),[canSwitch,setCanSwitch]=useState(true);
 const pipelineRef=useRef(null),stream=useRef(null),mediaRecorder=useRef(null),preview=useRef(null),mounted=useRef(true),onChangeRef=useRef(onChange),statusRef=useRef(onRecordingChange);
 onChangeRef.current=onChange;statusRef.current=onRecordingChange;
 const release=()=>{pipelineRef.current?.dispose();pipelineRef.current=null;stream.current?.getTracks().forEach(track=>track.stop());stream.current=null};
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;const r=mediaRecorder.current;if(r&&r.state!=='inactive')r.stop();release();statusRef.current?.(false)}},[]);
 useEffect(()=>{statusRef.current?.(recording||busy)},[recording,busy]);
 useEffect(()=>{if(!recording)return;setSeconds(0);const clock=setInterval(()=>setSeconds(n=>n+1),1000);return()=>clearInterval(clock)},[recording]);
 useEffect(()=>{if(preview.current&&stream.current){preview.current.srcObject=stream.current;preview.current.play().catch(()=>{})}},[recording,cameraReady]);
 async function openCamera(direction,keepAudio=false){
  const audio=keepAudio?(stream.current?.getAudioTracks()||[]):[];
  if(keepAudio)stream.current?.getVideoTracks().forEach(t=>t.stop());else release();
  const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:direction},width:{ideal:1280},height:{ideal:720}},audio:!keepAudio});
  if(!mounted.current){acquired.getTracks().forEach(t=>t.stop());return null;}
  const next=keepAudio?new MediaStream([...acquired.getVideoTracks(),...audio]):acquired;
  stream.current=next;
  if(keepAudio)await pipelineRef.current?.change(next);
  setCameraReady(n=>n+1);return next;
 }
 async function switchCamera(){
  if(busy)return;
  if(recording&&!canSwitch){setError('当前浏览器暂不支持录制中切换，请停止录制后切换');return}
  const next=facing==='environment'?'user':'environment';
  setError('');setBusy(true);
  try{if(Platform.OS==='web'&&(!uri||recording))await openCamera(next,recording);setFacing(next)}
  catch(e){
   if(recording){try{await openCamera(facing,true)}catch(restoreError){mediaRecorder.current?.stop()}}
   else setCameraReady(0);
   setError('未能切换摄像头，请再试一次');
  }
  finally{if(mounted.current)setBusy(false)}
 }
 async function capture(){
  if(busy)return;
  if(recording){mediaRecorder.current?.stop();return;}
  setError('');setBusy(true);
  try{
   if(Platform.OS!=='web'){
    const permission=await ImagePicker.requestCameraPermissionsAsync();
    const microphone=await AudioModule.requestRecordingPermissionsAsync();
    if(!permission.granted||!microphone.granted)throw new Error('请允许相机和麦克风权限后再拍摄');
    const result=await ImagePicker.launchCameraAsync({mediaTypes:['videos'],quality:1,videoQuality:1,cameraType:facing==='user'?'front':'back'});
    if(!result.canceled&&result.assets?.[0])onChangeRef.current(await keepVideoAsset(result.assets[0]));
    return;
   }
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('当前浏览器无法录制，请用 Safari 打开此页面');
   const acquired=stream.current||await openCamera(facing);
   if(!acquired)return;
   const type=['video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
   const pipeline=await createSwitchableRecording(acquired);
   pipelineRef.current=pipeline;setCanSwitch(pipeline.canSwitch);
   const recorder=new MediaRecorder(pipeline.stream,{...(type?{mimeType:type}:{}),videoBitsPerSecond:1000000});
   mediaRecorder.current=recorder;
   const chunks=[];
   recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
   recorder.onerror=()=>{release();if(mounted.current){setRecording(false);setBusy(false);setError('录制未完成，请重新拍摄')}};
   recorder.onstop=async()=>{
    release();if(!mounted.current)return;
    setCameraReady(0);setRecording(false);setBusy(true);
    try{
     if(!chunks.length)throw new Error('没有录到视频，请重新拍摄');
     const data=await blobToVideoData(new Blob(chunks,{type:recorder.mimeType||type||'video/mp4'}));
     if(mounted.current)onChangeRef.current(data);
    }catch(e){if(mounted.current)setError(e.message)}
    finally{if(mounted.current)setBusy(false)}
   };
   recorder.start();setRecording(true);
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
 return <View style={s.container}><View style={s.frame}>{(recording||(!uri&&cameraReady>0))&&Platform.OS==='web'?<video key="camera-preview" ref={preview} muted autoPlay playsInline style={{width:'100%',height:'100%',objectFit:'cover',transform:facing==='user'?'scaleX(-1)':'none'}}/>:uri?<VideoReplay uri={uri} autoReplay/>:<View style={s.empty}><Text style={s.emptyTitle}>留下这一刻</Text><Text style={s.hint}>轻触红色按钮，拍摄一段视频</Text></View>}</View><View style={s.controls}><TouchableOpacity disabled={recording||busy} onPress={album} style={s.side}><Text style={s.controlText}>相册</Text></TouchableOpacity><View style={s.recordCenter}><TouchableOpacity accessibilityLabel={recording?'停止录制':uri?'重新拍摄':'开始拍摄'} disabled={busy} onPress={capture} style={[s.recordRing,busy&&{opacity:.4}]}><View style={[s.recordDot,recording&&s.stopSquare]}/></TouchableOpacity><Text style={s.caption}>{recording?time:busy?'处理中…':uri?'重拍':'拍摄'}</Text></View><TouchableOpacity accessibilityLabel={facing==='environment'?'切换自拍摄像头':'切换后置摄像头'} disabled={busy} onPress={switchCamera} style={[s.side,busy&&{opacity:.35}]}><Text style={s.switchGlyph}>⟳</Text></TouchableOpacity></View>{error?<Text style={s.error}>{error}</Text>:null}</View>
}
const s=StyleSheet.create({
 switchGlyph:{fontSize:38,color:'#333'},soundButton:{position:'absolute',top:12,right:12,padding:8,borderRadius:10,backgroundColor:'rgba(0,0,0,.55)'},replayContainer:{flex:1,width:'100%',height:'100%',position:'relative'},playOverlay:{position:'absolute',top:'42%',alignSelf:'center',padding:14,borderRadius:14,backgroundColor:'rgba(0,0,0,.5)',alignItems:'center'},playGlyph:{fontSize:30,color:'#fff'},replayText:{fontSize:14,color:'#fff',marginTop:3},replayError:{position:'absolute',top:'44%',left:18,right:18,color:'#fff',fontSize:14,textAlign:'center'},container:{flex:1,paddingTop:8},frame:{flex:1,minHeight:180,backgroundColor:'#171717',borderRadius:16,overflow:'hidden'},preview:{width:'100%',height:'100%'},empty:{flex:1,justifyContent:'center',alignItems:'center',gap:8},emptyTitle:{fontSize:18,color:'#fff',fontWeight:'600'},hint:{fontSize:12,color:'#999'},controls:{height:112,flexDirection:'row',alignItems:'center',justifyContent:'space-around'},side:{width:78,alignItems:'center',paddingVertical:12},controlText:{fontSize:18,fontWeight:'500',color:'#333'},recordCenter:{alignItems:'center',gap:5},recordRing:{width:60,height:60,borderRadius:30,borderWidth:3,borderColor:'#BDBDBD',alignItems:'center',justifyContent:'center'},recordDot:{width:46,height:46,borderRadius:23,backgroundColor:'#FF3B30'},stopSquare:{width:24,height:24,borderRadius:5},caption:{fontSize:12,color:'#666'},error:{fontSize:12,lineHeight:18,color:'#B8332B',textAlign:'center',paddingBottom:8}
});
