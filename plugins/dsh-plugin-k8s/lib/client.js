window.__ModuleLoader__.load({
  id: "@snowlocked/dsh-k8s-console",
  factory: (require) => {
    "use strict";
    var __dsh_k8s_internal = { exports: {} };
    var __dsh_k8s_exports = __dsh_k8s_internal.exports;
    Object.defineProperty(__dsh_k8s_exports, Symbol.toStringTag, { value: "Module" });
"use strict";var __dsh_k8s_module__=(()=>{var pe=Object.defineProperty;var Ye=Object.getOwnPropertyDescriptor;var Ue=Object.getOwnPropertyNames;var Ge=Object.prototype.hasOwnProperty;var T=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,n)=>(typeof require<"u"?require:t)[n]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var Qe=(e,t)=>{for(var n in t)pe(e,n,{get:t[n],enumerable:!0})},Ze=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let c of Ue(t))!Ge.call(e,c)&&c!==n&&pe(e,c,{get:()=>t[c],enumerable:!(o=Ye(t,c))||o.enumerable});return e};var et=e=>Ze(pe({},"__esModule",{value:!0}),e);var ut={};Qe(ut,{apply:()=>pt,inject:()=>lt});var ae=T("react");var re=T("react");var Pe=T("react");var Ne="dsh-k8s-console.persist.v1";function ue(){try{let e=window.localStorage.getItem(Ne);if(!e)return{};let t=JSON.parse(e);return t&&typeof t=="object"?t:{}}catch{return{}}}function Se(e){try{let t={...ue(),...e};window.localStorage.setItem(Ne,JSON.stringify(t))}catch{}}var Y=ue().panelOpen===!0,be=new Set,ke=()=>{for(let e of be)e()},me=Object.freeze({panelOpen:!0}),ge=Object.freeze({panelOpen:!1}),oe=Y?me:ge,fe=()=>{try{Se({panelOpen:Y})}catch{}},X={open(){Y||(Y=!0,oe=me,fe(),ke())},close(){Y&&(Y=!1,oe=ge,fe(),ke())},toggle(){Y=!Y,oe=Y?me:ge,fe(),ke()},getSnapshot:()=>oe,subscribe(e){return be.add(e),()=>be.delete(e)}};function Ee(){return(0,Pe.useSyncExternalStore)(X.subscribe,X.getSnapshot,X.getSnapshot)}var V=T("react/jsx-runtime"),tt=(0,V.jsxs)("svg",{viewBox:"0 0 16 16",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,V.jsx)("circle",{cx:"8",cy:"8",r:"1.4",fill:"currentColor",stroke:"none"}),(0,V.jsx)("circle",{cx:"8",cy:"2.6",r:"1.05",fill:"currentColor",stroke:"none"}),(0,V.jsx)("circle",{cx:"8",cy:"13.4",r:"1.05",fill:"currentColor",stroke:"none"}),(0,V.jsx)("circle",{cx:"2.6",cy:"8",r:"1.05",fill:"currentColor",stroke:"none"}),(0,V.jsx)("circle",{cx:"13.4",cy:"8",r:"1.05",fill:"currentColor",stroke:"none"}),(0,V.jsx)("path",{d:"M8 4v2.6M8 9.4V12M4.6 6.6l2.2 1.4M9.2 8l2.2 1.4M4.6 9.4l2.2-1.4M9.2 8l2.2-1.4"})]});function Te(e={}){let{wide:t=!0,t:n=(a=>a)}=e,o=n,c=(0,re.useSyncExternalStore)(X.subscribe,X.getSnapshot,X.getSnapshot),x=(0,re.useCallback)(()=>{X.toggle()},[]);return(0,V.jsxs)("button",{type:"button","data-d-sh-plugin":"k8s-console","data-active":c.panelOpen||void 0,"aria-label":o("sidebar.aria"),title:o("sidebar.title"),onClick:x,className:"kc-sidebar-entry",children:[(0,V.jsx)("span",{className:"kc-sidebar-entry-icon","aria-hidden":"true",children:tt}),t?(0,V.jsx)("span",{className:"kc-sidebar-entry-label",children:o("sidebar.label")}):null]})}var U=T("react");var R=T("react");var Ae="/api/dsh-plugin-k8s",Q=class extends Error{status;code;constructor(t,n,o){super(t),this.status=n,this.code=o}};async function F(e){return e instanceof Q||e instanceof Error?e.message:typeof e=="string"?e:JSON.stringify(e)}function Ke(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e??{})}}async function ee(e,t){let n;try{n=await fetch(`${Ae}${e}`,Ke(t))}catch(c){throw new Q(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${c instanceof Error?c.message:String(c)}`,0)}let o=null;try{o=await n.json()}catch{o=null}if(!n.ok){let c=o&&typeof o=="object"?o:{};throw new Q(String(c.error??`HTTP ${n.status}`),n.status,String(c.code??""))}return o}async function $e(e,t,n,o){let c;try{c=await fetch(`${Ae}${e}`,{...Ke(t),...o?{signal:o}:{}})}catch(u){throw o?.aborted?u:new Q(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${u instanceof Error?u.message:String(u)}`,0)}if(!c.ok||!c.body){let u=`HTTP ${c.status}`;try{let f=await c.json();f?.error&&(u=f.error)}catch{}throw new Q(u,c.status)}let x=c.body.getReader(),a=new TextDecoder("utf-8"),m="";for(;;){let u;try{u=await x.read()}catch(y){throw o?.aborted?y:new Q(`\u8BFB\u53D6\u6D41\u5931\u8D25\uFF1A${y instanceof Error?y.message:String(y)}`,0)}if(u.done)break;m+=a.decode(u.value,{stream:!0});let f;for(;(f=m.indexOf(`

`))>=0;){let y=m.slice(0,f);if(m=m.slice(f+2),y.startsWith("data: ")){let $=y.slice(6).trim();if(!$)continue;try{n(JSON.parse($))}catch{}}}}if(m.startsWith("data: ")){let u=m.slice(6).trim();if(u)try{n(JSON.parse(u))}catch{}}}var B={state:e=>ee("/state",e?{refresh:!0}:{}),kubeconfigs:()=>ee("/kubeconfigs/list"),save:e=>ee("/kubeconfigs/save",e),remove:e=>ee("/kubeconfig/remove",{id:e}),raw:e=>ee("/kubeconfig/raw",{id:e}),check:e=>ee("/kubeconfigs/check",{id:e}),aiModels:()=>ee("/ai/models"),run:(e,t,n)=>$e("/run",e,t,n),chat:(e,t,n)=>$e("/ai/chat",e,t,n)};function Me(e){let t=[];for(let n of e.providers)if(n.models.length===0)t.push({key:`p:${n.provider}`,provider:n.provider,label:n.label??n.provider});else for(let o of n.models)t.push({key:`m:${n.provider}/${o.id}`,provider:n.provider,model:o.id,label:o.label??`${n.provider} \xB7 ${o.id}`});return t}function ze(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function xe(e){if(!e)return"\u2014";let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("zh-CN",{hour12:!1})}var L=T("react");var p=T("react/jsx-runtime"),ve={open:!1,name:"",mode:"paste",content:"",filePath:"",busy:!1,error:null};function Re(e){let{kubeconfigs:t,busyList:n,refresh:o,onOpenSession:c,onFlash:x}=e,[a,m]=(0,L.useState)(ve),[u,f]=(0,L.useState)(null),y=e.stateInfo?.kubectl,$=(0,L.useRef)(null);(0,L.useEffect)(()=>{a.open&&a.mode==="paste"&&$.current?.focus()},[a.open,a.mode]);let b=(0,L.useCallback)(s=>{m(C=>({...C,...s}))},[]),E=(0,L.useCallback)(()=>{m(ve)},[]),A=(0,L.useCallback)(async()=>{if(a.busy)return;let s=a.name.trim();if(!s){b({error:"\u8BF7\u586B\u5199 kubeconfig \u540D\u79F0\uFF08\u663E\u793A\u7528\uFF09"});return}if(a.mode==="paste"&&a.content.trim()===""){b({error:"\u8BF7\u7C98\u8D34 kubeconfig \u5185\u5BB9\uFF0C\u6216\u6539\u7528\u201C\u672C\u673A\u6587\u4EF6\u5BFC\u5165\u201D"});return}if(a.mode==="path"&&a.filePath.trim()===""){b({error:"\u8BF7\u586B\u5199\u672C\u673A kubeconfig \u6587\u4EF6\u8DEF\u5F84\uFF08\u5982 D:\\path\\dev.yaml\uFF09"});return}b({busy:!0,error:null});try{await B.save({name:s,content:a.mode==="paste"?a.content:void 0,filePath:a.mode==="path"?a.filePath:void 0}),E(),x("ok",`\u5DF2\u4FDD\u5B58 kubeconfig\u300C${s}\u300D`),o()}catch(C){b({error:await F(C)})}finally{b({busy:!1})}},[a,b,E,x,o]),z=(0,L.useCallback)(async s=>{if(window.confirm(`\u5220\u9664 kubeconfig\u300C${s.name}\u300D\uFF1F

\u8BE5\u64CD\u4F5C\u4F1A\u79FB\u9664\u672C\u5730\u4FDD\u5B58\u7684\u6587\u4EF6\u526F\u672C\uFF08\u542B\u8BBF\u95EE\u51ED\u636E\uFF09\uFF0C\u5E76\u5173\u95ED\u5B83\u7684\u6240\u6709\u4F1A\u8BDD Tab\u3002`)){f(`rm:${s.id}`);try{let{ok:O}=await B.remove(s.id);O?(x("info",`\u5DF2\u5220\u9664\u300C${s.name}\u300D`),o()):x("error","\u5220\u9664\u5931\u8D25\uFF1A\u670D\u52A1\u7AEF\u672A\u786E\u8BA4")}catch(O){x("error",`\u5220\u9664\u5931\u8D25\uFF1A${await F(O)}`)}finally{f(null)}}},[x,o]),I=(0,L.useCallback)(async s=>{f(`check:${s.id}`);try{let C=await B.check(s.id);x(C.ok?"ok":"error",`\u300C${s.name}\u300D${C.ok?"\u2705 \u96C6\u7FA4\u53EF\u8FBE":"\u274C \u4E0D\u53EF\u8FBE"}\uFF1A${C.message}`)}catch(C){x("error",`\u300C${s.name}\u300D\u68C0\u67E5\u5931\u8D25\uFF1A${await F(C)}`)}finally{f(null),o()}},[x,o]),D=(0,L.useCallback)(async s=>{f(`copy:${s.id}`);try{let{content:C}=await B.raw(s.id);await navigator.clipboard.writeText(C),x("ok",`\u5DF2\u590D\u5236\u300C${s.name}\u300D\u5B8C\u6574 kubeconfig \u5230\u526A\u8D34\u677F\uFF08\u542B\u51ED\u636E\uFF0C\u6CE8\u610F\u4FDD\u7BA1\uFF09`)}catch(C){x("error",`\u590D\u5236\u5931\u8D25\uFF1A${await F(C)}`)}finally{f(null)}},[x]);return(0,p.jsxs)("div",{className:"kc-nav",children:[(0,p.jsxs)("div",{className:"kc-nav-head",children:[(0,p.jsx)("span",{className:"kc-nav-title",children:"kubeconfig"}),(0,p.jsx)("span",{className:"kc-nav-count",children:t.length}),(0,p.jsx)("span",{className:"kc-grow"}),(0,p.jsx)("button",{className:"kc-btn-sm",onClick:()=>{b({...ve,open:!0})},title:"\u6DFB\u52A0 kubeconfig\uFF08\u7C98\u8D34\u5185\u5BB9\u6216\u5BFC\u5165\u672C\u673A\u6587\u4EF6\uFF09",children:"\u2795 \u6DFB\u52A0"}),(0,p.jsx)("button",{className:"kc-btn-sm",onClick:()=>void o(),disabled:n,title:"\u5237\u65B0\u5217\u8868",children:"\u21BB"})]}),y&&!y.present?(0,p.jsxs)("div",{className:"kc-warnbox",title:y.missingReason,children:[(0,p.jsx)("div",{className:"kc-warnbox-title",children:"\u26A0\uFE0F kubectl \u4E0D\u53EF\u7528"}),(0,p.jsx)("div",{className:"kc-warnbox-text",children:y.missingReason})]}):null,(0,p.jsxs)("div",{className:"kc-nav-list",children:[t.length===0?(0,p.jsx)("div",{className:"kc-nav-empty",children:n?"\u52A0\u8F7D\u4E2D\u2026":`\u8FD8\u6CA1\u6709 kubeconfig\u3002
\u70B9\u53F3\u4E0A\u89D2 \u2795 \u6DFB\u52A0\uFF08\u7C98\u8D34\u5185\u5BB9\u6216\u5BFC\u5165\u672C\u673A\u6587\u4EF6\uFF09\u3002`}):null,t.map(s=>{let C=u===`rm:${s.id}`||u===`check:${s.id}`||u===`copy:${s.id}`;return(0,p.jsxs)("div",{className:"kc-conn",title:"\u70B9\u51FB\u65B0\u5EFA\u4F1A\u8BDD\uFF08\u540C\u4E00\u96C6\u7FA4\u53EF\u5F00\u591A\u4E2A\uFF09",children:[(0,p.jsxs)("button",{type:"button",className:"kc-conn-main",onClick:()=>c(s),disabled:n,children:[(0,p.jsx)("span",{className:"kc-conn-name",children:s.name}),(0,p.jsxs)("span",{className:"kc-conn-sub",children:[s.currentContext??s.contextNames[0]??"\uFF08\u65E0 context\uFF09",s.contextNames.length>1?`\uFF08\u5171 ${s.contextNames.length} \u4E2A context\uFF09`:""]}),(0,p.jsx)("span",{className:"kc-conn-server",title:"API server",children:s.server??""}),s.lastCheckError?(0,p.jsx)("span",{className:"kc-conn-state kc-conn-state-bad",title:`\u4E0A\u6B21\u68C0\u67E5\u5931\u8D25\uFF1A${s.lastCheckError}`,children:"\u2715"}):s.lastCheckedAt?(0,p.jsx)("span",{className:"kc-conn-state kc-conn-state-ok",title:`\u4E0A\u6B21\u68C0\u67E5 ${xe(s.lastCheckedAt)}`,children:"\u2713"}):null]}),(0,p.jsxs)("span",{className:"kc-conn-actions",children:[(0,p.jsx)("button",{className:"kc-icon-btn",title:"\u6D4B\u8BD5\u8FDE\u901A\uFF08kubectl get --raw=/version\uFF09",disabled:C,onClick:()=>void I(s),children:C&&u===`check:${s.id}`?"\u2026":"\u6D4B"}),(0,p.jsx)("button",{className:"kc-icon-btn",title:"\u590D\u5236\u5B8C\u6574 kubeconfig\uFF08\u542B\u51ED\u636E\uFF09",disabled:C,onClick:()=>void D(s),children:C&&u===`copy:${s.id}`?"\u2026":"\u29C9"}),(0,p.jsx)("button",{className:"kc-icon-btn kc-icon-btn-danger",title:`\u5220\u9664\uFF08${ze(s.size)}\uFF0C\u66F4\u65B0\u4E8E ${xe(s.updatedAt)}\uFF09`,disabled:C,onClick:()=>void z(s),children:"\u2715"})]})]},s.id)})]}),(0,p.jsx)("div",{className:"kc-nav-foot",children:(0,p.jsxs)("div",{className:"kc-muted",style:{fontSize:11,lineHeight:1.6},children:["\u6570\u636E\u76EE\u5F55\uFF1A",e.stateInfo?.dataDir??"\u2026",y?.present&&y.version?(0,p.jsxs)("div",{children:["kubectl ",y.version]}):null]})}),a.open?(0,p.jsx)("div",{className:"kc-modal-mask",onMouseDown:s=>{s.target===s.currentTarget&&E()},children:(0,p.jsxs)("div",{className:"kc-modal",children:[(0,p.jsx)("div",{className:"kc-modal-title",children:"\u2795 \u6DFB\u52A0 kubeconfig"}),(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"\u540D\u79F0\uFF08\u663E\u793A\u7528\uFF09"}),(0,p.jsx)("input",{value:a.name,onChange:s=>b({name:s.target.value,error:null}),placeholder:"\u4F8B\u5982\uFF1Adevelopment / dev",autoFocus:!0})]}),(0,p.jsxs)("div",{className:"kc-seg",role:"tablist",children:[(0,p.jsx)("button",{type:"button",role:"tab","aria-selected":a.mode==="paste",className:a.mode==="paste"?"kc-seg-active":"",onClick:()=>b({mode:"paste"}),children:"\u{1F4CB} \u7C98\u8D34\u5185\u5BB9"}),(0,p.jsx)("button",{type:"button",role:"tab","aria-selected":a.mode==="path",className:a.mode==="path"?"kc-seg-active":"",onClick:()=>b({mode:"path"}),children:"\u{1F4C1} \u5BFC\u5165\u672C\u673A\u6587\u4EF6"})]}),a.mode==="paste"?(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"kubeconfig \u5185\u5BB9\uFF08YAML\uFF09"}),(0,p.jsx)("textarea",{ref:$,className:"kc-code-input",rows:10,value:a.content,onChange:s=>b({content:s.target.value,error:null}),placeholder:`apiVersion: v1
kind: Config
clusters:
- name: "dev"
  cluster:
    server: "https://\u2026"
\u2026`,spellCheck:!1})]}):(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"\u672C\u673A\u6587\u4EF6\u8DEF\u5F84"}),(0,p.jsx)("input",{value:a.filePath,onChange:s=>b({filePath:s.target.value,error:null}),placeholder:"D:\\Users\\wuzan\\.kube\\configs\\dev.yaml",spellCheck:!1}),(0,p.jsx)("div",{className:"kc-muted",style:{fontSize:11,marginTop:4},children:"\u8BFB\u53D6\u8BE5\u8DEF\u5F84\u7684\u5185\u5BB9\u5E76\u4FDD\u5B58\u526F\u672C\u5230\u63D2\u4EF6\u6570\u636E\u76EE\u5F55\uFF08\u652F\u6301 .yaml/.yml/.config\uFF09\u3002\u4FEE\u6539\u539F\u6587\u4EF6\u4E0D\u4F1A\u540C\u6B65 \u2014\u2014 \u60F3\u7528\u65B0\u7248\u8BF7\u5220\u9664\u540E\u91CD\u65B0\u5BFC\u5165\u3002"})]}),a.error?(0,p.jsx)("div",{className:"kc-form-error",children:a.error}):null,(0,p.jsxs)("div",{className:"kc-modal-actions",children:[(0,p.jsx)("button",{onClick:E,disabled:a.busy,children:"\u53D6\u6D88"}),(0,p.jsx)("button",{className:"kc-btn-primary",onClick:()=>void A(),disabled:a.busy,children:a.busy?"\u4FDD\u5B58\u5E76\u89E3\u6790\u2026":"\u4FDD\u5B58"})]})]})}):null]})}var Z=T("react");var N=T("react");var w=T("react/jsx-runtime"),Oe=800,nt=["get pods -A","get nodes -o wide","get all -n default","logs deploy/xxx -n <ns> --tail=100","describe pod <name> -n <ns>","get events -n <ns> --sort-by=.lastTimestamp"];function ot(e){switch(e){case"timeout":return"\u5DF2\u8D85\u65F6\u88AB\u7EC8\u6B62";case"bytes":return"\u8F93\u51FA\u8D85\u8FC7\u4E0A\u9650\u5DF2\u88AB\u622A\u65AD";case"aborted":return"\u5DF2\u624B\u52A8\u4E2D\u6B62";default:return""}}var Ie=(0,N.forwardRef)(function({kube:t},n){let[o,c]=(0,N.useState)(""),[x,a]=(0,N.useState)(""),[m,u]=(0,N.useState)(""),[f,y]=(0,N.useState)(!1),[$,b]=(0,N.useState)([]),[E,A]=(0,N.useState)(null),[z,I]=(0,N.useState)([]),[D,s]=(0,N.useState)(-1),[C,O]=(0,N.useState)(null),W=(0,N.useRef)(null),k=(0,N.useRef)(null),g=(0,N.useRef)(null),M=(0,N.useRef)(()=>{}),K=(0,N.useCallback)(r=>{b(l=>{let v=[...l,r];return v.length>Oe?v.slice(v.length-Oe):v})},[]);(0,N.useEffect)(()=>{let r=k.current;r&&(r.scrollTop=r.scrollHeight)},[$,f,E]);let J=(0,N.useCallback)(()=>{W.current?.abort()},[]),q=(0,N.useCallback)(async r=>{let l=r.trim();if(!l||f)return;let v=l.split(`
`).filter(S=>S.trim()!==""&&!S.trim().startsWith("#")).join(`
`).trim();if(!v)return;W.current=new AbortController;let j=W.current.signal;y(!0),A(null),s(-1),K({kind:"cmd",text:v}),I(S=>[...S.slice(-99),v]);let qe=S=>{if(S.type==="start")K({kind:"sys",text:`\u25B6 ${String(S.command??`kubectl ${v}`)}`}),O(`\u6B63\u5728\u6267\u884C ${String(S.command??"")} \u2026\uFF08\u53EF\u968F\u65F6\u4E2D\u6B62\uFF09`);else if(S.type==="out"){let ce=S.channel==="stderr"?"stderr":"stdout",ne=typeof S.text=="string"?S.text:"";ne&&K({kind:"out",channel:ce,text:ne})}else if(S.type==="exit"){let ce=typeof S.code=="number"?S.code:null,ne=typeof S.signal=="string"?S.signal:null,_e=typeof S.durationMs=="number"?S.durationMs:0,Ce=S.truncated===!0,le=typeof S.reason=="string"?S.reason:void 0;A({code:ce,signal:ne,durationMs:_e,truncated:Ce,reason:le});let de=ot(le);Ce&&!de&&K({kind:"sys",text:"\u8F93\u51FA\u8D85\u8FC7\u4E0A\u9650\u5DF2\u622A\u65AD",tone:"err"}),de&&K({kind:"sys",text:de,tone:le==="aborted"?"muted":"err"}),O(null)}else S.type==="error"&&(K({kind:"err",text:String(S.message??"\u672A\u77E5\u9519\u8BEF")}),O(null))};try{await B.run({id:t.id,command:v,context:x,namespace:m},qe,j),j.aborted&&(K({kind:"sys",text:"\u5DF2\u4E2D\u6B62",tone:"muted"}),A(S=>S??{code:null,signal:null,durationMs:0,truncated:!1,reason:"aborted"}))}catch(S){j.aborted?K({kind:"sys",text:"\u5DF2\u4E2D\u6B62",tone:"muted"}):K({kind:"err",text:await F(S)}),O(null)}finally{y(!1),W.current=null}},[t.id,f,x,m,K]);M.current=q,(0,N.useImperativeHandle)(n,()=>({runText(r){c(r),g.current?.focus(),window.setTimeout(()=>{let l=M.current;l&&l(r)},0)}}),[]);let G=(0,N.useCallback)(()=>{q(o)},[q,o]),_=(0,N.useCallback)(r=>{if(r.key==="Enter"&&!r.shiftKey&&!r.nativeEvent.isComposing){r.preventDefault(),G();return}if(r.key==="ArrowUp"&&z.length>0){let l=D<0?z.length-1:Math.max(0,D-1);s(l),c(z[l]??""),r.preventDefault()}else if(r.key==="ArrowDown"&&D>=0){if(D>=z.length-1)s(-1),c("");else{let l=D+1;s(l),c(z[l]??"")}r.preventDefault()}},[z,D,G]),se=(0,N.useCallback)(()=>{b([]),A(null)},[]),ie=(0,N.useCallback)(async()=>{let r=$.filter(l=>l.kind==="cmd"||l.kind==="out").map(l=>l.kind==="cmd"?`$ ${l.text}`:l.text).join("");try{await navigator.clipboard.writeText(r),O("\u5DF2\u590D\u5236\u8F93\u51FA"),window.setTimeout(()=>O(null),1500)}catch(l){O(`\u590D\u5236\u5931\u8D25\uFF1A${l instanceof Error?l.message:String(l)}`)}},[$]),i=r=>{let l=[];return r.reason==="aborted"?l.push("\u5DF2\u4E2D\u6B62"):r.code===0?l.push("\u6210\u529F"):r.code!==null&&l.push(`\u9000\u51FA\u7801 ${r.code}`),r.signal&&l.push(`signal ${r.signal}`),l.push(`${(r.durationMs/1e3).toFixed(2)}s`),l.join(" \xB7 ")};return(0,w.jsxs)("div",{className:"kc-console",children:[(0,w.jsxs)("div",{className:"kc-console-toolbar",children:[(0,w.jsxs)("div",{className:"kc-console-env",children:[(0,w.jsxs)("label",{title:"\u5728\u8BE5 kubeconfig \u7684\u54EA\u4E9B context \u4E0A\u6267\u884C\uFF08\u7A7A = \u4F7F\u7528\u6587\u4EF6\u5F53\u524D\u4E0A\u4E0B\u6587\uFF09",children:["context",(0,w.jsxs)("select",{value:x,onChange:r=>a(r.target.value),disabled:f,children:[(0,w.jsx)("option",{value:"",children:t.currentContext?`${t.currentContext}\uFF08\u9ED8\u8BA4\uFF09`:"\uFF08\u9ED8\u8BA4\uFF09"}),t.contextNames.filter(r=>r!==t.currentContext).map(r=>(0,w.jsx)("option",{value:r,children:r},r))]})]}),(0,w.jsxs)("label",{title:"\u7ED9\u547D\u4EE4\u9644\u52A0 -n <namespace>\uFF08\u547D\u4EE4\u91CC\u81EA\u5E26 -n \u65F6\u4EE5\u547D\u4EE4\u91CC\u7684\u4E3A\u51C6\uFF09",children:["namespace",(0,w.jsx)("input",{value:m,onChange:r=>u(r.target.value),placeholder:"default",disabled:f,spellCheck:!1})]})]}),(0,w.jsx)("div",{className:"kc-grow"}),(0,w.jsx)("button",{className:"kc-btn-sm",onClick:se,title:"\u6E05\u7A7A\u8F93\u51FA",children:"\u6E05\u7A7A"}),(0,w.jsx)("button",{className:"kc-btn-sm",onClick:()=>void ie(),title:"\u590D\u5236\u5168\u90E8\u547D\u4EE4\u4E0E\u8F93\u51FA",children:"\u590D\u5236\u8F93\u51FA"}),(0,w.jsx)("button",{className:"kc-btn-sm",onClick:()=>{c(nt.join(`
`)),g.current?.focus()},title:"\u586B\u5165\u5E38\u7528\u793A\u4F8B",children:"\u793A\u4F8B"})]}),(0,w.jsxs)("div",{className:"kc-console-input-row",children:[(0,w.jsx)("textarea",{ref:g,className:"kc-code-input kc-command-input",value:o,onChange:r=>c(r.target.value),onKeyDown:_,placeholder:`kubectl \u547D\u4EE4\uFF08\u53EF\u7701\u7565\u524D\u7F00 kubectl\uFF09
\u4F8B\u5982\uFF1Aget pods -A

Enter \u6267\u884C \xB7 Shift+Enter \u6362\u884C \xB7 \u2191/\u2193 \u5386\u53F2 \xB7 \u975E\u4EA4\u4E92\uFF08logs -f \u7B49\u957F\u547D\u4EE4\u8BF7\u7528\u4E2D\u6B62\u6309\u94AE\uFF09`,spellCheck:!1,rows:3}),f?(0,w.jsx)("button",{className:"kc-btn-primary kc-btn-stop",onClick:J,title:"\u4E2D\u6B62\u5F53\u524D\u547D\u4EE4",children:"\u25A0 \u4E2D\u6B62"}):(0,w.jsx)("button",{className:"kc-btn-primary",onClick:G,disabled:o.trim()==="",title:"\u6267\u884C\uFF08Ctrl+Enter \u4EA6\u53EF\uFF09",children:"\u25B6 \u6267\u884C"})]}),C?(0,w.jsx)("div",{className:"kc-console-status",children:C}):null,(0,w.jsx)("div",{className:"kc-output",ref:k,children:$.length===0?(0,w.jsx)("div",{className:"kc-output-empty",children:(0,w.jsxs)("div",{className:"kc-muted",children:["\u8F93\u5165\u547D\u4EE4\u5F00\u59CB\uFF08",t.name,x?` \xB7 --context ${x}`:"",m?` \xB7 -n ${m}`:"","\uFF09\u3002",(0,w.jsx)("br",{}),"\u53EA\u8BFB\u5EFA\u8BAE\uFF1Aget / describe / logs / top / explain\u3002\u7834\u574F\u6027\u547D\u4EE4\u8BF7\u81EA\u884C\u786E\u8BA4\u5F71\u54CD\u3002"]})}):$.map((r,l)=>r.kind==="cmd"?(0,w.jsxs)("div",{className:"kc-out-line kc-out-cmd",children:[(0,w.jsx)("span",{className:"kc-out-prompt",children:"$"})," ",r.text]},l):r.kind==="out"?(0,w.jsx)("pre",{className:`kc-out-line kc-out-${r.channel}${r.text.endsWith(`
`),""}`,children:r.text},l):r.kind==="err"?(0,w.jsxs)("div",{className:"kc-out-line kc-out-err",children:["\u2715 ",r.text]},l):(0,w.jsx)("div",{className:`kc-out-line kc-out-sys${r.tone==="err"?" kc-out-err":""}${r.tone==="muted"?" kc-out-muted":""}`,children:r.text},l))}),E?(0,w.jsxs)("div",{className:`kc-exitbar${E.reason==="aborted"?" kc-exitbar-muted":E.code===0?"":" kc-exitbar-err"}`,children:[E.reason==="aborted"?"\u23F9 ":E.code===0?"\u2713 ":"\u2715 ",i(E),E.truncated?" \xB7 \u26A0\uFE0F \u8F93\u51FA\u88AB\u622A\u65AD":"",f?" \xB7 \u8FD0\u884C\u4E2D":""]}):null]})});var P=T("react");var d=T("react/jsx-runtime"),De=0,rt=()=>(De+=1,De);function at(e){let t=/```(?:bash|sh|shell|kubectl|console)?\s*\n([\s\S]*?)```/g,n;for(;(n=t.exec(e))!==null;){let o=n[1]??"",c=he(o);if(c)return c}return he(e)}function he(e){for(let t of e.split(`
`)){let n=t.replace(/^\s*[$>]\s*/,"").trim();if(!(!n||n.startsWith("#"))&&/^kubectl\b/u.test(n))return n}return null}function st(e){let t=[],n=/```([\w+-]*)\s*\n([\s\S]*?)```/g,o=0,c;for(;(c=n.exec(e))!==null;)c.index>o&&t.push({kind:"text",text:e.slice(o,c.index)}),t.push({kind:"code",lang:c[1]||void 0,text:c[2]??""}),o=n.lastIndex;return o<e.length&&t.push({kind:"text",text:e.slice(o)}),t}function He({kube:e,onRunCommand:t}){let[n,o]=(0,P.useState)([]),[c,x]=(0,P.useState)(""),[a,m]=(0,P.useState)(!1),[u,f]=(0,P.useState)(null),[y,$]=(0,P.useState)(!1),[b,E]=(0,P.useState)(""),[A,z]=(0,P.useState)(null),I=(0,P.useRef)(null),D=(0,P.useRef)(null),s=(0,P.useRef)(null),C=(0,P.useCallback)(async()=>{$(!0);try{f(await B.aiModels())}catch(i){f(null),z(`\u6A21\u578B\u679A\u4E3E\u5931\u8D25\uFF1A${await F(i)}`)}finally{$(!1)}},[]);(0,P.useEffect)(()=>{C()},[C]);let O=(0,P.useMemo)(()=>u?Me(u):[],[u]),W=(0,P.useMemo)(()=>O.find(i=>i.key===b),[O,b]);(0,P.useEffect)(()=>{let i=D.current;i&&(i.scrollTop=i.scrollHeight)},[n]);let k=(0,P.useCallback)(i=>{o(r=>[...r,{...i,key:rt()}])},[]),g=(0,P.useCallback)(i=>{o(r=>{if(r.length===0)return r;let l=r[r.length-1];if(l.role!=="assistant")return r;let v={...l,...i};i.content&&typeof i.content=="string"&&(v.content=l.content+i.content);let j=[...r];return j[j.length-1]=v,j})},[]),M=(0,P.useCallback)(()=>{I.current?.abort()},[]),K=(0,P.useCallback)(async()=>{let i=c.trim();if(!i||a)return;x(""),z(null);let r=n.filter(v=>v.role==="user"||v.state==="done").map(v=>({role:v.role,content:v.content}));r.push({role:"user",content:i}),k({role:"user",content:i}),k({role:"assistant",content:"",state:"streaming"}),m(!0),I.current=new AbortController;let l=I.current.signal;try{await B.chat({id:e.id,provider:W?.provider,model:W?.model,history:r.slice(-40)},v=>{v.type==="delta"&&typeof v.text=="string"?g({content:v.text}):v.type==="done"?g({state:"done",meta:{...typeof v.provider=="string"?{provider:v.provider}:{},...typeof v.model=="string"?{model:v.model}:{}}}):v.type==="aborted"?g({state:"done"}):v.type==="error"&&g({state:"error",content:`\u26A0\uFE0F ${String(v.message??"AI \u51FA\u9519")}`})},l)}catch(v){if(l.aborted)g({state:"done"});else{let j=await F(v);g({state:"error",content:`\u26A0\uFE0F ${j}`})}}finally{m(!1),I.current=null}},[c,a,n,W,e.id,k,g]),J=(0,P.useCallback)(i=>{i.key==="Enter"&&!i.shiftKey&&!i.nativeEvent.isComposing&&(i.preventDefault(),K())},[K]),q=(0,P.useCallback)(()=>{a&&M(),o([]),z(null)},[a,M]),G=[...n].reverse().find(i=>i.role==="assistant"&&i.state==="done"),_=G?at(G.content):null,se=(0,P.useCallback)(async i=>{try{await navigator.clipboard.writeText(i)}catch{}},[]),ie=i=>{if(i.role==="user")return(0,d.jsx)("div",{className:"kc-chat-user-text",children:i.content});if(i.state==="error")return(0,d.jsx)("div",{className:"kc-chat-error-text",children:i.content});let r=st(i.content);return(0,d.jsxs)("div",{className:"kc-chat-ai-text",children:[r.length===0?i.state==="streaming"?(0,d.jsx)("span",{className:"kc-chat-cursor",children:"\u258D"}):(0,d.jsx)("span",{className:"kc-muted",children:"\uFF08\u7A7A\u56DE\u590D\uFF09"}):r.map((l,v)=>{if(l.kind==="text")return(0,d.jsx)("span",{className:"kc-chat-text-span",children:l.text},v);let j=l.lang===void 0||/^(bash|sh|shell|kubectl|console)$/u.test(l.lang)?he(l.text):null;return(0,d.jsxs)("div",{className:"kc-codebox",children:[(0,d.jsxs)("div",{className:"kc-codebox-head",children:[(0,d.jsx)("span",{className:"kc-codebox-lang",children:l.lang||"code"}),(0,d.jsx)("span",{className:"kc-grow"}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>void se(l.text),children:"\u590D\u5236"}),j?(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>t(j),title:`\u53D1\u9001\u5230\u547D\u4EE4\u63A7\u5236\u53F0\u6267\u884C\uFF1A${j}`,children:"\u25B6 \u8FD0\u884C"}):null]}),(0,d.jsx)("pre",{className:"kc-codebox-body",children:l.text})]},v)}),i.state==="streaming"&&r.length>0?(0,d.jsx)("span",{className:"kc-chat-cursor",children:"\u258D"}):null]})};return(0,d.jsxs)("div",{className:"kc-chat",children:[(0,d.jsxs)("div",{className:"kc-chat-toolbar",children:[(0,d.jsxs)("label",{title:"\u590D\u7528 DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\uFF1B\u7A7A = \u8BA9 DSH \u81EA\u52A8\u9009\u62E9",children:["AI \u6A21\u578B",(0,d.jsxs)("select",{value:b,onChange:i=>E(i.target.value),disabled:a||y,children:[(0,d.jsx)("option",{value:"",children:"\u81EA\u52A8\uFF08\u7531 DSH \u9009\u62E9\uFF09"}),O.map(i=>(0,d.jsx)("option",{value:i.key,children:i.label??i.key},i.key))]})]}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>void C(),disabled:y,title:"\u91CD\u65B0\u679A\u4E3E DSH \u6A21\u578B",children:"\u21BB \u6A21\u578B"}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:q,disabled:n.length===0&&!a,title:"\u6E05\u7A7A\u672C\u4F1A\u8BDD\u5BF9\u8BDD",children:"\u6E05\u7A7A\u5BF9\u8BDD"}),(0,d.jsx)("span",{className:"kc-grow"}),(0,d.jsxs)("span",{className:"kc-chat-cluster",title:"AI \u7CFB\u7EDF\u63D0\u793A\u4E2D\u4F1A\u643A\u5E26\u8BE5\u96C6\u7FA4\u4FE1\u606F",children:["\u2388 ",e.name," \xB7 ",e.currentContext??"",e.server?` \xB7 ${e.server.replace(/^https?:\/\//u,"")}`:""]})]}),u&&!u.ok?(0,d.jsxs)("div",{className:"kc-chat-warn",children:["\u26A0\uFE0F ",u.message??"\u6CA1\u6709\u53EF\u7528\u6A21\u578B","\uFF08\u914D\u7F6E\u597D\u540E\u70B9\u201C\u21BB \u6A21\u578B\u201D\u5237\u65B0\uFF09"]}):null,A?(0,d.jsxs)("div",{className:"kc-chat-warn",children:["\u26A0\uFE0F ",A]}):null,(0,d.jsxs)("div",{className:"kc-chat-scroll",ref:D,children:[n.length===0?(0,d.jsx)("div",{className:"kc-chat-empty",children:(0,d.jsxs)("div",{className:"kc-muted",style:{maxWidth:460},children:["\u9488\u5BF9\u5F53\u524D\u96C6\u7FA4\uFF08",e.name,"\uFF09\u63D0\u95EE\uFF0C\u4F8B\u5982\uFF1A",(0,d.jsx)("br",{}),"\xB7 \u201C\u67E5\u770B default \u547D\u540D\u7A7A\u95F4\u4E0B\u6240\u6709 deployment \u53CA\u5176\u72B6\u6001\u201D",(0,d.jsx)("br",{}),"\xB7 \u201C\u627E\u51FA ImagePullBackOff \u7684 pod\uFF0C\u5E76\u89E3\u91CA\u600E\u4E48\u6392\u67E5\u201D",(0,d.jsx)("br",{}),"\xB7 \u201C\u751F\u6210\u628A myapp \u7F29\u5230 2 \u526F\u672C\u7684\u547D\u4EE4\u201D",(0,d.jsx)("br",{}),"\xB7 \u201C\u7C98\u8D34\u4E00\u6761 kubectl \u62A5\u9519\uFF0C\u5E2E\u6211\u89E3\u91CA\u539F\u56E0\u201D",(0,d.jsx)("br",{}),(0,d.jsx)("br",{}),"AI \u751F\u6210\u7684\u53EF\u6267\u884C\u547D\u4EE4\u4F1A\u5728\u4EE3\u7801\u5757\u4E0B\u65B9\u63D0\u4F9B ",(0,d.jsx)("b",{children:"\u25B6 \u8FD0\u884C"}),"\uFF0C\u70B9\u51FB\u540E\u5207\u5230\u547D\u4EE4\u63A7\u5236\u53F0\u76F4\u63A5\u6267\u884C\u3002"]})}):n.map(i=>(0,d.jsxs)("div",{className:`kc-chat-row kc-chat-${i.role}`,children:[(0,d.jsx)("div",{className:"kc-chat-avatar",children:i.role==="user"?"\u{1F9D1}":"\u{1F916}"}),(0,d.jsxs)("div",{className:"kc-chat-bubble",children:[ie(i),i.state==="done"&&i.meta&&(i.meta.provider||i.meta.model)?(0,d.jsxs)("div",{className:"kc-chat-meta",children:[i.meta.provider,"/",i.meta.model]}):null]})]},i.key)),_&&!a?(0,d.jsxs)("div",{className:"kc-chat-quickrun",children:["\u{1F4A1} \u53EF\u7528\u547D\u4EE4\uFF1A",(0,d.jsx)("code",{children:_}),(0,d.jsx)("button",{className:"kc-btn-sm",onClick:()=>t(_),children:"\u25B6 \u53D1\u9001\u5230\u63A7\u5236\u53F0\u6267\u884C"})]}):null]}),(0,d.jsxs)("div",{className:"kc-chat-input-row",children:[(0,d.jsx)("textarea",{ref:s,className:"kc-code-input kc-chat-input",value:c,onChange:i=>x(i.target.value),onKeyDown:J,placeholder:"\u95EE AI\uFF1A\u751F\u6210 kubectl \u547D\u4EE4 / \u89E3\u91CA\u8F93\u51FA / \u6392\u67E5\u62A5\u9519\u2026\uFF08Enter \u53D1\u9001\uFF0CShift+Enter \u6362\u884C\uFF09",spellCheck:!1,rows:2}),a?(0,d.jsx)("button",{className:"kc-btn-primary kc-btn-stop",onClick:M,children:"\u25A0 \u505C\u6B62"}):(0,d.jsx)("button",{className:"kc-btn-primary",onClick:()=>void K(),disabled:c.trim()==="",children:"\u53D1\u9001"})]})]})}var H=T("react/jsx-runtime");function Le({kube:e}){let[t,n]=(0,Z.useState)("console"),[o,c]=(0,Z.useState)({console:!0,chat:!1}),x=(0,Z.useRef)(null),a=(0,Z.useCallback)(f=>{n(f),c(y=>y[f]?y:{...y,[f]:!0})},[]),m=(0,Z.useCallback)(f=>{a("console"),window.setTimeout(()=>{x.current?.runText(f)},0)},[a]),u=(f,y,$)=>(0,H.jsx)("button",{type:"button",role:"tab","aria-selected":t===f,title:$,className:t===f?"kc-seg-active":"",onClick:()=>a(f),children:y});return(0,H.jsxs)("div",{className:"kc-workspace",children:[(0,H.jsxs)("div",{className:"kc-ws-meta",children:[(0,H.jsxs)("span",{className:"kc-ws-meta-name",title:`kubeconfig \u6587\u4EF6\uFF1A${e.fileName}`,children:["\u2388 ",e.name]}),(0,H.jsx)("span",{className:"kc-ws-meta-chip",title:"\u5F53\u524D\u4E0A\u4E0B\u6587",children:e.currentContext??e.contextNames.join(", ")??"\uFF08\u65E0\uFF09"}),e.server?(0,H.jsx)("span",{className:"kc-ws-meta-chip kc-ws-meta-server",title:"API server",children:e.server}):null,(0,H.jsx)("span",{className:"kc-grow"}),(0,H.jsxs)("div",{className:"kc-seg",role:"tablist","aria-label":"\u4F1A\u8BDD\u5B50\u9875",children:[u("console","\u2328\uFE0F \u547D\u4EE4\u63A7\u5236\u53F0","\u76F4\u63A5\u6267\u884C kubectl \u547D\u4EE4\uFF08\u4F7F\u7528\u672C\u4F1A\u8BDD\u9009\u62E9\u7684 context / namespace\uFF09"),u("chat","\u{1F4AC} AI \u5BF9\u8BDD","\u591A\u8F6E\u5BF9\u8BDD\uFF1A\u751F\u6210 kubectl \u547D\u4EE4 / \u89E3\u91CA\u8F93\u51FA\u7ED3\u679C\uFF1B\u6A21\u578B\u8DDF\u968F DSH \u914D\u7F6E")]})]}),(0,H.jsxs)("div",{className:"kc-ws-body",children:[o.console?(0,H.jsx)("div",{className:"kc-ws-pane","data-active":t==="console"?"true":void 0,style:t==="console"?void 0:{display:"none"},children:(0,H.jsx)(Ie,{ref:x,kube:e})}):null,o.chat?(0,H.jsx)("div",{className:"kc-ws-pane","data-active":t==="chat"?"true":void 0,style:t==="chat"?void 0:{display:"none"},children:(0,H.jsx)(He,{kube:e,onRunCommand:m})}):null]})]})}var h=T("react/jsx-runtime"),je=0;function it(){return je+=1,`session_${Date.now().toString(36)}_${je}`}function ye(e={}){let[t,n]=(0,R.useState)([]),[o,c]=(0,R.useState)(null),[x,a]=(0,R.useState)(!1),[m,u]=(0,R.useState)(null),[f,y]=(0,R.useState)(null),$=(0,R.useRef)(!0),[b,E]=(0,R.useState)([]),[A,z]=(0,R.useState)(null),I=(0,R.useCallback)((k,g)=>{y({kind:k,text:g}),window.setTimeout(()=>y(M=>M?.text===g?null:M),k==="error"?6e3:2600)},[]),D=(0,R.useCallback)(async()=>{a(!0);try{let[k,{kubeconfigs:g}]=await Promise.all([B.state(!0),B.kubeconfigs()]);c(k),n(g),u(null)}catch(k){let g=await F(k);u(`\u65E0\u6CD5\u8FDE\u63A5\u63D2\u4EF6\u670D\u52A1\uFF1A${g}\u3002\u8BF7\u786E\u8BA4\u5DF2\u5728 DSH \u4E2D\u5B89\u88C5\u5E76\u542F\u7528 dsh-plugin-k8s\uFF08\u91CD\u542F dsh web \u540E\u751F\u6548\uFF09\u3002`),I("error",`\u52A0\u8F7D\u5931\u8D25\uFF1A${g}`)}finally{a(!1)}},[I]);(0,R.useEffect)(()=>{$.current&&($.current=!1,D())},[D]),(0,R.useEffect)(()=>{let k=new Set(t.map(g=>g.id));E(g=>{let M=g.filter(K=>k.has(K.kube.id));return M.length===g.length?g:M})},[t]),(0,R.useEffect)(()=>{A!==null&&!b.some(k=>k.key===A)&&z(b.length>0?b[b.length-1].key:null)},[b,A]);let s=(0,R.useCallback)(k=>{let g={key:it(),kube:k};E(M=>[...M,g]),z(g.key)},[]),C=(0,R.useCallback)(k=>{let g=b.findIndex(J=>J.key===k);if(E(J=>J.filter(q=>q.key!==k)),A!==k)return;let M=g>=0?b[g+1]:void 0,K=g>=0?b[g-1]:void 0;z((M??K)?.key??null)},[b,A]),O=(k,g)=>{let M=b.slice(0,g+1).filter(_=>_.kube.id===k.kube.id).length,K=b.filter(_=>_.kube.id===k.kube.id).length,J=k.kube.name,q=K>1?`${J} #${M}`:J,G=k.kube.currentContext?` \xB7 ${k.kube.currentContext}`:"";return{title:q,sub:`${k.kube.name}${G} \u2014 \u4F1A\u8BDD ${M}`}},W=k=>(0,h.jsx)(Le,{kube:k.kube},k.key);return(0,h.jsxs)("div",{className:"kc-app",children:[(0,h.jsxs)("div",{className:"kc-topbar",children:[(0,h.jsxs)("div",{className:"kc-title",children:[(0,h.jsx)("span",{className:"kc-logo",children:"K8s"})," K8s \u63A7\u5236\u53F0",(0,h.jsx)("span",{className:"kc-badge",children:"dsh-plugin-k8s"}),o?.kubectl.version?(0,h.jsxs)("span",{className:"kc-badge kc-badge-ok",children:["kubectl ",o.kubectl.version]}):null,o&&!o.kubectl.present?(0,h.jsx)("span",{className:"kc-badge kc-badge-bad",title:o.kubectl.missingReason,children:"kubectl \u672A\u627E\u5230"}):null]}),(0,h.jsx)("div",{className:"kc-grow"}),f?(0,h.jsx)("span",{className:`kc-notice kc-notice-${f.kind}`,title:f.text,children:f.text}):null,x?(0,h.jsx)("span",{className:"kc-muted",children:"\u2026"}):null,e.onClose?(0,h.jsx)("button",{onClick:e.onClose,title:"\u5173\u95ED\u9762\u677F\uFF0C\u56DE\u5230\u5BF9\u8BDD",children:e.standalone?"\u2715 \u5173\u95ED":"\u2715 \u56DE\u5230\u5BF9\u8BDD"}):null]}),m?(0,h.jsx)("div",{className:"kc-fatal",children:(0,h.jsxs)("div",{className:"kc-fatal-box",children:[(0,h.jsx)("div",{className:"kc-fatal-title",children:"\u26A0\uFE0F K8s \u63A7\u5236\u53F0\u6682\u65F6\u4E0D\u53EF\u7528"}),(0,h.jsx)("div",{className:"kc-fatal-text",children:m}),(0,h.jsx)("button",{onClick:()=>{u(null),D()},children:"\u91CD\u8BD5"})]})}):(0,h.jsxs)("div",{className:"kc-app-body",children:[(0,h.jsx)(Re,{kubeconfigs:t,busyList:x,refresh:D,onOpenSession:s,onFlash:I,stateInfo:o}),(0,h.jsxs)("div",{className:"kc-main",children:[(0,h.jsxs)("div",{className:"kc-tabbar",role:"tablist","aria-label":"\u5DF2\u6253\u5F00\u7684\u96C6\u7FA4\u4F1A\u8BDD",children:[b.length===0?(0,h.jsx)("span",{className:"kc-muted",style:{padding:"0 10px",whiteSpace:"nowrap"},children:"\u70B9\u51FB\u5DE6\u4FA7 kubeconfig \u65B0\u5EFA\u4F1A\u8BDD\uFF08\u540C\u4E00\u96C6\u7FA4\u53EF\u5F00\u591A\u4E2A\u72EC\u7ACB\u4F1A\u8BDD\uFF09\u3002"}):null,b.map((k,g)=>{let{title:M,sub:K}=O(k,g);return(0,h.jsxs)("div",{role:"tab","aria-selected":k.key===A,className:`kc-tab${k.key===A?" kc-tab-active":""}`,title:`${K} \u2014\u2014 \u70B9\u51FB\u5207\u6362\uFF0C\u2715 \u5173\u95ED`,onClick:()=>z(k.key),children:[(0,h.jsx)("span",{className:"kc-tab-icon",children:"\u2388"}),(0,h.jsx)("span",{className:"kc-tab-label",children:M}),(0,h.jsx)("span",{className:"kc-tab-close",title:"\u5173\u95ED",onClick:J=>{J.stopPropagation(),C(k.key)},children:"\u2715"})]},k.key)})]}),(0,h.jsx)("div",{className:"kc-tabpanes",children:b.length===0?(0,h.jsxs)("div",{className:"kc-empty",style:{flex:1},children:[(0,h.jsx)("div",{style:{fontSize:30,opacity:.5},children:"\u2388"}),(0,h.jsx)("div",{children:"\u8FD8\u6CA1\u6709\u6253\u5F00\u4EFB\u4F55\u96C6\u7FA4\u4F1A\u8BDD\u3002"}),(0,h.jsxs)("div",{style:{marginTop:6,fontSize:12},className:"kc-muted",children:["\u5DE6\u4FA7\u70B9\u51FB kubeconfig \u5373\u53EF\u65B0\u5EFA\u4F1A\u8BDD Tab\uFF08\u91CD\u590D\u70B9\u51FB\u540C\u4E00\u96C6\u7FA4\u4F1A\u518D\u5F00\u4E00\u4E2A\u72EC\u7ACB\u4F1A\u8BDD\uFF09\uFF1B",(0,h.jsx)("br",{}),"\u6BCF\u4E2A\u4F1A\u8BDD\u5185\u542B\u300C\u2328\uFE0F \u547D\u4EE4\u63A7\u5236\u53F0\u300D\u4E0E\u300C\u{1F4AC} AI \u5BF9\u8BDD\u300D\u4E24\u4E2A\u5B50\u9875\uFF0C\u5404\u81EA\u72EC\u7ACB\u4FDD\u6301\u72B6\u6001\u3002"]})]}):b.map(k=>(0,h.jsx)("div",{role:"tabpanel",className:"kc-pane","data-active":k.key===A?"true":void 0,style:k.key===A?void 0:{display:"none"},children:W(k)},k.key))})]})]})]})}var we=T("react/jsx-runtime");function Be(e){let[t,n]=(0,U.useState)({left:0,right:0}),o=(0,U.useRef)(null),c=(0,U.useRef)(e.onClose);c.current=e.onClose;let x=!e.hidden;return(0,U.useLayoutEffect)(()=>{if(typeof document>"u")return;let a=null,m=null,u=0,f=()=>{u===0&&(u=requestAnimationFrame(()=>{u=0,$()}))},y=()=>{(a===null||!a.isConnected)&&(a=document.querySelector('[class*="sidebarCol"]'),a!==null&&b.observe(a)),(m===null||!m.isConnected)&&(m=document.querySelector('[class*="detailsCol"]'),m!==null&&b.observe(m))},$=()=>{y();let A=a!==null?a.getBoundingClientRect().width:0,z=m!==null?m.getBoundingClientRect().width:0;n(I=>Math.abs(I.left-A)<.5&&Math.abs(I.right-z)<.5?I:{left:Math.max(0,A),right:Math.max(0,z)})},b=new ResizeObserver(f);$();let E=o.current?.closest('[class*="frame"]')??o.current?.parentElement;return E!=null&&b.observe(E),window.addEventListener("resize",f),()=>{window.removeEventListener("resize",f),b.disconnect(),u!==0&&cancelAnimationFrame(u)}},[]),(0,U.useEffect)(()=>{if(!x||e.standalone)return;let a=m=>{if(!(m.target instanceof Element))return;let u=o.current;u!==null&&(u.contains(m.target)||m.target.closest('[role="dialog"], [role="menu"], [role="listbox"]')||m.target.closest('[data-d-sh-plugin="k8s-console"]')||c.current())};return document.addEventListener("pointerdown",a,!0),()=>document.removeEventListener("pointerdown",a,!0)},[x,e.standalone]),(0,we.jsx)("div",{id:"dsh-k8s-console",ref:o,"data-hidden":e.hidden?"true":void 0,style:{position:"absolute",left:Math.max(0,Math.round(t.left)),top:0,right:Math.max(0,Math.round(t.right)),bottom:0,background:"var(--kc-bg)",display:e.hidden?"none":"flex",flexDirection:"column",overflow:"hidden",zIndex:1},children:(0,we.jsx)(ye,{onClose:e.onClose,standalone:e.standalone})})}var Je=`/* dsh-plugin-k8s \u5BA2\u6237\u7AEF\u6837\u5F0F\uFF08\u6697\u8272\u4E3B\u9898\uFF0C\u96F6\u5916\u90E8\u4F9D\u8D56\uFF0C\u5168\u90E8\u9650\u5B9A\u5728 #dsh-k8s-console\uFF09 */
:root {
  --kc-bg: #0d1117;
  --kc-panel: #141a23;
  --kc-panel-2: #1b2230;
  --kc-border: #2a3345;
  --kc-border-strong: #3a4660;
  --kc-text: #e6e9ef;
  --kc-muted: #8b93a3;
  --kc-accent: #3fa7f7;
  --kc-accent-weak: rgba(63, 167, 247, 0.14);
  --kc-ok: #37c978;
  --kc-warn: #e0b341;
  --kc-err: #ff5f56;
  --kc-radius: 8px;
  --kc-mono: "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace;
}

/* ---------- \u4FA7\u8FB9\u680F\u5165\u53E3\uFF08\u4F4D\u4E8E DSH \u4FA7\u680F\uFF0C\u4E0D\u5728\u9762\u677F\u5185\uFF0C\u9700\u5168\u5C40\u53EF\u89C1\uFF09 ---------- */
button.kc-sidebar-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 6px 10px;
  color: var(--kc-muted);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  text-align: left;
  transition: background 0.12s, color 0.12s;
}
button.kc-sidebar-entry:hover {
  background: var(--kc-accent-weak);
  color: var(--kc-text);
}
button.kc-sidebar-entry[data-active='true'],
button.kc-sidebar-entry[data-active='true']:hover {
  background: var(--kc-accent-weak);
  color: var(--kc-accent);
}
.kc-sidebar-entry-icon {
  display: inline-flex;
  flex: 0 0 auto;
}
.kc-sidebar-entry-icon svg {
  display: block;
}
.kc-sidebar-entry-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- \u9762\u677F\u6839 ---------- */
#dsh-k8s-console {
  color: var(--kc-text);
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
}
#dsh-k8s-console *,
#dsh-k8s-console *::before,
#dsh-k8s-console *::after {
  box-sizing: border-box;
}
#dsh-k8s-console input,
#dsh-k8s-console select,
#dsh-k8s-console textarea,
#dsh-k8s-console button {
  font: inherit;
  color: var(--kc-text);
  background: var(--kc-panel-2);
  border: 1px solid var(--kc-border);
  border-radius: 6px;
}
#dsh-k8s-console button {
  padding: 5px 11px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
#dsh-k8s-console button:hover:not(:disabled) {
  border-color: var(--kc-accent);
  background: var(--kc-accent-weak);
}
#dsh-k8s-console button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
#dsh-k8s-console button.kc-btn-primary {
  background: var(--kc-accent);
  border-color: var(--kc-accent);
  color: #fff;
}
#dsh-k8s-console button.kc-btn-primary:hover:not(:disabled) {
  background: #63b8ff;
  border-color: #63b8ff;
}
#dsh-k8s-console button.kc-btn-stop {
  background: #c0392b;
  border-color: #c0392b;
}
#dsh-k8s-console button.kc-btn-stop:hover:not(:disabled) {
  background: #d9534a;
  border-color: #d9534a;
}
#dsh-k8s-console button.kc-btn-sm {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 5px;
}
#dsh-k8s-console input,
#dsh-k8s-console select,
#dsh-k8s-console textarea {
  padding: 5px 9px;
}
#dsh-k8s-console input:focus,
#dsh-k8s-console select:focus,
#dsh-k8s-console textarea:focus {
  outline: none;
  border-color: var(--kc-accent);
}
#dsh-k8s-console input::placeholder,
#dsh-k8s-console textarea::placeholder {
  color: #5b6475;
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

/* ---------- \u9876\u680F ---------- */
.kc-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(180deg, #182130, #121825);
  border: 1px solid var(--kc-border);
  border-radius: var(--kc-radius);
  margin: 10px 10px 0;
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
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #3fa7f7, #7b61ff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}
.kc-badge {
  font-size: 11px;
  font-weight: 400;
  color: var(--kc-muted);
  border: 1px solid var(--kc-border);
  border-radius: 999px;
  padding: 1px 8px;
  white-space: nowrap;
}
.kc-badge-ok { color: var(--kc-ok); border-color: rgba(55, 201, 120, 0.4); }
.kc-badge-bad { color: var(--kc-err); border-color: rgba(255, 95, 86, 0.4); }
.kc-notice {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 46%;
}
.kc-notice-ok { color: var(--kc-ok); background: rgba(55, 201, 120, 0.12); }
.kc-notice-error { color: var(--kc-err); background: rgba(255, 95, 86, 0.12); }
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
  border: 1px solid var(--kc-border-strong);
  border-radius: 10px;
  padding: 20px 22px;
}
.kc-fatal-title { font-weight: 600; margin-bottom: 8px; color: var(--kc-err); }
.kc-fatal-text { color: var(--kc-muted); margin-bottom: 14px; white-space: pre-wrap; }

/* ---------- \u4E3B\u4F53\u5E03\u5C40 ---------- */
.kc-app-body {
  display: flex;
  gap: 10px;
  padding: 10px;
  flex: 1;
  min-height: 0;
}
.kc-nav {
  width: 292px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--kc-panel);
  border: 1px solid var(--kc-border);
  border-radius: var(--kc-radius);
  overflow: hidden;
}
.kc-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--kc-panel);
  border: 1px solid var(--kc-border);
  border-radius: var(--kc-radius);
  overflow: hidden;
}

/* ---------- TabBar\uFF08\u4F1A\u8BDD\uFF09 ---------- */
.kc-tabbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px 0;
  overflow-x: auto;
  scrollbar-width: thin;
  border-bottom: 1px solid var(--kc-border);
  background: linear-gradient(180deg, #1a2230, #151b28);
  flex: 0 0 auto;
}
.kc-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  max-width: 240px;
  padding: 5px 10px;
  background: var(--kc-panel-2);
  border: 1px solid var(--kc-border);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  color: var(--kc-muted);
  cursor: pointer;
  font-size: 12px;
  user-select: none;
}
.kc-tab:hover { color: var(--kc-text); }
.kc-tab-active {
  background: var(--kc-panel);
  border-color: var(--kc-border-strong);
  border-bottom-color: var(--kc-panel);
  color: var(--kc-text);
  margin-bottom: -1px;
}
.kc-tab-icon { opacity: 0.8; }
.kc-tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kc-tab-close {
  padding: 0 3px;
  border-radius: 4px;
  color: var(--kc-muted);
  font-size: 11px;
}
.kc-tab-close:hover { color: var(--kc-err); background: rgba(255, 95, 86, 0.12); }
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
  border: 1px solid var(--kc-border);
  border-radius: 999px;
  padding: 0 7px;
}
.kc-warnbox {
  margin: 0 10px 8px;
  padding: 8px 10px;
  border: 1px solid rgba(224, 179, 65, 0.4);
  background: rgba(224, 179, 65, 0.08);
  border-radius: 6px;
  font-size: 12px;
}
.kc-warnbox-title { color: var(--kc-warn); font-weight: 600; margin-bottom: 2px; }
.kc-warnbox-text { color: var(--kc-muted); white-space: pre-wrap; }
.kc-nav-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 6px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kc-nav-empty {
  color: var(--kc-muted);
  font-size: 12px;
  white-space: pre-wrap;
  padding: 14px 10px;
}
.kc-conn {
  border: 1px solid var(--kc-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}
.kc-conn:hover { border-color: var(--kc-border-strong); }
.kc-conn-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  padding: 7px 10px;
  text-align: left;
  background: var(--kc-panel-2);
  border: 0;
  border-radius: 0;
}
.kc-conn-main:hover { background: var(--kc-accent-weak); border-color: transparent; }
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
  color: #5b6475;
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
  background: var(--kc-panel-2);
  border-left: 1px solid var(--kc-border);
}
.kc-icon-btn {
  width: 26px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 5px;
}
.kc-icon-btn-danger:hover:not(:disabled) { color: var(--kc-err); border-color: var(--kc-err); }
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
  background: rgba(4, 8, 14, 0.6);
  backdrop-filter: blur(2px);
}
.kc-modal {
  width: min(620px, 90%);
  max-height: 88%;
  overflow-y: auto;
  background: var(--kc-panel);
  border: 1px solid var(--kc-border-strong);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kc-modal-title { font-weight: 700; font-size: 15px; }
.kc-field { display: flex; flex-direction: column; gap: 5px; }
.kc-field label { font-size: 12px; color: var(--kc-muted); }
.kc-form-error {
  color: var(--kc-err);
  background: rgba(255, 95, 86, 0.1);
  border: 1px solid rgba(255, 95, 86, 0.3);
  border-radius: 6px;
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
  background: var(--kc-panel-2);
  border: 1px solid var(--kc-border);
  border-radius: 7px;
  padding: 2px;
}
.kc-seg button {
  padding: 4px 12px;
  font-size: 12px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--kc-muted);
  white-space: nowrap;
}
.kc-seg button:hover:not(:disabled) { color: var(--kc-text); background: rgba(255, 255, 255, 0.05); border: 0; }
.kc-seg button.kc-seg-active {
  background: var(--kc-accent);
  color: #fff;
}
.kc-seg button.kc-seg-active:hover:not(:disabled) { background: #63b8ff; color: #fff; }

/* ---------- \u4EE3\u7801\u8F93\u5165/\u8F93\u51FA ---------- */
.kc-code-input {
  font-family: var(--kc-mono);
  font-size: 12px;
  line-height: 1.55;
  background: #0b0f16;
  resize: vertical;
  tab-size: 2;
}

/* ---------- \u4F1A\u8BDD\u5DE5\u4F5C\u533A ---------- */
.kc-workspace { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.kc-ws-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--kc-border);
  background: #121825;
  flex: 0 0 auto;
}
.kc-ws-meta-name { font-weight: 600; font-size: 13px; }
.kc-ws-meta-chip {
  font-size: 11px;
  color: var(--kc-muted);
  border: 1px solid var(--kc-border);
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
  background: #0a0e15;
  border: 1px solid var(--kc-border);
  border-radius: 8px;
  padding: 8px 0;
  font-family: var(--kc-mono);
  font-size: 12px;
  line-height: 1.5;
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
  color: #9ccbff;
  background: rgba(63, 167, 247, 0.07);
  border-left: 2px solid var(--kc-accent);
  padding-top: 2px;
  padding-bottom: 2px;
}
.kc-out-prompt { color: var(--kc-accent); user-select: none; }
.kc-out-stdout { color: #d6dde8; }
.kc-out-stderr { color: #ffb3a8; }
.kc-out-err { color: var(--kc-err); }
.kc-out-sys { color: var(--kc-muted); font-size: 11px; }
.kc-out-muted { color: #6b7484; }
.kc-exitbar {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--kc-ok);
  border-top: 1px solid var(--kc-border);
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
  background: rgba(224, 179, 65, 0.1);
  border: 1px solid rgba(224, 179, 65, 0.35);
  border-radius: 6px;
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
  background: var(--kc-panel-2);
  border: 1px solid var(--kc-border);
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
  border: 1px solid rgba(63, 167, 247, 0.25);
}
.kc-chat-assistant .kc-chat-bubble {
  background: var(--kc-panel-2);
  border: 1px solid var(--kc-border);
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
  color: #5b6475;
  text-align: right;
}
.kc-chat-quickrun {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px dashed var(--kc-border-strong);
  border-radius: 8px;
  font-size: 12px;
  color: var(--kc-muted);
  background: #101623;
}
.kc-chat-quickrun code {
  font-family: var(--kc-mono);
  font-size: 11px;
  color: #9ccbff;
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
  border: 1px solid var(--kc-border);
  border-radius: 8px;
  overflow: hidden;
  background: #0a0e15;
}
.kc-codebox-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px 3px 10px;
  background: #111827;
  border-bottom: 1px solid var(--kc-border);
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
  color: #d6dde8;
  max-height: 320px;
  overflow-y: auto;
}

/* ---------- \u6EDA\u52A8\u6761 ---------- */
#dsh-k8s-console *::-webkit-scrollbar { width: 8px; height: 8px; }
#dsh-k8s-console *::-webkit-scrollbar-thumb { background: #2f3a4e; border-radius: 4px; }
#dsh-k8s-console *::-webkit-scrollbar-track { background: transparent; }
`;var Ve="dsh-k8s-console-style";function Fe(){if(typeof document>"u")return()=>{};let e=document.getElementById(Ve);if(e!==null&&e.isConnected)return()=>{};let t=document.createElement("style");return t.id=Ve,t.setAttribute("data-plugin","dsh-plugin-k8s"),t.textContent=Je,document.head.appendChild(t),()=>{t.isConnected&&t.remove()}}var We={"sidebar.label":"K8s","sidebar.aria":"K8s \u63A7\u5236\u53F0","sidebar.title":"\u6253\u5F00 K8s \u63A7\u5236\u53F0","overlay.close":"\u56DE\u5230\u5BF9\u8BDD"},Xe={"sidebar.label":"K8s","sidebar.aria":"K8s console","sidebar.title":"Open K8s console","overlay.close":"Back to conversation"};var lt=["slots","locale"];function dt({renderSlot:e,standalone:t=!1}){let n=Ee(),o=(0,ae.useRef)(!1);if((0,ae.useEffect)(()=>{n.panelOpen&&(o.current=!0)},[n.panelOpen]),!n.panelOpen&&!t&&!o.current)return null;let c=n.panelOpen||t;return e("k8s.console",{onClose:()=>X.close(),standalone:t,hidden:!c})}function pt(e){let t=e?.slots,n=e?.locale;if(!t||!n)return;let o=n.bind("k8s"),c=n.register("k8s",{zh:We,en:Xe}),x=Fe(),a=t.inject("sidebar.footer.action",()=>t.register({name:"sidebar.footer.action",id:"k8s-console",order:-9,locale:"k8s",label:()=>o("sidebar.label")},Te)),m=t.inject("k8s.console",()=>t.register({name:"k8s.console",id:"dsh",order:0,locale:"k8s",label:()=>o("sidebar.aria")},Be)),u=t.inject("shell.overlay",()=>t.register({name:"shell.overlay",id:"k8s.console",order:70,locale:"k8s",label:()=>o("sidebar.aria"),children:{"k8s.console":{kind:"single",scope:"root"}}},dt));e?.effect&&e.effect(()=>()=>{c(),a(),m(),u(),x()},"dsh-plugin-k8s: plugin teardown")}return et(ut);})();
    return __dsh_k8s_module__;
  },
});
