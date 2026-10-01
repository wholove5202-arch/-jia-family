import {useEffect,useState} from 'react';
import {Platform} from 'react-native';

export function amplitudeLevel(samples){
 if(!samples.length)return 0;
 let sum=0;for(const sample of samples){const n=(sample-128)/128;sum+=n*n}
 return Math.min(1,Math.sqrt(sum/samples.length)*7);
}
export function meteringLevel(db){
 return Number.isFinite(db)?Math.min(1,Math.pow(10,db/20)*7):0;
}
export default function useVoiceWaveform(recording,metering){
 const [bars,setBars]=useState(Array(29).fill(4));
 useEffect(()=>{
  if(Platform.OS==='web'||!recording)return;
  const level=meteringLevel(metering);
  setBars(prev=>[...prev.slice(1),4+level*58]);
 },[recording,metering]);
 useEffect(()=>{
  if(!recording||Platform.OS!=='web')return;
  let active=true,microphone,context,source,timer;
  const cleanup=()=>{clearInterval(timer);source?.disconnect();microphone?.getTracks().forEach(t=>t.stop());context?.close().catch(()=>{})};
  (async()=>{
   const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
   microphone=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!active){cleanup();return}
   context=new AudioContext();await context.resume();
   if(!active){cleanup();return}
   source=context.createMediaStreamSource(microphone);
   const analyser=context.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.1;source.connect(analyser);
   const samples=new Uint8Array(analyser.fftSize);
   timer=setInterval(()=>{if(!active)return;analyser.getByteTimeDomainData(samples);const level=amplitudeLevel(samples);setBars(prev=>[...prev.slice(1),4+level*58])},60);
  })().catch(()=>{cleanup()});
  return()=>{active=false;cleanup()};
 },[recording]);
 return bars;
}
