
import {useEffect,useRef,useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {migrateSeedAncestor} from './familyDataMigration';
import {readPrivate,writePrivate} from './securePrivateStorage';
const PUB="jia_phase1_public_v4", PRIV="jia_phase1_private_v4";

export function useSeparatedPersistence(defaultPublic,defaultPrivate){
 const [pub,setPub]=useState(defaultPublic),[privState,setPrivState]=useState({...defaultPrivate,aiAllowed:false}),[ready,setReady]=useState(false),[error,setError]=useState(null);
 const privRef=useRef({...defaultPrivate,aiAllowed:false}),lastWritten=useRef(null);
 const setPriv=updater=>{const next={...(typeof updater==='function'?updater(privRef.current):updater),aiAllowed:false};privRef.current=next;setPrivState(next)};
 const priv=privState;
 const loaded=useRef(false),queue=useRef(Promise.resolve());
 const enqueue=work=>{const task=queue.current.then(work);queue.current=task.catch(()=>{});return task};
 const saveFutureItem=item=>enqueue(async()=>{
  const next={...privRef.current,futureLetters:[item,...(privRef.current.futureLetters||[])],aiAllowed:false},serialized=JSON.stringify(next);
  await writePrivate(PRIV,serialized);lastWritten.current=serialized;setPriv(next);
 });
 useEffect(()=>{(async()=>{
  try{
   const [a,b]=await Promise.all([AsyncStorage.getItem(PUB),readPrivate(PRIV)]);
   if(a)setPub(migrateSeedAncestor({...defaultPublic,...JSON.parse(a)}));
   if(b)setPriv({...defaultPrivate,...JSON.parse(b),aiAllowed:false});
  }catch(e){setError(e.message);}finally{loaded.current=true;setReady(true)}
 })()},[]);
 useEffect(()=>{if(loaded.current&&!error)AsyncStorage.setItem(PUB,JSON.stringify(pub)).catch(e=>setError(e.message))},[pub]);
 useEffect(()=>{if(loaded.current&&!error){const serialized=JSON.stringify({...priv,aiAllowed:false});if(lastWritten.current!==serialized)enqueue(async()=>{if(lastWritten.current===serialized)return;await writePrivate(PRIV,serialized);lastWritten.current=serialized}).catch(e=>setError(e.message))}},[priv]);
 return {pub,setPub,priv,setPriv,saveFutureItem,ready,error};
}

