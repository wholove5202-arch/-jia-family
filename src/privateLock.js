import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
const KEY='jia_private_lock_v1';
const read=()=>Platform.OS==='web'?AsyncStorage.getItem(KEY):SecureStore.getItemAsync(KEY);
const write=x=>Platform.OS==='web'?AsyncStorage.setItem(KEY,x):SecureStore.setItemAsync(KEY,x);
const remove=()=>Platform.OS==='web'?AsyncStorage.removeItem(KEY):SecureStore.deleteItemAsync(KEY);
export async function lockConfigured(){return !!await read();}
export async function setPrivatePassword(password){
 if(!/^\d{4,8}$/.test(password))throw new Error('密码应为 4 至 8 位数字');
 const salt=Crypto.randomUUID();const hash=await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,salt+password);
 await write(JSON.stringify({salt,hash,failures:0,blockedUntil:0}));
}
export async function verifyPrivatePassword(password){
 const raw=await read();if(!raw)return true;const data=JSON.parse(raw);
 if(data.blockedUntil>Date.now())throw new Error('尝试次数较多，请一分钟后重试');
 const hash=await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,data.salt+password);
 if(hash!==data.hash){const failures=(data.failures||0)+1;await write(JSON.stringify({...data,failures,blockedUntil:failures>=5?Date.now()+60000:0}));return false;}
 await write(JSON.stringify({...data,failures:0,blockedUntil:0}));return true;
}

export async function clearPrivatePassword(){await remove();}
