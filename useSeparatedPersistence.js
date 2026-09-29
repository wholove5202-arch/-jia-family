
import {useEffect,useRef,useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
const PUB="jia_phase1_public_v4", PRIV="jia_phase1_private_v4";

export function useSeparatedPersistence(defaultPublic,defaultPrivate){
 const [pub,setPub]=useState(defaultPublic),[privState,setPrivState]=useState({...defaultPrivate,aiAllowed:false}),[ready,setReady]=useState(false);
 const setPriv=updater=>setPrivState(prev=>{const next=typeof updater==="function"?updater(prev):updater;return {...next,aiAllowed:false};});
 const priv=privState;
 const loaded=useRef(false);
 useEffect(()=>{(async()=>{
  try{
   const [a,b]=await Promise.all([AsyncStorage.getItem(PUB),AsyncStorage.getItem(PRIV)]);
   if(a)setPub({...defaultPublic,...JSON.parse(a)});
   if(b)setPriv({...defaultPrivate,...JSON.parse(b),aiAllowed:false});
  }finally{loaded.current=true;setReady(true)}
 })()},[]);
 useEffect(()=>{if(loaded.current)AsyncStorage.setItem(PUB,JSON.stringify(pub))},[pub]);
 useEffect(()=>{if(loaded.current)AsyncStorage.setItem(PRIV,JSON.stringify({...priv,aiAllowed:false}))},[priv]);
 return {pub,setPub,priv,setPriv,ready};
}
