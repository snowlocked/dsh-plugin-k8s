window.__ModuleLoader__.load({
  id: "@snowlocked/dsh-k8s-console",
  factory: (require) => {
    "use strict";
    var __dsh_k8s_internal = { exports: {} };
    var __dsh_k8s_exports = __dsh_k8s_internal.exports;
    Object.defineProperty(__dsh_k8s_exports, Symbol.toStringTag, { value: "Module" });
"use strict";var __dsh_k8s_module__=(()=>{var de=Object.defineProperty;var Ge=Object.getOwnPropertyDescriptor;var Qe=Object.getOwnPropertyNames;var Ze=Object.prototype.hasOwnProperty;var E=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,o)=>(typeof require<"u"?require:t)[o]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var et=(e,t)=>{for(var o in t)de(e,o,{get:t[o],enumerable:!0})},tt=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Qe(t))!Ze.call(e,a)&&a!==o&&de(e,a,{get:()=>t[a],enumerable:!(n=Ge(t,a))||n.enumerable});return e};var nt=e=>tt(de({},"__esModule",{value:!0}),e);var ft={};et(ft,{apply:()=>bt,inject:()=>kt});var ne=E("react");var ot=E("react");var he="dsh-k8s-console.persist.v1";function pe(){try{let e=window.localStorage.getItem(he);if(!e)return{};let t=JSON.parse(e);return t&&typeof t=="object"?t:{}}catch{return{}}}function ye(e){try{let t={...pe(),...e};window.localStorage.setItem(he,JSON.stringify(t))}catch{}}var ee=pe().panelOpen===!0,ke=new Set,we=e=>{if(typeof document>"u")return;let t=0,o=()=>{let n=Array.from(document.querySelectorAll('[role="tab"]')).filter(a=>a.closest("#dsh-k8s-console")===null).filter(a=>a.closest("#dsh-database-console")===null).find(a=>{let k=a.textContent?.trim().toLowerCase()??"",s=`${a.getAttribute("aria-label")??""} ${a.title??""}`.toLowerCase();return e==="k8s"?k==="k8s"||s.includes("k8s"):k==="chat"||k==="\u5BF9\u8BDD"||s.includes("chat")||s.includes("\u5BF9\u8BDD")});if(n!==void 0){n.click();return}++t<8&&setTimeout(o,16)};o()},Ne=()=>{for(let e of ke)e()},Ce=!1,Pe=Object.freeze({panelOpen:!0}),Ee=Object.freeze({panelOpen:!1}),ue=ee?Pe:Ee,Se=()=>{try{ye({panelOpen:ee})}catch{}},F={open(){ee||(ee=!0,ue=Pe,Se(),Ne()),we("k8s")},close(){ee=!1,ue=Ee,Se(),Ne(),we("chat")},toggle(){Ce?F.close():F.open()},setDocked(e){Ce=e},getSnapshot:()=>ue,subscribe(e){return ke.add(e),()=>ke.delete(e)}};var J=E("react/jsx-runtime"),rt=(0,J.jsxs)("svg",{viewBox:"0 0 16 16",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,J.jsx)("circle",{cx:"8",cy:"8",r:"1.4",fill:"currentColor",stroke:"none"}),(0,J.jsx)("circle",{cx:"8",cy:"2.6",r:"1.05",fill:"currentColor",stroke:"none"}),(0,J.jsx)("circle",{cx:"8",cy:"13.4",r:"1.05",fill:"currentColor",stroke:"none"}),(0,J.jsx)("circle",{cx:"2.6",cy:"8",r:"1.05",fill:"currentColor",stroke:"none"}),(0,J.jsx)("circle",{cx:"13.4",cy:"8",r:"1.05",fill:"currentColor",stroke:"none"}),(0,J.jsx)("path",{d:"M8 4v2.6M8 9.4V12M4.6 6.6l2.2 1.4M9.2 8l2.2 1.4M4.6 9.4l2.2-1.4M9.2 8l2.2-1.4"})]});function Te(e={}){let{wide:t=!0,t:o=(s=>s)}=e,n=o,a=(0,ne.useSyncExternalStore)(F.subscribe,F.getSnapshot,F.getSnapshot),k=(0,ne.useCallback)(()=>{F.toggle()},[]);return(0,J.jsxs)("button",{type:"button","data-d-sh-plugin":"k8s-console","data-active":a.panelOpen||void 0,"aria-label":n("sidebar.aria"),title:n("sidebar.title"),onClick:k,className:"kc-sidebar-entry",children:[(0,J.jsx)("span",{className:"kc-sidebar-entry-icon","aria-hidden":"true",children:rt}),t?(0,J.jsx)("span",{className:"kc-sidebar-entry-label",children:n("sidebar.label")}):null]})}var oe=E("react"),Ve=E("react-dom/client");var R=E("react");var $e="/api/dsh-plugin-k8s",U=class extends Error{status;code;constructor(t,o,n){super(t),this.status=o,this.code=n}};async function W(e){return e instanceof U||e instanceof Error?e.message:typeof e=="string"?e:JSON.stringify(e)}function Ke(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e??{})}}async function Z(e,t){let o;try{o=await fetch(`${$e}${e}`,Ke(t))}catch(a){throw new U(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${a instanceof Error?a.message:String(a)}`,0)}let n=null;try{n=await o.json()}catch{n=null}if(!o.ok){let a=n&&typeof n=="object"?n:{};throw new U(String(a.error??`HTTP ${o.status}`),o.status,String(a.code??""))}return n}async function Ae(e,t,o,n){let a;try{a=await fetch(`${$e}${e}`,{...Ke(t),...n?{signal:n}:{}})}catch(f){throw n?.aborted?f:new U(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${f instanceof Error?f.message:String(f)}`,0)}if(!a.ok||!a.body){let f=`HTTP ${a.status}`;try{let b=await a.json();b?.error&&(f=b.error)}catch{}throw new U(f,a.status)}let k=a.body.getReader(),s=new TextDecoder("utf-8"),v="";for(;;){let f;try{f=await k.read()}catch(y){throw n?.aborted?y:new U(`\u8BFB\u53D6\u6D41\u5931\u8D25\uFF1A${y instanceof Error?y.message:String(y)}`,0)}if(f.done)break;v+=s.decode(f.value,{stream:!0});let b;for(;(b=v.indexOf(`

`))>=0;){let y=v.slice(0,b);if(v=v.slice(b+2),y.startsWith("data: ")){let A=y.slice(6).trim();if(!A)continue;try{o(JSON.parse(A))}catch{}}}}if(v.startsWith("data: ")){let f=v.slice(6).trim();if(f)try{o(JSON.parse(f))}catch{}}}var B={state:e=>Z("/state",e?{refresh:!0}:{}),kubeconfigs:()=>Z("/kubeconfigs/list"),save:e=>Z("/kubeconfigs/save",e),remove:e=>Z("/kubeconfig/remove",{id:e}),raw:e=>Z("/kubeconfig/raw",{id:e}),check:e=>Z("/kubeconfigs/check",{id:e}),aiModels:()=>Z("/ai/models"),run:(e,t,o)=>Ae("/run",e,t,o),chat:(e,t,o)=>Ae("/ai/chat",e,t,o)};function ze(e){let t=[];for(let o of e.providers)if(o.models.length===0)t.push({key:`p:${o.provider}`,provider:o.provider,label:o.label??o.provider});else for(let n of o.models)t.push({key:`m:${o.provider}/${n.id}`,provider:o.provider,model:n.id,label:n.label??`${o.provider} \xB7 ${n.id}`});return t}function Re(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function be(e){if(!e)return"\u2014";let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("zh-CN",{hour12:!1})}var H=E("react");var p=E("react/jsx-runtime"),fe={open:!1,name:"",mode:"paste",content:"",filePath:"",busy:!1,error:null};function Me(e){let{kubeconfigs:t,busyList:o,refresh:n,onOpenSession:a,onFlash:k}=e,[s,v]=(0,H.useState)(fe),[f,b]=(0,H.useState)(null),y=e.stateInfo?.kubectl,A=(0,H.useRef)(null);(0,H.useEffect)(()=>{s.open&&s.mode==="paste"&&A.current?.focus()},[s.open,s.mode]);let g=(0,H.useCallback)(i=>{v(N=>({...N,...i}))},[]),K=(0,H.useCallback)(()=>{v(fe)},[]),z=(0,H.useCallback)(async()=>{if(s.busy)return;let i=s.name.trim();if(!i){g({error:"\u8BF7\u586B\u5199 kubeconfig \u540D\u79F0\uFF08\u663E\u793A\u7528\uFF09"});return}if(s.mode==="paste"&&s.content.trim()===""){g({error:"\u8BF7\u7C98\u8D34 kubeconfig \u5185\u5BB9\uFF0C\u6216\u6539\u7528\u201C\u672C\u673A\u6587\u4EF6\u5BFC\u5165\u201D"});return}if(s.mode==="path"&&s.filePath.trim()===""){g({error:"\u8BF7\u586B\u5199\u672C\u673A kubeconfig \u6587\u4EF6\u8DEF\u5F84\uFF08\u5982 D:\\path\\dev.yaml\uFF09"});return}g({busy:!0,error:null});try{await B.save({name:i,content:s.mode==="paste"?s.content:void 0,filePath:s.mode==="path"?s.filePath:void 0}),K(),k("ok",`\u5DF2\u4FDD\u5B58 kubeconfig\u300C${i}\u300D`),n()}catch(N){g({error:await W(N)})}finally{g({busy:!1})}},[s,g,K,k,n]),M=(0,H.useCallback)(async i=>{if(window.confirm(`\u5220\u9664 kubeconfig\u300C${i.name}\u300D\uFF1F

\u8BE5\u64CD\u4F5C\u4F1A\u79FB\u9664\u672C\u5730\u4FDD\u5B58\u7684\u6587\u4EF6\u526F\u672C\uFF08\u542B\u8BBF\u95EE\u51ED\u636E\uFF09\uFF0C\u5E76\u5173\u95ED\u5B83\u7684\u6240\u6709\u4F1A\u8BDD Tab\u3002`)){b(`rm:${i.id}`);try{let{ok:O}=await B.remove(i.id);O?(k("info",`\u5DF2\u5220\u9664\u300C${i.name}\u300D`),n()):k("error","\u5220\u9664\u5931\u8D25\uFF1A\u670D\u52A1\u7AEF\u672A\u786E\u8BA4")}catch(O){k("error",`\u5220\u9664\u5931\u8D25\uFF1A${await W(O)}`)}finally{b(null)}}},[k,n]),j=(0,H.useCallback)(async i=>{b(`check:${i.id}`);try{let N=await B.check(i.id);k(N.ok?"ok":"error",`\u300C${i.name}\u300D${N.ok?"\u2705 \u96C6\u7FA4\u53EF\u8FBE":"\u274C \u4E0D\u53EF\u8FBE"}\uFF1A${N.message}`)}catch(N){k("error",`\u300C${i.name}\u300D\u68C0\u67E5\u5931\u8D25\uFF1A${await W(N)}`)}finally{b(null),n()}},[k,n]),I=(0,H.useCallback)(async i=>{b(`copy:${i.id}`);try{let{content:N}=await B.raw(i.id);await navigator.clipboard.writeText(N),k("ok",`\u5DF2\u590D\u5236\u300C${i.name}\u300D\u5B8C\u6574 kubeconfig \u5230\u526A\u8D34\u677F\uFF08\u542B\u51ED\u636E\uFF0C\u6CE8\u610F\u4FDD\u7BA1\uFF09`)}catch(N){k("error",`\u590D\u5236\u5931\u8D25\uFF1A${await W(N)}`)}finally{b(null)}},[k]);return(0,p.jsxs)("div",{className:"kc-nav",children:[(0,p.jsxs)("div",{className:"kc-nav-head",children:[(0,p.jsx)("span",{className:"kc-nav-title",children:"kubeconfig"}),(0,p.jsx)("span",{className:"kc-nav-count",children:t.length}),(0,p.jsx)("span",{className:"kc-grow"}),(0,p.jsx)("button",{className:"kc-btn-sm",onClick:()=>{g({...fe,open:!0})},title:"\u6DFB\u52A0 kubeconfig\uFF08\u7C98\u8D34\u5185\u5BB9\u6216\u5BFC\u5165\u672C\u673A\u6587\u4EF6\uFF09",children:"\u2795 \u6DFB\u52A0"}),(0,p.jsx)("button",{className:"kc-btn-sm",onClick:()=>void n(),disabled:o,title:"\u5237\u65B0\u5217\u8868",children:"\u21BB"})]}),y&&!y.present?(0,p.jsxs)("div",{className:"kc-warnbox",title:y.missingReason,children:[(0,p.jsx)("div",{className:"kc-warnbox-title",children:"\u26A0\uFE0F kubectl \u4E0D\u53EF\u7528"}),(0,p.jsx)("div",{className:"kc-warnbox-text",children:y.missingReason})]}):null,(0,p.jsxs)("div",{className:"kc-nav-list",children:[t.length===0?(0,p.jsx)("div",{className:"kc-nav-empty",children:o?"\u52A0\u8F7D\u4E2D\u2026":`\u8FD8\u6CA1\u6709 kubeconfig\u3002
\u70B9\u53F3\u4E0A\u89D2 \u2795 \u6DFB\u52A0\uFF08\u7C98\u8D34\u5185\u5BB9\u6216\u5BFC\u5165\u672C\u673A\u6587\u4EF6\uFF09\u3002`}):null,t.map(i=>{let N=f===`rm:${i.id}`||f===`check:${i.id}`||f===`copy:${i.id}`;return(0,p.jsxs)("div",{className:"kc-conn",title:"\u70B9\u51FB\u65B0\u5EFA\u4F1A\u8BDD\uFF08\u540C\u4E00\u96C6\u7FA4\u53EF\u5F00\u591A\u4E2A\uFF09",children:[(0,p.jsxs)("button",{type:"button",className:"kc-conn-main",onClick:()=>a(i),disabled:o,children:[(0,p.jsx)("span",{className:"kc-conn-name",children:i.name}),(0,p.jsxs)("span",{className:"kc-conn-sub",children:[i.currentContext??i.contextNames[0]??"\uFF08\u65E0 context\uFF09",i.contextNames.length>1?`\uFF08\u5171 ${i.contextNames.length} \u4E2A context\uFF09`:""]}),(0,p.jsx)("span",{className:"kc-conn-server",title:"API server",children:i.server??""}),i.lastCheckError?(0,p.jsx)("span",{className:"kc-conn-state kc-conn-state-bad",title:`\u4E0A\u6B21\u68C0\u67E5\u5931\u8D25\uFF1A${i.lastCheckError}`,children:"\u2715"}):i.lastCheckedAt?(0,p.jsx)("span",{className:"kc-conn-state kc-conn-state-ok",title:`\u4E0A\u6B21\u68C0\u67E5 ${be(i.lastCheckedAt)}`,children:"\u2713"}):null]}),(0,p.jsxs)("span",{className:"kc-conn-actions",children:[(0,p.jsx)("button",{className:"kc-icon-btn",title:"\u6D4B\u8BD5\u8FDE\u901A\uFF08kubectl get --raw=/version\uFF09",disabled:N,onClick:()=>void j(i),children:N&&f===`check:${i.id}`?"\u2026":"\u6D4B"}),(0,p.jsx)("button",{className:"kc-icon-btn",title:"\u590D\u5236\u5B8C\u6574 kubeconfig\uFF08\u542B\u51ED\u636E\uFF09",disabled:N,onClick:()=>void I(i),children:N&&f===`copy:${i.id}`?"\u2026":"\u29C9"}),(0,p.jsx)("button",{className:"kc-icon-btn kc-icon-btn-danger",title:`\u5220\u9664\uFF08${Re(i.size)}\uFF0C\u66F4\u65B0\u4E8E ${be(i.updatedAt)}\uFF09`,disabled:N,onClick:()=>void M(i),children:"\u2715"})]})]},i.id)})]}),(0,p.jsx)("div",{className:"kc-nav-foot",children:(0,p.jsxs)("div",{className:"kc-muted",style:{fontSize:11,lineHeight:1.6},children:["\u6570\u636E\u76EE\u5F55\uFF1A",e.stateInfo?.dataDir??"\u2026",y?.present&&y.version?(0,p.jsxs)("div",{children:["kubectl ",y.version]}):null]})}),s.open?(0,p.jsx)("div",{className:"kc-modal-mask",onMouseDown:i=>{i.target===i.currentTarget&&K()},children:(0,p.jsxs)("div",{className:"kc-modal",children:[(0,p.jsx)("div",{className:"kc-modal-title",children:"\u2795 \u6DFB\u52A0 kubeconfig"}),(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"\u540D\u79F0\uFF08\u663E\u793A\u7528\uFF09"}),(0,p.jsx)("input",{value:s.name,onChange:i=>g({name:i.target.value,error:null}),placeholder:"\u4F8B\u5982\uFF1Adevelopment / dev",autoFocus:!0})]}),(0,p.jsxs)("div",{className:"kc-seg",role:"tablist",children:[(0,p.jsx)("button",{type:"button",role:"tab","aria-selected":s.mode==="paste",className:s.mode==="paste"?"kc-seg-active":"",onClick:()=>g({mode:"paste"}),children:"\u{1F4CB} \u7C98\u8D34\u5185\u5BB9"}),(0,p.jsx)("button",{type:"button",role:"tab","aria-selected":s.mode==="path",className:s.mode==="path"?"kc-seg-active":"",onClick:()=>g({mode:"path"}),children:"\u{1F4C1} \u5BFC\u5165\u672C\u673A\u6587\u4EF6"})]}),s.mode==="paste"?(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"kubeconfig \u5185\u5BB9\uFF08YAML\uFF09"}),(0,p.jsx)("textarea",{ref:A,className:"kc-code-input",rows:10,value:s.content,onChange:i=>g({content:i.target.value,error:null}),placeholder:`apiVersion: v1
kind: Config
clusters:
- name: "dev"
  cluster:
    server: "https://\u2026"
\u2026`,spellCheck:!1})]}):(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"\u672C\u673A\u6587\u4EF6\u8DEF\u5F84"}),(0,p.jsx)("input",{value:s.filePath,onChange:i=>g({filePath:i.target.value,error:null}),placeholder:"D:\\Users\\wuzan\\.kube\\configs\\dev.yaml",spellCheck:!1}),(0,p.jsx)("div",{className:"kc-muted",style:{fontSize:11,marginTop:4},children:"\u8BFB\u53D6\u8BE5\u8DEF\u5F84\u7684\u5185\u5BB9\u5E76\u4FDD\u5B58\u526F\u672C\u5230\u63D2\u4EF6\u6570\u636E\u76EE\u5F55\uFF08\u652F\u6301 .yaml/.yml/.config\uFF09\u3002\u4FEE\u6539\u539F\u6587\u4EF6\u4E0D\u4F1A\u540C\u6B65 \u2014\u2014 \u60F3\u7528\u65B0\u7248\u8BF7\u5220\u9664\u540E\u91CD\u65B0\u5BFC\u5165\u3002"})]}),s.error?(0,p.jsx)("div",{className:"kc-form-error",children:s.error}):null,(0,p.jsxs)("div",{className:"kc-modal-actions",children:[(0,p.jsx)("button",{onClick:K,disabled:s.busy,children:"\u53D6\u6D88"}),(0,p.jsx)("button",{className:"kc-btn-primary",onClick:()=>void z(),disabled:s.busy,children:s.busy?"\u4FDD\u5B58\u5E76\u89E3\u6790\u2026":"\u4FDD\u5B58"})]})]})}):null]})}var G=E("react");var C=E("react");var w=E("react/jsx-runtime"),Oe=800,at=["get pods -A","get nodes -o wide","get all -n default","logs deploy/xxx -n <ns> --tail=100","describe pod <name> -n <ns>","get events -n <ns> --sort-by=.lastTimestamp"];function st(e){switch(e){case"timeout":return"\u5DF2\u8D85\u65F6\u88AB\u7EC8\u6B62";case"bytes":return"\u8F93\u51FA\u8D85\u8FC7\u4E0A\u9650\u5DF2\u88AB\u622A\u65AD";case"aborted":return"\u5DF2\u624B\u52A8\u4E2D\u6B62";default:return""}}var Ie=(0,C.forwardRef)(function({kube:t},o){let[n,a]=(0,C.useState)(""),[k,s]=(0,C.useState)(""),[v,f]=(0,C.useState)(""),[b,y]=(0,C.useState)(!1),[A,g]=(0,C.useState)([]),[K,z]=(0,C.useState)(null),[M,j]=(0,C.useState)([]),[I,i]=(0,C.useState)(-1),[N,O]=(0,C.useState)(null),X=(0,C.useRef)(null),u=(0,C.useRef)(null),m=(0,C.useRef)(null),$=(0,C.useRef)(()=>{}),T=(0,C.useCallback)(r=>{g(l=>{let x=[...l,r];return x.length>Oe?x.slice(x.length-Oe):x})},[]);(0,C.useEffect)(()=>{let r=u.current;r&&(r.scrollTop=r.scrollHeight)},[A,b,K]);let V=(0,C.useCallback)(()=>{X.current?.abort()},[]),_=(0,C.useCallback)(async r=>{let l=r.trim();if(!l||b)return;let x=l.split(`
`).filter(S=>S.trim()!==""&&!S.trim().startsWith("#")).join(`
`).trim();if(!x)return;X.current=new AbortController;let L=X.current.signal;y(!0),z(null),i(-1),T({kind:"cmd",text:x}),j(S=>[...S.slice(-99),x]);let Ye=S=>{if(S.type==="start")T({kind:"sys",text:`\u25B6 ${String(S.command??`kubectl ${x}`)}`}),O(`\u6B63\u5728\u6267\u884C ${String(S.command??"")} \u2026\uFF08\u53EF\u968F\u65F6\u4E2D\u6B62\uFF09`);else if(S.type==="out"){let ie=S.channel==="stderr"?"stderr":"stdout",te=typeof S.text=="string"?S.text:"";te&&T({kind:"out",channel:ie,text:te})}else if(S.type==="exit"){let ie=typeof S.code=="number"?S.code:null,te=typeof S.signal=="string"?S.signal:null,Ue=typeof S.durationMs=="number"?S.durationMs:0,ve=S.truncated===!0,ce=typeof S.reason=="string"?S.reason:void 0;z({code:ie,signal:te,durationMs:Ue,truncated:ve,reason:ce});let le=st(ce);ve&&!le&&T({kind:"sys",text:"\u8F93\u51FA\u8D85\u8FC7\u4E0A\u9650\u5DF2\u622A\u65AD",tone:"err"}),le&&T({kind:"sys",text:le,tone:ce==="aborted"?"muted":"err"}),O(null)}else S.type==="error"&&(T({kind:"err",text:String(S.message??"\u672A\u77E5\u9519\u8BEF")}),O(null))};try{await B.run({id:t.id,command:x,context:k,namespace:v},Ye,L),L.aborted&&(T({kind:"sys",text:"\u5DF2\u4E2D\u6B62",tone:"muted"}),z(S=>S??{code:null,signal:null,durationMs:0,truncated:!1,reason:"aborted"}))}catch(S){L.aborted?T({kind:"sys",text:"\u5DF2\u4E2D\u6B62",tone:"muted"}):T({kind:"err",text:await W(S)}),O(null)}finally{y(!1),X.current=null}},[t.id,b,k,v,T]);$.current=_,(0,C.useImperativeHandle)(o,()=>({runText(r){a(r),m.current?.focus(),window.setTimeout(()=>{let l=$.current;l&&l(r)},0)}}),[]);let Y=(0,C.useCallback)(()=>{_(n)},[_,n]),q=(0,C.useCallback)(r=>{if(r.key==="Enter"&&!r.shiftKey&&!r.nativeEvent.isComposing){r.preventDefault(),Y();return}if(r.key==="ArrowUp"&&M.length>0){let l=I<0?M.length-1:Math.max(0,I-1);i(l),a(M[l]??""),r.preventDefault()}else if(r.key==="ArrowDown"&&I>=0){if(I>=M.length-1)i(-1),a("");else{let l=I+1;i(l),a(M[l]??"")}r.preventDefault()}},[M,I,Y]),ae=(0,C.useCallback)(()=>{g([]),z(null)},[]),se=(0,C.useCallback)(async()=>{let r=A.filter(l=>l.kind==="cmd"||l.kind==="out").map(l=>l.kind==="cmd"?`$ ${l.text}`:l.text).join("");try{await navigator.clipboard.writeText(r),O("\u5DF2\u590D\u5236\u8F93\u51FA"),window.setTimeout(()=>O(null),1500)}catch(l){O(`\u590D\u5236\u5931\u8D25\uFF1A${l instanceof Error?l.message:String(l)}`)}},[A]),c=r=>{let l=[];return r.reason==="aborted"?l.push("\u5DF2\u4E2D\u6B62"):r.code===0?l.push("\u6210\u529F"):r.code!==null&&l.push(`\u9000\u51FA\u7801 ${r.code}`),r.signal&&l.push(`signal ${r.signal}`),l.push(`${(r.durationMs/1e3).toFixed(2)}s`),l.join(" \xB7 ")};return(0,w.jsxs)("div",{className:"kc-console",children:[(0,w.jsxs)("div",{className:"kc-console-toolbar",children:[(0,w.jsxs)("div",{className:"kc-console-env",children:[(0,w.jsxs)("label",{title:"\u5728\u8BE5 kubeconfig \u7684\u54EA\u4E9B context \u4E0A\u6267\u884C\uFF08\u7A7A = \u4F7F\u7528\u6587\u4EF6\u5F53\u524D\u4E0A\u4E0B\u6587\uFF09",children:["context",(0,w.jsxs)("select",{value:k,onChange:r=>s(r.target.value),disabled:b,children:[(0,w.jsx)("option",{value:"",children:t.currentContext?`${t.currentContext}\uFF08\u9ED8\u8BA4\uFF09`:"\uFF08\u9ED8\u8BA4\uFF09"}),t.contextNames.filter(r=>r!==t.currentContext).map(r=>(0,w.jsx)("option",{value:r,children:r},r))]})]}),(0,w.jsxs)("label",{title:"\u7ED9\u547D\u4EE4\u9644\u52A0 -n <namespace>\uFF08\u547D\u4EE4\u91CC\u81EA\u5E26 -n \u65F6\u4EE5\u547D\u4EE4\u91CC\u7684\u4E3A\u51C6\uFF09",children:["namespace",(0,w.jsx)("input",{value:v,onChange:r=>f(r.target.value),placeholder:"default",disabled:b,spellCheck:!1})]})]}),(0,w.jsx)("div",{className:"kc-grow"}),(0,w.jsx)("button",{className:"kc-btn-sm",onClick:ae,title:"\u6E05\u7A7A\u8F93\u51FA",children:"\u6E05\u7A7A"}),(0,w.jsx)("button",{className:"kc-btn-sm",onClick:()=>void se(),title:"\u590D\u5236\u5168\u90E8\u547D\u4EE4\u4E0E\u8F93\u51FA",children:"\u590D\u5236\u8F93\u51FA"}),(0,w.jsx)("button",{className:"kc-btn-sm",onClick:()=>{a(at.join(`
`)),m.current?.focus()},title:"\u586B\u5165\u5E38\u7528\u793A\u4F8B",children:"\u793A\u4F8B"})]}),(0,w.jsxs)("div",{className:"kc-console-input-row",children:[(0,w.jsx)("textarea",{ref:m,className:"kc-code-input kc-command-input",value:n,onChange:r=>a(r.target.value),onKeyDown:q,placeholder:`kubectl \u547D\u4EE4\uFF08\u53EF\u7701\u7565\u524D\u7F00 kubectl\uFF09
\u4F8B\u5982\uFF1Aget pods -A

Enter \u6267\u884C \xB7 Shift+Enter \u6362\u884C \xB7 \u2191/\u2193 \u5386\u53F2 \xB7 \u975E\u4EA4\u4E92\uFF08logs -f \u7B49\u957F\u547D\u4EE4\u8BF7\u7528\u4E2D\u6B62\u6309\u94AE\uFF09`,spellCheck:!1,rows:3}),b?(0,w.jsx)("button",{className:"kc-btn-primary kc-btn-stop",onClick:V,title:"\u4E2D\u6B62\u5F53\u524D\u547D\u4EE4",children:"\u25A0 \u4E2D\u6B62"}):(0,w.jsx)("button",{className:"kc-btn-primary",onClick:Y,disabled:n.trim()==="",title:"\u6267\u884C\uFF08Ctrl+Enter \u4EA6\u53EF\uFF09",children:"\u25B6 \u6267\u884C"})]}),N?(0,w.jsx)("div",{className:"kc-console-status",children:N}):null,(0,w.jsx)("div",{className:"kc-output",ref:u,children:A.length===0?(0,w.jsx)("div",{className:"kc-output-empty",children:(0,w.jsxs)("div",{className:"kc-muted",children:["\u8F93\u5165\u547D\u4EE4\u5F00\u59CB\uFF08",t.name,k?` \xB7 --context ${k}`:"",v?` \xB7 -n ${v}`:"","\uFF09\u3002",(0,w.jsx)("br",{}),"\u53EA\u8BFB\u5EFA\u8BAE\uFF1Aget / describe / logs / top / explain\u3002\u7834\u574F\u6027\u547D\u4EE4\u8BF7\u81EA\u884C\u786E\u8BA4\u5F71\u54CD\u3002"]})}):A.map((r,l)=>r.kind==="cmd"?(0,w.jsxs)("div",{className:"kc-out-line kc-out-cmd",children:[(0,w.jsx)("span",{className:"kc-out-prompt",children:"$"})," ",r.text]},l):r.kind==="out"?(0,w.jsx)("pre",{className:`kc-out-line kc-out-${r.channel}${r.text.endsWith(`
`),""}`,children:r.text},l):r.kind==="err"?(0,w.jsxs)("div",{className:"kc-out-line kc-out-err",children:["\u2715 ",r.text]},l):(0,w.jsx)("div",{className:`kc-out-line kc-out-sys${r.tone==="err"?" kc-out-err":""}${r.tone==="muted"?" kc-out-muted":""}`,children:r.text},l))}),K?(0,w.jsxs)("div",{className:`kc-exitbar${K.reason==="aborted"?" kc-exitbar-muted":K.code===0?"":" kc-exitbar-err"}`,children:[K.reason==="aborted"?"\u23F9 ":K.code===0?"\u2713 ":"\u2715 ",c(K),K.truncated?" \xB7 \u26A0\uFE0F \u8F93\u51FA\u88AB\u622A\u65AD":"",b?" \xB7 \u8FD0\u884C\u4E2D":""]}):null]})});var P=E("react");var d=E("react/jsx-runtime"),De=0,it=()=>(De+=1,De);function ct(e){let t=/```(?:bash|sh|shell|kubectl|console)?\s*\n([\s\S]*?)```/g,o;for(;(o=t.exec(e))!==null;){let n=o[1]??"",a=me(n);if(a)return a}return me(e)}function me(e){for(let t of e.split(`
`)){let o=t.replace(/^\s*[$>]\s*/,"").trim();if(!(!o||o.startsWith("#"))&&/^kubectl\b/u.test(o))return o}return null}function lt(e){let t=[],o=/```([\w+-]*)\s*\n([\s\S]*?)```/g,n=0,a;for(;(a=o.exec(e))!==null;)a.index>n&&t.push({kind:"text",text:e.slice(n,a.index)}),t.push({kind:"code",lang:a[1]||void 0,text:a[2]??""}),n=o.lastIndex;return n<e.length&&t.push({kind:"text",text:e.slice(n)}),t}function He({kube:e,onRunCommand:t}){let[o,n]=(0,P.useState)([]),[a,k]=(0,P.useState)(""),[s,v]=(0,P.useState)(!1),[f,b]=(0,P.useState)(null),[y,A]=(0,P.useState)(!1),[g,K]=(0,P.useState)(""),[z,M]=(0,P.useState)(null),j=(0,P.useRef)(null),I=(0,P.useRef)(null),i=(0,P.useRef)(null),N=(0,P.useCallback)(async()=>{A(!0);try{b(await B.aiModels())}catch(c){b(null),M(`\u6A21\u578B\u679A\u4E3E\u5931\u8D25\uFF1A${await W(c)}`)}finally{A(!1)}},[]);(0,P.useEffect)(()=>{N()},[N]);let O=(0,P.useMemo)(()=>f?ze(f):[],[f]),X=(0,P.useMemo)(()=>O.find(c=>c.key===g),[O,g]);(0,P.useEffect)(()=>{let c=I.current;c&&(c.scrollTop=c.scrollHeight)},[o]);let u=(0,P.useCallback)(c=>{n(r=>[...r,{...c,key:it()}])},[]),m=(0,P.useCallback)(c=>{n(r=>{if(r.length===0)return r;let l=r[r.length-1];if(l.role!=="assistant")return r;let x={...l,...c};c.content&&typeof c.content=="string"&&(x.content=l.content+c.content);let L=[...r];return L[L.length-1]=x,L})},[]),$=(0,P.useCallback)(()=>{j.current?.abort()},[]),T=(0,P.useCallback)(async()=>{let c=a.trim();if(!c||s)return;k(""),M(null);let r=o.filter(x=>x.role==="user"||x.state==="done").map(x=>({role:x.role,content:x.content}));r.push({role:"user",content:c}),u({role:"user",content:c}),u({role:"assistant",content:"",state:"streaming"}),v(!0),j.current=new AbortController;let l=j.current.signal;try{await B.chat({id:e.id,provider:X?.provider,model:X?.model,history:r.slice(-40)},x=>{x.type==="delta"&&typeof x.text=="string"?m({content:x.text}):x.type==="done"?m({state:"done",meta:{...typeof x.provider=="string"?{provider:x.provider}:{},...typeof x.model=="string"?{model:x.model}:{}}}):x.type==="aborted"?m({state:"done"}):x.type==="error"&&m({state:"error",content:`\u26A0\uFE0F ${String(x.message??"AI \u51FA\u9519")}`})},l)}catch(x){if(l.aborted)m({state:"done"});else{let L=await W(x);m({state:"error",content:`\u26A0\uFE0F ${L}`})}}finally{v(!1),j.current=null}},[a,s,o,X,e.id,u,m]),V=(0,P.useCallback)(c=>{c.key==="Enter"&&!c.shiftKey&&!c.nativeEvent.isComposing&&(c.preventDefault(),T())},[T]),_=(0,P.useCallback)(()=>{s&&$(),n([]),M(null)},[s,$]),Y=[...o].reverse().find(c=>c.role==="assistant"&&c.state==="done"),q=Y?ct(Y.content):null,ae=(0,P.useCallback)(async c=>{try{await navigator.clipboard.writeText(c)}catch{}},[]),se=c=>{if(c.role==="user")return(0,d.jsx)("div",{className:"kc-chat-user-text",children:c.content});if(c.state==="error")return(0,d.jsx)("div",{className:"kc-chat-error-text",children:c.content});let r=lt(c.content);return(0,d.jsxs)("div",{className:"kc-chat-ai-text",children:[r.length===0?c.state==="streaming"?(0,d.jsx)("span",{className:"kc-chat-cursor",children:"\u258D"}):(0,d.jsx)("span",{className:"kc-muted",children:"\uFF08\u7A7A\u56DE\u590D\uFF09"}):r.map((l,x)=>{if(l.kind==="text")return(0,d.jsx)("span",{className:"kc-chat-text-span",children:l.text},x);let L=l.lang===void 0||/^(bash|sh|shell|kubectl|console)$/u.test(l.lang)?me(l.text):null;return(0,d.jsxs)("div",{className:"kc-codebox",children:[(0,d.jsxs)("div",{className:"kc-codebox-head",children:[(0,d.jsx)("span",{className:"kc-codebox-lang",children:l.lang||"code"}),(0,d.jsx)("span",{className:"kc-grow"}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>void ae(l.text),children:"\u590D\u5236"}),L?(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>t(L),title:`\u53D1\u9001\u5230\u547D\u4EE4\u63A7\u5236\u53F0\u6267\u884C\uFF1A${L}`,children:"\u25B6 \u8FD0\u884C"}):null]}),(0,d.jsx)("pre",{className:"kc-codebox-body",children:l.text})]},x)}),c.state==="streaming"&&r.length>0?(0,d.jsx)("span",{className:"kc-chat-cursor",children:"\u258D"}):null]})};return(0,d.jsxs)("div",{className:"kc-chat",children:[(0,d.jsxs)("div",{className:"kc-chat-toolbar",children:[(0,d.jsxs)("label",{title:"\u590D\u7528 DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\uFF1B\u7A7A = \u8BA9 DSH \u81EA\u52A8\u9009\u62E9",children:["AI \u6A21\u578B",(0,d.jsxs)("select",{value:g,onChange:c=>K(c.target.value),disabled:s||y,children:[(0,d.jsx)("option",{value:"",children:"\u81EA\u52A8\uFF08\u7531 DSH \u9009\u62E9\uFF09"}),O.map(c=>(0,d.jsx)("option",{value:c.key,children:c.label??c.key},c.key))]})]}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>void N(),disabled:y,title:"\u91CD\u65B0\u679A\u4E3E DSH \u6A21\u578B",children:"\u21BB \u6A21\u578B"}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:_,disabled:o.length===0&&!s,title:"\u6E05\u7A7A\u672C\u4F1A\u8BDD\u5BF9\u8BDD",children:"\u6E05\u7A7A\u5BF9\u8BDD"}),(0,d.jsx)("span",{className:"kc-grow"}),(0,d.jsxs)("span",{className:"kc-chat-cluster",title:"AI \u7CFB\u7EDF\u63D0\u793A\u4E2D\u4F1A\u643A\u5E26\u8BE5\u96C6\u7FA4\u4FE1\u606F",children:["\u2388 ",e.name," \xB7 ",e.currentContext??"",e.server?` \xB7 ${e.server.replace(/^https?:\/\//u,"")}`:""]})]}),f&&!f.ok?(0,d.jsxs)("div",{className:"kc-chat-warn",children:["\u26A0\uFE0F ",f.message??"\u6CA1\u6709\u53EF\u7528\u6A21\u578B","\uFF08\u914D\u7F6E\u597D\u540E\u70B9\u201C\u21BB \u6A21\u578B\u201D\u5237\u65B0\uFF09"]}):null,z?(0,d.jsxs)("div",{className:"kc-chat-warn",children:["\u26A0\uFE0F ",z]}):null,(0,d.jsxs)("div",{className:"kc-chat-scroll",ref:I,children:[o.length===0?(0,d.jsx)("div",{className:"kc-chat-empty",children:(0,d.jsxs)("div",{className:"kc-muted",style:{maxWidth:460},children:["\u9488\u5BF9\u5F53\u524D\u96C6\u7FA4\uFF08",e.name,"\uFF09\u63D0\u95EE\uFF0C\u4F8B\u5982\uFF1A",(0,d.jsx)("br",{}),"\xB7 \u201C\u67E5\u770B default \u547D\u540D\u7A7A\u95F4\u4E0B\u6240\u6709 deployment \u53CA\u5176\u72B6\u6001\u201D",(0,d.jsx)("br",{}),"\xB7 \u201C\u627E\u51FA ImagePullBackOff \u7684 pod\uFF0C\u5E76\u89E3\u91CA\u600E\u4E48\u6392\u67E5\u201D",(0,d.jsx)("br",{}),"\xB7 \u201C\u751F\u6210\u628A myapp \u7F29\u5230 2 \u526F\u672C\u7684\u547D\u4EE4\u201D",(0,d.jsx)("br",{}),"\xB7 \u201C\u7C98\u8D34\u4E00\u6761 kubectl \u62A5\u9519\uFF0C\u5E2E\u6211\u89E3\u91CA\u539F\u56E0\u201D",(0,d.jsx)("br",{}),(0,d.jsx)("br",{}),"AI \u751F\u6210\u7684\u53EF\u6267\u884C\u547D\u4EE4\u4F1A\u5728\u4EE3\u7801\u5757\u4E0B\u65B9\u63D0\u4F9B ",(0,d.jsx)("b",{children:"\u25B6 \u8FD0\u884C"}),"\uFF0C\u70B9\u51FB\u540E\u5207\u5230\u547D\u4EE4\u63A7\u5236\u53F0\u76F4\u63A5\u6267\u884C\u3002"]})}):o.map(c=>(0,d.jsxs)("div",{className:`kc-chat-row kc-chat-${c.role}`,children:[(0,d.jsx)("div",{className:"kc-chat-avatar",children:c.role==="user"?"\u{1F9D1}":"\u{1F916}"}),(0,d.jsxs)("div",{className:"kc-chat-bubble",children:[se(c),c.state==="done"&&c.meta&&(c.meta.provider||c.meta.model)?(0,d.jsxs)("div",{className:"kc-chat-meta",children:[c.meta.provider,"/",c.meta.model]}):null]})]},c.key)),q&&!s?(0,d.jsxs)("div",{className:"kc-chat-quickrun",children:["\u{1F4A1} \u53EF\u7528\u547D\u4EE4\uFF1A",(0,d.jsx)("code",{children:q}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>t(q),children:"\u25B6 \u53D1\u9001\u5230\u63A7\u5236\u53F0\u6267\u884C"})]}):null]}),(0,d.jsxs)("div",{className:"kc-chat-input-row",children:[(0,d.jsx)("textarea",{ref:i,className:"kc-code-input kc-chat-input",value:a,onChange:c=>k(c.target.value),onKeyDown:V,placeholder:"\u95EE AI\uFF1A\u751F\u6210 kubectl \u547D\u4EE4 / \u89E3\u91CA\u8F93\u51FA / \u6392\u67E5\u62A5\u9519\u2026\uFF08Enter \u53D1\u9001\uFF0CShift+Enter \u6362\u884C\uFF09",spellCheck:!1,rows:2}),s?(0,d.jsx)("button",{className:"kc-btn-primary kc-btn-stop",onClick:$,children:"\u25A0 \u505C\u6B62"}):(0,d.jsx)("button",{className:"kc-btn-primary",onClick:()=>void T(),disabled:a.trim()==="",children:"\u53D1\u9001"})]})]})}var D=E("react/jsx-runtime");function Le({kube:e}){let[t,o]=(0,G.useState)("console"),[n,a]=(0,G.useState)({console:!0,chat:!1}),k=(0,G.useRef)(null),s=(0,G.useCallback)(b=>{o(b),a(y=>y[b]?y:{...y,[b]:!0})},[]),v=(0,G.useCallback)(b=>{s("console"),window.setTimeout(()=>{k.current?.runText(b)},0)},[s]),f=(b,y,A)=>(0,D.jsx)("button",{type:"button",role:"tab","aria-selected":t===b,title:A,className:t===b?"kc-seg-active":"",onClick:()=>s(b),children:y});return(0,D.jsxs)("div",{className:"kc-workspace",children:[(0,D.jsxs)("div",{className:"kc-ws-meta",children:[(0,D.jsxs)("span",{className:"kc-ws-meta-name",title:`kubeconfig \u6587\u4EF6\uFF1A${e.fileName}`,children:["\u2388 ",e.name]}),(0,D.jsx)("span",{className:"kc-ws-meta-chip",title:"\u5F53\u524D\u4E0A\u4E0B\u6587",children:e.currentContext??e.contextNames.join(", ")??"\uFF08\u65E0\uFF09"}),e.server?(0,D.jsx)("span",{className:"kc-ws-meta-chip kc-ws-meta-server",title:"API server",children:e.server}):null,(0,D.jsx)("span",{className:"kc-grow"}),(0,D.jsxs)("div",{className:"kc-seg",role:"tablist","aria-label":"\u4F1A\u8BDD\u5B50\u9875",children:[f("console","\u2328\uFE0F \u547D\u4EE4\u63A7\u5236\u53F0","\u76F4\u63A5\u6267\u884C kubectl \u547D\u4EE4\uFF08\u4F7F\u7528\u672C\u4F1A\u8BDD\u9009\u62E9\u7684 context / namespace\uFF09"),f("chat","\u{1F4AC} AI \u5BF9\u8BDD","\u591A\u8F6E\u5BF9\u8BDD\uFF1A\u751F\u6210 kubectl \u547D\u4EE4 / \u89E3\u91CA\u8F93\u51FA\u7ED3\u679C\uFF1B\u6A21\u578B\u8DDF\u968F DSH \u914D\u7F6E")]})]}),(0,D.jsxs)("div",{className:"kc-ws-body",children:[n.console?(0,D.jsx)("div",{className:"kc-ws-pane","data-active":t==="console"?"true":void 0,style:t==="console"?void 0:{display:"none"},children:(0,D.jsx)(Ie,{ref:k,kube:e})}):null,n.chat?(0,D.jsx)("div",{className:"kc-ws-pane","data-active":t==="chat"?"true":void 0,style:t==="chat"?void 0:{display:"none"},children:(0,D.jsx)(He,{kube:e,onRunCommand:v})}):null]})]})}var h=E("react/jsx-runtime"),Be=0;function dt(){return Be+=1,`session_${Date.now().toString(36)}_${Be}`}function ge(e={}){let[t,o]=(0,R.useState)([]),[n,a]=(0,R.useState)(null),[k,s]=(0,R.useState)(!1),[v,f]=(0,R.useState)(null),[b,y]=(0,R.useState)(null),A=(0,R.useRef)(!0),[g,K]=(0,R.useState)([]),[z,M]=(0,R.useState)(null),j=(0,R.useCallback)((u,m)=>{y({kind:u,text:m}),window.setTimeout(()=>y($=>$?.text===m?null:$),u==="error"?6e3:2600)},[]),I=(0,R.useCallback)(async()=>{s(!0);try{let[u,{kubeconfigs:m}]=await Promise.all([B.state(!0),B.kubeconfigs()]);a(u),o(m),f(null)}catch(u){let m=await W(u);f(`\u65E0\u6CD5\u8FDE\u63A5\u63D2\u4EF6\u670D\u52A1\uFF1A${m}\u3002\u8BF7\u786E\u8BA4\u5DF2\u5728 DSH \u4E2D\u5B89\u88C5\u5E76\u542F\u7528 dsh-plugin-k8s\uFF08\u91CD\u542F dsh web \u540E\u751F\u6548\uFF09\u3002`),j("error",`\u52A0\u8F7D\u5931\u8D25\uFF1A${m}`)}finally{s(!1)}},[j]);(0,R.useEffect)(()=>{A.current&&(A.current=!1,I())},[I]),(0,R.useEffect)(()=>{let u=new Set(t.map(m=>m.id));K(m=>{let $=m.filter(T=>u.has(T.kube.id));return $.length===m.length?m:$})},[t]),(0,R.useEffect)(()=>{z!==null&&!g.some(u=>u.key===z)&&M(g.length>0?g[g.length-1].key:null)},[g,z]);let i=(0,R.useCallback)(u=>{let m={key:dt(),kube:u};K($=>[...$,m]),M(m.key)},[]),N=(0,R.useCallback)(u=>{let m=g.findIndex(V=>V.key===u);if(K(V=>V.filter(_=>_.key!==u)),z!==u)return;let $=m>=0?g[m+1]:void 0,T=m>=0?g[m-1]:void 0;M(($??T)?.key??null)},[g,z]),O=(u,m)=>{let $=g.slice(0,m+1).filter(q=>q.kube.id===u.kube.id).length,T=g.filter(q=>q.kube.id===u.kube.id).length,V=u.kube.name,_=T>1?`${V} #${$}`:V,Y=u.kube.currentContext?` \xB7 ${u.kube.currentContext}`:"";return{title:_,sub:`${u.kube.name}${Y} \u2014 \u4F1A\u8BDD ${$}`}},X=u=>(0,h.jsx)(Le,{kube:u.kube},u.key);return(0,h.jsxs)("div",{className:"kc-app",children:[(0,h.jsxs)("div",{className:"kc-topbar",children:[(0,h.jsxs)("div",{className:"kc-title",children:[(0,h.jsx)("span",{className:"kc-logo",children:"K8s"})," K8s \u63A7\u5236\u53F0",(0,h.jsx)("span",{className:"kc-badge",children:"dsh-plugin-k8s"}),n?.kubectl.version?(0,h.jsxs)("span",{className:"kc-badge kc-badge-ok",children:["kubectl ",n.kubectl.version]}):null,n&&!n.kubectl.present?(0,h.jsx)("span",{className:"kc-badge kc-badge-bad",title:n.kubectl.missingReason,children:"kubectl \u672A\u627E\u5230"}):null]}),(0,h.jsx)("div",{className:"kc-grow"}),b?(0,h.jsx)("span",{className:`kc-notice kc-notice-${b.kind}`,title:b.text,children:b.text}):null,k?(0,h.jsx)("span",{className:"kc-muted",children:"\u2026"}):null,e.onClose?(0,h.jsx)("button",{onClick:e.onClose,title:"\u5173\u95ED\u9762\u677F\uFF0C\u56DE\u5230\u5BF9\u8BDD",children:e.standalone?"\u2715 \u5173\u95ED":"\u2715 \u56DE\u5230\u5BF9\u8BDD"}):null]}),v?(0,h.jsx)("div",{className:"kc-fatal",children:(0,h.jsxs)("div",{className:"kc-fatal-box",children:[(0,h.jsx)("div",{className:"kc-fatal-title",children:"\u26A0\uFE0F K8s \u63A7\u5236\u53F0\u6682\u65F6\u4E0D\u53EF\u7528"}),(0,h.jsx)("div",{className:"kc-fatal-text",children:v}),(0,h.jsx)("button",{onClick:()=>{f(null),I()},children:"\u91CD\u8BD5"})]})}):(0,h.jsxs)("div",{className:"kc-app-body",children:[(0,h.jsx)(Me,{kubeconfigs:t,busyList:k,refresh:I,onOpenSession:i,onFlash:j,stateInfo:n}),(0,h.jsxs)("div",{className:"kc-main",children:[(0,h.jsxs)("div",{className:"kc-tabbar",role:"tablist","aria-label":"\u5DF2\u6253\u5F00\u7684\u96C6\u7FA4\u4F1A\u8BDD",children:[g.length===0?(0,h.jsx)("span",{className:"kc-muted",style:{padding:"0 10px",whiteSpace:"nowrap"},children:"\u70B9\u51FB\u5DE6\u4FA7 kubeconfig \u65B0\u5EFA\u4F1A\u8BDD\uFF08\u540C\u4E00\u96C6\u7FA4\u53EF\u5F00\u591A\u4E2A\u72EC\u7ACB\u4F1A\u8BDD\uFF09\u3002"}):null,g.map((u,m)=>{let{title:$,sub:T}=O(u,m);return(0,h.jsxs)("div",{role:"tab","aria-selected":u.key===z,className:`kc-tab${u.key===z?" kc-tab-active":""}`,title:`${T} \u2014\u2014 \u70B9\u51FB\u5207\u6362\uFF0C\u2715 \u5173\u95ED`,onClick:()=>M(u.key),children:[(0,h.jsx)("span",{className:"kc-tab-icon",children:"\u2388"}),(0,h.jsx)("span",{className:"kc-tab-label",children:$}),(0,h.jsx)("span",{className:"kc-tab-close",title:"\u5173\u95ED",onClick:V=>{V.stopPropagation(),N(u.key)},children:"\u2715"})]},u.key)})]}),(0,h.jsx)("div",{className:"kc-tabpanes",children:g.length===0?(0,h.jsxs)("div",{className:"kc-empty",style:{flex:1},children:[(0,h.jsx)("div",{style:{fontSize:30,opacity:.5},children:"\u2388"}),(0,h.jsx)("div",{children:"\u8FD8\u6CA1\u6709\u6253\u5F00\u4EFB\u4F55\u96C6\u7FA4\u4F1A\u8BDD\u3002"}),(0,h.jsxs)("div",{style:{marginTop:6,fontSize:12},className:"kc-muted",children:["\u5DE6\u4FA7\u70B9\u51FB kubeconfig \u5373\u53EF\u65B0\u5EFA\u4F1A\u8BDD Tab\uFF08\u91CD\u590D\u70B9\u51FB\u540C\u4E00\u96C6\u7FA4\u4F1A\u518D\u5F00\u4E00\u4E2A\u72EC\u7ACB\u4F1A\u8BDD\uFF09\uFF1B",(0,h.jsx)("br",{}),"\u6BCF\u4E2A\u4F1A\u8BDD\u5185\u542B\u300C\u2328\uFE0F \u547D\u4EE4\u63A7\u5236\u53F0\u300D\u4E0E\u300C\u{1F4AC} AI \u5BF9\u8BDD\u300D\u4E24\u4E2A\u5B50\u9875\uFF0C\u5404\u81EA\u72EC\u7ACB\u4FDD\u6301\u72B6\u6001\u3002"]})]}):g.map(u=>(0,h.jsx)("div",{role:"tabpanel",className:"kc-pane","data-active":u.key===z?"true":void 0,style:u.key===z?void 0:{display:"none"},children:X(u)},u.key))})]})]})]})}var xe=E("react/jsx-runtime"),Q=null,je=null;function pt(){return Q!==null||(Q=document.createElement("div"),Q.id="dsh-k8s-console",Q.style.cssText=["position:absolute","inset:0","z-index:30","display:none","flex-direction:column","overflow:hidden","background:var(--kc-bg)"].join(";"),document.body.appendChild(Q),je=(0,Ve.createRoot)(Q),je.render((0,xe.jsx)(ge,{onClose:()=>F.close(),standalone:!1}))),Q}function Je(e){let t=(0,oe.useRef)(null);return(0,oe.useEffect)(()=>{let o=t.current;if(o===null)return;let n=pt(),a=o.closest("[data-phase]")??o.parentElement,k,s=v=>{Number.isFinite(v)&&v>=32&&n.style.setProperty("--kc-shell-header-h",`${v}px`)};if(a!=null){let v=a.querySelector("header");v!==null&&(k=new ResizeObserver(f=>{for(let b of f){let y=b.borderBoxSize,A=Array.isArray(y)?y[0]?.blockSize:void 0;s(A??v.getBoundingClientRect().height)}}),k.observe(v),s(v.getBoundingClientRect().height))}return a!=null&&(F.setDocked(!0),n.style.display="flex",n.parentElement!==a&&a.appendChild(n)),()=>{k?.disconnect(),F.setDocked(!1),n.parentElement!==document.body&&document.body.appendChild(n),n.style.display="none"}},[]),(0,xe.jsx)("div",{ref:t,style:{height:0,overflow:"hidden"}})}var We=`/* dsh-plugin-k8s \u5BA2\u6237\u7AEF\u6837\u5F0F\uFF08\u96F6\u5916\u90E8\u4F9D\u8D56\uFF0C\u5168\u90E8\u9650\u5B9A\u5728 #dsh-k8s-console\uFF09
 *
 * \u4E3B\u9898\u7B56\u7565\uFF08\u5BF9\u9F50\u756A\u8304\u5DE5\u4F5C\u53F0 / \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0\uFF09\uFF1A
 *   \u989C\u8272\u4E00\u5F8B\u5F15\u7528 DSH Web \u7684\u4E3B\u9898 token\uFF08--dsw-alias-* / --ds-*\uFF09\uFF0C\u8DDF\u968F DSH
 *   \u914D\u7F6E\u7684\u4E3B\u9898\uFF08\u660E\u6697 / \u6362\u80A4\uFF09\u81EA\u52A8\u53D8\u5316\uFF1Btoken \u62FF\u4E0D\u5230\u65F6\u56DE\u843D\u5230\u5185\u7F6E\u6697\u8272\u503C\u3002
 *
 * \u5E03\u5C40\u7B56\u7565\uFF1A
 *   \u5DE5\u4F5C\u53F0\u56DB\u8FB9\u4E0D\u7559 margin\uFF0C\u533A\u57DF\u4E4B\u95F4\u7528 1px hairline \u5206\u5272\u7EBF\uFF08--kc-border\uFF09\u5206\u5F00\uFF1B
 *   \u9762\u677F\u4E0D\u518D\u81EA\u5E26\u63CF\u8FB9\u4E0E\u5E95\u8272\uFF0C\u5C3D\u91CF\u5C11\u8FB9\u6846\uFF1B\u9876\u680F + TabBar \u603B\u9AD8\u4E0E\u5BBF\u4E3B\u5BF9\u8BDD\u5934\u90E8
 *   \u5BF9\u9F50\uFF08\u9AD8\u5EA6\u7531 overlay.tsx \u5B9E\u6D4B\u5199\u5165 --kc-shell-header-h\uFF09\u3002
 */
:root {
  --kc-bg: var(--dsw-alias-bg-base, #12141a);
  --kc-panel: var(--dsw-alias-bg-layer-1, #171a21);
  --kc-panel-2: var(--dsw-alias-bg-layer-2, #1d212b);
  --kc-border: var(--dsw-alias-border-l2, rgba(136, 148, 168, 0.24));
  --kc-border-strong: var(--dsw-alias-border-l3, rgba(136, 148, 168, 0.38));
  --kc-text: var(--dsw-alias-label-primary, #e6e9ef);
  --kc-muted: var(--dsw-alias-label-secondary, #8b93a3);
  --kc-faint: var(--dsw-alias-label-tertiary, #6b7383);
  --kc-accent: var(--dsw-alias-state-business-primary, #3fa7f7);
  --kc-accent-weak: color-mix(in srgb, var(--kc-accent) 12%, transparent);
  --kc-ok: var(--dsw-alias-state-success-primary, #37c978);
  --kc-warn: var(--dsw-alias-state-warn-primary, #e0b341);
  --kc-err: var(--dsw-alias-state-error-primary, #ff5f56);
  --kc-radius: 10px;
  --kc-mono: "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace;
  --kc-ease: var(--ds-transition-duration-fast, 120ms) var(--ds-ease-in-out, ease);
  /* \u5BBF\u4E3B\u5BF9\u8BDD\u5934\u90E8\u5B9E\u6D4B\u9AD8\u5EA6\uFF08overlay.tsx \u7528 ResizeObserver \u5199\u5165\uFF09\uFF1B\u62FF\u4E0D\u5230\u65F6\u56DE\u843D 76px\u3002
     \u9876\u680F + TabBar \u9AD8\u5EA6\u4E4B\u548C\u8DDF\u968F\u5B83\uFF0C\u4E0E\u5BBF\u4E3B\u5934\u90E8\u5E95\u8FB9\u7CBE\u786E\u5BF9\u9F50\u3002 */
  --kc-shell-header-h: 76px;
  --kc-tabbar-h: 32px;
}

/* token \u91CD\u58F0\u660E\uFF1ADSH \u7684 --dsw-alias-* \u82E5\u4E0D\u662F\u6302\u5728 :root \u800C\u662F\u6302\u5728\u5E94\u7528\u5BB9\u5668\u4E0A\uFF0C
   \u8FD9\u91CC\u5728\u5BB9\u5668\u81EA\u8EAB\u518D\u6C42\u503C\u4E00\u6B21\uFF0C\u4FDD\u8BC1\u63A7\u5236\u53F0\u53D6\u5230\u6B63\u786E\u4E3B\u9898\u8272\u3002 */
#dsh-k8s-console {
  --kc-bg: var(--dsw-alias-bg-base, #12141a);
  --kc-panel: var(--dsw-alias-bg-layer-1, #171a21);
  --kc-panel-2: var(--dsw-alias-bg-layer-2, #1d212b);
  --kc-border: var(--dsw-alias-border-l2, rgba(136, 148, 168, 0.24));
  --kc-border-strong: var(--dsw-alias-border-l3, rgba(136, 148, 168, 0.38));
  --kc-text: var(--dsw-alias-label-primary, #e6e9ef);
  --kc-muted: var(--dsw-alias-label-secondary, #8b93a3);
  --kc-faint: var(--dsw-alias-label-tertiary, #6b7383);
  --kc-accent: var(--dsw-alias-state-business-primary, #3fa7f7);
  --kc-ok: var(--dsw-alias-state-success-primary, #37c978);
  --kc-warn: var(--dsw-alias-state-warn-primary, #e0b341);
  --kc-err: var(--dsw-alias-state-error-primary, #ff5f56);

  color: var(--kc-text);
  font-size: 13px;
  line-height: 1.5;
  font-family: var(--dsw-font-family, inherit);
  box-sizing: border-box;
}
#dsh-k8s-console *,
#dsh-k8s-console *::before,
#dsh-k8s-console *::after {
  box-sizing: border-box;
}

/* ---------- \u4FA7\u8FB9\u680F\u5165\u53E3\uFF08\u4F4D\u4E8E DSH \u4FA7\u680F\uFF0C\u4E0D\u5728\u9762\u677F\u5185\uFF0C\u76F4\u63A5\u7528 DSW token\uFF09 ---------- */
button.kc-sidebar-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 8px 12px;
  margin: 0;
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 1;
  text-align: left;
  transition: background var(--kc-ease), color var(--kc-ease);
}
button.kc-sidebar-entry:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--kc-accent-weak));
  color: var(--dsw-alias-label-secondary);
}
button.kc-sidebar-entry[data-active='true'],
button.kc-sidebar-entry[data-active='true']:hover {
  background: var(--dsw-alias-interactive-bg-active);
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}
.kc-sidebar-entry-icon {
  display: inline-flex;
  flex: 0 0 auto;
  color: inherit;
}
.kc-sidebar-entry-icon svg {
  display: block;
}
.kc-sidebar-entry-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- \u9762\u677F\u6839 ----------
   \u4E2D\u680F\u63A5\u7BA1\u8BF4\u660E\uFF1A\u5DE5\u4F5C\u53F0\u6253\u5F00\u65F6\u7531 overlay.tsx \u628A\u6301\u4E45\u5BB9\u5668\uFF08#dsh-k8s-console\uFF09
   \u4EE5 absolute inset:0 \u8986\u76D6\u5230 Conversation \u6839\u8282\u70B9\u4E0A\uFF08\u53C2\u8003\u756A\u8304\u5DE5\u4F5C\u53F0/\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0\uFF09\uFF0C
   \u4E0D\u9690\u85CF\u3001\u4E0D\u4FEE\u6539\u4EFB\u4F55\u5BBF\u4E3B\u5143\u7D20\uFF0C\u56E0\u6B64\u8FD9\u91CC\u6CA1\u6709\u4EFB\u4F55\u9488\u5BF9\u5BBF\u4E3B\uFF08\u5934\u90E8/composer\uFF09\u7684\u89C4\u5219\u3002 */
#dsh-k8s-console input,
#dsh-k8s-console select,
#dsh-k8s-console textarea,
#dsh-k8s-console button {
  font: inherit;
  color: var(--kc-text);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--kc-border) 72%, transparent);
  border-radius: 8px;
}
#dsh-k8s-console button {
  padding: 5px 11px;
  cursor: pointer;
  transition: background var(--kc-ease), border-color var(--kc-ease), color var(--kc-ease);
}
#dsh-k8s-console button:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, var(--kc-accent-weak));
}
#dsh-k8s-console button:focus-visible {
  outline: 2px solid var(--kc-accent);
  outline-offset: 1px;
}
#dsh-k8s-console button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
#dsh-k8s-console button.kc-btn-primary {
  background: var(--kc-accent);
  border-color: transparent;
  color: var(--dsw-alias-label-primary-inverted, #fff);
  font-weight: 600;
}
#dsh-k8s-console button.kc-btn-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--kc-accent) 86%, #fff);
}
#dsh-k8s-console button.kc-btn-stop {
  background: var(--kc-err);
  border-color: transparent;
  color: var(--dsw-alias-label-primary-inverted, #fff);
}
#dsh-k8s-console button.kc-btn-stop:hover:not(:disabled) {
  background: color-mix(in srgb, var(--kc-err) 86%, #fff);
}
#dsh-k8s-console button.kc-btn-sm {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 6px;
}
#dsh-k8s-console input,
#dsh-k8s-console select,
#dsh-k8s-console textarea {
  padding: 5px 9px;
  background: var(--kc-panel);
  border: 1px solid var(--kc-border);
  transition: border-color var(--kc-ease);
}
#dsh-k8s-console input:focus,
#dsh-k8s-console select:focus,
#dsh-k8s-console textarea:focus {
  outline: none;
  border-color: var(--kc-accent);
}
#dsh-k8s-console input::placeholder,
#dsh-k8s-console textarea::placeholder {
  color: var(--kc-faint);
}

.kc-grow { flex: 1 1 auto; }
.kc-muted { color: var(--kc-muted); }
.kc-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--kc-bg);
}

/* ---------- \u9876\u680F ----------
   \u9AD8\u5EA6 = \u5BBF\u4E3B\u5BF9\u8BDD\u5934\u90E8\u9AD8\u5EA6 - TabBar \u9AD8\u5EA6\uFF0C\u4F7F\u300C\u9876\u680F+TabBar\u300D\u5E95\u90E8\u5206\u5272\u7EBF\u4E0E
   \u5BBF\u4E3B\u5934\u90E8\u5E95\u8FB9\u7CBE\u786E\u5BF9\u9F50\u3002\u65E0\u5916\u8FB9\u8DDD\u3001\u65E0\u5706\u89D2\u63CF\u8FB9\uFF0C\u4EC5\u4E00\u6761\u5E95\u90E8\u5206\u5272\u7EBF\u3002 */
.kc-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: calc(var(--kc-shell-header-h, 76px) - var(--kc-tabbar-h, 32px));
  min-height: 40px;
  padding: 0 20px;
  margin: 0;
  border: 0;
  border-bottom: 1px solid var(--kc-border);
  background: transparent;
}
.kc-title {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.kc-logo {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--kc-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: var(--dsw-alias-label-primary-inverted, #fff);
  letter-spacing: -0.5px;
}
.kc-badge {
  font-size: 11px;
  font-weight: 400;
  color: var(--kc-muted);
  border: 1px solid color-mix(in srgb, var(--kc-border) 80%, transparent);
  border-radius: 999px;
  padding: 1px 8px;
  background: transparent;
  white-space: nowrap;
}
.kc-badge-ok { color: var(--kc-ok); border-color: color-mix(in srgb, var(--kc-ok) 40%, transparent); }
.kc-badge-bad { color: var(--kc-err); border-color: color-mix(in srgb, var(--kc-err) 40%, transparent); }
.kc-notice {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 46%;
}
.kc-notice-ok { color: var(--kc-ok); background: var(--dsw-alias-state-success-secondary, rgba(55, 201, 120, 0.12)); }
.kc-notice-error { color: var(--kc-err); background: var(--dsw-alias-state-error-secondary, rgba(255, 95, 86, 0.12)); }
.kc-notice-info { color: var(--kc-accent); background: var(--kc-accent-weak); }

.kc-fatal {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.kc-fatal-box {
  max-width: 560px;
  background: var(--kc-panel);
  border: 1px solid var(--kc-border);
  border-radius: var(--kc-radius);
  padding: 20px 22px;
}
.kc-fatal-title { font-weight: 600; margin-bottom: 8px; color: var(--kc-err); }
.kc-fatal-text { color: var(--kc-muted); margin-bottom: 14px; white-space: pre-wrap; }

/* ---------- \u4E3B\u4F53\u5E03\u5C40 ----------
   \u533A\u57DF\u95F4\u53EA\u9760\u5206\u5272\u7EBF\uFF1A\u5DE6\u5BFC\u822A\u53F3\u4FA7\u4E00\u6761 hairline\uFF0C\u65E0 margin\u3001\u65E0 gap\u3001\u65E0\u9762\u677F\u63CF\u8FB9\u3002 */
.kc-app-body {
  display: flex;
  gap: 0;
  padding: 0;
  flex: 1;
  min-height: 0;
}
.kc-nav {
  width: 292px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: transparent;
  border: 0;
  border-right: 1px solid var(--kc-border);
  border-radius: 0;
  overflow: hidden;
}
.kc-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: hidden;
}

/* ---------- TabBar\uFF08\u4F1A\u8BDD\uFF09----------
   \u756A\u8304\u5DE5\u4F5C\u53F0 pageTabs \u540C\u6B3E\uFF1A\u6587\u5B57 Tab + \u4E3B\u9898\u8272\u4E0B\u5212\u7EBF\u6307\u793A\uFF1B\u5E95\u90E8\u4E00\u6761\u5206\u5272\u7EBF\u3002 */
.kc-tabbar {
  display: flex;
  align-items: stretch;
  gap: 4px;
  height: calc(var(--kc-tabbar-h, 32px) - 1px);
  padding: 0 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-border-strong) transparent;
  border-bottom: 1px solid var(--kc-border);
  background: transparent;
  flex: 0 0 auto;
}
.kc-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  height: 100%;
  max-width: 240px;
  min-width: 0;
  padding: 0 6px;
  background: transparent;
  border: 0;
  border-radius: 0;
  color: var(--kc-muted);
  cursor: pointer;
  font-size: 12.5px;
  user-select: none;
  white-space: nowrap;
  transition: color var(--kc-ease);
}
.kc-tab::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: -1px;
  left: 2px;
  height: 2px;
  border-radius: 2px;
  background: transparent;
}
.kc-tab:hover { color: var(--kc-text); }
.kc-tab-active {
  background: transparent;
  border: 0;
  color: var(--kc-accent);
  font-weight: 600;
  margin-bottom: 0;
}
.kc-tab-active::after { background: var(--kc-accent); }
.kc-tab-icon { opacity: 0.8; }
.kc-tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kc-tab-close {
  padding: 0 3px;
  border: 0;
  border-radius: 4px;
  color: var(--kc-muted);
  font-size: 11px;
  opacity: 0.55;
}
.kc-tab-close:hover {
  color: var(--kc-err);
  background: color-mix(in srgb, var(--kc-err) 18%, transparent);
  opacity: 1;
}
.kc-tabpanes { flex: 1; min-height: 0; position: relative; }
.kc-pane {
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.kc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--kc-muted);
  text-align: center;
}

/* ---------- \u5DE6\u4FA7 kubeconfig \u7BA1\u7406 ---------- */
.kc-nav-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px 8px;
}
.kc-nav-title { font-weight: 600; font-size: 13px; }
.kc-nav-count {
  font-size: 11px;
  color: var(--kc-muted);
  border: 1px solid color-mix(in srgb, var(--kc-border) 80%, transparent);
  border-radius: 999px;
  padding: 0 7px;
}
.kc-warnbox {
  margin: 0 10px 8px;
  padding: 8px 10px;
  border: 0;
  background: var(--dsw-alias-state-warn-secondary, rgba(224, 179, 65, 0.12));
  border-radius: 8px;
  font-size: 12px;
}
.kc-warnbox-title { color: var(--kc-warn); font-weight: 600; margin-bottom: 2px; }
.kc-warnbox-text { color: var(--kc-muted); white-space: pre-wrap; }
.kc-nav-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-border-strong) transparent;
}
.kc-nav-empty {
  color: var(--kc-muted);
  font-size: 12px;
  white-space: pre-wrap;
  padding: 14px 10px;
}
.kc-conn {
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  transition: background var(--kc-ease), border-color var(--kc-ease);
}
.kc-conn:hover { border-color: color-mix(in srgb, var(--kc-border) 72%, transparent); }
.kc-conn-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  padding: 7px 10px;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 0;
}
.kc-conn-main:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--kc-accent-weak));
  border-color: transparent;
}
.kc-conn-name {
  font-weight: 600;
  color: var(--kc-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kc-conn-sub {
  font-size: 11px;
  color: var(--kc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kc-conn-server {
  font-size: 10px;
  color: var(--kc-faint);
  font-family: var(--kc-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl;
  text-align: left;
}
.kc-conn-state { font-size: 11px; }
.kc-conn-state-ok { color: var(--kc-ok); }
.kc-conn-state-bad { color: var(--kc-err); }
.kc-conn-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 6px;
  background: transparent;
  border-left: 1px solid color-mix(in srgb, var(--kc-border) 60%, transparent);
}
.kc-icon-btn {
  width: 26px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 6px;
  border-color: transparent;
  color: var(--kc-muted);
}
.kc-icon-btn:hover:not(:disabled) {
  color: var(--kc-accent);
  background: var(--dsw-alias-interactive-bg-hover, var(--kc-accent-weak));
}
.kc-icon-btn-danger:hover:not(:disabled) { color: var(--kc-err); }
.kc-nav-foot {
  padding: 8px 10px;
  border-top: 1px solid var(--kc-border);
  color: var(--kc-muted);
  font-size: 11px;
}

/* ---------- \u6A21\u6001\u6846\uFF08\u6DFB\u52A0 kubeconfig\uFF09 ---------- */
.kc-modal-mask {
  position: absolute;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dsw-alias-bg-mask-1, rgba(4, 8, 14, 0.6));
  backdrop-filter: blur(2px);
}
.kc-modal {
  width: min(620px, 90%);
  max-height: 88%;
  overflow-y: auto;
  background: var(--kc-panel);
  border: 1px solid var(--kc-border);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: var(--dsw-shadow-lv3, 0 18px 48px rgba(0, 0, 0, 0.5));
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kc-modal-title { font-weight: 700; font-size: 15px; }
.kc-field { display: flex; flex-direction: column; gap: 5px; }
.kc-field label { font-size: 12px; color: var(--kc-muted); }
.kc-form-error {
  color: var(--kc-err);
  background: var(--dsw-alias-state-error-secondary, rgba(255, 95, 86, 0.12));
  border: 0;
  border-radius: 8px;
  padding: 6px 9px;
  font-size: 12px;
  white-space: pre-wrap;
}
.kc-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ---------- \u5206\u6BB5\u63A7\u4EF6\uFF08\u4F1A\u8BDD\u5B50\u9875 / \u8868\u5355 tab\uFF09 ---------- */
.kc-seg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--kc-panel);
  border: 1px solid color-mix(in srgb, var(--kc-border) 72%, transparent);
  border-radius: 999px;
  padding: 2px;
}
.kc-seg button {
  padding: 3px 11px;
  font-size: 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--kc-muted);
  white-space: nowrap;
}
.kc-seg button:hover:not(:disabled) { color: var(--kc-text); background: transparent; border: 0; }
.kc-seg button.kc-seg-active {
  background: var(--kc-accent-weak);
  color: var(--kc-accent);
  font-weight: 600;
}
.kc-seg button.kc-seg-active:hover:not(:disabled) { background: var(--kc-accent-weak); color: var(--kc-accent); }

/* ---------- \u4EE3\u7801\u8F93\u5165/\u8F93\u51FA ---------- */
.kc-code-input {
  font-family: var(--kc-mono);
  font-size: 12px;
  line-height: 1.55;
  background: var(--kc-panel);
  resize: vertical;
  tab-size: 2;
}

/* ---------- \u4F1A\u8BDD\u5DE5\u4F5C\u533A ---------- */
.kc-workspace { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.kc-ws-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--kc-border);
  background: transparent;
  flex: 0 0 auto;
}
.kc-ws-meta-name { font-weight: 600; font-size: 13px; }
.kc-ws-meta-chip {
  font-size: 11px;
  color: var(--kc-muted);
  border: 1px solid color-mix(in srgb, var(--kc-border) 80%, transparent);
  border-radius: 999px;
  padding: 1px 8px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kc-ws-meta-server { font-family: var(--kc-mono); }
.kc-ws-body { flex: 1; min-height: 0; position: relative; }
.kc-ws-pane {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ---------- \u547D\u4EE4\u63A7\u5236\u53F0 ---------- */
.kc-console {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 10px 12px;
  gap: 8px;
}
.kc-console-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.kc-console-env { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.kc-console-env label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--kc-muted);
}
.kc-console-env select,
.kc-console-env input {
  font-size: 12px;
  min-width: 90px;
  padding: 3px 7px;
}
.kc-console-input-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.kc-console-input-row .kc-code-input { flex: 1; }
.kc-console-input-row button { white-space: nowrap; }
.kc-console-status {
  font-size: 12px;
  color: var(--kc-accent);
  padding: 0 2px;
}
.kc-output {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: var(--kc-bg);
  border: 1px solid color-mix(in srgb, var(--kc-border) 60%, transparent);
  border-radius: 8px;
  padding: 8px 0;
  font-family: var(--kc-mono);
  font-size: 12px;
  line-height: 1.5;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-border-strong) transparent;
}
.kc-output-empty {
  padding: 10px 14px;
  color: var(--kc-muted);
  font-family: inherit;
}
.kc-out-line {
  margin: 0;
  padding: 0 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--kc-mono);
}
.kc-out-cmd {
  color: var(--kc-accent);
  background: var(--kc-accent-weak);
  border-left: 2px solid var(--kc-accent);
  padding-top: 2px;
  padding-bottom: 2px;
}
.kc-out-prompt { color: var(--kc-accent); user-select: none; }
.kc-out-stdout { color: var(--kc-text); }
.kc-out-stderr { color: color-mix(in srgb, var(--kc-err) 72%, var(--kc-text)); }
.kc-out-err { color: var(--kc-err); }
.kc-out-sys { color: var(--kc-muted); font-size: 11px; }
.kc-out-muted { color: var(--kc-faint); }
.kc-exitbar {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--kc-ok);
  border-top: 1px solid color-mix(in srgb, var(--kc-border) 60%, transparent);
  padding: 5px 4px 0;
}
.kc-exitbar-err { color: var(--kc-err); }
.kc-exitbar-muted { color: var(--kc-muted); }

/* ---------- AI \u5BF9\u8BDD ---------- */
.kc-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 10px 12px;
  gap: 8px;
}
.kc-chat-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.kc-chat-toolbar label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--kc-muted);
}
.kc-chat-toolbar select { font-size: 12px; min-width: 150px; padding: 3px 7px; }
.kc-chat-cluster {
  font-size: 11px;
  color: var(--kc-muted);
  font-family: var(--kc-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40%;
}
.kc-chat-warn {
  font-size: 12px;
  color: var(--kc-warn);
  background: var(--dsw-alias-state-warn-secondary, rgba(224, 179, 65, 0.12));
  border: 0;
  border-radius: 8px;
  padding: 6px 9px;
  white-space: pre-wrap;
}
.kc-chat-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 2px;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-border-strong) transparent;
}
.kc-chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--kc-muted);
  font-size: 12px;
}
.kc-chat-row { display: flex; gap: 8px; align-items: flex-start; }
.kc-chat-assistant { flex-direction: row; }
.kc-chat-user { flex-direction: row-reverse; }
.kc-chat-avatar {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--kc-panel);
  border: 1px solid color-mix(in srgb, var(--kc-border) 80%, transparent);
  font-size: 14px;
  user-select: none;
}
.kc-chat-bubble {
  max-width: min(760px, 82%);
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  overflow-wrap: break-word;
}
.kc-chat-user .kc-chat-bubble {
  background: var(--kc-accent-weak);
  border: 1px solid color-mix(in srgb, var(--kc-accent) 30%, transparent);
}
.kc-chat-assistant .kc-chat-bubble {
  background: var(--kc-panel);
  border: 1px solid color-mix(in srgb, var(--kc-border) 70%, transparent);
}
.kc-chat-user-text { white-space: pre-wrap; }
.kc-chat-ai-text { white-space: normal; }
.kc-chat-text-span { white-space: pre-wrap; }
.kc-chat-cursor {
  display: inline-block;
  width: 7px;
  color: var(--kc-accent);
  animation: kc-blink 1s steps(2, start) infinite;
}
@keyframes kc-blink { to { visibility: hidden; } }
.kc-chat-error-text {
  color: var(--kc-err);
  white-space: pre-wrap;
}
.kc-chat-meta {
  margin-top: 6px;
  font-size: 10px;
  color: var(--kc-faint);
  text-align: right;
}
.kc-chat-quickrun {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px dashed color-mix(in srgb, var(--kc-border-strong) 80%, transparent);
  border-radius: 8px;
  font-size: 12px;
  color: var(--kc-muted);
  background: var(--kc-panel);
}
.kc-chat-quickrun code {
  font-family: var(--kc-mono);
  font-size: 11px;
  color: var(--kc-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.kc-chat-input-row { display: flex; gap: 8px; align-items: stretch; }
.kc-chat-input-row .kc-code-input { flex: 1; }
.kc-chat-input-row button { white-space: nowrap; }

/* ---------- \u4EE3\u7801\u5757\uFF08AI \u56DE\u590D\u5185\uFF09 ---------- */
.kc-codebox {
  margin: 6px 0;
  border: 1px solid color-mix(in srgb, var(--kc-border) 70%, transparent);
  border-radius: 8px;
  overflow: hidden;
  background: var(--kc-bg);
}
.kc-codebox-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px 3px 10px;
  background: var(--kc-panel);
  border-bottom: 1px solid color-mix(in srgb, var(--kc-border) 60%, transparent);
}
.kc-codebox-lang {
  font-size: 11px;
  color: var(--kc-muted);
  font-family: var(--kc-mono);
}
.kc-codebox-body {
  margin: 0;
  padding: 8px 12px;
  font-family: var(--kc-mono);
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--kc-text);
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-border-strong) transparent;
}

/* ---------- \u6EDA\u52A8\u6761\uFF08WebKit \u56DE\u843D\uFF1B\u73B0\u4EE3\u6D4F\u89C8\u5668\u8D70 scrollbar-width/color\uFF09 ---------- */
#dsh-k8s-console *::-webkit-scrollbar { width: 8px; height: 8px; }
#dsh-k8s-console *::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--kc-border-strong) 85%, transparent);
  border-radius: 4px;
}
#dsh-k8s-console *::-webkit-scrollbar-track { background: transparent; }
`;var Fe="dsh-k8s-console-style";function Xe(){if(typeof document>"u")return()=>{};let e=document.getElementById(Fe);if(e!==null&&e.isConnected)return()=>{};let t=document.createElement("style");return t.id=Fe,t.setAttribute("data-plugin","dsh-plugin-k8s"),t.textContent=We,document.head.appendChild(t),()=>{t.isConnected&&t.remove()}}var _e={"sidebar.label":"K8s","sidebar.aria":"K8s \u63A7\u5236\u53F0","sidebar.title":"\u6253\u5F00 K8s \u63A7\u5236\u53F0","overlay.close":"\u56DE\u5230\u5BF9\u8BDD"},qe={"sidebar.label":"K8s","sidebar.aria":"K8s console","sidebar.title":"Open K8s console","overlay.close":"Back to conversation"};var kt=["slots","locale"];function bt(e){let t=e?.slots,o=e?.locale;if(!t||!o)return;let n=o.bind("k8s"),a=o.register("k8s",{zh:_e,en:qe}),k=Xe(),s=t.inject("sidebar.footer.action",()=>t.register({name:"sidebar.footer.action",id:"k8s-console",order:-9,locale:"k8s",label:()=>n("sidebar.label")},Te)),v=t.inject("conversation.view",()=>t.register({name:"conversation.view",id:"k8s",order:65,locale:"k8s",label:()=>n("sidebar.label")},Je));e?.effect&&e.effect(()=>()=>{a(),s(),v(),k()},"dsh-plugin-k8s: plugin teardown")}return nt(ft);})();
    return __dsh_k8s_module__;
  },
});
