!function(){"use strict";var e="/big-island-buses/";const t=e=>Number.parseInt(e,10);var o;function n(e){return{route:e.route,stop:e.stop}}function s(t,n,s){let i=e;switch(t){case o.ROUTE:i+=`routes/${n}/`,null!=s.route.trip&&(i+=s.route.trip),null!=s.stop&&(i+=`?stop=${s.stop}`);break;case o.STOP:return`?stop=${n}`;case o.TRIP:i+=`routes/${s.route.id}/${n}`,null!=s.stop&&(i+=`?stop=${s.stop}`);break;default:console.warn("Invalid type provided for link: %i",t)}return i}function i(e,t){const o=e.indexOf(t);return o>-1?e.substring(o+t.length):null}!function(e){e[e.ROUTE=0]="ROUTE",e[e.STOP=1]="STOP",e[e.TRIP=2]="TRIP"}(o||(o={}));const r=new RegExp(e+"routes/([\\w-]+)/(\\w+)?");function a(e){var t;const o=i(e.hash,"#!")||(null===(t=i(e.search,"_escaped_fragment_"))||void 0===t?void 0:t.replace(/%26/g,"&"));if(o){const e=new URLSearchParams(o);return{route:{id:e.get("route"),trip:e.get("trip")},stop:e.get("stop")}}const n=e.pathname.match(r),s=e.searchParams.get("stop");if(n){const[,e,t]=n;return{route:{id:e,trip:t},stop:s}}return{route:{},stop:s}}function c(e,t,s){const i=n(e);switch(t){case o.STOP:i.stop=s;break;case o.ROUTE:i.route={id:s,trip:e.route.trip};break;case o.TRIP:i.route={id:e.route.id,trip:s}}return i}function l(e,t){for(var o in t)e[o]=t[o];return e}var d,u;!function(e){e[e.LIST=0]="LIST",e[e.MAP_PRIMARY=1]="MAP_PRIMARY",e[e.STREET_PRIMARY=2]="STREET_PRIMARY"}(d||(d={})),function(e){e[e.NOT_ASKED=-1]="NOT_ASKED",e[e.GRANTED=0]="GRANTED",e[e.DENIED=1]="DENIED",e[e.UNAVALIABLE=2]="UNAVALIABLE",e[e.TIMEOUT=3]="TIMEOUT"}(u||(u={}));const p=function(e){var t=[];function o(e){for(var o=[],n=0;n<t.length;n++)t[n]===e?e=null:o.push(t[n]);t=o}function n(o,n,s){e=n?o:l(l({},e),o);for(var i=t,r=0;r<i.length;r++)i[r](e,s)}return e=e||{},{action:function(t){function o(e){n(e,!1,t)}return function(){for(var n=arguments,s=[e],i=0;i<arguments.length;i++)s.push(n[i]);var r=t.apply(this,s);if(null!=r)return r.then?r.then(o):o(r)}},setState:n,subscribe:function(e){return t.push(e),function(){o(e)}},unsubscribe:o,getState:function(){return e}}}({route:{},view:{route:d.LIST,stop:d.MAP_PRIMARY},locatePermission:u.NOT_ASKED,focus:"stop"});function m(e){let t,o;return function(...n){var s;return(null===(s=t)||void 0===s?void 0:s.every((e,t)=>e===n[t]))?o:(t=n,o=e(...n))}}function g(e,t,o){let n;return e.subscribe(e=>(function(e){const t=Object.keys(e);return Promise.all(t.map(t=>e[t])).then(e=>{const o={};return t.forEach((t,n)=>{o[t]=e[n]}),o})})(t(e)).then(e=>{n&&!function(e,t){return Object.keys(e).some(o=>e[o]===t[o])}(e,n)||(n=e,o(e))}))}var h;null===(h=navigator.serviceWorker)||void 0===h||h.register(e+"service-worker.js");const f=e+"assets/pins.png",v={url:f,size:{height:26,width:24},scaledSize:{height:26,width:120},origin:{x:0,y:0},anchor:{x:12,y:12}},_={url:f,size:{height:26,width:24},scaledSize:{height:26,width:120},origin:{x:96,y:0},anchor:{x:12,y:12}},E={url:f,size:{height:26,width:24},scaledSize:{height:26,width:120},origin:{x:48,y:0},anchor:{x:12,y:12}},I={url:f,size:{height:26,width:24},scaledSize:{height:26,width:120},origin:{x:72,y:0},anchor:{x:12,y:23}},y={url:f,size:{height:26,width:24},scaledSize:{height:26,width:120},origin:{x:24,y:0},anchor:{x:12,y:20}};function w(e,t){return Object.assign(document.createElement(e),t)}function P(e,t){return s(e,t,p.getState())}function T(e,t,o,i){return Object.assign(e,{Type:t,Value:o,href:P(t,o)}),e.href=P(t,o),e.addEventListener("click",S),i&&g(i,n,n=>{e.href=s(t,o,n)}),e}function L(e,t,o){return T(document.createElement("a"),e,t,o)}function S(e){var t,o,n,s;return null===(o=(t=e).preventDefault)||void 0===o||o.call(t),null===(s=(n=e).stopPropagation)||void 0===s||s.call(n),function(e){var t;const{Type:o,Value:n}=e,s=P(o,n),i=c(p.getState(),o,n);p.setState(i),history.pushState(i,null,s),null===(t=ga)||void 0===t||t("send","pageview",{page:s,title:document.title})}(this),!1}function R(e){let t;return(n,s,i)=>(t||((t=new google.maps.Marker(e)).setMap(n),t.Type=o.STOP,google.maps.event.addListener(t,"click",S)),t.Value=i,t.setPosition(s),t)}let C=0;const B=new class{constructor(e){this.worker=e,this.callbacks=new Map,e.addEventListener("message",e=>this.onMessage(e.data))}onMessage(e){if(!Array.isArray(e)||e.length<2)return;const[t,o,n]=e,s=this.callbacks.get(t);s&&(this.callbacks.delete(t),s(o,n))}postMessage(e){const t=C++,o=[t,e];return new Promise((e,n)=>{this.callbacks.set(t,(t,o)=>{t?n(t):e(o)}),this.worker.postMessage(o)})}}(new Worker(e+"worker/closest-stop.js"));let b=!1;function M(e,t){return t?(b||(B.postMessage({stops:Object.values(e)}),b=!0),B.postMessage(t)):Promise.resolve(void 0)}const x=m(M),O=m(M);function A(e,t){return x(e,t.userLocation)}function k(e,t){return O(e,t.searchLocation)}function N(e){var t;return null===(t=e)||void 0===t?void 0:t.stop_id}function D(e,t){return Promise.resolve().then(()=>{switch(t.focus){case"user":return A(e,t).then(N);case"search":return k(e,t).then(N);case"stop":return t.stop||void 0}})}let z,j,U,V,Y=0;function $(e){if("string"==typeof e&&e.indexOf(":")>-1&&e.lastIndexOf(":")>e.indexOf(":")){const[o,n,s]=e.split(":").map(t);e=new Date(0,0,0,o,n,s,0)}if("object"!=typeof e)throw new TypeError(`date must be Date or string, not ${typeof e}`);let o="am",n="",s="";const i=e.getHours(),r=e.getMinutes();if(0===i)n="12";else if(12===i)n="12",o="pm";else if(i>12){n=(i-12).toString(),o="pm"}else n=i.toString();return n+(s=0===r?"":r<10?":0"+r.toString():":"+r.toString())+o}function G(e){const[o,n,s]=e.split(":").map(e=>t(e));let i=0,r=0;return o>23&&(i=Math.floor(o/24),r=o%24),new Date(0,0,0+i,o+r,n,s,0)}let H,Z=[];const K="interactive"===document.readyState||"complete"===document.readyState?Promise.resolve(document.readyState):new Promise(e=>{document.addEventListener("readystatechange",()=>{"interactive"===document.readyState&&e(document.readyState)})}),F=fetch(e+"api.json").then(e=>{if(e.ok)return e.json();throw new Error(e.statusText)}).then(e=>e),W=function(){if(!navigator.onLine||"object"!=typeof google||"object"!=typeof google.maps)throw K.then(function(){document.body.classList.add("no-map")}),new Error("Google Maps API has not loaded");V=new google.maps.LatLngBounds,Z=[];const e=K.then(function(){return Promise.resolve().then(()=>{const e=p.getState().view.stop,t=e===d.MAP_PRIMARY?document.getElementById("map-canvas"):document.getElementById("streetview-canvas"),o=e===d.STREET_PRIMARY?document.getElementById("map-canvas"):document.getElementById("streetview-canvas");return z=new google.maps.Map(t,{center:new google.maps.LatLng(19.6,-155.56),zoom:10,mapTypeControlOptions:{position:google.maps.ControlPosition.TOP_CENTER},panControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},streetViewControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},zoomControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP}}),j=new google.maps.StreetViewPanorama(o,{position:new google.maps.LatLng(19.723835,-155.084741),visible:!0,pov:{heading:34,pitch:0},scrollwheel:!1,panControlOptions:{position:google.maps.ControlPosition.RIGHT_CENTER},zoomControlOptions:{style:google.maps.ZoomControlStyle.SMALL,position:google.maps.ControlPosition.RIGHT_CENTER},addressControl:!1}),z.setStreetView(j),(U=new google.maps.places.Autocomplete(document.getElementById("search"))).bindTo("bounds",z),google.maps.event.addListener(U,"place_changed",function(){const e=U.getPlace();e.geometry&&p.setState({searchLocation:e.geometry.location.toJSON(),focus:"search"})}),z})});return Promise.all([e,F.then(function(e){return Promise.resolve().then(()=>{for(const t of Object.values(e.stops)){const e=new google.maps.Marker({position:q(t),title:t.stop_name,icon:v});e.Type=o.STOP,e.Value=t.stop_id,e.stop_id=t.stop_id,google.maps.event.addListener(e,"click",S),V.extend(e.getPosition()),Z.push(e)}return{markers:Z,bounds:V}})})]).then(function([e,{markers:t,bounds:o}]){e.setCenter(o.getCenter()),e.fitBounds(o),google.maps.event.addListener(e,"bounds_changed",function(){const o=e.getBounds();for(const n of t)o.contains(n.getPosition())?n.getMap()!==e&&n.setMap(e):n.setMap(null)}),t.forEach(t=>t.setMap(e))}),window.addEventListener("resize",function(){google.maps.event.trigger(z,"resize"),google.maps.event.trigger(j,"resize"),p.getState().route.id||(z.setCenter(V.getCenter()),z.fitBounds(V))}),e}();function q(e){return new google.maps.LatLng(parseFloat(e.stop_lat),parseFloat(e.stop_lon))}if(Promise.all([F,W]).then(([e,t])=>{function o({location:e,stop:o,buildMarker:n}){var s;e&&n(t,e,null===(s=o)||void 0===s?void 0:s.stop_id)}const n=R({title:"My Location",icon:E,animation:google.maps.Animation.DROP,zIndex:1e3}),s=R({title:"Search Location",icon:I,animation:google.maps.Animation.DROP,zIndex:1e3});g(p,t=>({location:t.userLocation,stop:A(e.stops,t),buildMarker:n}),o),g(p,t=>({location:t.searchLocation,stop:k(e.stops,t),buildMarker:s}),o)}),Promise.all([F,K.then(function(){const e=document.getElementById("nearby"),t=document.getElementById("other"),n=document.getElementById("nearby-info"),s=new Map;for(const e of t.children){const t=e,n=t.dataset.route;T(t.querySelector("a.routes__link"),o.ROUTE,n,p),s.set(n,t)}return function(o,i){n.addEventListener("click",()=>(function(e){let t=!0;navigator.geolocation.clearWatch(Y),Y=navigator.geolocation.watchPosition(function({coords:o}){let n={locatePermission:u.GRANTED,userLocation:{lat:o.latitude,lng:o.longitude}};t&&(n.focus="user",t=!1),e.setState(n)},function(t){e.setState({locatePermission:t.code})})})(i)),g(i,e=>({permission:e.locatePermission}),function({permission:e}){switch(e){case u.NOT_ASKED:n.textContent="Find routes near my location >",n.hidden=!1;break;case u.GRANTED:n.hidden=!0;break;case u.DENIED:n.textContent="Location permission denied.",n.hidden=!1;break;case u.UNAVALIABLE:n.textContent="Location search failed.",n.hidden=!1;break;case u.TIMEOUT:n.textContent="Location search timed out.",n.hidden=!1}}),g(i,e=>({nearest:A(o.stops,e)}),function({nearest:o}){var n,i;const r=new Set(null!=(i=null===(n=o)||void 0===n?void 0:n.routes)?i:[]);for(const[o,n]of s)r.has(o)?e.appendChild(n):t.appendChild(n)})}})]).then(([e,t])=>t(e,p)),K.then(function(){!function(){navigator.onLine||document.getElementById("main").classList.add("offline");document.getElementById("map-toggle").addEventListener("click",X);const e=document.getElementById("trip-select");function t(){document.getElementById("aside").classList.toggle("open")}e.Type=o.TRIP,e.addEventListener("change",function(t){e.Value=e.options[e.selectedIndex].value,S.call(e,t)}),document.getElementById("screen-cover").addEventListener("click",t),document.getElementById("menu").addEventListener("click",t),document.getElementById("alt-menu").addEventListener("click",t)}()}),F.then(e=>{g(p,t=>({route_id:t.route.id||void 0,trip_id:t.route.trip||void 0,stop_id:D(e.stops,t)}),function(n){let s=Promise.resolve();return n.route_id&&(s=Q(e,n.route_id).then(s=>{var i;return function(e,n,s){const i=e.routes[n];if(!i)return void console.error("Invalid Route %s",n);const r=i.trips[s];if(!r||!r.trip_id)return void console.error("Invalid trip %s in route %s",s,n);const a=document.getElementById("schedule");J(a);const c=function(e){const o=[];for(const t in e)o.push(t);return o.sort((e,o)=>t(e)-t(o))}(r.stop_times),l=document.getElementById("trip-select");for(let e=0;e<l.options.length;e++)if(l.options[e].value===s){l.selectedIndex=e,l.options[e].selected=!0;break}document.getElementById("week-days-value").textContent=e.calendar[r.service_id].text_name;for(const t of c){const n=r.stop_times[t],s=L(o.STOP,n.stop_id);s.className="schedule__stop";const i=w("div",{className:"lines"});for(let e=0;e<2;e++){const e=w("span",{className:"line"});i.appendChild(e)}s.appendChild(i);const c=w("span",{className:"schedule__stopname name",textContent:e.stops[n.stop_id].stop_name});s.appendChild(c);const l=w("time",{className:"schedule__time",textContent:(d=n.arrival_time,$(G(d)))});s.appendChild(l),a.appendChild(s)}var d}(e,n.route_id,null!=(i=n.trip_id)?i:s)})),n.stop_id&&function(e,t,n){const s=e.stops[n];if(!s||!s.stop_id)return void console.error("Invalid Stop %s",n);if(j&&j.setPosition(q(s)),z){for(const e of Z)e.activeInRoute||null==t?e.setIcon(v):e.setIcon(_),e.stop_id===s.stop_id&&(H=e);H.setIcon(y),H.setZIndex(300),j.setPosition(H.getPosition()),google.maps.event.trigger(j,"resize"),google.maps.event.addListener(j,"pano_changed",function(){document.getElementById("address").textContent=j.getLocation().description,j.setPov(j.getPhotographerPov())})}j||document.getElementById("stop").classList.add("no-streetview"),document.getElementById("stop_name").textContent=s.stop_name;const i=document.getElementById("connections");J(i);for(const n of s.routes){const s=e.routes[n],r=L(o.ROUTE,n);r.className="connections__link",r.style.borderColor=`#${s.route_color}`,r.textContent=s.route_long_name;const a=document.createElement("li");a.className="connections__item",a.append(r),t===n&&a.classList.add("connections__item--active-route"),i.append(a)}document.getElementById("main").classList.add("open-stop")}(e,n.route_id,n.stop_id),s})}),window.history.state)p.setState(window.history.state);else{const e=a(new URL(location.href));p.setState(e)}function J(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function X(){if(!z||!j)throw console.error("Map and StreetViewPanorama have not loaded"),new TypeError;const e=document.getElementById("map"),t=document.getElementById("streetview-header"),o={...p.getState().view};o.stop===d.MAP_PRIMARY?(e.insertBefore(document.getElementById("streetview-canvas"),e.firstChild),t.insertBefore(document.getElementById("map-canvas"),e.firstChild),this.classList.add("on"),o.stop=d.STREET_PRIMARY):o.stop===d.STREET_PRIMARY&&(e.insertBefore(document.getElementById("map-canvas"),e.firstChild),t.insertBefore(document.getElementById("streetview-canvas"),e.firstChild),this.classList.remove("on"),o.stop=d.MAP_PRIMARY),p.setState({view:o})}window.onhashchange=()=>{const e=a(new URL(location.href));p.setState(e)},window.onpopstate=e=>{p.setState(e.state)};const Q=m(function(e,o){const n=e.routes[o];if(!n||!n.route_id)return console.error("Invalid Route %s",o),Promise.resolve(void 0);document.title=`${n.route_long_name} | Big Island Buses`;const s=document.getElementById("content");let i,r;s.style.setProperty("--route-color",`#${n.route_color}`),s.style.setProperty("--route-text-color",`#${n.route_text_color}`),document.getElementById("route_long_name").textContent=n.route_long_name;let a,c,l=0,d=new Date(0,0,0,23,59,59,0),u=new Date(0,0,0,0,0,0,0);const p=function(){const e=new Date;return new Date(0,0,0,e.getHours(),e.getMinutes(),e.getSeconds(),0)}();let m,g,h=Number.MAX_VALUE;const f=document.getElementById("trip-select");J(f);const E=new Set;for(const e of Object.keys(n.trips)){const o=n.trips[e];for(const e in o.stop_times){"1"==e&&0===t(o.direction_id)?i=o.stop_times[e].stop_id:t(e)>l&&0===t(o.direction_id)&&(l=t(e),r=o.stop_times[e].stop_id),E.add(o.stop_times[e].stop_id);const n=G(o.stop_times[e].arrival_time);n>u&&(u=n),n<d&&(d=n,a=o.trip_id,c=o.stop_times[e].stop_id),n.getTime()-p.getTime()<h&&n.getTime()-p.getTime()>0&&(h=n.getTime()-p.getTime(),m=o.trip_id,g=o.stop_times[e].stop_id)}m||(h=new Date(0,0,1,d.getHours(),d.getMinutes(),d.getSeconds(),0).getTime()-p.getTime(),m=a,g=c);const s=w("option",{value:o.trip_id,textContent:o.trip_short_name});f.appendChild(s)}const I=1!=Math.floor(h/6e4)?Math.floor(h/6e4)+" minutes":"1 minute";if(document.getElementById("place-value").textContent="Between "+e.stops[i].stop_name+" - "+e.stops[r].stop_name,document.getElementById("time-value").textContent=$(d)+" - "+$(u),document.getElementById("next-stop-value").textContent="Reaches "+e.stops[g].stop_name+" in "+I,document.getElementById("main").classList.add("open"),navigator.onLine&&"object"==typeof google&&"object"==typeof google.maps){const e=new google.maps.LatLngBounds;for(const t of Z)E.has(t.stop_id)?(t.setIcon(v),t.setZIndex(200),t.activeInRoute=!0,e.extend(t.getPosition())):(t.setIcon(_),t.setZIndex(null),t.activeInRoute=!1);H&&(H.setIcon(y),H.setZIndex(300)),google.maps.event.trigger(z,"resize"),z.setCenter(e.getCenter()),z.fitBounds(e),google.maps.event.trigger(j,"resize")}return Promise.resolve(m)})}();
//# sourceMappingURL=main.js.map
