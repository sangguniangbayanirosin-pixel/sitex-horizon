import{f as e,r as t,v as n}from"./card-rNPOwAW2.js";var r=Object.fromEntries(e.map(e=>[e.id,e.color])),i=Object.fromEntries(e.map(e=>[e.name.toLowerCase(),e.color]));function a(e){return r[e]??`#5B9DFF`}function o(e){return i[e.toLowerCase()]??`#5B9DFF`}var s=n();function c(e,t=40){return`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${Math.round(t*.55)}" viewBox="0 0 48 26" aria-hidden="true">
  <rect x="3.2" y="4" width="39.5" height="13.2" rx="3.6" fill="${e}"/>
  <path d="M3.2 10.2 V17 H1.4 A1.4 1.4 0 0 1 0 15.6 V12.4 Z" fill="${e}"/>
  <rect x="8" y="6.4" width="8" height="6.2" rx="1.1" fill="#061018" opacity="0.5"/>
  <rect x="18" y="6.4" width="8" height="6.2" rx="1.1" fill="#061018" opacity="0.42"/>
  <rect x="28" y="6.4" width="7.2" height="6.2" rx="1.1" fill="#061018" opacity="0.34"/>
  <rect x="37.4" y="8" width="3.2" height="2.3" rx="0.45" fill="#fff8d6"/>
  <circle cx="13" cy="19.6" r="3.15" fill="#0b1220"/>
  <circle cx="13" cy="19.6" r="1.35" fill="#cbd5e1"/>
  <circle cx="35" cy="19.6" r="3.15" fill="#0b1220"/>
  <circle cx="35" cy="19.6" r="1.35" fill="#cbd5e1"/>
  <rect x="6" y="15.4" width="34" height="1.15" fill="#061018" opacity="0.22"/>
</svg>`}function l({color:e,routeId:n,town:r,className:i,size:l=28,title:u}){let d=e??(n?a(n):r?o(r):`#5B9DFF`);return(0,s.jsx)(`span`,{className:t(`inline-flex shrink-0 items-center justify-center`,i),style:{width:l,height:Math.round(l*.55)},title:u,"aria-hidden":!u,dangerouslySetInnerHTML:{__html:c(d,l)}})}function u(e,t){return t<=1||e<=0?null:e/t*60}function d(e){if(e==null)return`—`;if(e<1)return`<1 min`;if(e<60)return`${Math.round(e)} min`;let t=Math.floor(e/60),n=Math.round(e%60);return n?`${t}h ${n}m`:`${t}h`}function f(e){return e<.1?`<0.1 km`:`${e.toFixed(1)} km`}function p(e){return`${Math.round(e)} km/h`}export{l as a,p as i,d as n,c as o,f as r,a as s,u as t};