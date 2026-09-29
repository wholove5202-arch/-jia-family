
import {useEffect} from "react";
import {BackHandler,Platform} from "react-native";

export function useAndroidBack(screen,setScreen){
 useEffect(()=>{
  if(Platform.OS!=="android")return;
  const sub=BackHandler.addEventListener("hardwareBackPress",()=>{
   if(screen==="home")return false;
   setScreen("home");
   return true;
  });
  return ()=>sub.remove();
 },[screen,setScreen]);
}
export const platformLabel=Platform.OS==="ios"?"iPhone":"Android";
