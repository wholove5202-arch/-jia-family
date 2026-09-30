
import {useEffect,useRef,useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {readPrivate,writePrivate} from './securePrivateStorage';
const PUB="jia_phase1_public_v4", PRIV="jia_phase1_private_v4";

export function useSeparatedPersistence(defaultPublic,defaultPrivate){
 const [pub,setPub]=useState(defaultPublic),[privState,setPrivState]=useState({...defaultPrivate,aiAllowed:false}),[ready,setReady]=useState(false),[error,setError]=useState(null);
 const setPriv=updater=>setPrivState(prev=>{const next=typeof updater==="function"?updater(prev):updater;return {...next,aiAllowed:false};});
 const priv=privState;
 const loaded=useRef(false),queue=useRef(Promise.resolve());
 useEffect(()=>{(async()=>{
  try{
   const [a,b]=await Promise.all([AsyncStorage.getItem(PUB),readPrivate(PRIV)]);
   if(a)setPub({...defaultPublic,...JSON.parse(a)});
   if(b)setPriv({...defaultPrivate,...JSON.parse(b),aiAllowed:false});
  }catch(e){setError(e.message);}finally{loaded.current=true;setReady(true)}
 })()},[]);
 useEffect(()=>{if(loaded.current&&!error)AsyncStorage.setItem(PUB,JSON.stringify(pub)).catch(e=>setError(e.message))},[pub]);
 useEffect(()=>{if(loaded.current&&!error)queue.current=queue.current.then(()=>writePrivate(PRIV,JSON.stringify({...priv,aiAllowed:false}))).catch(e=>setError(e.message))},[priv]);
 return {pub,setPub,priv,setPriv,ready,error};
}
