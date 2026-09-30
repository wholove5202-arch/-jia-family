import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {AESEncryptionKey,AESSealedData,aesEncryptAsync,aesDecryptAsync} from 'expo-crypto';
import {Platform} from 'react-native';
let keyPromise;
function key(){if(!keyPromise)keyPromise=(async()=>{const encoded=Platform.OS==='web'?await AsyncStorage.getItem('jia_private_aes_key'):await SecureStore.getItemAsync('jia_private_aes_key');if(encoded)return AESEncryptionKey.import(encoded,'hex');const k=await AESEncryptionKey.generate();const hex=await k.encoded('hex');if(Platform.OS==='web')await AsyncStorage.setItem('jia_private_aes_key',hex);else await SecureStore.setItemAsync('jia_private_aes_key',hex);return k;})();return keyPromise;}
function encode(s){const b=unescape(encodeURIComponent(s));return Uint8Array.from(b,c=>c.charCodeAt(0));}
function decode(bytes){return decodeURIComponent(escape(Array.from(bytes,b=>String.fromCharCode(b)).join('')));}
export async function readPrivate(name){const raw=await AsyncStorage.getItem(name);if(!raw)return null;const parsed=JSON.parse(raw);if(parsed.encrypted!==1)return raw;const sealed=AESSealedData.fromCombined(Uint8Array.from(parsed.bytes));const bytes=await aesDecryptAsync(sealed,await key());return decode(bytes);}
export async function writePrivate(name,value){const sealed=await aesEncryptAsync(encode(value),await key());await AsyncStorage.setItem(name,JSON.stringify({encrypted:1,bytes:Array.from(await sealed.combined())}));}
