import {File,Paths} from 'expo-file-system';
import {Platform} from 'react-native';
import * as ImagePicker from "expo-image-picker";

export async function pickImagesAndVideos(options={}){
  const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
  if(!permission.granted)return {permissionDenied:true,assets:[]};
  const mediaTypes=["images","videos"];
  const result=await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    allowsMultipleSelection:true,
    quality:1,
    ...options,
  });
  const assets=[];for(const a of result.canceled?[]:(result.assets||[])){if(Platform.OS==='web'){assets.push(a);continue;}const extension=(a.fileName||a.uri).split('.').pop()?.split('?')[0]||'bin';const dest=new File(Paths.document,`jia_${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`);new File(a.uri).copy(dest);assets.push({...a,uri:dest.uri});}return {permissionDenied:false,assets};
}
