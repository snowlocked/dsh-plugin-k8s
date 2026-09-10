window.__ModuleLoader__.load({
  id: "@snowlocked/dsh-k8s-console",
  factory: (require) => {
    "use strict";
    var __dsh_k8s_internal = { exports: {} };
    var __dsh_k8s_exports = __dsh_k8s_internal.exports;
    Object.defineProperty(__dsh_k8s_exports, Symbol.toStringTag, { value: "Module" });
"use strict";var __dsh_k8s_module__=(()=>{var Ne=Object.defineProperty;var ft=Object.getOwnPropertyDescriptor;var gt=Object.getOwnPropertyNames;var vt=Object.prototype.hasOwnProperty;var A=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(r,a)=>(typeof require<"u"?require:r)[a]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var xt=(e,r)=>{for(var a in r)Ne(e,a,{get:r[a],enumerable:!0})},ht=(e,r,a,n)=>{if(r&&typeof r=="object"||typeof r=="function")for(let s of gt(r))!vt.call(e,s)&&s!==a&&Ne(e,s,{get:()=>r[s],enumerable:!(n=ft(r,s))||n.enumerable});return e};var yt=e=>ht(Ne({},"__esModule",{value:!0}),e);var Rt={};xt(Rt,{apply:()=>Mt,inject:()=>Kt});var ve=A("react");var wt=A("react");var Me="dsh-k8s-console.persist.v1";function Ce(){try{let e=window.localStorage.getItem(Me);if(!e)return{};let r=JSON.parse(e);return r&&typeof r=="object"?r:{}}catch{return{}}}function Re(e){try{let r={...Ce(),...e};window.localStorage.setItem(Me,JSON.stringify(r))}catch{}}var ge=Ce().panelOpen===!0,Pe=new Set,He=e=>{if(typeof document>"u")return;let r=0,a=()=>{let n=Array.from(document.querySelectorAll('[role="tab"]')).filter(s=>s.closest("#dsh-k8s-console")===null).filter(s=>s.closest("#dsh-database-console")===null).find(s=>{let k=s.textContent?.trim().toLowerCase()??"",i=`${s.getAttribute("aria-label")??""} ${s.title??""}`.toLowerCase();return e==="k8s"?k==="k8s"||i.includes("k8s"):k==="chat"||k==="\u5BF9\u8BDD"||i.includes("chat")||i.includes("\u5BF9\u8BDD")});if(n!==void 0){n.click();return}++r<8&&setTimeout(a,16)};a()},Ie=()=>{for(let e of Pe)e()},De=!1,Le=Object.freeze({panelOpen:!0}),Be=Object.freeze({panelOpen:!1}),Se=ge?Le:Be,Oe=()=>{try{Re({panelOpen:ge})}catch{}},Q={open(){ge||(ge=!0,Se=Le,Oe(),Ie()),He("k8s")},close(){ge=!1,Se=Be,Oe(),Ie(),He("chat")},toggle(){De?Q.close():Q.open()},setDocked(e){De=e},getSnapshot:()=>Se,subscribe(e){return Pe.add(e),()=>Pe.delete(e)}};var q=A("react/jsx-runtime"),Nt=(0,q.jsxs)("svg",{viewBox:"0 0 16 16",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,q.jsx)("circle",{cx:"8",cy:"8",r:"1.4",fill:"currentColor",stroke:"none"}),(0,q.jsx)("circle",{cx:"8",cy:"2.6",r:"1.05",fill:"currentColor",stroke:"none"}),(0,q.jsx)("circle",{cx:"8",cy:"13.4",r:"1.05",fill:"currentColor",stroke:"none"}),(0,q.jsx)("circle",{cx:"2.6",cy:"8",r:"1.05",fill:"currentColor",stroke:"none"}),(0,q.jsx)("circle",{cx:"13.4",cy:"8",r:"1.05",fill:"currentColor",stroke:"none"}),(0,q.jsx)("path",{d:"M8 4v2.6M8 9.4V12M4.6 6.6l2.2 1.4M9.2 8l2.2 1.4M4.6 9.4l2.2-1.4M9.2 8l2.2-1.4"})]});function je(e={}){let{wide:r=!0,t:a=(i=>i)}=e,n=a,s=(0,ve.useSyncExternalStore)(Q.subscribe,Q.getSnapshot,Q.getSnapshot),k=(0,ve.useCallback)(()=>{Q.toggle()},[]);return(0,q.jsxs)("button",{type:"button","data-d-sh-plugin":"k8s-console","data-active":s.panelOpen||void 0,"aria-label":n("sidebar.aria"),title:n("sidebar.title"),onClick:k,className:"kc-sidebar-entry",children:[(0,q.jsx)("span",{className:"kc-sidebar-entry-icon","aria-hidden":"true",children:Nt}),r?(0,q.jsx)("span",{className:"kc-sidebar-entry-label",children:n("sidebar.label")}):null]})}var xe=A("react"),nt=A("react-dom/client");var O=A("react");var Je="/api/dsh-plugin-k8s",se=class extends Error{status;code;constructor(r,a,n){super(r),this.status=a,this.code=n}};async function V(e){return e instanceof se||e instanceof Error?e.message:typeof e=="string"?e:JSON.stringify(e)}function We(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e??{})}}async function Y(e,r){let a;try{a=await fetch(`${Je}${e}`,We(r))}catch(s){throw new se(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${s instanceof Error?s.message:String(s)}`,0)}let n=null;try{n=await a.json()}catch{n=null}if(!a.ok){let s=n&&typeof n=="object"?n:{};throw new se(String(s.error??`HTTP ${a.status}`),a.status,String(s.code??""))}return n}async function Ve(e,r,a,n){let s;try{s=await fetch(`${Je}${e}`,{...We(r),...n?{signal:n}:{}})}catch(g){throw n?.aborted?g:new se(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${g instanceof Error?g.message:String(g)}`,0)}if(!s.ok||!s.body){let g=`HTTP ${s.status}`;try{let b=await s.json();b?.error&&(g=b.error)}catch{}throw new se(g,s.status)}let k=s.body.getReader(),i=new TextDecoder("utf-8"),h="";for(;;){let g;try{g=await k.read()}catch(N){throw n?.aborted?N:new se(`\u8BFB\u53D6\u6D41\u5931\u8D25\uFF1A${N instanceof Error?N.message:String(N)}`,0)}if(g.done)break;h+=i.decode(g.value,{stream:!0});let b;for(;(b=h.indexOf(`

`))>=0;){let N=h.slice(0,b);if(h=h.slice(b+2),N.startsWith("data: ")){let $=N.slice(6).trim();if(!$)continue;try{a(JSON.parse($))}catch{}}}}if(h.startsWith("data: ")){let g=h.slice(6).trim();if(g)try{a(JSON.parse(g))}catch{}}}var D={state:e=>Y("/state",e?{refresh:!0}:{}),kubeconfigs:()=>Y("/kubeconfigs/list"),save:e=>Y("/kubeconfigs/save",e),remove:e=>Y("/kubeconfig/remove",{id:e}),raw:e=>Y("/kubeconfig/raw",{id:e}),check:e=>Y("/kubeconfigs/check",{id:e}),aiModels:()=>Y("/ai/models"),run:(e,r,a)=>Ve("/run",e,r,a),chat:(e,r,a)=>Ve("/ai/chat",e,r,a),historyAppend:e=>Y("/history/append",e),historyList:e=>Y("/history/list",e??{}),historyGet:e=>Y("/history/get",{sessionId:e}),historyDelete:e=>Y("/history/delete",{sessionId:e}),historyClear:()=>Y("/history/clear",{confirm:!0})};function Xe(e){let r=[];for(let a of e.providers)if(a.models.length===0)r.push({key:`p:${a.provider}`,provider:a.provider,label:a.label??a.provider});else for(let n of a.models)r.push({key:`m:${a.provider}/${n.id}`,provider:a.provider,model:n.id,label:n.label??`${a.provider} \xB7 ${n.id}`});return r}function Fe(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function de(e){if(!e)return"\u2014";let r=new Date(e);return Number.isNaN(r.getTime())?e:r.toLocaleString("zh-CN",{hour12:!1})}var X=A("react");var p=A("react/jsx-runtime"),Ae={open:!1,name:"",mode:"paste",content:"",filePath:"",busy:!1,error:null};function _e(e){let{kubeconfigs:r,busyList:a,refresh:n,onOpenSession:s,onFlash:k}=e,[i,h]=(0,X.useState)(Ae),[g,b]=(0,X.useState)(null),N=e.stateInfo?.kubectl,$=(0,X.useRef)(null);(0,X.useEffect)(()=>{i.open&&i.mode==="paste"&&$.current?.focus()},[i.open,i.mode]);let v=(0,X.useCallback)(c=>{h(C=>({...C,...c}))},[]),R=(0,X.useCallback)(()=>{h(Ae)},[]),H=(0,X.useCallback)(async()=>{if(i.busy)return;let c=i.name.trim();if(!c){v({error:"\u8BF7\u586B\u5199 kubeconfig \u540D\u79F0\uFF08\u663E\u793A\u7528\uFF09"});return}if(i.mode==="paste"&&i.content.trim()===""){v({error:"\u8BF7\u7C98\u8D34 kubeconfig \u5185\u5BB9\uFF0C\u6216\u6539\u7528\u201C\u672C\u673A\u6587\u4EF6\u5BFC\u5165\u201D"});return}if(i.mode==="path"&&i.filePath.trim()===""){v({error:"\u8BF7\u586B\u5199\u672C\u673A kubeconfig \u6587\u4EF6\u8DEF\u5F84\uFF08\u5982 D:\\path\\dev.yaml\uFF09"});return}v({busy:!0,error:null});try{await D.save({name:c,content:i.mode==="paste"?i.content:void 0,filePath:i.mode==="path"?i.filePath:void 0}),R(),k("ok",`\u5DF2\u4FDD\u5B58 kubeconfig\u300C${c}\u300D`),n()}catch(C){v({error:await V(C)})}finally{v({busy:!1})}},[i,v,R,k,n]),E=(0,X.useCallback)(async c=>{if(window.confirm(`\u5220\u9664 kubeconfig\u300C${c.name}\u300D\uFF1F

\u8BE5\u64CD\u4F5C\u4F1A\u79FB\u9664\u672C\u5730\u4FDD\u5B58\u7684\u6587\u4EF6\u526F\u672C\uFF08\u542B\u8BBF\u95EE\u51ED\u636E\uFF09\uFF0C\u5E76\u5173\u95ED\u5B83\u7684\u6240\u6709\u4F1A\u8BDD Tab\u3002`)){b(`rm:${c.id}`);try{let{ok:L}=await D.remove(c.id);L?(k("info",`\u5DF2\u5220\u9664\u300C${c.name}\u300D`),n()):k("error","\u5220\u9664\u5931\u8D25\uFF1A\u670D\u52A1\u7AEF\u672A\u786E\u8BA4")}catch(L){k("error",`\u5220\u9664\u5931\u8D25\uFF1A${await V(L)}`)}finally{b(null)}}},[k,n]),_=(0,X.useCallback)(async c=>{b(`check:${c.id}`);try{let C=await D.check(c.id);k(C.ok?"ok":"error",`\u300C${c.name}\u300D${C.ok?"\u2705 \u96C6\u7FA4\u53EF\u8FBE":"\u274C \u4E0D\u53EF\u8FBE"}\uFF1A${C.message}`)}catch(C){k("error",`\u300C${c.name}\u300D\u68C0\u67E5\u5931\u8D25\uFF1A${await V(C)}`)}finally{b(null),n()}},[k,n]),B=(0,X.useCallback)(async c=>{b(`copy:${c.id}`);try{let{content:C}=await D.raw(c.id);await navigator.clipboard.writeText(C),k("ok",`\u5DF2\u590D\u5236\u300C${c.name}\u300D\u5B8C\u6574 kubeconfig \u5230\u526A\u8D34\u677F\uFF08\u542B\u51ED\u636E\uFF0C\u6CE8\u610F\u4FDD\u7BA1\uFF09`)}catch(C){k("error",`\u590D\u5236\u5931\u8D25\uFF1A${await V(C)}`)}finally{b(null)}},[k]);return(0,p.jsxs)("div",{className:"kc-nav",children:[(0,p.jsxs)("div",{className:"kc-nav-head",children:[(0,p.jsx)("span",{className:"kc-nav-title",children:"kubeconfig"}),(0,p.jsx)("span",{className:"kc-nav-count",children:r.length}),(0,p.jsx)("span",{className:"kc-grow"}),(0,p.jsx)("button",{className:"kc-btn-sm",onClick:()=>{v({...Ae,open:!0})},title:"\u6DFB\u52A0 kubeconfig\uFF08\u7C98\u8D34\u5185\u5BB9\u6216\u5BFC\u5165\u672C\u673A\u6587\u4EF6\uFF09",children:"\u2795 \u6DFB\u52A0"}),(0,p.jsx)("button",{className:"kc-btn-sm",onClick:()=>void n(),disabled:a,title:"\u5237\u65B0\u5217\u8868",children:"\u21BB"})]}),N&&!N.present?(0,p.jsxs)("div",{className:"kc-warnbox",title:N.missingReason,children:[(0,p.jsx)("div",{className:"kc-warnbox-title",children:"\u26A0\uFE0F kubectl \u4E0D\u53EF\u7528"}),(0,p.jsx)("div",{className:"kc-warnbox-text",children:N.missingReason})]}):null,(0,p.jsxs)("div",{className:"kc-nav-list",children:[r.length===0?(0,p.jsx)("div",{className:"kc-nav-empty",children:a?"\u52A0\u8F7D\u4E2D\u2026":`\u8FD8\u6CA1\u6709 kubeconfig\u3002
\u70B9\u53F3\u4E0A\u89D2 \u2795 \u6DFB\u52A0\uFF08\u7C98\u8D34\u5185\u5BB9\u6216\u5BFC\u5165\u672C\u673A\u6587\u4EF6\uFF09\u3002`}):null,r.map(c=>{let C=g===`rm:${c.id}`||g===`check:${c.id}`||g===`copy:${c.id}`;return(0,p.jsxs)("div",{className:"kc-conn",title:"\u70B9\u51FB\u65B0\u5EFA\u4F1A\u8BDD\uFF08\u540C\u4E00\u96C6\u7FA4\u53EF\u5F00\u591A\u4E2A\uFF09",children:[(0,p.jsxs)("button",{type:"button",className:"kc-conn-main",onClick:()=>s(c),disabled:a,children:[(0,p.jsx)("span",{className:"kc-conn-name",children:c.name}),(0,p.jsxs)("span",{className:"kc-conn-sub",children:[c.currentContext??c.contextNames[0]??"\uFF08\u65E0 context\uFF09",c.contextNames.length>1?`\uFF08\u5171 ${c.contextNames.length} \u4E2A context\uFF09`:""]}),(0,p.jsx)("span",{className:"kc-conn-server",title:"API server",children:c.server??""}),c.lastCheckError?(0,p.jsx)("span",{className:"kc-conn-state kc-conn-state-bad",title:`\u4E0A\u6B21\u68C0\u67E5\u5931\u8D25\uFF1A${c.lastCheckError}`,children:"\u2715"}):c.lastCheckedAt?(0,p.jsx)("span",{className:"kc-conn-state kc-conn-state-ok",title:`\u4E0A\u6B21\u68C0\u67E5 ${de(c.lastCheckedAt)}`,children:"\u2713"}):null]}),(0,p.jsxs)("span",{className:"kc-conn-actions",children:[(0,p.jsx)("button",{className:"kc-icon-btn",title:"\u6D4B\u8BD5\u8FDE\u901A\uFF08kubectl get --raw=/version\uFF09",disabled:C,onClick:()=>void _(c),children:C&&g===`check:${c.id}`?"\u2026":"\u6D4B"}),(0,p.jsx)("button",{className:"kc-icon-btn",title:"\u590D\u5236\u5B8C\u6574 kubeconfig\uFF08\u542B\u51ED\u636E\uFF09",disabled:C,onClick:()=>void B(c),children:C&&g===`copy:${c.id}`?"\u2026":"\u29C9"}),(0,p.jsx)("button",{className:"kc-icon-btn kc-icon-btn-danger",title:`\u5220\u9664\uFF08${Fe(c.size)}\uFF0C\u66F4\u65B0\u4E8E ${de(c.updatedAt)}\uFF09`,disabled:C,onClick:()=>void E(c),children:"\u2715"})]})]},c.id)})]}),(0,p.jsx)("div",{className:"kc-nav-foot",children:(0,p.jsxs)("div",{className:"kc-muted",style:{fontSize:11,lineHeight:1.6},children:["\u6570\u636E\u76EE\u5F55\uFF1A",e.stateInfo?.dataDir??"\u2026",N?.present&&N.version?(0,p.jsxs)("div",{children:["kubectl ",N.version]}):null]})}),i.open?(0,p.jsx)("div",{className:"kc-modal-mask",onMouseDown:c=>{c.target===c.currentTarget&&R()},children:(0,p.jsxs)("div",{className:"kc-modal",children:[(0,p.jsx)("div",{className:"kc-modal-title",children:"\u2795 \u6DFB\u52A0 kubeconfig"}),(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"\u540D\u79F0\uFF08\u663E\u793A\u7528\uFF09"}),(0,p.jsx)("input",{value:i.name,onChange:c=>v({name:c.target.value,error:null}),placeholder:"\u4F8B\u5982\uFF1Adevelopment / dev",autoFocus:!0})]}),(0,p.jsxs)("div",{className:"kc-seg",role:"tablist",children:[(0,p.jsx)("button",{type:"button",role:"tab","aria-selected":i.mode==="paste",className:i.mode==="paste"?"kc-seg-active":"",onClick:()=>v({mode:"paste"}),children:"\u{1F4CB} \u7C98\u8D34\u5185\u5BB9"}),(0,p.jsx)("button",{type:"button",role:"tab","aria-selected":i.mode==="path",className:i.mode==="path"?"kc-seg-active":"",onClick:()=>v({mode:"path"}),children:"\u{1F4C1} \u5BFC\u5165\u672C\u673A\u6587\u4EF6"})]}),i.mode==="paste"?(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"kubeconfig \u5185\u5BB9\uFF08YAML\uFF09"}),(0,p.jsx)("textarea",{ref:$,className:"kc-code-input",rows:10,value:i.content,onChange:c=>v({content:c.target.value,error:null}),placeholder:`apiVersion: v1
kind: Config
clusters:
- name: "dev"
  cluster:
    server: "https://\u2026"
\u2026`,spellCheck:!1})]}):(0,p.jsxs)("div",{className:"kc-field",children:[(0,p.jsx)("label",{children:"\u672C\u673A\u6587\u4EF6\u8DEF\u5F84"}),(0,p.jsx)("input",{value:i.filePath,onChange:c=>v({filePath:c.target.value,error:null}),placeholder:"D:\\Users\\wuzan\\.kube\\configs\\dev.yaml",spellCheck:!1}),(0,p.jsx)("div",{className:"kc-muted",style:{fontSize:11,marginTop:4},children:"\u8BFB\u53D6\u8BE5\u8DEF\u5F84\u7684\u5185\u5BB9\u5E76\u4FDD\u5B58\u526F\u672C\u5230\u63D2\u4EF6\u6570\u636E\u76EE\u5F55\uFF08\u652F\u6301 .yaml/.yml/.config\uFF09\u3002\u4FEE\u6539\u539F\u6587\u4EF6\u4E0D\u4F1A\u540C\u6B65 \u2014\u2014 \u60F3\u7528\u65B0\u7248\u8BF7\u5220\u9664\u540E\u91CD\u65B0\u5BFC\u5165\u3002"})]}),i.error?(0,p.jsx)("div",{className:"kc-form-error",children:i.error}):null,(0,p.jsxs)("div",{className:"kc-modal-actions",children:[(0,p.jsx)("button",{onClick:R,disabled:i.busy,children:"\u53D6\u6D88"}),(0,p.jsx)("button",{className:"kc-btn-primary",onClick:()=>void H(),disabled:i.busy,children:i.busy?"\u4FDD\u5B58\u5E76\u89E3\u6790\u2026":"\u4FDD\u5B58"})]})]})}):null]})}var ie=A("react");var P=A("react");var S=A("react/jsx-runtime"),qe=800,Ct=["get pods -A","get nodes -o wide","get all -n default","logs deploy/xxx -n <ns> --tail=100","describe pod <name> -n <ns>","get events -n <ns> --sort-by=.lastTimestamp"],Ye=e=>`dsh-k8s-console.cmdhist.v1.${e}`,Ee=100;function St(e){try{let r=window.localStorage.getItem(Ye(e)),a=r?JSON.parse(r):null;return Array.isArray(a)?a.filter(n=>typeof n=="string").slice(-Ee):[]}catch{return[]}}function Pt(e,r){try{window.localStorage.setItem(Ye(e),JSON.stringify(r.slice(-Ee)))}catch{}}function At(e){switch(e){case"timeout":return"\u5DF2\u8D85\u65F6\u88AB\u7EC8\u6B62";case"bytes":return"\u8F93\u51FA\u8D85\u8FC7\u4E0A\u9650\u5DF2\u88AB\u622A\u65AD";case"aborted":return"\u5DF2\u624B\u52A8\u4E2D\u6B62";default:return""}}var Ge=(0,P.forwardRef)(function({kube:r},a){let[n,s]=(0,P.useState)(""),[k,i]=(0,P.useState)(""),[h,g]=(0,P.useState)(""),[b,N]=(0,P.useState)(!1),[$,v]=(0,P.useState)([]),[R,H]=(0,P.useState)(null),[E,_]=(0,P.useState)(()=>St(r.id)),[B,c]=(0,P.useState)(-1),[C,L]=(0,P.useState)(null),oe=(0,P.useRef)(null),u=(0,P.useRef)(null),x=(0,P.useRef)(null),T=(0,P.useRef)(()=>{}),z=(0,P.useCallback)(l=>{v(f=>{let W=[...f,l];return W.length>qe?W.slice(W.length-qe):W})},[]);(0,P.useEffect)(()=>{let l=u.current;l&&(l.scrollTop=l.scrollHeight)},[$,b,R]);let K=(0,P.useCallback)(()=>{oe.current?.abort()},[]),Z=(0,P.useCallback)(async l=>{let f=l.trim();if(!f||b)return;let W=f.split(`
`).filter(w=>w.trim()!==""&&!w.trim().startsWith("#")).join(`
`).trim();if(!W)return;oe.current=new AbortController;let U=oe.current.signal;N(!0),H(null),c(-1),z({kind:"cmd",text:W}),_(w=>{let te=[...w.slice(-(Ee-1)),W];return Pt(r.id,te),te});let me=w=>{if(w.type==="start")z({kind:"sys",text:`\u25B6 ${String(w.command??`kubectl ${W}`)}`}),L(`\u6B63\u5728\u6267\u884C ${String(w.command??"")} \u2026\uFF08\u53EF\u968F\u65F6\u4E2D\u6B62\uFF09`);else if(w.type==="out"){let te=w.channel==="stderr"?"stderr":"stdout",pe=typeof w.text=="string"?w.text:"";pe&&z({kind:"out",channel:te,text:pe})}else if(w.type==="note")z({kind:"sys",text:String(w.text??""),tone:"muted"});else if(w.type==="exit"){let te=typeof w.code=="number"?w.code:null,pe=typeof w.signal=="string"?w.signal:null,ye=typeof w.durationMs=="number"?w.durationMs:0,re=w.truncated===!0,ue=typeof w.reason=="string"?w.reason:void 0;H({code:te,signal:pe,durationMs:ye,truncated:re,reason:ue});let ke=At(ue);re&&!ke&&z({kind:"sys",text:"\u8F93\u51FA\u8D85\u8FC7\u4E0A\u9650\u5DF2\u622A\u65AD",tone:"err"}),ke&&z({kind:"sys",text:ke,tone:ue==="aborted"?"muted":"err"}),L(null)}else w.type==="error"&&(z({kind:"err",text:String(w.message??"\u672A\u77E5\u9519\u8BEF")}),L(null))};try{await D.run({id:r.id,command:W,context:k,namespace:h},me,U),U.aborted&&(z({kind:"sys",text:"\u5DF2\u4E2D\u6B62",tone:"muted"}),H(w=>w??{code:null,signal:null,durationMs:0,truncated:!1,reason:"aborted"}))}catch(w){U.aborted?z({kind:"sys",text:"\u5DF2\u4E2D\u6B62",tone:"muted"}):z({kind:"err",text:await V(w)}),L(null)}finally{N(!1),oe.current=null}},[r.id,b,k,h,z]);T.current=Z,(0,P.useImperativeHandle)(a,()=>({runText(l){s(l),x.current?.focus(),window.setTimeout(()=>{let f=T.current;f&&f(l)},0)}}),[]);let ee=(0,P.useCallback)(()=>{Z(n)},[Z,n]),ne=(0,P.useCallback)(l=>{if(l.key==="Enter"&&!l.shiftKey&&!l.nativeEvent.isComposing){l.preventDefault(),ee();return}if(l.key==="ArrowUp"&&E.length>0){let f=B<0?E.length-1:Math.max(0,B-1);c(f),s(E[f]??""),l.preventDefault()}else if(l.key==="ArrowDown"&&B>=0){if(B>=E.length-1)c(-1),s("");else{let f=B+1;c(f),s(E[f]??"")}l.preventDefault()}},[E,B,ee]),G=(0,P.useCallback)(()=>{v([]),H(null)},[]),le=(0,P.useCallback)(async()=>{let l=$.filter(f=>f.kind==="cmd"||f.kind==="out").map(f=>f.kind==="cmd"?`$ ${f.text}`:f.text).join("");try{await navigator.clipboard.writeText(l),L("\u5DF2\u590D\u5236\u8F93\u51FA"),window.setTimeout(()=>L(null),1500)}catch(f){L(`\u590D\u5236\u5931\u8D25\uFF1A${f instanceof Error?f.message:String(f)}`)}},[$]),be=l=>{let f=[];return l.reason==="aborted"?f.push("\u5DF2\u4E2D\u6B62"):l.code===0?f.push("\u6210\u529F"):l.code!==null&&f.push(`\u9000\u51FA\u7801 ${l.code}`),l.signal&&f.push(`signal ${l.signal}`),f.push(`${(l.durationMs/1e3).toFixed(2)}s`),f.join(" \xB7 ")};return(0,S.jsxs)("div",{className:"kc-console",children:[(0,S.jsxs)("div",{className:"kc-console-toolbar",children:[(0,S.jsxs)("div",{className:"kc-console-env",children:[(0,S.jsxs)("label",{title:"\u5728\u8BE5 kubeconfig \u7684\u54EA\u4E9B context \u4E0A\u6267\u884C\uFF08\u7A7A = \u4F7F\u7528\u6587\u4EF6\u5F53\u524D\u4E0A\u4E0B\u6587\uFF09",children:["context",(0,S.jsxs)("select",{value:k,onChange:l=>i(l.target.value),disabled:b,children:[(0,S.jsx)("option",{value:"",children:r.currentContext?`${r.currentContext}\uFF08\u9ED8\u8BA4\uFF09`:"\uFF08\u9ED8\u8BA4\uFF09"}),r.contextNames.filter(l=>l!==r.currentContext).map(l=>(0,S.jsx)("option",{value:l,children:l},l))]})]}),(0,S.jsxs)("label",{title:"\u7ED9\u547D\u4EE4\u9644\u52A0 -n <namespace>\uFF08\u547D\u4EE4\u91CC\u81EA\u5E26 -n \u65F6\u4EE5\u547D\u4EE4\u91CC\u7684\u4E3A\u51C6\uFF09",children:["namespace",(0,S.jsx)("input",{value:h,onChange:l=>g(l.target.value),placeholder:"default",disabled:b,spellCheck:!1})]})]}),(0,S.jsx)("div",{className:"kc-grow"}),(0,S.jsx)("button",{className:"kc-btn-sm",onClick:G,title:"\u6E05\u7A7A\u8F93\u51FA",children:"\u6E05\u7A7A"}),(0,S.jsx)("button",{className:"kc-btn-sm",onClick:()=>void le(),title:"\u590D\u5236\u5168\u90E8\u547D\u4EE4\u4E0E\u8F93\u51FA",children:"\u590D\u5236\u8F93\u51FA"}),(0,S.jsx)("button",{className:"kc-btn-sm",onClick:()=>{s(Ct.join(`
`)),x.current?.focus()},title:"\u586B\u5165\u5E38\u7528\u793A\u4F8B",children:"\u793A\u4F8B"})]}),(0,S.jsxs)("div",{className:"kc-console-input-row",children:[(0,S.jsx)("textarea",{ref:x,className:"kc-code-input kc-command-input",value:n,onChange:l=>s(l.target.value),onKeyDown:ne,placeholder:`kubectl \u547D\u4EE4\uFF08\u53EF\u7701\u7565\u524D\u7F00 kubectl\uFF09
\u4F8B\u5982\uFF1Aget pods -A\u3001get pods -A | grep <\u5173\u952E\u8BCD>

Enter \u6267\u884C \xB7 Shift+Enter \u6362\u884C \xB7 \u2191/\u2193 \u5386\u53F2\uFF08\u5DF2\u6301\u4E45\u5316\uFF09
\u652F\u6301\u7BA1\u9053\u8FC7\u6EE4\uFF1A| grep / head / tail / sort / wc -l\uFF08\u8FDB\u7A0B\u5185\u5B9E\u73B0\uFF09\xB7 \u975E\u4EA4\u4E92`,spellCheck:!1,rows:3}),b?(0,S.jsx)("button",{className:"kc-btn-primary kc-btn-stop",onClick:K,title:"\u4E2D\u6B62\u5F53\u524D\u547D\u4EE4",children:"\u25A0 \u4E2D\u6B62"}):(0,S.jsx)("button",{className:"kc-btn-primary",onClick:ee,disabled:n.trim()==="",title:"\u6267\u884C\uFF08Ctrl+Enter \u4EA6\u53EF\uFF09",children:"\u25B6 \u6267\u884C"})]}),C?(0,S.jsx)("div",{className:"kc-console-status",children:C}):null,(0,S.jsx)("div",{className:"kc-output",ref:u,children:$.length===0?(0,S.jsx)("div",{className:"kc-output-empty",children:(0,S.jsxs)("div",{className:"kc-muted",children:["\u8F93\u5165\u547D\u4EE4\u5F00\u59CB\uFF08",r.name,k?` \xB7 --context ${k}`:"",h?` \xB7 -n ${h}`:"","\uFF09\u3002",(0,S.jsx)("br",{}),"\u53EA\u8BFB\u5EFA\u8BAE\uFF1Aget / describe / logs / top / explain\u3002\u7834\u574F\u6027\u547D\u4EE4\u8BF7\u81EA\u884C\u786E\u8BA4\u5F71\u54CD\u3002"]})}):$.map((l,f)=>l.kind==="cmd"?(0,S.jsxs)("div",{className:"kc-out-line kc-out-cmd",children:[(0,S.jsx)("span",{className:"kc-out-prompt",children:"$"})," ",l.text]},f):l.kind==="out"?(0,S.jsx)("pre",{className:`kc-out-line kc-out-${l.channel}${l.text.endsWith(`
`),""}`,children:l.text},f):l.kind==="err"?(0,S.jsxs)("div",{className:"kc-out-line kc-out-err",children:["\u2715 ",l.text]},f):(0,S.jsx)("div",{className:`kc-out-line kc-out-sys${l.tone==="err"?" kc-out-err":""}${l.tone==="muted"?" kc-out-muted":""}`,children:l.text},f))}),R?(0,S.jsxs)("div",{className:`kc-exitbar${R.reason==="aborted"?" kc-exitbar-muted":R.code===0?"":" kc-exitbar-err"}`,children:[R.reason==="aborted"?"\u23F9 ":R.code===0?"\u2713 ":"\u2715 ",be(R),R.truncated?" \xB7 \u26A0\uFE0F \u8F93\u51FA\u88AB\u622A\u65AD":"",b?" \xB7 \u8FD0\u884C\u4E2D":""]}):null]})});var m=A("react");var o=A("react/jsx-runtime"),Ue=0,Qe=()=>(Ue+=1,Ue);function Et(e){let r=/```(?:bash|sh|shell|kubectl|console)?\s*\n([\s\S]*?)```/g,a;for(;(a=r.exec(e))!==null;){let n=a[1]??"",s=$e(n);if(s)return s}return $e(e)}function $e(e){for(let r of e.split(`
`)){let a=r.replace(/^\s*[$>]\s*/,"").trim();if(!(!a||a.startsWith("#"))&&/^kubectl\b/u.test(a))return a}return null}function Ze(e){let r=[],a=/```([\w+-]*)\s*\n([\s\S]*?)```/g,n=0,s;for(;(s=a.exec(e))!==null;)s.index>n&&r.push({kind:"text",text:e.slice(n,s.index)}),r.push({kind:"code",lang:s[1]||void 0,text:s[2]??""}),n=a.lastIndex;return n<e.length&&r.push({kind:"text",text:e.slice(n)}),r}function et({kube:e,onRunCommand:r}){let[a,n]=(0,m.useState)([]),[s,k]=(0,m.useState)(""),[i,h]=(0,m.useState)(!1),[g,b]=(0,m.useState)(null),[N,$]=(0,m.useState)(!1),[v,R]=(0,m.useState)(""),[H,E]=(0,m.useState)(null),_=(0,m.useRef)(null),B=(0,m.useRef)(null),c=(0,m.useRef)(null),C=(0,m.useRef)(null),[L,oe]=(0,m.useState)(!1),[u,x]=(0,m.useState)(!1),[T,z]=(0,m.useState)(!1),[K,Z]=(0,m.useState)(""),[ee,ne]=(0,m.useState)([]),[G,le]=(0,m.useState)(null),be=(0,m.useCallback)(async()=>{$(!0);try{b(await D.aiModels())}catch(t){b(null),E(`\u6A21\u578B\u679A\u4E3E\u5931\u8D25\uFF1A${await V(t)}`)}finally{$(!1)}},[]);(0,m.useEffect)(()=>{be()},[be]);let l=(0,m.useMemo)(()=>g?Xe(g):[],[g]),f=(0,m.useMemo)(()=>l.find(t=>t.key===v),[l,v]);(0,m.useEffect)(()=>{let t=B.current;t&&(t.scrollTop=t.scrollHeight)},[a]);let W=(0,m.useCallback)(t=>{n(d=>[...d,{...t,key:Qe()}])},[]),U=(0,m.useCallback)(t=>{n(d=>{if(d.length===0)return d;let I=d[d.length-1];if(I.role!=="assistant")return d;let F={...I,...t};t.content&&typeof t.content=="string"&&(F.content=I.content+t.content);let j=[...d];return j[j.length-1]=F,j})},[]),me=(0,m.useCallback)(()=>{_.current?.abort()},[]),w=(0,m.useCallback)(async t=>{try{let d=await D.historyAppend({...C.current?{sessionId:C.current}:{},kubeId:e.id,kubeName:e.name,context:e.currentContext,message:{role:t.role,content:t.content,at:new Date().toISOString(),...t.provider?{provider:t.provider}:{},...t.model?{model:t.model}:{},...t.error===!0?{error:!0}:{}}});C.current=d.sessionId}catch{}},[e.id,e.name,e.currentContext]),te=(0,m.useCallback)(async()=>{let t=s.trim();if(!t||i)return;k(""),E(null);let d=a.filter(M=>M.role==="user"||M.state==="done").map(M=>({role:M.role,content:M.content}));d.push({role:"user",content:t}),W({role:"user",content:t}),W({role:"assistant",content:"",state:"streaming"}),h(!0),_.current=new AbortController;let I=_.current.signal;w({role:"user",content:t});let F="",j,fe,ae=null;try{await D.chat({id:e.id,provider:f?.provider,model:f?.model,history:d.slice(-40)},M=>{M.type==="delta"&&typeof M.text=="string"?(F+=M.text,U({content:M.text})):M.type==="done"?(typeof M.provider=="string"&&(j=M.provider),typeof M.model=="string"&&(fe=M.model),U({state:"done",meta:{...j?{provider:j}:{},...fe?{model:fe}:{}}})):M.type==="aborted"?U({state:"done"}):M.type==="error"&&(ae=String(M.message??"AI \u51FA\u9519"),U({state:"error",content:`\u26A0\uFE0F ${ae}`}))},I)}catch(M){I.aborted?U({state:"done"}):(ae=await V(M),U({state:"error",content:`\u26A0\uFE0F ${ae}`}))}finally{h(!1),_.current=null,(F.trim()!==""||ae)&&w({role:"assistant",content:ae?`\u26A0\uFE0F ${ae}`:F,...j?{provider:j}:{},...fe?{model:fe}:{},...ae?{error:!0}:{}})}},[s,i,a,f,e.id,W,U,w]),pe=(0,m.useCallback)(t=>{t.key==="Enter"&&!t.shiftKey&&!t.nativeEvent.isComposing&&(t.preventDefault(),te())},[te]),ye=(0,m.useCallback)(()=>{i&&me(),n([]),E(null),C.current=null},[i,me]),re=(0,m.useCallback)(async t=>{x(!0);try{let d=await D.historyList({...t&&t.trim()!==""?{keyword:t.trim()}:{},...T?{}:{kubeId:e.id},limit:100});ne(d.sessions??[]),le(null)}catch(d){E(`\u5386\u53F2\u52A0\u8F7D\u5931\u8D25\uFF1A${await V(d)}`)}finally{x(!1)}},[T,e.id]),ue=(0,m.useCallback)(()=>{let t=!L;oe(t),t&&re(K)},[L,re,K]),ke=(0,m.useCallback)(async()=>{await re(K)},[re,K]),pt=(0,m.useCallback)(async t=>{if(G?.id===t){le(null);return}x(!0);try{let d=await D.historyGet(t);le(d.session)}catch(d){E(`\u5386\u53F2\u4F1A\u8BDD\u8BFB\u53D6\u5931\u8D25\uFF1A${await V(d)}`)}finally{x(!1)}},[G]),ut=(0,m.useCallback)(t=>{i||(n(t.messages.map(d=>({key:Qe(),role:d.role,content:d.content,state:d.error?"error":"done",...d.provider||d.model?{meta:{...d.provider?{provider:d.provider}:{},...d.model?{model:d.model}:{}}}:{}}))),C.current=t.id,oe(!1),E(null),c.current?.focus())},[i]),kt=(0,m.useCallback)(async t=>{if(window.confirm("\u786E\u5B9A\u5220\u9664\u8FD9\u6761\u5386\u53F2\u4F1A\u8BDD\uFF1F\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D\u3002"))try{await D.historyDelete(t),C.current===t&&(C.current=null),G?.id===t&&le(null),await re(K)}catch(d){E(`\u5386\u53F2\u4F1A\u8BDD\u5220\u9664\u5931\u8D25\uFF1A${await V(d)}`)}},[G,re,K]),Ke=[...a].reverse().find(t=>t.role==="assistant"&&t.state==="done"),we=Ke?Et(Ke.content):null,bt=(0,m.useCallback)(async t=>{try{await navigator.clipboard.writeText(t)}catch{}},[]),mt=t=>{if(t.role==="user")return(0,o.jsx)("div",{className:"kc-chat-user-text",children:t.content});if(t.state==="error")return(0,o.jsx)("div",{className:"kc-chat-error-text",children:t.content});let d=Ze(t.content);return(0,o.jsxs)("div",{className:"kc-chat-ai-text",children:[d.length===0?t.state==="streaming"?(0,o.jsx)("span",{className:"kc-chat-cursor",children:"\u258D"}):(0,o.jsx)("span",{className:"kc-muted",children:"\uFF08\u7A7A\u56DE\u590D\uFF09"}):d.map((I,F)=>{if(I.kind==="text")return(0,o.jsx)("span",{className:"kc-chat-text-span",children:I.text},F);let j=I.lang===void 0||/^(bash|sh|shell|kubectl|console)$/u.test(I.lang)?$e(I.text):null;return(0,o.jsxs)("div",{className:"kc-codebox",children:[(0,o.jsxs)("div",{className:"kc-codebox-head",children:[(0,o.jsx)("span",{className:"kc-codebox-lang",children:I.lang||"code"}),(0,o.jsx)("span",{className:"kc-grow"}),(0,o.jsx)("button",{className:"kc-btn-sm",onClick:()=>void bt(I.text),children:"\u590D\u5236"}),j?(0,o.jsx)("button",{className:"kc-btn-sm",onClick:()=>r(j),title:`\u53D1\u9001\u5230\u547D\u4EE4\u63A7\u5236\u53F0\u6267\u884C\uFF1A${j}`,children:"\u25B6 \u8FD0\u884C"}):null]}),(0,o.jsx)("pre",{className:"kc-codebox-body",children:I.text})]},F)}),t.state==="streaming"&&d.length>0?(0,o.jsx)("span",{className:"kc-chat-cursor",children:"\u258D"}):null]})};return(0,o.jsxs)("div",{className:"kc-chat",children:[(0,o.jsxs)("div",{className:"kc-chat-toolbar",children:[(0,o.jsxs)("label",{title:"\u590D\u7528 DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\uFF1B\u7A7A = \u8BA9 DSH \u81EA\u52A8\u9009\u62E9",children:["AI \u6A21\u578B",(0,o.jsxs)("select",{value:v,onChange:t=>R(t.target.value),disabled:i||N,children:[(0,o.jsx)("option",{value:"",children:"\u81EA\u52A8\uFF08\u7531 DSH \u9009\u62E9\uFF09"}),l.map(t=>(0,o.jsx)("option",{value:t.key,children:t.label??t.key},t.key))]})]}),(0,o.jsx)("button",{className:"kc-btn-sm",onClick:()=>void be(),disabled:N,title:"\u91CD\u65B0\u679A\u4E3E DSH \u6A21\u578B",children:"\u21BB \u6A21\u578B"}),(0,o.jsx)("button",{className:`kc-btn-sm${L?" kc-btn-sm-active":""}`,onClick:ue,title:"\u67E5\u770B / \u641C\u7D22\u5DF2\u4FDD\u5B58\u7684\u5386\u53F2\u5BF9\u8BDD\uFF08\u9010\u6761\u843D\u76D8\uFF0C\u5237\u65B0\u4E0E\u91CD\u542F\u540E\u4ECD\u53EF\u67E5\u8BE2\uFF09",children:"\u{1F558} \u5386\u53F2"}),(0,o.jsx)("button",{className:"kc-btn-sm",onClick:ye,disabled:a.length===0&&!i,title:"\u6E05\u7A7A\u672C\u4F1A\u8BDD\u5BF9\u8BDD\uFF08\u5F00\u542F\u65B0\u4E00\u8F6E\uFF0C\u5386\u53F2\u4ECD\u4FDD\u7559\uFF09",children:"\u6E05\u7A7A\u5BF9\u8BDD"}),(0,o.jsx)("span",{className:"kc-grow"}),(0,o.jsxs)("span",{className:"kc-chat-cluster",title:"AI \u7CFB\u7EDF\u63D0\u793A\u4E2D\u4F1A\u643A\u5E26\u8BE5\u96C6\u7FA4\u4FE1\u606F",children:["\u2388 ",e.name," \xB7 ",e.currentContext??"",e.server?` \xB7 ${e.server.replace(/^https?:\/\//u,"")}`:""]})]}),g&&!g.ok?(0,o.jsxs)("div",{className:"kc-chat-warn",children:["\u26A0\uFE0F ",g.message??"\u6CA1\u6709\u53EF\u7528\u6A21\u578B","\uFF08\u914D\u7F6E\u597D\u540E\u70B9\u201C\u21BB \u6A21\u578B\u201D\u5237\u65B0\uFF09"]}):null,H?(0,o.jsxs)("div",{className:"kc-chat-warn",children:["\u26A0\uFE0F ",H]}):null,L?(0,o.jsxs)("div",{className:"kc-history",children:[(0,o.jsxs)("div",{className:"kc-history-head",children:[(0,o.jsx)("b",{children:"\u{1F558} \u5BF9\u8BDD\u5386\u53F2"}),(0,o.jsxs)("label",{className:"kc-history-all",title:"\u53D6\u6D88\u52FE\u9009\u5219\u53EA\u770B\u5F53\u524D\u96C6\u7FA4\u7684\u5386\u53F2",children:[(0,o.jsx)("input",{type:"checkbox",checked:T,onChange:t=>{let d=t.target.checked;z(d),window.setTimeout(()=>{(async()=>{x(!0);try{let I=await D.historyList({...K.trim()!==""?{keyword:K.trim()}:{},...d?{}:{kubeId:e.id},limit:100});ne(I.sessions??[]),le(null)}catch{}finally{x(!1)}})()},0)}}),"\u5168\u90E8\u96C6\u7FA4"]}),(0,o.jsx)("span",{className:"kc-grow"}),(0,o.jsxs)("span",{className:"kc-muted",children:[ee.length," \u6761\u4F1A\u8BDD"]}),(0,o.jsx)("button",{className:"kc-btn-sm",onClick:ue,title:"\u5173\u95ED\u5386\u53F2\u9762\u677F",children:"\u2715"})]}),(0,o.jsxs)("div",{className:"kc-history-search",children:[(0,o.jsx)("input",{value:K,onChange:t=>Z(t.target.value),onKeyDown:t=>{t.key==="Enter"&&!t.shiftKey&&!t.nativeEvent.isComposing&&(t.preventDefault(),ke())},placeholder:"\u641C\u7D22\u5386\u53F2\u6D88\u606F\u5173\u952E\u8BCD\uFF08\u56DE\u8F66\u641C\u7D22\uFF09\u2026",spellCheck:!1}),(0,o.jsx)("button",{className:"kc-btn-sm",onClick:()=>void ke(),disabled:u,children:"\u641C\u7D22"}),(0,o.jsx)("button",{className:"kc-btn-sm",onClick:()=>{Z(""),re("")},disabled:u,title:"\u6E05\u7A7A\u5173\u952E\u8BCD\u5E76\u5237\u65B0",children:"\u91CD\u7F6E"})]}),(0,o.jsxs)("div",{className:"kc-history-list",children:[u&&ee.length===0?(0,o.jsx)("div",{className:"kc-muted",children:"\u52A0\u8F7D\u4E2D\u2026"}):null,!u&&ee.length===0?(0,o.jsx)("div",{className:"kc-muted",children:"\u6682\u65E0\u5386\u53F2\u4F1A\u8BDD\u3002\u53D1\u51FA\u7684\u5BF9\u8BDD\u4F1A\u81EA\u52A8\u9010\u6761\u4FDD\u5B58\uFF08\u670D\u52A1\u7AEF\u843D\u76D8\uFF09\uFF0C\u5237\u65B0 / \u91CD\u542F\u540E\u4ECD\u53EF\u5728\u6B64\u641C\u7D22\u67E5\u8BE2\u3002"}):null,ee.map(t=>(0,o.jsxs)("div",{className:`kc-history-item${G?.id===t.id?" kc-history-item-open":""}`,children:[(0,o.jsxs)("div",{className:"kc-history-item-main",onClick:()=>void pt(t.id),title:"\u70B9\u51FB\u5C55\u5F00\u5B8C\u6574\u8BB0\u5F55",children:[(0,o.jsx)("div",{className:"kc-history-item-title",children:t.preview||"\uFF08\u65E0\u6587\u5B57\u5185\u5BB9\uFF09"}),(0,o.jsxs)("div",{className:"kc-history-item-meta",children:["\u2388 ",t.kubeName," \xB7 ",t.messageCount," \u6761 \xB7 ",de(t.updatedAt)]}),t.snippet?(0,o.jsxs)("div",{className:"kc-history-item-snippet",children:["\u547D\u4E2D\uFF1A",t.snippet]}):null]}),(0,o.jsxs)("div",{className:"kc-history-item-actions",children:[(0,o.jsx)("button",{className:"kc-btn-sm",title:"\u8F7D\u5165\u5230\u5BF9\u8BDD\u533A\u5E76\u7EE7\u7EED\u8FFD\u95EE\uFF08\u65B0\u6D88\u606F\u4F1A\u7EE7\u7EED\u4FDD\u5B58\u5230\u8BE5\u4F1A\u8BDD\uFF09",disabled:i,onClick:()=>{(async()=>{try{let d=G?.id===t.id?G:(await D.historyGet(t.id)).session;ut(d)}catch(d){E(`\u5386\u53F2\u4F1A\u8BDD\u8BFB\u53D6\u5931\u8D25\uFF1A${await V(d)}`)}})()},children:"\u8F7D\u5165"}),(0,o.jsx)("button",{className:"kc-btn-sm kc-history-delete",onClick:()=>void kt(t.id),title:"\u5220\u9664\u8BE5\u5386\u53F2\u4F1A\u8BDD",children:"\u5220\u9664"})]}),G?.id===t.id?(0,o.jsx)("div",{className:"kc-history-detail",children:G.messages.map((d,I)=>(0,o.jsxs)("div",{className:`kc-history-msg kc-history-msg-${d.role}${d.error?" kc-history-msg-error":""}`,children:[(0,o.jsx)("span",{className:"kc-history-msg-role",children:d.role==="user"?"\u{1F9D1}":"\u{1F916}"}),(0,o.jsxs)("div",{className:"kc-history-msg-body",children:[Ze(d.content).map((F,j)=>F.kind==="code"?(0,o.jsx)("pre",{className:"kc-history-msg-code",children:F.text},j):(0,o.jsx)("span",{children:F.text},j)),d.provider||d.model?(0,o.jsxs)("div",{className:"kc-history-msg-meta",children:[d.provider??"",d.model?`/${d.model}`:""," \xB7 ",de(d.at)]}):(0,o.jsx)("div",{className:"kc-history-msg-meta",children:de(d.at)})]})]},I))}):null]},t.id))]})]}):null,(0,o.jsxs)("div",{className:"kc-chat-scroll",ref:B,children:[a.length===0?(0,o.jsx)("div",{className:"kc-chat-empty",children:(0,o.jsxs)("div",{className:"kc-muted",style:{maxWidth:460},children:["\u9488\u5BF9\u5F53\u524D\u96C6\u7FA4\uFF08",e.name,"\uFF09\u63D0\u95EE\uFF0C\u4F8B\u5982\uFF1A",(0,o.jsx)("br",{}),"\xB7 \u201C\u67E5\u770B default \u547D\u540D\u7A7A\u95F4\u4E0B\u6240\u6709 deployment \u53CA\u5176\u72B6\u6001\u201D",(0,o.jsx)("br",{}),"\xB7 \u201C\u627E\u51FA ImagePullBackOff \u7684 pod\uFF0C\u5E76\u89E3\u91CA\u600E\u4E48\u6392\u67E5\u201D",(0,o.jsx)("br",{}),"\xB7 \u201C\u751F\u6210\u628A myapp \u7F29\u5230 2 \u526F\u672C\u7684\u547D\u4EE4\u201D",(0,o.jsx)("br",{}),"\xB7 \u201C\u7C98\u8D34\u4E00\u6761 kubectl \u62A5\u9519\uFF0C\u5E2E\u6211\u89E3\u91CA\u539F\u56E0\u201D",(0,o.jsx)("br",{}),(0,o.jsx)("br",{}),"AI \u751F\u6210\u7684\u53EF\u6267\u884C\u547D\u4EE4\u4F1A\u5728\u4EE3\u7801\u5757\u4E0B\u65B9\u63D0\u4F9B ",(0,o.jsx)("b",{children:"\u25B6 \u8FD0\u884C"}),"\uFF0C\u70B9\u51FB\u540E\u5207\u5230\u547D\u4EE4\u63A7\u5236\u53F0\u76F4\u63A5\u6267\u884C\u3002"]})}):a.map(t=>(0,o.jsxs)("div",{className:`kc-chat-row kc-chat-${t.role}`,children:[(0,o.jsx)("div",{className:"kc-chat-avatar",children:t.role==="user"?"\u{1F9D1}":"\u{1F916}"}),(0,o.jsxs)("div",{className:"kc-chat-bubble",children:[mt(t),t.state==="done"&&t.meta&&(t.meta.provider||t.meta.model)?(0,o.jsxs)("div",{className:"kc-chat-meta",children:[t.meta.provider,"/",t.meta.model]}):null]})]},t.key)),we&&!i?(0,o.jsxs)("div",{className:"kc-chat-quickrun",children:["\u{1F4A1} \u53EF\u7528\u547D\u4EE4\uFF1A",(0,o.jsx)("code",{children:we}),(0,o.jsx)("button",{className:"kc-btn-sm",onClick:()=>r(we),children:"\u25B6 \u53D1\u9001\u5230\u63A7\u5236\u53F0\u6267\u884C"})]}):null]}),(0,o.jsxs)("div",{className:"kc-chat-input-row",children:[(0,o.jsx)("textarea",{ref:c,className:"kc-code-input kc-chat-input",value:s,onChange:t=>k(t.target.value),onKeyDown:pe,placeholder:"\u95EE AI\uFF1A\u751F\u6210 kubectl \u547D\u4EE4 / \u89E3\u91CA\u8F93\u51FA / \u6392\u67E5\u62A5\u9519\u2026\uFF08Enter \u53D1\u9001\uFF0CShift+Enter \u6362\u884C\uFF09",spellCheck:!1,rows:2}),i?(0,o.jsx)("button",{className:"kc-btn-primary kc-btn-stop",onClick:me,children:"\u25A0 \u505C\u6B62"}):(0,o.jsx)("button",{className:"kc-btn-primary",onClick:()=>void te(),disabled:s.trim()==="",children:"\u53D1\u9001"})]})]})}var J=A("react/jsx-runtime");function tt({kube:e}){let[r,a]=(0,ie.useState)("console"),[n,s]=(0,ie.useState)({console:!0,chat:!1}),k=(0,ie.useRef)(null),i=(0,ie.useCallback)(b=>{a(b),s(N=>N[b]?N:{...N,[b]:!0})},[]),h=(0,ie.useCallback)(b=>{i("console"),window.setTimeout(()=>{k.current?.runText(b)},0)},[i]),g=(b,N,$)=>(0,J.jsx)("button",{type:"button",role:"tab","aria-selected":r===b,title:$,className:r===b?"kc-seg-active":"",onClick:()=>i(b),children:N});return(0,J.jsxs)("div",{className:"kc-workspace",children:[(0,J.jsxs)("div",{className:"kc-ws-meta",children:[(0,J.jsxs)("span",{className:"kc-ws-meta-name",title:`kubeconfig \u6587\u4EF6\uFF1A${e.fileName}`,children:["\u2388 ",e.name]}),(0,J.jsx)("span",{className:"kc-ws-meta-chip",title:"\u5F53\u524D\u4E0A\u4E0B\u6587",children:e.currentContext??e.contextNames.join(", ")??"\uFF08\u65E0\uFF09"}),e.server?(0,J.jsx)("span",{className:"kc-ws-meta-chip kc-ws-meta-server",title:"API server",children:e.server}):null,(0,J.jsx)("span",{className:"kc-grow"}),(0,J.jsxs)("div",{className:"kc-seg",role:"tablist","aria-label":"\u4F1A\u8BDD\u5B50\u9875",children:[g("console","\u2328\uFE0F \u547D\u4EE4\u63A7\u5236\u53F0","\u76F4\u63A5\u6267\u884C kubectl \u547D\u4EE4\uFF08\u4F7F\u7528\u672C\u4F1A\u8BDD\u9009\u62E9\u7684 context / namespace\uFF09"),g("chat","\u{1F4AC} AI \u5BF9\u8BDD","\u591A\u8F6E\u5BF9\u8BDD\uFF1A\u751F\u6210 kubectl \u547D\u4EE4 / \u89E3\u91CA\u8F93\u51FA\u7ED3\u679C\uFF1B\u6A21\u578B\u8DDF\u968F DSH \u914D\u7F6E")]})]}),(0,J.jsxs)("div",{className:"kc-ws-body",children:[n.console?(0,J.jsx)("div",{className:"kc-ws-pane","data-active":r==="console"?"true":void 0,style:r==="console"?void 0:{display:"none"},children:(0,J.jsx)(Ge,{ref:k,kube:e})}):null,n.chat?(0,J.jsx)("div",{className:"kc-ws-pane","data-active":r==="chat"?"true":void 0,style:r==="chat"?void 0:{display:"none"},children:(0,J.jsx)(et,{kube:e,onRunCommand:h})}):null]})]})}var y=A("react/jsx-runtime"),rt=0;function $t(){return rt+=1,`session_${Date.now().toString(36)}_${rt}`}function Te(e={}){let[r,a]=(0,O.useState)([]),[n,s]=(0,O.useState)(null),[k,i]=(0,O.useState)(!1),[h,g]=(0,O.useState)(null),[b,N]=(0,O.useState)(null),$=(0,O.useRef)(!0),[v,R]=(0,O.useState)([]),[H,E]=(0,O.useState)(null),_=(0,O.useCallback)((u,x)=>{N({kind:u,text:x}),window.setTimeout(()=>N(T=>T?.text===x?null:T),u==="error"?6e3:2600)},[]),B=(0,O.useCallback)(async()=>{i(!0);try{let[u,{kubeconfigs:x}]=await Promise.all([D.state(!0),D.kubeconfigs()]);s(u),a(x),g(null)}catch(u){let x=await V(u);g(`\u65E0\u6CD5\u8FDE\u63A5\u63D2\u4EF6\u670D\u52A1\uFF1A${x}\u3002\u8BF7\u786E\u8BA4\u5DF2\u5728 DSH \u4E2D\u5B89\u88C5\u5E76\u542F\u7528 dsh-plugin-k8s\uFF08\u91CD\u542F dsh web \u540E\u751F\u6548\uFF09\u3002`),_("error",`\u52A0\u8F7D\u5931\u8D25\uFF1A${x}`)}finally{i(!1)}},[_]);(0,O.useEffect)(()=>{$.current&&($.current=!1,B())},[B]),(0,O.useEffect)(()=>{let u=new Set(r.map(x=>x.id));R(x=>{let T=x.filter(z=>u.has(z.kube.id));return T.length===x.length?x:T})},[r]),(0,O.useEffect)(()=>{H!==null&&!v.some(u=>u.key===H)&&E(v.length>0?v[v.length-1].key:null)},[v,H]);let c=(0,O.useCallback)(u=>{let x={key:$t(),kube:u};R(T=>[...T,x]),E(x.key)},[]),C=(0,O.useCallback)(u=>{let x=v.findIndex(K=>K.key===u);if(R(K=>K.filter(Z=>Z.key!==u)),H!==u)return;let T=x>=0?v[x+1]:void 0,z=x>=0?v[x-1]:void 0;E((T??z)?.key??null)},[v,H]),L=(u,x)=>{let T=v.slice(0,x+1).filter(ne=>ne.kube.id===u.kube.id).length,z=v.filter(ne=>ne.kube.id===u.kube.id).length,K=u.kube.name,Z=z>1?`${K} #${T}`:K,ee=u.kube.currentContext?` \xB7 ${u.kube.currentContext}`:"";return{title:Z,sub:`${u.kube.name}${ee} \u2014 \u4F1A\u8BDD ${T}`}},oe=u=>(0,y.jsx)(tt,{kube:u.kube},u.key);return(0,y.jsxs)("div",{className:"kc-app",children:[(0,y.jsxs)("div",{className:"kc-topbar",children:[(0,y.jsxs)("div",{className:"kc-title",children:[(0,y.jsx)("span",{className:"kc-logo",children:"K8s"})," K8s \u63A7\u5236\u53F0",(0,y.jsx)("span",{className:"kc-badge",children:"dsh-plugin-k8s"}),n?.kubectl.version?(0,y.jsxs)("span",{className:"kc-badge kc-badge-ok",children:["kubectl ",n.kubectl.version]}):null,n&&!n.kubectl.present?(0,y.jsx)("span",{className:"kc-badge kc-badge-bad",title:n.kubectl.missingReason,children:"kubectl \u672A\u627E\u5230"}):null]}),(0,y.jsx)("div",{className:"kc-grow"}),b?(0,y.jsx)("span",{className:`kc-notice kc-notice-${b.kind}`,title:b.text,children:b.text}):null,k?(0,y.jsx)("span",{className:"kc-muted",children:"\u2026"}):null,e.onClose?(0,y.jsx)("button",{onClick:e.onClose,title:"\u5173\u95ED\u9762\u677F\uFF0C\u56DE\u5230\u5BF9\u8BDD",children:e.standalone?"\u2715 \u5173\u95ED":"\u2715 \u56DE\u5230\u5BF9\u8BDD"}):null]}),h?(0,y.jsx)("div",{className:"kc-fatal",children:(0,y.jsxs)("div",{className:"kc-fatal-box",children:[(0,y.jsx)("div",{className:"kc-fatal-title",children:"\u26A0\uFE0F K8s \u63A7\u5236\u53F0\u6682\u65F6\u4E0D\u53EF\u7528"}),(0,y.jsx)("div",{className:"kc-fatal-text",children:h}),(0,y.jsx)("button",{onClick:()=>{g(null),B()},children:"\u91CD\u8BD5"})]})}):(0,y.jsxs)("div",{className:"kc-app-body",children:[(0,y.jsx)(_e,{kubeconfigs:r,busyList:k,refresh:B,onOpenSession:c,onFlash:_,stateInfo:n}),(0,y.jsxs)("div",{className:"kc-main",children:[(0,y.jsxs)("div",{className:"kc-tabbar",role:"tablist","aria-label":"\u5DF2\u6253\u5F00\u7684\u96C6\u7FA4\u4F1A\u8BDD",children:[v.length===0?(0,y.jsx)("span",{className:"kc-muted",style:{padding:"0 10px",whiteSpace:"nowrap"},children:"\u70B9\u51FB\u5DE6\u4FA7 kubeconfig \u65B0\u5EFA\u4F1A\u8BDD\uFF08\u540C\u4E00\u96C6\u7FA4\u53EF\u5F00\u591A\u4E2A\u72EC\u7ACB\u4F1A\u8BDD\uFF09\u3002"}):null,v.map((u,x)=>{let{title:T,sub:z}=L(u,x);return(0,y.jsxs)("div",{role:"tab","aria-selected":u.key===H,className:`kc-tab${u.key===H?" kc-tab-active":""}`,title:`${z} \u2014\u2014 \u70B9\u51FB\u5207\u6362\uFF0C\u2715 \u5173\u95ED`,onClick:()=>E(u.key),children:[(0,y.jsx)("span",{className:"kc-tab-icon",children:"\u2388"}),(0,y.jsx)("span",{className:"kc-tab-label",children:T}),(0,y.jsx)("span",{className:"kc-tab-close",title:"\u5173\u95ED",onClick:K=>{K.stopPropagation(),C(u.key)},children:"\u2715"})]},u.key)})]}),(0,y.jsx)("div",{className:"kc-tabpanes",children:v.length===0?(0,y.jsxs)("div",{className:"kc-empty",style:{flex:1},children:[(0,y.jsx)("div",{style:{fontSize:30,opacity:.5},children:"\u2388"}),(0,y.jsx)("div",{children:"\u8FD8\u6CA1\u6709\u6253\u5F00\u4EFB\u4F55\u96C6\u7FA4\u4F1A\u8BDD\u3002"}),(0,y.jsxs)("div",{style:{marginTop:6,fontSize:12},className:"kc-muted",children:["\u5DE6\u4FA7\u70B9\u51FB kubeconfig \u5373\u53EF\u65B0\u5EFA\u4F1A\u8BDD Tab\uFF08\u91CD\u590D\u70B9\u51FB\u540C\u4E00\u96C6\u7FA4\u4F1A\u518D\u5F00\u4E00\u4E2A\u72EC\u7ACB\u4F1A\u8BDD\uFF09\uFF1B",(0,y.jsx)("br",{}),"\u6BCF\u4E2A\u4F1A\u8BDD\u5185\u542B\u300C\u2328\uFE0F \u547D\u4EE4\u63A7\u5236\u53F0\u300D\u4E0E\u300C\u{1F4AC} AI \u5BF9\u8BDD\u300D\u4E24\u4E2A\u5B50\u9875\uFF0C\u5404\u81EA\u72EC\u7ACB\u4FDD\u6301\u72B6\u6001\u3002"]})]}):v.map(u=>(0,y.jsx)("div",{role:"tabpanel",className:"kc-pane","data-active":u.key===H?"true":void 0,style:u.key===H?void 0:{display:"none"},children:oe(u)},u.key))})]})]})]})}var ze=A("react/jsx-runtime"),ce=null,ot=null;function Tt(){return ce!==null||(ce=document.createElement("div"),ce.id="dsh-k8s-console",ce.style.cssText=["position:absolute","inset:0","z-index:30","display:none","flex-direction:column","overflow:hidden","background:var(--kc-bg)"].join(";"),document.body.appendChild(ce),ot=(0,nt.createRoot)(ce),ot.render((0,ze.jsx)(Te,{onClose:()=>Q.close(),standalone:!1}))),ce}function at(e){let r=(0,xe.useRef)(null);return(0,xe.useEffect)(()=>{let a=r.current;if(a===null)return;let n=Tt(),s=a.closest("[data-phase]")??a.parentElement,k,i=h=>{Number.isFinite(h)&&h>=32&&n.style.setProperty("--kc-shell-header-h",`${h}px`)};if(s!=null){let h=s.querySelector("header");h!==null&&(k=new ResizeObserver(g=>{for(let b of g){let N=b.borderBoxSize,$=Array.isArray(N)?N[0]?.blockSize:void 0;i($??h.getBoundingClientRect().height)}}),k.observe(h),i(h.getBoundingClientRect().height))}return s!=null&&(Q.setDocked(!0),n.style.display="flex",n.parentElement!==s&&s.appendChild(n)),()=>{k?.disconnect(),Q.setDocked(!1),n.parentElement!==document.body&&document.body.appendChild(n),n.style.display="none"}},[]),(0,ze.jsx)("div",{ref:r,style:{height:0,overflow:"hidden"}})}var st=`/* dsh-plugin-k8s \u5BA2\u6237\u7AEF\u6837\u5F0F\uFF08\u96F6\u5916\u90E8\u4F9D\u8D56\uFF0C\u5168\u90E8\u9650\u5B9A\u5728 #dsh-k8s-console\uFF09
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

/* ---------- \u5BF9\u8BDD\u5386\u53F2\u62BD\u5C49\uFF08ChatView \u5185\uFF09 ---------- */
.kc-history {
  margin: 0 10px 6px;
  border: 1px solid var(--kc-border);
  border-radius: 10px;
  background: var(--kc-panel);
  display: flex;
  flex-direction: column;
  max-height: 46%;
  overflow: hidden;
  flex-shrink: 0;
}
.kc-history-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--kc-border) 60%, transparent);
  font-size: 12px;
}
.kc-history-head b { font-size: 12px; }
.kc-history-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--kc-muted);
  cursor: pointer;
  white-space: nowrap;
}
.kc-history-count { font-size: 12px; }
.kc-history-search {
  display: flex;
  gap: 6px;
  padding: 6px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--kc-border) 50%, transparent);
}
.kc-history-search input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid var(--kc-border);
  border-radius: 6px;
  background: var(--kc-bg);
  color: var(--kc-text);
  font-size: 12px;
}
.kc-history-list {
  flex: 1;
  min-height: 60px;
  overflow-y: auto;
  padding: 6px 10px;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-border-strong) transparent;
}
.kc-history-item {
  border: 1px solid color-mix(in srgb, var(--kc-border) 70%, transparent);
  border-radius: 8px;
  margin-bottom: 6px;
  background: var(--kc-bg);
  overflow: hidden;
}
.kc-history-item-open { border-color: var(--kc-accent); }
.kc-history-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  cursor: pointer;
}
.kc-history-item-main:hover { background: color-mix(in srgb, var(--kc-accent) 6%, transparent); }
.kc-history-item-title {
  font-size: 12px;
  color: var(--kc-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kc-history-item-meta { font-size: 11px; color: var(--kc-muted); }
.kc-history-item-snippet {
  font-size: 11px;
  color: var(--kc-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kc-history-item-actions {
  display: flex;
  gap: 6px;
  padding: 0 8px 6px;
}
.kc-history-delete:hover { color: #e5484d; }
.kc-history-detail {
  border-top: 1px dashed color-mix(in srgb, var(--kc-border) 70%, transparent);
  padding: 8px;
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-border-strong) transparent;
}
.kc-history-msg {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  line-height: 1.5;
}
.kc-history-msg-role { flex-shrink: 0; }
.kc-history-msg-body {
  flex: 1;
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--kc-text);
}
.kc-history-msg-user .kc-history-msg-body { color: var(--kc-muted); }
.kc-history-msg-error .kc-history-msg-body { color: #e5484d; }
.kc-history-msg-code {
  margin: 4px 0;
  padding: 6px 10px;
  border: 1px solid var(--kc-border);
  border-radius: 6px;
  background: var(--kc-panel);
  font-family: var(--kc-mono);
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
}
.kc-history-msg-meta { font-size: 10px; color: var(--kc-muted); margin-top: 2px; }
.kc-btn-sm-active {
  border-color: var(--kc-accent);
  color: var(--kc-accent);
}
`;var it="dsh-k8s-console-style";function ct(){if(typeof document>"u")return()=>{};let e=document.getElementById(it);if(e!==null&&e.isConnected)return()=>{};let r=document.createElement("style");return r.id=it,r.setAttribute("data-plugin","dsh-plugin-k8s"),r.textContent=st,document.head.appendChild(r),()=>{r.isConnected&&r.remove()}}var lt={"sidebar.label":"K8s","sidebar.aria":"K8s \u63A7\u5236\u53F0","sidebar.title":"\u6253\u5F00 K8s \u63A7\u5236\u53F0","overlay.close":"\u56DE\u5230\u5BF9\u8BDD"},dt={"sidebar.label":"K8s","sidebar.aria":"K8s console","sidebar.title":"Open K8s console","overlay.close":"Back to conversation"};var Kt=["slots","locale"];function Mt(e){let r=e?.slots,a=e?.locale;if(!r||!a)return;let n=a.bind("k8s"),s=a.register("k8s",{zh:lt,en:dt}),k=ct(),i=r.inject("sidebar.footer.action",()=>r.register({name:"sidebar.footer.action",id:"k8s-console",order:-9,locale:"k8s",label:()=>n("sidebar.label")},je)),h=r.inject("conversation.view",()=>r.register({name:"conversation.view",id:"k8s",order:65,locale:"k8s",label:()=>n("sidebar.label")},at));e?.effect&&e.effect(()=>()=>{s(),i(),h(),k()},"dsh-plugin-k8s: plugin teardown")}return yt(Rt);})();
    return __dsh_k8s_module__;
  },
});
