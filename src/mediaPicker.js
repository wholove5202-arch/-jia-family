import * as ImagePicker from "expo-image-picker";

export async function pickImagesAndVideos(options={}){
  const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
  if(!permission.granted)return {permissionDenied:true,assets:[]};
  const mediaTypes=ImagePicker.MediaTypeOptions?.All ?? ["images","videos"];
  const result=await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    allowsMultipleSelection:true,
    quality:1,
    ...options,
  });
  return {permissionDenied:false,assets:result.canceled?[]:(result.assets||[])};
}
