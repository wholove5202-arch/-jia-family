import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {AESEncryptionKey,AESSealedData,aesEncryptAsync,aesDecryptAsync} from 'expo-crypto';
import {Platform} from 'react-native';
let keyPromise;
function key(){if(!keyPromise)keyPromise=(async()=>{const encoded=Platform.OS==='web'?await AsyncStorage.getItem('jia_private_aes_key'):await SecureStore.getItemAsync('jia_private_aes_key');if(encoded)return AESEncryptionKey.import(encoded,'hex');const k=await AESEncryptionKey.generate();const hex=await k.encoded('hex');if(Platform.OS==='web')await AsyncStorage.setItem('jia_private_aes_key',hex);else await SecureStore.setItemAsync('jia_private_aes_key',hex);return k;})();return keyPromise;}
function encode(s){if(typeof TextEncoder!=='undefined')return new TextEncoder().encode(s);const b=unescape(encodeURIComponent(s));return Uint8Array.from(b,c=>c.charCodeAt(0))}
function decode(bytes){if(typeof TextDecoder!=='undefined')return new TextDecoder().decode(bytes);return decodeURIComponent(escape(Array.from(bytes,b=>String.fromCharCode(b)).join('')))}
function openDatabase(){return new Promise((resolve,reject)=>{
 if(!globalThis.indexedDB){reject(new Error('此浏览器无法保存，请使用 Safari 打开'));return}
 const request=indexedDB.open('jia_private_storage',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('private');
 request.onsuccess=()=>resolve(request.result);
 request.onerror=()=>reject(request.error||new Error('无法打开保存空间'));
 request.onblocked=()=>reject(new Error('请关闭其他页面后重试保存'));
})}
async function databaseValue(name,bytes){
 const db=await openDatabase();
 try{return await new Promise((resolve,reject)=>{
  const writing=bytes!==undefined;
  let tx;try{tx=db.transaction('private',writing?'readwrite':'readonly',writing?{durability:'strict'}:undefined)}catch(e){tx=db.transaction('private',writing?'readwrite':'readonly')}
  const request=writing?tx.objectStore('private').put(bytes,name):tx.objectStore('private').get(name);
  let result;request.onsuccess=()=>{result=request.result};
  tx.oncomplete=()=>resolve(result);
  tx.onabort=()=>reject(tx.error||request.error||new Error('未能保存，请重试'));
  tx.onerror=()=>reject(tx.error||request.error||new Error('未能保存，请重试'));
 })}finally{db.close()}
}
export async function readPrivate(name){
 if(Platform.OS==='web'&&globalThis.indexedDB){const stored=await databaseValue(name);if(stored){const sealed=AESSealedData.fromCombined(new Uint8Array(stored));return decode(await aesDecryptAsync(sealed,await key()))}}
 const raw=await AsyncStorage.getItem(name);if(!raw)return null;const parsed=JSON.parse(raw);if(parsed.encrypted!==1)return raw;
 const sealed=AESSealedData.fromCombined(Uint8Array.from(parsed.bytes));return decode(await aesDecryptAsync(sealed,await key()));
}
export async function writePrivate(name,value){
 const sealed=await aesEncryptAsync(encode(value),await key()),bytes=await sealed.combined();
 if(Platform.OS==='web'){await databaseValue(name,new Uint8Array(bytes));return}
 await AsyncStorage.setItem(name,JSON.stringify({encrypted:1,bytes:Array.from(bytes)}));
}
