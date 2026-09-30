import React,{useState,useEffect} from 'react';
import {Text,TextInput,ScrollView,Alert} from 'react-native';
import {setPrivatePassword,verifyPrivatePassword,lockConfigured} from './privateLock';
import {Btn,styles as s} from './JournalScreens';
export default function PrivateAccessScreen({settings=false,onUnlock}){
 const [configured,setConfigured]=useState(null),[password,setPassword]=useState(''),[old,setOld]=useState(''),[repeat,setRepeat]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{lockConfigured().then(setConfigured).catch(()=>Alert.alert('无法读取密码设置'));},[]);
 async function submit(){setBusy(true);try{if(settings||!configured){if(configured&&!await verifyPrivatePassword(old))throw new Error('原密码不正确');if(password!==repeat)throw new Error('两次密码不一致');await setPrivatePassword(password);Alert.alert('二级密码已设置');}else if(!await verifyPrivatePassword(password))throw new Error('密码不正确');setPassword('');onUnlock();}catch(e){Alert.alert('未能完成',e.message);}finally{setBusy(false);}}
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}><Text style={s.title}>{settings?'设置二级密码':'私密空间'}</Text><Text style={s.hint}>{configured&&!settings?'输入独立密码，打开自己的私密内容。':'设置独立密码，离开私密区域或切到后台后会重新锁定。'}</Text>{settings&&configured&&<TextInput secureTextEntry style={s.input} value={old} onChangeText={setOld} placeholder="原二级密码"/>}<TextInput secureTextEntry style={s.input} value={password} onChangeText={setPassword} placeholder={configured&&!settings?'二级密码':'新密码（至少 8 位）'}/>{(!configured||settings)&&<TextInput secureTextEntry style={s.input} value={repeat} onChangeText={setRepeat} placeholder="再次输入密码"/>}<Btn disabled={busy||configured===null} title={busy?'处理中…':settings||!configured?'设置并进入':'解锁'} onPress={submit}/><Text style={s.hint}>测试版密码保存在本机，暂未提供找回功能，请记住密码。</Text></ScrollView>;
}
