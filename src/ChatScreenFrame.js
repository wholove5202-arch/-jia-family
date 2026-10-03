import React from 'react';
import {View,KeyboardAvoidingView,Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// iOS KeyboardAvoidingView replaces its own paddingBottom with keyboard space.
// Keep the navigation reservation outside it so it survives both keyboard states.
export default function ChatScreenFrame({children,style,bottomInset=0}){
 const insets=useSafeAreaInsets();
 return <View style={{flex:1,minHeight:0,paddingBottom:bottomInset}}>
  <KeyboardAvoidingView style={[{flex:1,minHeight:0},style]} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={Platform.OS==='ios'?insets.top:0}>
   {children}
  </KeyboardAvoidingView>
 </View>;
}
