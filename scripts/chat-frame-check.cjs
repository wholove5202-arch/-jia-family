const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),babel=require('@babel/core');
const React={createElement:(type,props,...children)=>({type,props:{...props,children}})};
const source=babel.transformSync(fs.readFileSync('src/ChatScreenFrame.js','utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-react-jsx'),require('@babel/plugin-transform-modules-commonjs')]}).code;
for(const os of ['ios','android','web']){
 const out={};vm.runInNewContext(source,{exports:out,require:n=>n==='react'?React:n==='react-native'?{View:'View',KeyboardAvoidingView:'Keyboard',Platform:{OS:os}}:{useSafeAreaInsets:()=>({top:59,bottom:34})}});
 for(const height of [667,844])for(const nav of [0,72])for(const keyboard of [0,301]){
  const tree=out.default({bottomInset:nav,style:{flex:1},children:'composer'}),avoider=tree.props.children[0];
  const parentHeight=height-59-34;
  const frameHeight=parentHeight-(tree.props.style.paddingBottom||0);
  // Reproduce RN's padding mode: internal keyboard padding replaces own paddingBottom.
  const keyboardTop=keyboard?height-keyboard:height;
  const pad=os==='ios'?Math.max(frameHeight-(keyboardTop-avoider.props.keyboardVerticalOffset),0):0;
  const bottom=59+frameHeight-pad;
  assert.ok(bottom<=height-34-nav,'Composer overlaps navigation with keyboard closed');
  if(os==='ios'&&keyboard)assert.ok(bottom<=keyboardTop,'Composer overlaps iOS keyboard');
  assert.equal(avoider.props.children[0],'composer');
 }
}
console.log('PASS chat composer avoids navigation and iOS keyboard on short and tall screens');
