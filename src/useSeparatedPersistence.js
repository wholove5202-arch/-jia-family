
import {useEffect,useRef,useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {migrateSeedAncestor} from './familyDataMigration';
import {readPrivate,writePrivate} from './securePrivateStorage';
import {updateFutureSettings} from './futureItemSettings';
const PUB="jia_phase1_public_v4", PRIV="jia_phase1_private_v4";

export function useSeparatedPersistence(defaultPublic,defaultPrivate){
 const [pub,setPubState]=useState(defaultPublic),[privState,setPrivState]=useState({...defaultPrivate,aiAllowed:false}),[ready,setReady]=useState(false),[error,setError]=useState(null);
 const pubRef=useRef(defaultPublic),publicQueue=useRef(Promise.resolve()),lastPublicWritten=useRef(null);
 const setPub=updater=>{const next=typeof updater==='function'?updater(pubRef.current):updater;pubRef.current=next;setPubState(next)};
 const savePublic=updater=>{const task=publicQueue.current.then(async()=>{for(;;){const baseline=pubRef.current,next=updater(baseline),serialized=JSON.stringify(next);await AsyncStorage.setItem(PUB,serialized);lastPublicWritten.current=serialized;if(pubRef.current!==baseline)continue;setPub(next);break}});publicQueue.current=task.catch(()=>{});return task};
 const privRef=useRef({...defaultPrivate,aiAllowed:false}),lastWritten=useRef(null);
 const setPriv=updater=>{const next={...(typeof updater==='function'?updater(privRef.current):updater),aiAllowed:false};privRef.current=next;setPrivState(next)};
 const priv=privState;
 const loaded=useRef(false),queue=useRef(Promise.resolve());
 const enqueue=work=>{const task=queue.current.then(work);queue.current=task.catch(()=>{});return task};
 const saveFutureItem=item=>enqueue(async()=>{
  const next={...privRef.current,futureLetters:[item,...(privRef.current.futureLetters||[])],aiAllowed:false},serialized=JSON.stringify(next);
  await writePrivate(PRIV,serialized);lastWritten.current=serialized;setPriv(next);
 });
 const updateFutureItem=(id,settings)=>enqueue(async()=>{
  const next={...privRef.current,futureLetters:updateFutureSettings(privRef.current.futureLetters||[],id,settings),aiAllowed:false},serialized=JSON.stringify(next);
  await writePrivate(PRIV,serialized);lastWritten.current=serialized;setPriv(next);
 });
 useEffect(()=>{(async()=>{
  try{
   const [a,b]=await Promise.all([AsyncStorage.getItem(PUB),readPrivate(PRIV)]);
   if(a)setPub(migrateSeedAncestor({...defaultPublic,...JSON.parse(a)}));
   if(b)setPriv({...defaultPrivate,...JSON.parse(b),aiAllowed:false});
  }catch(e){setError(e.message);}finally{loaded.current=true;setReady(true)}
 })()},[]);
 useEffect(()=>{if(loaded.current&&!error){const task=publicQueue.current.then(async()=>{const serialized=JSON.stringify(pubRef.current);if(lastPublicWritten.current===serialized)return;await AsyncStorage.setItem(PUB,serialized);lastPublicWritten.current=serialized});publicQueue.current=task.catch(()=>{});task.catch(e=>setError(e.message))}},[pub]);
 useEffect(()=>{if(loaded.current&&!error){const serialized=JSON.stringify({...priv,aiAllowed:false});if(lastWritten.current!==serialized)enqueue(async()=>{if(lastWritten.current===serialized)return;await writePrivate(PRIV,serialized);lastWritten.current=serialized}).catch(e=>setError(e.message))}},[priv]);
 return {pub,setPub,savePublic,priv,setPriv,saveFutureItem,updateFutureItem,ready,error};
}

