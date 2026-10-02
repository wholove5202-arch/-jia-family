
import React from "react";
import {Platform,StatusBar} from 'react-native';
import {SafeAreaProvider,SafeAreaView,initialWindowMetrics} from 'react-native-safe-area-context';
import {theme} from './src/theme';
import AppErrorBoundary from "./src/AppErrorBoundary";
import IntegratedPhase1App from "./src/IntegratedPhase1App";
export default function App(){
 return <SafeAreaProvider initialMetrics={initialWindowMetrics}><SafeAreaView edges={Platform.OS==='android'?['top','right','bottom','left']:[]} style={{flex:1,backgroundColor:theme.bg}}><StatusBar barStyle="dark-content"/><AppErrorBoundary><IntegratedPhase1App/></AppErrorBoundary></SafeAreaView></SafeAreaProvider>;
}
