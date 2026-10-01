import {File,Paths} from 'expo-file-system';
import {Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
export async function persistAvatarAsset(asset){
 if(Platform.OS==='web'){
  if(asset.uri.startsWith('data:'))return asset;
  const response=await fetch(asset.uri);if(!response.ok)throw new Error('无法读取这张照片');
  const blob=await response.blob();
  const uri=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('照片保存失败'));reader.readAsDataURL(blob);});
  return {...asset,uri};
 }
 const extension=(asset.fileName||asset.uri).split('.').pop()?.split('?')[0]||'jpg';
 const dest=new File(Paths.document,`jia_avatar_${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`);new File(asset.uri).copy(dest);return {...asset,uri:dest.uri};
}
export async function pickAvatarAsset(){
 const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();if(!permission.granted)throw new Error('请允许访问照片，再选择头像');
 const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:false,allowsMultipleSelection:false,quality:.85});
 return result.canceled?null:persistAvatarAsset(result.assets[0]);
}
