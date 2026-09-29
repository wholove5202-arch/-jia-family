
import {useEffect,useRef,useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {migrateState,validateState} from "./stateMigration";

const KEY="jia_phase1_integrated_v1";
export function usePhase1Persistence(defaultState){
 const [state,setState]=useState(defaultState),[ready,setReady]=useState(false);
 const loaded=useRef(false);
 useEffect(()=>{(async()=>{
   try{
    const raw=await AsyncStorage.getItem(KEY);
    if(raw){
      const next=migrateState(JSON.parse(raw));
      if(validateState(next).ok) setState({...defaultState,...next});
    }
   }finally{loaded.current=true;setReady(true)}
 })()},[]);
 useEffect(()=>{if(!loaded.current)return;AsyncStorage.setItem(KEY,JSON.stringify({...state,schemaVersion:3}))},[state]);
 return [state,setState,ready];
}
