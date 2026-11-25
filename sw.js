const CACHE='automaten-v28';
const ASSETS=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(ASSETS);
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 const isAppPage=request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/Autometenverwaltung/');
 if(isAppPage){
  event.respondWith((async()=>{
   try{
    const fresh=await fetch(request,{cache:'no-store'});
    if(fresh&&fresh.ok){const cache=await caches.open(CACHE);cache.put(request,fresh.clone());return fresh;}
   }catch(error){}
   return (await caches.match(request))||(await caches.match('./index.html'))||Response.error();
  })());
 }else{
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
 }
});