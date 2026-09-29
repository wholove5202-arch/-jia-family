const fs=require('fs'),path=require('path');
const parser=require('@babel/parser');
const root=path.resolve(__dirname,'..');
const files=[];
function walk(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n);const s=fs.statSync(p);if(s.isDirectory()&&n!=='node_modules')walk(p);else if(s.isFile()&&p.endsWith('.js'))files.push(p)}}
walk(path.join(root,'src'));files.push(path.join(root,'App.js'));
let bad=[];
for(const f of files){
 const t=fs.readFileSync(f,'utf8');
 try {
  const ast=parser.parse(t,{sourceType:'module',plugins:['jsx']});
  for(const node of ast.program.body){
   const specifier=node.source?.value;
   if(typeof specifier!=='string'||!specifier.startsWith('.'))continue;
   const q=path.resolve(path.dirname(f),specifier);
   if(!fs.existsSync(q)&&!fs.existsSync(q+'.js')&&!fs.existsSync(path.join(q,'index.js')))bad.push(`${path.relative(root,f)} -> ${specifier}`);
  }
 }catch(e){bad.push(`${path.relative(root,f)}: ${e.message}`)}
}
if(bad.length){console.error('FAIL relative imports\n'+bad.join('\n'));process.exit(1)}
const priv=fs.readFileSync(path.join(root,'src','PrivateMediaScreen.js'),'utf8');
if(/aiMode\s*:\s*true|source\s*:\s*["']ai/i.test(priv)){console.error('FAIL private AI isolation');process.exit(1)}
console.log(`PASS relative imports (${files.length} JS files scanned)`);
console.log(`PASS JavaScript/JSX syntax (${files.length} JS files parsed)`);
console.log('PASS private media AI isolation static guard');
