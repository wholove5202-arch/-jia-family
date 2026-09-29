
import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS={
  PUBLIC:"jia_public_v2",
  PRIVATE:"jia_private_v2"
};

export async function loadPublic(){
  const raw=await AsyncStorage.getItem(KEYS.PUBLIC);
  return raw?JSON.parse(raw):{families:[],activeFamilyId:null,deathCases:[],avatarHistory:[]};
}
export async function savePublic(data){
  await AsyncStorage.setItem(KEYS.PUBLIC,JSON.stringify(data));
}
export async function loadPrivate(){
  const raw=await AsyncStorage.getItem(KEYS.PRIVATE);
  return raw?JSON.parse(raw):{notes:[],albums:[],missYou:[],legacySettings:null};
}
export async function savePrivate(data){
  // Deliberately separate from public/AI eligible state.
  await AsyncStorage.setItem(KEYS.PRIVATE,JSON.stringify(data));
}
