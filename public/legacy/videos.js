(function(){
"use strict";
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const IC={
play:'<path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.5-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z" fill="currentColor" stroke="none"/>',
pause:'<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
back:'<path d="M19 5.5v13a.7.7 0 0 1-1.1.6L9 13a1 1 0 0 1 0-1.7l8.9-6.4a.7.7 0 0 1 1.1.6z"/><path d="M5 5v14"/>',
next:'<path d="M5 5.5v13a.7.7 0 0 0 1.1.6L15 13a1 1 0 0 0 0-1.7L6.1 4.9A.7.7 0 0 0 5 5.5z"/><path d="M19 5v14"/>',
restart:'<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
speed:'<path d="M12 14.5l4-4.5"/><path d="M3.3 17A9.5 9.5 0 1 1 20.7 17"/>',
volOn:'<path d="M11 5 6.5 9H3.5v6h3L11 19z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.3 6.3a8 8 0 0 1 0 11.4"/>',
volOff:'<path d="M11 5 6.5 9H3.5v6h3L11 19z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'};
const lbl=(el,ic,t)=>{if(!el)return;el.innerHTML='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+IC[ic]+'</svg><span>'+t+'</span>'};
function E(t,a,p,txt){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;if(p)p.appendChild(e);return e}
const TAGS={start:'START',problem:'PROBLEM',fix:'FIX',idea:'IDEA',question:'QUESTION',result:'RESULT',next:'WHAT’S NEXT',summary:'SUMMARY'};

/* ================= EPISODES ================= */
const EPS=[
{id:'scale',o3:{ceil:[640,100]},name:'Episode 1 · Scaling',sub:'Vertical vs horizontal scaling',
 actors:[
  ['crowd','users',{cnt:'100 users'}],
  ['box','S1',{t:'Server',s:'2 CPU · 4 GB',meter:15}],['box','S2',{t:'Server 2',s:'8 CPU · 32 GB',meter:40}],['box','S3',{t:'Server 3',s:'8 CPU · 32 GB',meter:40}],
  ['box','S4',{t:'Server 4',s:'added at 7:45 pm',meter:45}],['box','S5',{t:'Server 5',s:'added at 8:00 pm',meter:45}],
  ['box','LB',{t:'Load balancer',s:'one address for all',cls:'acc',h:84}],['box','redis',{t:'Session store',s:'Redis · shared',cls:'db',w:190,h:84}],
  ['box','db',{t:'Database',s:'one primary',cls:'db',w:190,meter:90}],
  ['pill','sess',{t:'Priya’s login',cls:'acc'}],['ceil','ceil',{w:400,t:'Biggest machine you can rent'}],['pill','cost',{t:'₹12 lakh / month',cls:'warn'}],
  ['pill','clock',{t:'8:00 pm · 5 servers',cls:'ok'}],['q','q'],
  ['card','pros',{w:230,h:150,lines:[['h2','Why it’s tempting',22],['lg','✓ No code changes',56],['lg','✓ One machine to manage',84],['lg','✓ No network between servers',112]]}],
  ['card','sum',{w:840,h:380,lines:[['h','Vertical vs horizontal scaling',40],['h2','Vertical · scale up',84],['h2','Horizontal · scale out',84,430],
    ['li','Make one machine bigger',116],['li','Add more ordinary machines',116,430],['lg','✓ Simple, no code changes',150],['lg','✓ Grows almost without limit',150,430],
    ['lg','✓ Good first step, great for databases',178],['lg','✓ One machine dies, others keep serving',178,430],['lb','✗ Hardware ceiling, cost explodes',206],['lb','✗ Needs a load balancer',206,430],
    ['lb','✗ Single point of failure',234],['lb','✗ Servers must be stateless',234,430],
    ['li','Real systems do both: scale stateless app servers out from day one,',290],['li','and scale the database up for as long as possible before sharding it.',314]],split:400}]
 ],
 scenes:[
  {tag:'start',title:'Day one: 100 users',cap:'Our food app launches. 100 people use it, and one small server with 2 CPUs and 4 GB of memory handles every request easily. Its load meter sits at 15%.',
   set:{users:[140,280,1,1],S1:[520,280,1,1]},flows:[['users','S1','a',900]]},
  {tag:'problem',title:'One server can’t keep up',cap:'Word spreads. At dinner time 10,000 people open the app at once. The single server hits 96% load, requests queue up, and pages take 8 seconds to load.',
   txt:{users:'10,000 users'},meter:{S1:96},shake:['S1'],flows:[['users','S1','a',170],['S1','users','b',700]]},
  {tag:'fix',title:'Fix #1: vertical scaling',cap:'The first fix most teams try is vertical scaling, also called scaling up: move the same app to a much bigger machine with 32 CPUs and 128 GB. Nothing in the code changes. Load drops back to 38%.',
   set:{S1:[540,280,1.5,1]},lab:{S1:['Bigger server','32 CPU · 128 GB']},meter:{S1:38},flows:[['users','S1','a',170],['S1','users','g',260]]},
  {tag:'idea',title:'Why it’s tempting',cap:'Scaling up is attractive because it is simple: no code changes, still only one machine to look after, and no network calls between servers. It is a perfectly good first step.',
   set:{pros:[830,280,1,1]},flows:[['users','S1','a',220]]},
  {tag:'problem',title:'Problem: there is a ceiling',cap:'Users keep growing to one million. Even the biggest machine you can rent runs out of power, and each size up costs far more than the last. You can’t buy your way past the hardware limit.',
   set:{pros:[830,280,1,0],S1:[540,290,1.85,1],ceil:[540,150,1,1],cost:[540,470,1,1]},txt:{users:'1,000,000 users'},lab:{S1:['Biggest server','448 CPU · 12 TB']},meter:{S1:100},shake:['S1'],flows:[['users','S1','a',110],['S1','users','b',500]]},
  {tag:'problem',title:'Problem: single point of failure',cap:'Worse, it is still just one machine. When it crashes, or even needs a security update and a restart, every single user sees an error. This is called a single point of failure.',
   set:{ceil:[540,150,1,0],cost:[540,470,1,0]},cls:{S1:'dead'},flows:[['users','S1','b',260]]},
  {tag:'fix',title:'Fix #2: horizontal scaling',set3:{S1:[560,120],S2:[700,280],S3:[560,440]},cap:'Horizontal scaling, or scaling out, takes the opposite approach: instead of one giant machine, run several ordinary servers side by side, each with the same code. Need more capacity? Add another server.',
   set:{S1:[600,120,1,1],S2:[600,280,1,1],S3:[600,440,1,1]},cls:{S1:''},lab:{S1:['Server 1','8 CPU · 32 GB']},meter:{S1:40}},
  {tag:'question',title:'But who picks a server?',cap:'There is a catch. The app on Priya’s phone only knows one address. With three servers, something has to decide which server should answer each request.',
   set:{q:[370,280,1,1]},flows:[['users','q','a',350]]},
  {tag:'fix',title:'Fix: a load balancer',cap:'We put a load balancer in front. Users talk only to it, and it spreads requests across the servers, here in turn: server 1, then 2, then 3. Each server now carries about a third of the traffic.',
   set:{q:[370,280,1,0],LB:[370,280,1,1]},flows:[['users','LB','a',200],['LB',['S1','S2','S3'],'a',200]]},
  {tag:'result',title:'A server crashes: nobody notices',cap:'Now when server 2 crashes, the load balancer’s health check notices within seconds and stops sending it traffic. Servers 1 and 3 absorb the load. Users never see an error. No more single point of failure.',
   cls:{S2:'dead'},meter:{S1:62,S3:62},flows:[['users','LB','a',200],['LB',['S1','S3'],'a',200]]},
  {tag:'problem',title:'Problem: logged out at random',cap:'A new bug appears. Priya logs in, and server 1 remembers her login in its own memory. Her next tap goes to server 3, which has never heard of her, so she is suddenly logged out.',
   set:{sess:[790,120,1,1]},cls:{S2:''},meter:{S1:40,S3:40},seq:[['users','LB','a',0],['LB','S1','a',.9],['users','LB','a',2.2],['LB','S3','b',3.1]]},
  {tag:'fix',title:'Fix: make servers stateless',set3:{redis:[875,280],sess:[875,345]},cap:'The fix is to make servers stateless: they keep nothing about a user in their own memory. Logins and carts move to a shared store such as Redis, so any server can serve any user on any request.',
   set:{redis:[845,280,1,1],sess:[845,345,1,1]},flows:[['users','LB','a',220],['LB',['S1','S2','S3'],'a',220],['S1','redis','u',900],['S3','redis','u',900]]},
  {tag:'fix',title:'Autoscaling: pay only for what you use',set3:{S1:[560,100],S2:[700,170],S3:[560,240],S4:[700,310],S5:[560,380]},cap:'Traffic changes through the day. An autoscaler watches the load and adds servers as the 8 pm rush builds, then removes them at night, so we only pay for machines we actually need. This only works because servers are stateless.',
   set:{S1:[600,96,.74,1],S2:[600,182,.74,1],S3:[600,268,.74,1],S4:[600,354,.74,1],S5:[600,440,.74,1],clock:[370,390,1,1],sess:[845,345,1,1]},
   meter:{S1:45,S2:45,S3:45},flows:[['users','LB','a',150],['LB',['S1','S2','S3','S4','S5'],'a',150]]},
  {tag:'next',title:'The next bottleneck: the database',set3:{S1:[560,100],S2:[700,170],S3:[560,240],S4:[700,310],S5:[560,380]},cap:'All these servers still read and write one database. As we keep adding servers, that database fills up to 90% load. Scaling it is harder because it holds the data. That is Episode 3.',
   set:{sess:[845,345,1,0],clock:[370,390,1,0],db:[845,450,1,1]},shake:['db'],flows:[['users','LB','a',150],['LB',['S1','S2','S3','S4','S5'],'a',150],['S2','db','u',260],['S4','db','u',260],['S5','db','u',300]]},
  {tag:'summary',title:'What to remember',cap:'Vertical scaling makes one machine bigger: simple, but it has a ceiling and is a single point of failure. Horizontal scaling adds machines behind a load balancer and needs stateless servers, but it can keep growing.',
   set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'cache',o3:{msg:[812,160]},name:'Episode 2 · Caching',sub:'Cache-aside, invalidation, stampedes, LRU',
 actors:[
  ['crowd','users',{cnt:'Priya'}],['box','app',{t:'App server',s:'menu service'}],['box','db',{t:'Database',s:'Postgres · on disk',cls:'db',meter:20}],
  ['box','cache',{t:'Redis cache',s:'in memory',cls:'acc',w:190,h:84}],['pill','lat',{t:'response: 50 ms'}],['pill','msg',{t:'',cls:'acc'}],
  ['pill','pc',{t:'biryani: ₹349',cls:'bad'}],['pill','pc2',{t:'biryani: ₹399',cls:'ok'}],['pill','hr',{t:'97% hit rate',cls:'ok'}],
  ['pill','k1',{t:'menu:biryani-house'}],['pill','k2',{t:'menu:pizza-hub'}],['pill','k3',{t:'menu:dosa-corner'}],['pill','k4',{t:'menu:old-cafe'}],['pill','k5',{t:'menu:new-thali',cls:'acc'}],
  ['card','sum',{w:820,h:370,lines:[['h','Caching in five lines',40],
   ['li','1. Cache-aside: check Redis first; on a miss, read the database and save a copy with a TTL.',90],
   ['li','2. Popular data is read again and again, so 90–99% of reads never reach the database.',126],
   ['li','3. On every write, update the database and delete the cache key, so nobody sees stale data for long.',162],
   ['li','4. Stop stampedes: one request rebuilds an expired key while others wait; add random jitter to TTLs.',198],
   ['li','5. Memory is limited: an eviction policy such as LRU removes the least recently used keys.',234],
   ['lb','Never cache what must be exact right now: payment status, stock at checkout.',290],
   ['lg','Interview line: “Reads outnumber writes 100 to 1, so Redis cache-aside with a 10-minute TTL.”',326]]}]
 ],
 scenes:[
  {tag:'start',title:'Without a cache',cap:'Priya opens a restaurant menu. The app server asks the database, the database reads from disk, and the answer comes back in about 50 milliseconds. Fine for one person.',
   set:{users:[130,280,1,1],app:[430,280,1,1],db:[800,280,1,1],lat:[430,395,1,1]},seq:[['users','app','a',0],['app','db','a',.9],['db','app','g',1.9,1.1],['app','users','g',3.1]]},
  {tag:'problem',title:'The database repeats itself',cap:'At dinner, 30,000 people open menus every second, mostly the same popular ones. The database does the exact same work again and again, hits 97% load, and responses slow to 2 seconds.',
   txt:{users:'30,000 / second',lat:'response: 2,000 ms'},lcls:{lat:'bad'},meter:{db:97},shake:['db'],flows:[['users','app','a',120],['app','db','a',120],['db','app','b',380]]},
  {tag:'idea',title:'Keep a copy in memory',cap:'The idea: keep a ready-made copy of popular menus in memory, close to the app. Memory answers in about 1 millisecond, roughly 50 times faster than the database. This store is the cache, here Redis.',
   set:{cache:[620,120,1,1]},meter:{db:40},txt:{users:'Priya',lat:'response: 50 ms'},lcls:{lat:''}},
  {tag:'fix',title:'Cache-aside: the first request',cap:'Cache-aside works like this. The app checks Redis first. The menu is not there yet, a miss, so it reads the database and then saves a copy in Redis with a time-to-live of 10 minutes.',
   set:{msg:[620,48,1,1]},txt:{msg:'MISS → read DB → save copy'},seq:[['users','app','a',0],['app','cache','a',.9],['cache','app','b',1.7,.7],['app','db','a',2.5],['db','app','g',3.4],['app','cache','y',4.3],['app','users','g',5.1]]},
  {tag:'result',title:'Every request after that: a hit',cap:'The next person asks for the same menu. This time Redis has it, a hit, and the answer comes back in 1 millisecond. The database is not touched at all.',
   txt:{msg:'HIT → answered from memory',lat:'response: 1 ms'},lcls:{lat:'ok',msg:'ok'},seq:[['users','app','a',0],['app','cache','a',.9],['cache','app','g',1.6],['app','users','g',2.4]]},
  {tag:'result',title:'Database load drops 30×',cap:'Back to 30,000 menus a second. About 97% are hits answered from Redis, and only 3 in 100 reach the database. Its load falls from 97% to 18%, and pages load in a couple of milliseconds.',
   set:{msg:[620,48,1,0],hr:[800,395,1,1]},txt:{users:'30,000 / second',lat:'response: ~2 ms'},meter:{db:18},flows:[['users','app','a',120],['app','cache','g',130],['app','db','a',1100]]},
  {tag:'problem',title:'Problem: stale data',cap:'The restaurant raises the biryani price from ₹349 to ₹399 and the database is updated. But Redis still holds the old copy, so customers keep seeing ₹349 for up to 10 minutes.',
   set:{hr:[800,395,1,0],pc:[620,200,1,1],msg:[620,48,1,1]},txt:{msg:'cache still says ₹349',users:'Priya'},lcls:{msg:'bad'},lab:{db:['Database','biryani: ₹399 (new)']}},
  {tag:'fix',title:'Fix: delete the key on every write',cap:'The fix is invalidation: whenever the menu changes, update the database and then delete that menu’s key from Redis. The next read misses once, loads ₹399 from the database, and the cache is correct again.',
   set:{pc:[620,200,.6,0],pc2:[620,200,1,1]},txt:{msg:'DEL key → next read reloads'},lcls:{msg:'ok'},seq:[['app','db','a',0],['app','cache','b',1],['app','cache','a',2.4],['app','db','a',3.2],['db','app','g',4],['app','cache','y',4.8]]},
  {tag:'problem',title:'Problem: cache stampede',cap:'A very popular key expires during the rush. In that instant 5,000 requests all miss together and all hit the database at once. The database spikes to 99% and might fall over.',
   set:{pc2:[620,200,1,0]},txt:{msg:'hot key expired!',users:'5,000 at once'},lcls:{msg:'bad'},lab:{db:['Database','Postgres · on disk']},meter:{db:99},shake:['db'],flows:[['users','app','a',90],['app','db','b',90]]},
  {tag:'fix',title:'Fix: one rebuilds, the rest wait',cap:'The fix: the first request takes a short lock and rebuilds the value, while the others wait 50 milliseconds and then read the fresh copy. Adding a little random jitter to TTLs also stops many keys expiring at the same moment.',
   txt:{msg:'1 rebuilds · others wait 50 ms'},lcls:{msg:'ok'},meter:{db:22},flows:[['users','app','a',110],['app','cache','g',120]],seq:[['app','db','a',0],['db','app','g',.9],['app','cache','y',1.8]]},
  {tag:'problem',title:'Problem: memory is limited',cap:'Memory is expensive, so the cache is small. Imagine it only has room for four menus, and all four slots are full. A new restaurant’s menu needs a place to go.',
   set:{msg:[620,48,1,0],k1:[620,200,1,1],k2:[620,236,1,1],k3:[620,272,1,1],k4:[620,308,1,1],k5:[430,385,1,1],lat:[430,395,1,0]},txt:{users:'Priya'}},
  {tag:'fix',title:'Fix: evict the least recently used',cap:'An eviction policy decides who leaves. With LRU, least recently used, the menu nobody has opened for the longest time, the old cafe, is removed. The new menu goes in at the top as the most recent.',
   set:{k5:[620,200,1,1],k1:[620,236,1,1],k2:[620,272,1,1],k3:[620,308,1,1],k4:[800,420,.9,0]}},
  {tag:'summary',title:'What to remember',cap:'Cache-aside for read-heavy data, delete keys on writes, protect against stampedes with a lock and jitter, and let LRU evict cold keys. Never cache values that must be exactly right at that moment.',
   set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'db',o3:{msg:[480,450]},name:'Episode 3 · Database scaling',sub:'Replicas, lag, failover, sharding',
 actors:[
  ['box','app',{t:'App servers',s:'20 of them'}],['box','pri',{t:'Database',s:'20k reads + 500 writes/s',cls:'db',w:200,meter:92}],
  ['box','r1',{t:'Read replica 1',s:'copy of primary',cls:'db',w:200,meter:40}],['box','r2',{t:'Read replica 2',s:'copy of primary',cls:'db',w:200,meter:40}],
  ['pill','msg',{t:'',cls:'acc'}],['box','router',{t:'Shard router',s:'hash(city_id)',cls:'acc'}],
  ['box','sh1',{t:'Hyderabad shard',s:'primary + replicas',cls:'db',w:210,meter:35}],['box','sh2',{t:'Bengaluru shard',s:'primary + replicas',cls:'db',w:210,meter:35}],['box','sh3',{t:'Mumbai shard',s:'primary + replicas',cls:'db',w:210,meter:35}],
  ['bars','bars',{}],
  ['card','sum',{w:820,h:370,lines:[['h','Scaling a database, in order',40],
   ['li','1. Indexes and a cache first: the cheapest wins.',90],['li','2. Scale up: a bigger machine with a standby copy in another zone.',124],
   ['li','3. Read replicas spread reads; watch replication lag (read-your-writes).',158],['li','4. Automatic failover promotes a replica when the primary dies.',192],
   ['li','5. Shard when writes outgrow one primary; pick the shard key your queries use.',226],['li','6. Use consistent hashing so adding a shard moves little data.',260],
   ['lg','Interview line: “Primary + replicas now; shard by city_id with consistent hashing later.”',316]]}]
 ],
 scenes:[
  {tag:'start',title:'One database does everything',cap:'All 20 app servers send every read and every write to a single database: 20,000 reads and 500 writes every second at dinner. It is running at 92% load and starting to slow down.',
   set:{app:[170,280,1,1],pri:[480,280,1,1]},shake:['pri'],flows:[['app','pri','u',110],['app','pri','a',600]]},
  {tag:'fix',title:'Fix: read replicas',cap:'Most traffic is reads. So we keep the main database, now called the primary, for writes, and copy every change to read replicas. Reads go to the replicas, and the primary’s load drops to 45%.',
   set:{r1:[800,140,1,1],r2:[800,420,1,1]},lab:{pri:['Primary','all writes']},meter:{pri:45},flows:[['app','pri','a',500],['pri',['r1','r2'],'y',500],['app',['r1','r2'],'u',150]]},
  {tag:'problem',title:'Problem: replication lag',cap:'Copying takes a moment. Priya places an order, which is written to the primary, then instantly opens My Orders. That read goes to replica 1, which is 200 milliseconds behind, and her order is missing.',
   set:{msg:[480,140,1,1]},txt:{msg:'“where is my order?”'},lcls:{msg:'bad'},lab:{r1:['Read replica 1','200 ms behind']},seq:[['app','pri','a',0],['app','r1','b',.6],['pri','r1','y',1.2,2]]},
  {tag:'fix',title:'Fix: read your own writes',cap:'The fix is called read-your-writes: for a few seconds after a user writes something, send that user’s reads to the primary. Everyone else still reads from replicas, and Priya always sees her own order.',
   txt:{msg:'her reads → primary for 5 s'},lcls:{msg:'ok'},lab:{r1:['Read replica 1','copy of primary']},seq:[['app','pri','a',0],['app','pri','g',1],['pri','app','g',1.9]]},
  {tag:'problem',title:'Problem: the primary dies',cap:'At 8:15 pm the machine running the primary fails. Reads still work from the replicas, but no one can place an order, because all writes go to the primary.',
   set:{msg:[480,140,1,0]},cls:{pri:'dead'},flows:[['app','pri','b',220],['app',['r1','r2'],'u',220]]},
  {tag:'fix',title:'Fix: automatic failover',cap:'With automatic failover, the system detects the dead primary within seconds and promotes replica 1 to be the new primary. App servers switch to it, and orders flow again in under a minute.',
   set:{pri:[480,280,.8,0],r1:[480,280,1,1]},lab:{r1:['New primary','was replica 1']},meter:{r1:55},flows:[['app','r1','a',400],['r1','r2','y',500],['app','r2','u',220]]},
  {tag:'problem',title:'Problem: too many writes',cap:'On IPL final night, orders spike to 5,000 writes a second. Replicas only help with reads; every write still has to go through one primary, and it is overloaded at 99%.',
   set:{r2:[800,420,1,0]},lab:{r1:['Primary','5,000 writes/s']},meter:{r1:99},shake:['r1'],flows:[['app','r1','a',80]]},
  {tag:'fix',title:'Fix: sharding',set3:{sh1:[690,110],sh2:[830,280],sh3:[690,450]},cap:'Sharding splits the data across several databases. A router sends each order to a shard based on the city: Hyderabad orders to one, Bengaluru to another, Mumbai to a third. Each handles a third of the writes.',
   set:{r1:[480,280,.8,0],router:[480,280,1,1],sh1:[800,110,1,1],sh2:[800,280,1,1],sh3:[800,450,1,1]},flows:[['app','router','a',100],['router','sh1','a',300],['router','sh2','u',300],['router','sh3','y',300]]},
  {tag:'problem',title:'Problem: adding a shard moves data',cap:'If shards are picked with hash % N, going from 3 to 4 shards changes the answer for about 75% of the data, which then has to be copied between databases. Consistent hashing moves only about 25%.',
   set:{bars:[400,470,1,1]},flows:[['app','router','a',260]]},
  {tag:'summary',title:'What to remember',cap:'Add indexes and a cache, scale up, add read replicas, handle lag and failover, then shard by the key your queries use, with consistent hashing. Go to the next step only when the previous one is not enough.',
   set:{sum:[480,316,1,1]},dim:['sum']}
 ]}
];


/* ================= EPISODES 2,3,6–12 ================= */
const SUM=(title,lines,iv)=>['card','sum',{w:820,h:370,lines:[['h',title,40],...lines.map((t,i)=>['li',t,90+i*36]),['lg',iv,90+lines.length*36+18]]}];
EPS.push(
{id:'net',n:2,title:'Networking & APIs',sub:'DNS, HTTPS, REST, idempotency, gRPC, WebSockets',o3:{},
 actors:[
  ['box','app',{k:'phone',t:"Priya's phone",s:'Android app'}],['box','dns',{k:'dns',t:'DNS',s:'Route 53'}],['box','cdn',{k:'cdn',t:'CDN edge',s:'Hyderabad'}],
  ['box','gw',{k:'gateway',t:'API gateway',s:'TLS ends here',cls:'acc'}],['box','svc',{k:'app',t:'Order service',s:'REST handler'}],
  ['box','pricing',{k:'app',t:'Pricing service',s:'internal, gRPC'}],['box','ws',{k:'worker',t:'Tracking server',s:'WebSocket',label:'REAL-TIME'}],
  ['box','rzp',{k:'ext',t:'Razorpay',s:'payment partner',cls:'ext',w:170}],['pill','msg',{t:'',cls:'acc'}],['pill','orders',{t:'',cls:'bad'}],
  SUM('Networking & APIs in six lines',["1. DNS turns a name into an IP address; answers are cached.","2. TCP gives a reliable connection; TLS encrypts it (that's HTTPS).","3. A CDN serves static files from a data center near the user.","4. REST for public APIs, gRPC for fast calls between internal services.","5. Idempotency keys make retries safe: one tap, one order.","6. WebSockets or SSE for live updates; webhooks when partners call you."],"Interview line: “REST + idempotency keys for orders, WebSocket for tracking, gRPC inside.”")],
 scenes:[
  {tag:'start',title:'Priya taps “Place order”',cap:"Priya taps Place order. Her phone knows the name api.foodapp.in, but computers find each other by number, an IP address. So the first job is to look that number up.",set:{app:[130,280,1,1]}},
  {tag:'idea',title:"DNS: the internet's phone book",cap:"The phone asks DNS, which replies with the IP address of our servers, like 13.235.4.8. The answer is cached for a few minutes, so most taps skip this step entirely.",set:{dns:[330,175,1,1]},seq:[['app','dns','a',0],['dns','app','g',.9]]},
  {tag:'idea',title:'A secure line: TCP + TLS',cap:"The phone opens a TCP connection to that address, then a TLS handshake agrees on encryption keys. From now on every request is sealed, which is the S in HTTPS.",set:{gw:[540,280,1,1],msg:[600,120,1,1]},txt:{msg:'TCP + TLS handshake: keys agreed'},seq:[['app','gw','a',0],['gw','app','g',.9],['app','gw','a',1.8]]},
  {tag:'fix',title:'Static files come from nearby',cap:"Photos, icons and app code don't need our servers. A CDN keeps copies in a data center in Hyderabad, a few milliseconds from Priya, instead of fetching them from Mumbai every time.",set:{cdn:[330,450,1,1],msg:[600,120,1,0]},flows:[['app','cdn','a',500],['cdn','app','g',300]]},
  {tag:'idea',title:'A REST request',cap:"The order is a REST call: POST /v1/orders with the cart as JSON. The gateway checks her login token and passes it to the order service, which replies 201 Created.",set:{svc:[760,280,1,1],msg:[600,120,1,1]},txt:{msg:'POST /v1/orders → 201 Created'},lcls:{msg:'ok'},seq:[['app','gw','a',0],['gw','svc','a',.9],['svc','gw','g',1.8],['gw','app','g',2.7]]},
  {tag:'problem',title:'Problem: the retry makes a second order',cap:"Her phone switches from Wi-Fi to 4G, the first response is lost, and the app times out. She taps again. Without protection the server creates a second order and charges her twice.",set:{orders:[760,390,1,1]},txt:{orders:'2 orders · charged twice!',msg:'timeout… she taps again'},lcls:{orders:'bad',msg:'bad'},seq:[['app','gw','a',0],['gw','svc','a',.8],['app','gw','b',1.8],['gw','svc','b',2.6]]},
  {tag:'fix',title:'Fix: idempotency keys',cap:"Each order request carries a unique Idempotency-Key. The server stores the key with the first result, so a retry with the same key gets the same order back instead of creating a new one.",txt:{orders:'1 order · retry gets same answer',msg:'Idempotency-Key: 9f2c-…'},lcls:{orders:'ok',msg:'acc'},seq:[['app','gw','a',0],['gw','svc','a',.8],['app','gw','y',1.8],['gw','svc','y',2.6],['svc','gw','g',3.4]]},
  {tag:'idea',title:'Inside the system: gRPC',cap:"Behind the gateway, services talk with gRPC: compact binary messages over HTTP/2 with a strict contract. The order service asks pricing for the final total, ₹349 including delivery.",set:{orders:[760,390,1,0],pricing:[760,450,1,1]},txt:{msg:'internal calls: gRPC (binary, typed)'},seq:[['svc','pricing','a',0],['pricing','svc','g',.9]]},
  {tag:'problem',title:"Problem: “where's my rider?” every 2 s",cap:"To show the rider moving, the app could ask every 2 seconds. Most answers are “no change”. That drains Priya's battery and adds millions of useless requests across all users.",txt:{msg:'polling every 2 s…'},lcls:{msg:'bad'},flows:[['app','gw','a',260],['gw','app','b',520]]},
  {tag:'fix',title:'Fix: one WebSocket that stays open',cap:"Instead, the app opens one WebSocket and keeps it open. The server pushes the rider's position every 4 seconds, only when it changes. One connection replaces thousands of requests.",set:{ws:[540,450,1,1]},txt:{msg:'one open line, server pushes'},lcls:{msg:'ok'},flows:[['ws','app','g',1000]]},
  {tag:'idea',title:'A partner calls us: webhooks',cap:"When the UPI payment succeeds, Razorpay calls a URL on our side, a webhook, to tell us. We verify its signature before trusting it, then mark the order as paid.",set:{rzp:[900,130,1,1]},txt:{msg:'webhook: payment.captured ✓'},lcls:{msg:'ok'},seq:[['rzp','svc','y',0,1.1]]},
  {tag:'summary',title:'What to remember',cap:"DNS finds the server, TLS secures the line, the CDN serves files nearby, REST and gRPC carry requests, idempotency keys make retries safe, and WebSockets and webhooks handle real-time and partner events.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'lb',n:3,title:'Load balancing',sub:'Algorithms, health checks, L4 vs L7, redundancy',o3:{},
 actors:[
  ['crowd','users',{cnt:'Dinner rush'}],['box','LB',{t:'Load balancer',s:'one address for all',cls:'acc'}],
  ['box','S1',{t:'Server 1',s:'8 CPU · fast disk',meter:30}],['box','S2',{t:'Server 2',s:'8 CPU · fast disk',meter:30}],['box','S3',{t:'Server 3',s:'slow disk',meter:30}],
  ['box','S4',{t:'Menu pod',s:'serves /v1/menu',meter:30}],['box','LB2',{k:'lb',t:'Standby balancer',s:'takes over the IP',cls:'acc'}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Load balancing in six lines',["1. A load balancer gives users one address and spreads requests across servers.","2. Round robin is simple; least connections handles uneven request times.","3. Health checks remove failing servers automatically.","4. Layer 7 routes by URL and headers; layer 4 by address and port.","5. The balancer itself must be redundant: active-standby or a managed service.","6. Tools: AWS ALB / NLB, Nginx, HAProxy, Envoy, Kubernetes Services."],"Interview line: “Redundant L7 balancer, least connections, health checks, connection draining.”")],
 scenes:[
  {tag:'start',title:'Which server gets this request?',cap:"Thousands of dinner orders arrive at one address: the load balancer. Behind it are three copies of the order service. For every single request it has to pick one.",set:{users:[140,280,1,1],LB:[380,280,1,1],S1:[630,145,1,1],S2:[800,290,1,1],S3:[630,445,1,1]},flows:[['users','LB','a',220],['LB',['S1','S2','S3'],'a',220]]},
  {tag:'problem',title:'Problem: round robin ignores busy servers',cap:"Round robin sends requests in strict turn: 1, 2, 3, 1, 2, 3. But server 3 has a slow disk, so its requests take three times longer. It gets the same share anyway, piles up work, and its users wait.",set:{msg:[330,120,1,1]},txt:{msg:'round robin: 1, 2, 3, 1, 2, 3…'},lcls:{msg:'bad'},meter:{S1:35,S2:35,S3:95},shake:['S3'],flows:[['users','LB','a',220],['LB',['S1','S2','S3'],'a',220]]},
  {tag:'fix',title:'Fix: least connections',cap:"With least connections, each new request goes to the server with the fewest requests still in progress. The slow server naturally receives fewer, and the load evens out.",txt:{msg:'least connections wins'},lcls:{msg:'ok'},meter:{S1:55,S2:55,S3:55},flows:[['users','LB','a',220],['LB',['S1','S2','S1','S2','S3'],'a',160]]},
  {tag:'idea',title:'Health checks',cap:"Every few seconds the balancer calls a tiny /healthz endpoint on each server. Healthy servers answer “OK”. This time, server 3 doesn't answer at all.",txt:{msg:'GET /healthz every 5 s'},lcls:{msg:'acc'},seq:[['LB','S1','y',0],['LB','S2','y',0],['LB','S3','y',0],['S1','LB','g',.9],['S2','LB','g',.9]]},
  {tag:'result',title:'A sick server is removed',cap:"After two failed checks, server 3 is taken out of rotation and traffic flows only to healthy servers while it restarts. During deploys, connections drain for 30 seconds so nothing is cut off.",cls:{S3:'dead'},txt:{msg:'2 failed checks → removed'},lcls:{msg:'ok'},meter:{S1:62,S2:62},flows:[['users','LB','a',220],['LB',['S1','S2'],'a',220]]},
  {tag:'idea',title:'Layer 7: route by URL',cap:"A layer 7 balancer reads each request: order calls go to order servers, menu calls go to menu servers, so each pool scales on its own. A layer 4 balancer only sees addresses and ports, which is faster for raw connections.",set:{S3:[620,440,1,0],S4:[620,440,1,1]},cls:{S3:''},txt:{msg:'/orders → orders · /menu → menu'},lcls:{msg:'acc'},flows:[['users','LB','a',220],['LB',['S1','S2'],'a',300],['LB','S4','u',420]]},
  {tag:'problem',title:'Problem: the balancer is a single point',cap:"Now everything depends on one load balancer. If that one machine dies, no request reaches any server, no matter how many servers we have.",cls:{LB:'dead'},txt:{msg:'the balancer itself crashed'},lcls:{msg:'bad'},flows:[['users','LB','b',260]]},
  {tag:'fix',title:'Fix: a standby or managed balancer',cap:"Run balancers in pairs. A standby watches the active one and takes over its IP address within seconds. Cloud balancers such as AWS ALB do this for you across availability zones.",set:{LB2:[380,455,1,1]},txt:{msg:'standby took over the IP'},lcls:{msg:'ok'},flows:[['users','LB2','a',220],['LB2',['S1','S2','S4'],'a',220]]},
  {tag:'summary',title:'What to remember',cap:"Pick servers with least connections, remove sick ones with health checks, route by URL at layer 7, and never let the balancer itself be a single point of failure.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'cons',n:6,title:'Consistency & sagas',sub:'Quorums, split brain, sagas, idempotency',o3:{orch:[640,150],msg:[760,505]},
 actors:[
  ['box','cl',{k:'app',t:'Order service',s:'writes x = 5'}],
  ['box','nA',{k:'db',label:'COPY A',t:'Copy A',s:'replica',cls:'db'}],['box','nB',{k:'db',label:'COPY B',t:'Copy B',s:'replica',cls:'db'}],['box','nC',{k:'db',label:'COPY C',t:'Copy C',s:'replica',cls:'db'}],
  ['box','orch',{k:'flow',t:'Order workflow',s:'remembers every step',cls:'acc'}],
  ['box','n1',{k:'app',t:'1 · Create order',s:'status PENDING'}],['box','n2',{k:'ext',t:'2 · Charge ₹349',s:'Razorpay',cls:'ext'}],
  ['box','n3',{k:'phone',t:'3 · Restaurant accepts',s:'3-minute timer',w:200}],['box','n4',{k:'worker',t:'4 · Assign rider',s:'dispatch'}],
  ['box','c2',{k:'ext',t:'Undo · refund ₹349',s:'compensates step 2',cls:'acc'}],['box','c1',{k:'app',t:'Undo · cancel order',s:'and notify Priya',cls:'acc'}],
  ['pill','msg',{t:'',cls:'acc'}],
  SUM('Consistency in six lines',["1. Keep copies on several machines; a quorum (R + W > N) keeps reads current.","2. Strong consistency for money and stock; eventual for likes and feeds.","3. Raft and Paxos elect a leader by majority, which prevents split brain.","4. Across services, use a saga: local steps plus compensating undo steps.","5. Make every step idempotent, because retries will happen.","6. Tools: etcd, ZooKeeper, Temporal, Step Functions, CockroachDB, Spanner."],"Interview line: “Orchestrated saga with idempotent steps; refunds as compensation.”")],
 scenes:[
  {tag:'start',title:'Three copies of the same data',cap:"Important data is stored on three machines, so losing one never loses data. But now every write has to reach all three, and for a moment they can disagree.",set:{cl:[160,280,1,1],nA:[560,120,1,1],nB:[790,280,1,1],nC:[560,440,1,1]}},
  {tag:'idea',title:'A write goes to all three',cap:"The order service writes x = 5. The write goes to all three copies at once. Copy C sits on a busy machine and is slow to answer.",seq:[['cl','nA','a',0],['cl','nB','a',0],['cl','nC','a',0,2.4]]},
  {tag:'fix',title:'Quorum: two answers are enough',cap:"We don't wait for everyone. As soon as two of the three copies confirm (W = 2), the write counts as done. Copy C catches up a moment later.",set:{msg:[330,130,1,1]},txt:{msg:'W = 2 of N = 3 → success'},lcls:{msg:'ok'},lab:{nC:['Copy C','slow, catches up later']},seq:[['cl','nA','a',0],['cl','nB','a',0],['cl','nC','a',0,2.4],['nA','cl','g',1],['nB','cl','g',1.1]]},
  {tag:'idea',title:'Reads ask two copies too',cap:"A read also asks two copies (R = 2) and keeps the newest value. Because 2 + 2 is more than 3, every read overlaps with at least one copy that has the latest write.",txt:{msg:'R + W > N → always fresh'},lcls:{msg:'acc'},seq:[['cl','nB','a',0],['cl','nC','a',0],['nB','cl','g',.9],['nC','cl','y',1]]},
  {tag:'problem',title:'Problem: split brain',cap:"The network between machines breaks. Copy C can't see the others, and both sides believe they are in charge. If both accept writes, the data splits into two conflicting versions.",txt:{msg:'network split!'},lcls:{msg:'bad'},lab:{nA:['Copy A','“I am the leader”'],nC:['Copy C','“No, I am the leader”']},shake:['nA','nC']},
  {tag:'fix',title:'Fix: only a majority can lead',cap:"Consensus protocols like Raft allow a leader only with a majority of votes. A and B together are 2 of 3, so they carry on. C alone is a minority and refuses writes until the network heals.",cls:{nC:'dead'},lab:{nA:['Copy A','leader (has majority)'],nC:['Copy C','minority: steps down']},txt:{msg:'majority rules: 2 of 3'},lcls:{msg:'ok'},flows:[['cl','nA','a',600],['nA','nB','y',600]]},
  {tag:'idea',title:'Many services, one business step',cap:"Placing an order touches four services, each with its own database: create the order, charge the card, the restaurant accepts, assign a rider. No single database transaction can cover them all.",set:{cl:[160,280,1,0],nA:[560,120,1,0],nB:[790,280,1,0],nC:[560,440,1,0],msg:[820,120,1,0],orch:[460,150,1,1],n1:[130,300,1,1],n2:[350,300,1,1],n3:[570,300,1,1],n4:[800,300,1,1]},cls:{nC:''},seq:[['n1','n2','g',0],['n2','n3','g',.9],['n3','n4','g',1.8]]},
  {tag:'problem',title:'Problem: step 3 fails after paying',cap:"The restaurant's tablet is offline and never accepts. But Priya has already been charged ₹349. We can't simply roll back, because the payment happened in a different system.",cls:{n3:'dead'},lab:{n3:['3 · Restaurant accepts','no reply in 3 min']},seq:[['n1','n2','g',0],['n2','n3','b',.9]]},
  {tag:'fix',title:'Fix: a saga with undo steps',cap:"A saga gives every step an undo action. The workflow runs them in reverse: refund the ₹349, then cancel the order and tell Priya. The workflow engine records progress, so a crash can't leave it half done.",set:{c2:[350,460,1,1],c1:[130,460,1,1]},seq:[['n3','c2','b',0],['c2','c1','b',1]]},
  {tag:'fix',title:'Every step must be safe to repeat',cap:"If a server crashes mid-step, the workflow retries it. So every step is idempotent: charging twice with the same order ID still charges once, and refunding twice still refunds once.",set:{msg:[820,120,1,1]},txt:{msg:'every step safe to retry'},lcls:{msg:'ok'},seq:[['orch','n2','y',0],['orch','n2','y',.8],['n2','orch','g',1.7]]},
  {tag:'summary',title:'What to remember',cap:"Quorums keep copies in step, majorities prevent split brain, and sagas with idempotent steps and undo actions keep many services consistent without one big transaction.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'queue',n:7,title:'Queues & Kafka',sub:'Async events, outbox, DLQ, absorbing spikes',o3:{},
 actors:[
  ['box','order',{k:'app',t:'Order service',s:'just placed #48213',cls:'acc'}],['box','kafka',{k:'queue',t:'Kafka',s:'order-events topic',cls:'okb',meter:10}],
  ['box','notify',{k:'worker',t:'Notifications',s:'push to Priya'}],['box','disp',{k:'worker',t:'Dispatch',s:'find a rider'}],['box','ana',{k:'worker',t:'Analytics',s:'reports'}],
  ['box','pg',{k:'db',label:'DATABASE',t:'Postgres',s:'orders',cls:'db'}],['box','relay',{k:'worker',t:'Outbox relay',s:'Debezium'}],
  ['box','dlq',{k:'queue',t:'Dead-letter topic',s:'after 3 retries',cls:'acc'}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Queues in six lines',["1. Do the essential work now; publish an event for everything else.","2. Kafka keeps events for days; each consumer group reads at its own pace.","3. Save a record and its event together with a transactional outbox.","4. Delivery is at-least-once, so make consumers idempotent.","5. Retry with backoff, then move poison messages to a dead-letter queue.","6. Tools: Kafka, RabbitMQ, SQS + SNS, BullMQ, Celery, Debezium."],"Interview line: “Synchronous order; everything else async via Kafka, with an outbox and a DLQ.”")],
 scenes:[
  {tag:'problem',title:'Problem: doing everything at once',cap:"After saving an order, the order service calls notifications, dispatch and analytics one by one and waits for each. Analytics is slow today, so every checkout is slow too. If it fails, the order fails.",set:{order:[140,280,1,1],notify:[700,120,1,1],disp:[860,280,1,1],ana:[700,440,1,1],msg:[440,130,1,1]},lab:{ana:['Analytics','slow today']},txt:{msg:'checkout waits for the slowest'},lcls:{msg:'bad'},shake:['ana'],seq:[['order','notify','a',0],['order','disp','a',.3],['order','ana','a',.6,2.2]]},
  {tag:'fix',title:'Fix: publish an event and move on',cap:"Now the order service writes one event, OrderPlaced, to Kafka and immediately answers Priya. Each team's service reads the event on its own. Nobody waits for anybody.",set:{kafka:[440,280,1,1]},lab:{ana:['Analytics','reports']},txt:{msg:'publish once, move on'},lcls:{msg:'ok'},flows:[['order','kafka','a',500],['kafka',['notify','disp','ana'],'g',300]]},
  {tag:'result',title:'One consumer down, nothing lost',cap:"The notification service goes down for 10 minutes. Dispatch and analytics keep working. Notification events simply wait in Kafka, which keeps them for days.",cls:{notify:'dead'},lab:{notify:['Notifications','down for 10 min']},meter:{kafka:70},txt:{msg:'events wait safely in the topic'},lcls:{msg:'acc'},flows:[['order','kafka','a',260],['kafka',['disp','ana'],'g',300]]},
  {tag:'result',title:'It catches up where it stopped',cap:"When it comes back, it reads from its saved position, called an offset, and works through the backlog. Every notification is still sent, just a few minutes late.",cls:{notify:''},lab:{notify:['Notifications','catching up']},meter:{kafka:20},txt:{msg:'resume from saved offset'},lcls:{msg:'ok'},flows:[['kafka','notify','g',120],['kafka',['disp','ana'],'g',400],['order','kafka','a',500]]},
  {tag:'problem',title:'Problem: the event that never got sent',cap:"The order service saves the order in Postgres, then crashes a split second before publishing the event. The order exists, but no rider is ever assigned and Priya never hears back.",set:{pg:[110,450,1,1]},lab:{notify:['Notifications','push to Priya']},txt:{msg:'saved, then crashed before publish'},lcls:{msg:'bad'},seq:[['order','pg','a',0],['order','kafka','b',1.2]]},
  {tag:'fix',title:'Fix: the transactional outbox',cap:"The order and its event are saved in one database transaction, the event in an outbox table. A relay such as Debezium reads new outbox rows and publishes them. If anything crashes, the relay simply retries.",set:{relay:[330,450,1,1]},lab:{pg:['Postgres','order + outbox row']},txt:{msg:'save both in one transaction'},lcls:{msg:'ok'},seq:[['order','pg','a',0],['pg','relay','a',1],['relay','kafka','g',2]]},
  {tag:'problem',title:'Problem: one broken event blocks the line',cap:"A malformed event makes the analytics consumer crash every time it reads it. It retries forever, and every event queued behind it is stuck.",set:{pg:[110,450,1,0],relay:[330,450,1,0],dlq:[440,455,1,1]},txt:{msg:'one bad event keeps failing'},lcls:{msg:'bad'},shake:['ana'],seq:[['kafka','ana','b',0],['kafka','ana','b',1],['kafka','ana','b',2]]},
  {tag:'fix',title:'Fix: retries, then a dead-letter queue',cap:"Retry a few times with growing waits, then move the event to a dead-letter topic and carry on. An engineer is alerted to inspect it. Consumers are idempotent too, because Kafka may deliver an event twice.",txt:{msg:'3 tries → dead-letter topic'},lcls:{msg:'ok'},seq:[['kafka','ana','b',0],['ana','dlq','b',1]],flows:[['kafka',['notify','disp'],'g',400]]},
  {tag:'result',title:'Spikes are absorbed',cap:"On IPL final night orders jump tenfold. The topic grows, consumers work through it at a steady pace, and autoscaling adds workers when the backlog grows. Nothing crashes and nothing is lost.",lab:{order:['Order service','IPL final: 10× orders']},meter:{kafka:85},txt:{msg:'the queue absorbs the spike'},lcls:{msg:'ok'},flows:[['order','kafka','a',90],['kafka',['notify','disp','ana'],'g',260]]},
  {tag:'summary',title:'What to remember',cap:"Answer the user fast and push the rest through a queue. Use an outbox so events are never lost, idempotent consumers because duplicates happen, and a dead-letter queue for messages that keep failing.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'arch',n:8,title:'Architecture',sub:'Monolith vs microservices, gateway, events',o3:{},
 actors:[
  ['crowd','users',{cnt:'Customers'}],['box','mono',{k:'app',t:'Monolith',s:'users · orders · payments',w:250,meter:40}],
  ['box','gw',{k:'gateway',t:'API gateway',s:'one front door',cls:'acc'}],['box','sU',{k:'app',t:'User service',s:'owns users DB'}],
  ['box','sO',{k:'app',t:'Order service',s:'owns orders DB'}],['box','sP',{k:'app',t:'Payment service',s:'owns payments DB'}],
  ['box','sN',{k:'worker',t:'Notifications',s:'owns templates'}],['box','bus',{k:'queue',t:'Event bus',s:'Kafka',cls:'okb'}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Architecture in six lines',["1. Start with a monolith (ideally modular); split when teams or scale demand it.","2. Split by business capability; each service owns its own data.","3. An API gateway handles auth, rate limits and routing in one place.","4. gRPC when you need an answer now; events for everything else.","5. Protect every call with timeouts and fallbacks so failures don't spread.","6. Tools: Docker, Kubernetes, Istio, Kong, Kafka, Terraform."],"Interview line: “Services by domain, each with its own DB; gRPC for queries, Kafka for events.”")],
 scenes:[
  {tag:'start',title:'Day one: one app does everything',cap:"Most products start as a monolith: one codebase and one database with every feature inside. It is fast to build, easy to test and simple to deploy. For a small team it is the right choice.",set:{users:[140,280,1,1],mono:[520,280,1,1]},flows:[['users','mono','a',400]]},
  {tag:'problem',title:"Problem: one bug takes everyone down",cap:"Years later, 300 engineers work in the same codebase. Every release waits on everyone, a bug in offers can crash checkout, and the whole app must scale together even when only search is busy.",set:{msg:[840,120,1,1]},meter:{mono:96},cls:{mono:'dead'},txt:{msg:'1 bug → whole app down'},lcls:{msg:'bad'},flows:[['users','mono','b',300]]},
  {tag:'fix',title:'Fix: split by business area',cap:"We split the system along business lines: users, orders, payments, notifications. Each service is owned by one team, has its own database, and can be released on its own schedule.",set:{mono:[520,280,.8,0],gw:[380,280,1,1],sU:[620,120,1,1],sO:[800,280,1,1],sP:[600,450,1,1],sN:[810,460,1,0]},cls:{mono:''},txt:{msg:'split by business area'},lcls:{msg:'ok'},flows:[['users','gw','a',260],['gw',['sU','sO','sP'],'a',260]]},
  {tag:'idea',title:'One front door: the API gateway',cap:"Clients still see a single address. The API gateway checks login tokens and rate limits once, then routes each request to the service that owns it.",txt:{msg:'gateway: auth + routing'},lcls:{msg:'acc'},flows:[['users','gw','a',260],['gw',['sU','sO','sP'],'a',260]]},
  {tag:'idea',title:'Two ways to talk',cap:"When the order service needs an answer right now, such as charging the card, it calls payments directly with gRPC. For news like “order placed”, it publishes an event, and notifications reacts on its own.",set:{bus:[380,455,1,1],sN:[810,460,1,1]},txt:{msg:'gRPC for answers, events for news'},seq:[['gw','sO','a',0],['sO','sP','a',.9],['sP','sO','g',1.8],['sO','bus','g',2.6],['bus','sN','g',3.5]]},
  {tag:'problem',title:'Problem: one slow service slows the rest',cap:"The payment service becomes slow. The order service waits on it, its threads fill up, and soon checkout is slow for everyone. In a distributed system, one sick service can spread.",lab:{sP:['Payment service','responding in 30 s']},txt:{msg:'checkout waits on payments'},lcls:{msg:'bad'},shake:['sP'],seq:[['gw','sO','a',0],['sO','sP','b',.8,2.5]]},
  {tag:'fix',title:'Fix: timeouts, fallbacks, events',cap:"Every call gets a strict timeout and a fallback, such as “payment pending, we'll confirm shortly”. Anything that doesn't need an instant answer goes through events. Episode 9 covers these patterns.",lab:{sP:['Payment service','300 ms timeout + fallback']},txt:{msg:'timeout + fallback → keep going'},lcls:{msg:'ok'},seq:[['gw','sO','a',0],['sO','sP','a',.8],['sO','gw','g',1.6]]},
  {tag:'result',title:'Each service scales on its own',cap:"At dinner the order service runs 40 copies while the user service needs only 3. With a monolith, everything would have to scale together and we would pay for it all.",set:{sO:[800,280,1.3,1],sU:[620,120,.8,1]},lab:{sO:['Order service','×40 pods at dinner'],sU:['User service','×3 pods']},txt:{msg:'scale only what is busy'},flows:[['users','gw','a',180],['gw',['sO','sO','sO','sU'],'a',180]]},
  {tag:'summary',title:'What to remember',cap:"Start simple with a monolith. Split by business area when teams and scale demand it, give each service its own data, put a gateway in front, and protect every call so one slow service can't drag down the rest.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'res',n:9,title:'Resilience',sub:'Rate limits, shedding, circuit breakers, retries',o3:{},
 actors:[
  ['crowd','users',{cnt:'Cricket fans'}],['crowd','bots',{cnt:'Bots'}],['box','gw',{k:'gateway',t:'API gateway',s:'token bucket per user',cls:'acc'}],
  ['box','order',{k:'app',t:'Order service',s:'checkout',meter:50}],['box','reco',{k:'app',t:'Recommendations',s:'nice to have'}],
  ['box','pr',{k:'router',t:'Payment router',s:'circuit breaker',cls:'acc',w:180}],['box','rzp',{k:'ext',t:'Razorpay',s:'primary gateway',cls:'ext',w:160}],
  ['box','backup',{k:'ext',t:'Backup gateway',s:'secondary',cls:'ext',w:160}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Resilience in six lines',["1. Rate limit at the edge with token buckets; return 429 with Retry-After.","2. Shed nice-to-have features first so the core keeps working.","3. Circuit breakers stop calls to a failing dependency and use a fallback.","4. Every call gets a timeout; retries use backoff, jitter and a budget.","5. Plan for disaster: replicas in another region, tested failover (RPO / RTO).","6. Tools: Kong, Envoy, Resilience4j, Istio, Unleash, AWS WAF, Chaos Monkey."],"Interview line: “Token-bucket limits, circuit breakers with fallback, backoff with jitter.”")],
 scenes:[
  {tag:'start',title:'IPL final, last over: 10× traffic',cap:"Millions of fans order food at the same moment and traffic jumps tenfold within seconds. The system has to protect itself, keep the important parts working, and keep taking payments.",set:{users:[130,200,1,1],gw:[340,300,1,1],order:[540,180,1,1]},meter:{order:70},flows:[['users','gw','a',110],['gw','order','a',160]]},
  {tag:'fix',title:'Rate limits stop abusive traffic',cap:"Bots hammer the offers API 50 times a second. Each user and IP has a token bucket at the gateway: tokens refill steadily and each request spends one. Bots run out and get 429 Too Many Requests.",set:{bots:[130,450,1,1],msg:[340,130,1,1]},txt:{msg:'bots get 429 Too Many Requests'},lcls:{msg:'ok'},flows:[['users','gw','a',160],['bots','gw','b',90],['gw','bots','b',300],['gw','order','a',200]]},
  {tag:'fix',title:'Load shedding: drop the extras',cap:"A feature flag switches off recommendations and other extras. Their capacity goes to search, menus and checkout, the parts that matter most tonight.",set:{reco:[540,450,1,1]},cls:{reco:'dead'},lab:{reco:['Recommendations','switched off by flag']},meter:{order:55},txt:{msg:'shed nice-to-haves first'},flows:[['users','gw','a',160],['gw','order','a',200]]},
  {tag:'problem',title:'Problem: the payment gateway is failing',cap:"Razorpay is struggling under its own load, and payment calls start timing out after 30 seconds. Users stare at a spinner while our servers fill up with waiting requests.",set:{pr:[720,300,1,1],rzp:[870,130,1,1]},cls:{rzp:'dead'},txt:{msg:'payments timing out (30 s each)'},lcls:{msg:'bad'},flows:[['gw','order','a',220],['order','pr','a',220],['pr','rzp','b',220]]},
  {tag:'fix',title:'Fix: the circuit breaker opens',cap:"After 30% of calls fail within 20 seconds, the circuit breaker opens. It stops calling Razorpay entirely and sends new payments to a backup gateway. Users get answers in seconds instead of timeouts.",set:{backup:[870,450,1,1]},lab:{pr:['Payment router','breaker OPEN']},txt:{msg:'breaker open → backup gateway'},lcls:{msg:'ok'},flows:[['order','pr','a',220],['pr','backup','g',220]]},
  {tag:'result',title:'Half-open: test, then recover',cap:"After 30 seconds the breaker lets one test payment through to Razorpay. It succeeds, so the breaker closes and traffic returns to the primary gateway.",cls:{rzp:''},lab:{pr:['Payment router','half-open → closed']},txt:{msg:'1 test call succeeded'},seq:[['pr','rzp','y',0],['rzp','pr','g',1]],flows:[['order','pr','a',300]]},
  {tag:'problem',title:'Problem: retries make it worse',cap:"When something slows down, every layer retries. Three retries at each of four layers turns one tap into 81 calls on the deepest service, and the service that was struggling collapses.",txt:{msg:'3 retries × 4 layers = 81 calls'},lcls:{msg:'bad'},shake:['pr'],flows:[['order','pr','b',70]]},
  {tag:'fix',title:'Fix: back off, add jitter, cap retries',cap:"Retry at one layer only, wait longer each time (100, 200, 400 ms) with random jitter so clients don't retry in sync, and cap retries at about 10% extra traffic. Only retry calls that are safe to repeat.",txt:{msg:'backoff + jitter + retry budget'},lcls:{msg:'ok'},flows:[['order','pr','a',450],['pr','rzp','g',450]]},
  {tag:'summary',title:'What to remember',cap:"Limit abusive traffic at the edge, shed extras first, open circuit breakers on failing dependencies, and retry gently with backoff, jitter and a budget.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'store',n:10,title:'Storage, search & geo',sub:'S3 uploads, CDN, search index, nearby riders',o3:{},
 actors:[
  ['box','partner',{k:'phone',t:'Restaurant app',s:'new dish photo'}],['box','menu',{k:'app',t:'Menu service',s:'signs upload URL'}],
  ['box','s3',{k:'storage',t:'Object storage',s:'Amazon S3',cls:'db'}],['box','cdn',{k:'cdn',t:'CDN',s:'served in Hyderabad'}],
  ['box','pg',{k:'db',label:'DATABASE',t:'Postgres',s:'restaurants + dishes',cls:'db',meter:30}],['box','cdc',{k:'worker',t:'Change capture',s:'Debezium'}],
  ['box','es',{k:'search',t:'Search index',s:'Elasticsearch',cls:'db'}],['box','api',{k:'app',t:'Search API',s:'“biriyani” near me'}],
  ['crowd','riders',{cnt:'160,000 riders'}],['box','loc',{k:'app',t:'Location service',s:'GPS every 4 s'}],
  ['box','geo',{k:'db',label:'IN-MEMORY',t:'Redis GEO',s:'H3 cell → riders',cls:'db'}],['box','disp',{k:'worker',t:'Dispatch',s:'nearest free rider',meter:30}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Storage, search & geo in six lines',["1. Files go to object storage (S3); the database stores only the URL.","2. Presigned URLs let clients upload directly, keeping servers free.","3. Resize images once and serve them through a CDN.","4. Search with an inverted index (Elasticsearch), fed by change-data-capture.","5. Find nearby things with geo cells: geohash, H3 or Redis GEO.","6. Bloom filters, HyperLogLog and tries answer special questions cheaply."],"Interview line: “Presigned uploads to S3 + CDN, Elasticsearch via CDC, H3 cells in Redis.”")],
 scenes:[
  {tag:'problem',title:'Problem: big files through our servers',cap:"A restaurant uploads a 4 MB photo for every dish. If every file passes through our app servers and into the database, they waste memory and bandwidth, and database backups become huge.",set:{partner:[140,300,1,1],menu:[380,170,1,1],msg:[600,460,1,1]},txt:{msg:'4 MB photos through our servers'},lcls:{msg:'bad'},shake:['menu'],seq:[['partner','menu','a',0,1.6]]},
  {tag:'fix',title:'Fix, step 1: ask for permission',cap:"Instead, the app asks the menu service for permission. The service checks the restaurant owns this dish and returns a presigned URL: a link that allows uploading one file to S3 for 5 minutes.",set:{s3:[600,300,1,1]},txt:{msg:'presigned URL, valid 5 min'},lcls:{msg:'ok'},seq:[['partner','menu','a',0],['menu','partner','g',.9]]},
  {tag:'fix',title:'Fix, step 2: upload straight to S3',cap:"The phone uploads the photo directly to object storage. Our servers never touch the bytes. S3 stores it cheaply and durably, and the database keeps only the file's URL.",txt:{msg:'upload goes straight to S3'},seq:[['partner','s3','a',0,1.6]]},
  {tag:'result',title:'Serve it from a CDN',cap:"The photo is resized once into small, medium and large WebP versions. A CDN copies them to servers near customers, so menus load fast everywhere and S3 is rarely read.",set:{cdn:[830,300,1,1]},txt:{msg:'resized once, cached near users'},flows:[['s3','cdn','g',600]]},
  {tag:'problem',title:'Problem: search with SQL is slow',cap:"Priya types “biriyani”, with a typo. A SQL LIKE query has to scan every dish row, can't handle the typo, and can't rank results by relevance. At dinner the database chokes.",set:{partner:[140,300,1,0],menu:[380,170,1,0],s3:[600,300,1,0],cdn:[830,300,1,0],pg:[140,300,1,1],api:[830,300,1,1],msg:[480,460,1,1]},meter:{pg:96},shake:['pg'],txt:{msg:"LIKE '%biryani%' scans every row"},lcls:{msg:'bad'},seq:[['api','pg','b',0,1.8]]},
  {tag:'fix',title:'Fix: a search index',cap:"A search engine like Elasticsearch keeps an inverted index: for each word, the list of dishes containing it. Fuzzy matching handles the typo, and changes stream in from Postgres within seconds.",set:{cdc:[370,300,1,1],es:[600,300,1,1]},meter:{pg:30},txt:{msg:'“biryani” → dishes 4, 9, 22, 31'},lcls:{msg:'ok'},flows:[['pg','cdc','a',900],['cdc','es','a',900]],seq:[['api','es','a',0],['es','api','g',.9]]},
  {tag:'problem',title:'Problem: who is the nearest rider?',cap:"To assign Priya's order, dispatch needs the closest free rider. Checking the distance to all 160,000 riders for every order, hundreds of times a second, is far too slow.",set:{pg:[140,300,1,0],cdc:[370,300,1,0],es:[600,300,1,0],api:[830,300,1,0],riders:[140,300,1,1],disp:[830,300,1,1]},meter:{disp:97},shake:['disp'],txt:{msg:'160,000 distance checks per order'},lcls:{msg:'bad'}},
  {tag:'fix',title:'Fix: split the map into cells',cap:"The map is divided into small hexagon cells (H3). Each rider is stored under their cell in Redis. Dispatch looks only in the restaurant's cell and the 6 around it: a few dozen riders instead of 160,000.",set:{loc:[370,300,1,1],geo:[600,300,1,1]},meter:{disp:25},txt:{msg:'look in 7 nearby hexagons only'},lcls:{msg:'ok'},flows:[['riders','loc','u',300],['loc','geo','u',300]],seq:[['disp','geo','a',0],['geo','disp','g',.9]]},
  {tag:'summary',title:'What to remember',cap:"Put files in object storage and serve them through a CDN, search with an inverted index fed by change capture, and find nearby things with geo cells instead of checking every distance.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'sec',n:11,title:'Security',sub:'OTP login, JWT, ownership, payments, webhooks',o3:{},
 actors:[
  ['box','app',{k:'phone',t:"Priya's phone",s:'stores tokens'}],['box','waf',{k:'firewall',t:'Edge firewall',s:'WAF + CDN'}],
  ['box','auth',{k:'lock',t:'Auth service',s:'OTP → JWT',cls:'acc'}],['box','sms',{k:'ext',t:'SMS provider',s:'sends OTP',cls:'ext',w:160}],
  ['box','gw',{k:'gateway',t:'API gateway',s:'verifies JWT'}],['box','order',{k:'app',t:'Order service',s:'checks ownership'}],
  ['box','rzp',{k:'ext',t:'Razorpay checkout',s:'card / UPI',cls:'ext'}],['box','pay',{k:'app',t:'Payment service',s:'verifies signature'}],
  ['crowd','bad',{cnt:'Attack traffic'}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Security in six lines',["1. Authentication proves who you are; authorization decides what you may do.","2. Short-lived JWTs verified at the gateway; refresh tokens to renew them.","3. Check ownership on every resource (stops IDOR); use random IDs.","4. Never store card data: let the payment provider tokenize it.","5. Verify webhook signatures; keep secrets in a vault, not in code.","6. TLS everywhere, a WAF at the edge, parameterized queries against injection."],"Interview line: “OTP → short-lived JWT checked at the gateway; ownership check on every order.”")],
 scenes:[
  {tag:'start',title:'Log in with a one-time code',cap:"Priya enters her phone number. The request passes the edge firewall to the auth service, which sends a 6-digit code by SMS. Attempts are limited to 3 per 10 minutes so codes can't be guessed.",set:{app:[130,280,1,1],waf:[330,280,1,1],auth:[560,180,1,1],sms:[790,180,1,1],msg:[330,140,1,1]},txt:{msg:'OTP sent to +91 98xxx xxx21'},seq:[['app','waf','a',0],['waf','auth','a',.8],['auth','sms','a',1.6]]},
  {tag:'idea',title:'She gets a signed token',cap:"After the right code, the auth service gives her phone a JWT: a small signed token that says who she is and expires in 15 minutes, plus a longer-lived refresh token stored securely.",txt:{msg:'JWT · user_42 · customer · 15 min'},lcls:{msg:'ok'},seq:[['auth','waf','g',0],['waf','app','g',.8]]},
  {tag:'fix',title:'Every request carries the token',cap:"Each API call includes the token. The gateway checks its signature with the auth service's public key, with no database lookup. A forged or expired token gets 401 Unauthorized.",set:{gw:[560,350,1,1],order:[790,350,1,1]},txt:{msg:'signature ✓ → user_42'},seq:[['app','waf','a',0],['waf','gw','a',.8],['gw','order','a',1.6]]},
  {tag:'problem',title:"Problem: peeking at another order",cap:"Someone with a valid login changes the order number in the URL from 48213 to 48214. Their token is genuine, so checking the login alone would happily return a stranger's address.",txt:{msg:'GET /orders/48214 (not theirs)'},lcls:{msg:'bad'},seq:[['app','waf','b',0],['waf','gw','b',.8],['gw','order','b',1.6]]},
  {tag:'fix',title:'Fix: check ownership every time',cap:"Authentication says who you are; authorization decides what you may see. The order service compares the order's owner with the user in the token and returns 403 Forbidden. Order IDs are random, too.",lab:{order:['Order service','403: not your order']},txt:{msg:'owner check → 403 Forbidden'},lcls:{msg:'ok'},seq:[['gw','order','a',0],['order','gw','b',.9]]},
  {tag:'fix',title:'Card details never touch our servers',cap:"Payment happens inside Razorpay's checkout. Card numbers and UPI details go straight to them, and we only receive a payment ID. We never store card data, which keeps us out of the riskiest compliance scope.",set:{gw:[560,350,1,0],order:[790,350,1,0],rzp:[380,470,1,1],pay:[640,470,1,1]},lab:{order:['Order service','checks ownership']},txt:{msg:'card data goes only to Razorpay'},seq:[['app','rzp','a',0,1.2]]},
  {tag:'fix',title:'Verify every webhook',cap:"Razorpay signs each webhook with a shared secret. The payment service recomputes the signature with the secret from its vault and rejects anything that doesn't match, so nobody can fake a “payment succeeded” message.",lab:{pay:['Payment service','signature ✓ → paid']},txt:{msg:'webhook signature (HMAC) ✓'},seq:[['rzp','pay','y',0,1]]},
  {tag:'fix',title:'The edge firewall absorbs attacks',cap:"Bots try SQL injection strings and flood the login page. The web application firewall and CDN at the edge block known attack patterns and absorb floods before they ever reach our servers.",set:{rzp:[380,470,1,0],pay:[640,470,1,0],bad:[130,460,1,1]},txt:{msg:'WAF blocks floods and injections'},flows:[['bad','waf','b',110],['waf','bad','b',300],['app','waf','a',700]]},
  {tag:'summary',title:'What to remember',cap:"Short-lived signed tokens prove who someone is, ownership checks decide what they can see, payment data stays with the payment provider, webhooks are verified, and the edge firewall stops attacks early.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'obs',n:12,title:'Observability & deploys',sub:'Metrics, logs, traces, alerts, canary releases',o3:{},
 actors:[
  ['box','sA',{k:'app',t:'Order service',s:'emits telemetry'}],['box','sB',{k:'app',t:'Payment service',s:'emits telemetry'}],['box','sC',{k:'app',t:'Menu service',s:'emits telemetry'}],
  ['box','col',{k:'worker',t:'Collector',s:'OpenTelemetry',cls:'acc'}],['box','store',{k:'db',label:'METRICS · LOGS · TRACES',t:'Telemetry stores',s:'Prometheus · Loki · Tempo',cls:'db',w:220}],
  ['box','graf',{k:'monitor',t:'Dashboards',s:'orders/min by city',w:175}],['box','pd',{k:'phone',t:'On-call engineer',s:'PagerDuty',w:175}],
  ['crowd','users',{cnt:'Customers'}],['box','argo',{k:'router',t:'Canary rollout',s:'Argo Rollouts',cls:'acc'}],
  ['box','v41',{k:'server',t:'Order v41',s:'95% of users',meter:40}],['box','v42',{k:'server',t:'Order v42',s:'5% of users',meter:40}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Observability in six lines',["1. Metrics say something is wrong, traces say where, logs say exactly what.","2. Track the four golden signals plus business metrics (orders per minute).","3. Alert on SLOs and user-facing symptoms, not on every CPU spike.","4. Pass a trace ID through every service so logs and traces join up.","5. Release with canaries and feature flags; roll back automatically.","6. Tools: OpenTelemetry, Prometheus, Grafana, Loki, Tempo, Sentry, PagerDuty, Argo."],"Interview line: “OpenTelemetry everywhere, SLO-based alerts, canary deploys with auto-rollback.”")],
 scenes:[
  {tag:'start',title:"Every service reports what it's doing",cap:"Each service sends three kinds of telemetry: metrics (numbers over time), logs (what happened) and traces (one request's journey across services). OpenTelemetry collects all three in one standard way.",set:{sA:[140,190,1,1],sB:[260,340,1,1],sC:[140,470,1,1],col:[450,330,1,1]},flows:[['sA','col','a',500],['sB','col','a',500],['sC','col','a',500]]},
  {tag:'idea',title:'Stored where it can be searched',cap:"Metrics go to Prometheus, logs to Loki or Elasticsearch, and traces to Tempo or Jaeger. Each store is built for its kind of data, so questions come back in seconds.",set:{store:[680,330,1,1]},flows:[['sA','col','a',500],['sB','col','a',500],['sC','col','a',500],['col','store','u',300]]},
  {tag:'fix',title:'One screen for system health',cap:"Grafana shows the four golden signals for every service (latency, traffic, errors, saturation) next to the most important business number: orders per minute by city, compared with last Friday.",set:{graf:[860,180,1,1]},flows:[['col','store','u',400],['store','graf','g',400]]},
  {tag:'problem',title:'Checkout errors rise: page on-call',cap:"At 8:20 pm checkout success drops below its 99.5% target. An alert based on that target pages the on-call engineer. Alerts fire on what users feel, not on every CPU spike, so people trust them.",set:{pd:[860,450,1,1],msg:[450,150,1,1]},txt:{msg:'checkout success 97% < 99.5%'},lcls:{msg:'bad'},shake:['pd'],seq:[['graf','pd','b',0],['graf','pd','b',.6]]},
  {tag:'fix',title:'The trace shows exactly where',cap:"Every request carries a trace ID from the gateway onward. The engineer opens one slow checkout and sees it spent 4.1 seconds waiting on the payment service. The cause is found in minutes, not hours.",txt:{msg:'trace: 4.1 s waiting on payments'},lcls:{msg:'acc'},seq:[['sA','col','y',0],['sB','col','b',.4],['col','store','u',1],['store','graf','g',1.8]]},
  {tag:'idea',title:'Ship new code to 5% first',cap:"Most outages come from deploys. So version 42 of the order service goes to only 5% of users, while 95% stay on version 41. The rollout tool compares their error rates live.",set:{sA:[140,190,1,0],sB:[260,340,1,0],sC:[140,470,1,0],col:[450,330,1,0],store:[680,330,1,0],graf:[860,180,1,0],pd:[860,450,1,0],users:[140,300,1,1],argo:[400,300,1,1],v41:[680,160,1,1],v42:[680,440,1,1],msg:[400,140,1,1]},txt:{msg:'new version → 5% of users'},lcls:{msg:'acc'},flows:[['users','argo','a',200],['argo',['v41','v41','v41','v41','v41','v41','v41','v41','v41','v42'],'a',150]]},
  {tag:'problem',title:'Problem: the new version has a bug',cap:"Version 42 has a bug that breaks UPI payments for some users. Its error rate jumps to 4.2% while version 41 stays at 0.3%.",meter:{v42:95},lab:{v42:['Order v42','errors 4.2%']},shake:['v42'],txt:{msg:'v42 errors 4.2% vs v41 0.3%'},lcls:{msg:'bad'},flows:[['users','argo','a',200],['argo',['v41','v41','v41','v41','v42'],'a',150]]},
  {tag:'fix',title:'Fix: automatic rollback',cap:"The rollout tool sees the difference and rolls version 42 back within 3 minutes, without waiting for a human. Only 5% of users saw the bug, briefly, and the trace points straight at the failing call.",cls:{v42:'dead'},lab:{v42:['Order v42','rolled back']},txt:{msg:'auto-rollback in 3 minutes'},lcls:{msg:'ok'},flows:[['users','argo','a',200],['argo','v41','a',150]]},
  {tag:'summary',title:'What to remember',cap:"Collect metrics, logs and traces with one standard, alert on what users actually feel, follow trace IDs to the cause, and release new code to a small slice first with automatic rollback.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'est',n:13,title:'Back-of-envelope estimation',sub:'QPS, storage and bandwidth math',o3:{},
 actors:[
  ['crowd','users',{cnt:'10M users a day'}],['box','api',{k:'server',t:'App servers',s:'~1,000 requests/s each',meter:20}],['box','db',{k:'db',t:'Database',s:'one Postgres',cls:'db',meter:20}],
  ['box','cache',{k:'cache',t:'Cache',s:'Redis, in memory',cls:'acc'}],['box','store',{k:'storage',t:'Photo storage',s:'object storage',w:175}],['box','cdn',{k:'cdn',t:'CDN',s:'serves the photos',w:175}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Estimation in six lines',["1. Start from users: daily users × actions per user = requests per day.","2. Divide by about 100,000 (seconds in a day) to get requests per second (QPS).","3. Design for the peak: multiply the average by 2 to 3.","4. One server handles about 1,000 simple requests per second; add one spare.","5. Storage = items per day × size × 365; bandwidth = peak QPS × size.","6. Round hard. The goal is the right order of magnitude, not exact answers."],"Interview line: “About 600 QPS, 1,800 at peak: three servers, a cache and a CDN for the photos.”")],
 scenes:[
  {tag:'start',title:'Size the problem before drawing boxes',cap:"Imagine the interviewer says: “Build the photo feed for our food app. About 10 million people use it every day.” Before picking any technology, we ask one question: how big is this? A few rounded sums, called back-of-envelope math, answer it in two minutes.",set:{users:[200,300,1,1],msg:[540,140,1,1]},txt:{msg:'First question: how big is the problem?'},lcls:{msg:'acc'}},
  {tag:'idea',title:'Step 1: requests per day',cap:"Guess how often one person uses the app. Say each person opens the feed about 5 times a day. Then 10 million people × 5 opens = 50 million requests every day. Say your guess out loud; interviewers care about your reasoning, not the exact number.",txt:{msg:'10M people × 5 opens = 50M requests/day'},flows:[['users','msg','a',900]]},
  {tag:'idea',title:'Step 2: requests per second (QPS)',cap:"Servers think in seconds, not days. QPS means queries per second, like orders per minute at a shop counter. A day has 86,400 seconds, but round it to 100,000 to keep the math easy: 50 million ÷ 100,000 = 500 requests per second.",set:{api:[560,300,1,1]},meter:{api:35},txt:{msg:'50M ÷ ~100,000 s ≈ 500 QPS'},flows:[['users','api','a',500]]},
  {tag:'idea',title:'Step 3: plan for the dinner rush',cap:"Traffic is not flat. Most people open a food app around lunch and dinner, so the busiest minute can be 3 times the average. We always design for that peak, not the average: 500 × 3 = 1,500 requests per second.",meter:{api:70},txt:{msg:'peak ≈ 3 × average ≈ 1,500 QPS'},lcls:{msg:'acc'},flows:[['users','api','a',250]]},
  {tag:'idea',title:'Step 4: how many servers?',cap:"A good rule of thumb: one ordinary app server handles about 1,000 simple requests per second. For 1,500 at peak we need 2 servers. Add 1 spare so the app survives if one breaks. Answer: about 3 servers, not 1 and not 30.",meter:{api:55},lab:{api:['App servers ×3','1,500 ÷ 1,000 → 2, +1 spare']},txt:{msg:'1,500 ÷ 1,000 → 2 servers + 1 spare = 3'},flows:[['users','api','a',350]]},
  {tag:'idea',title:'Step 5: how much storage?',cap:"Say users post 1 million photos a day, 2 MB each. 1,000,000 × 2 MB = 2 TB per day. Over a year that is 2 TB × 365 ≈ 730 TB. That is far too much for a normal database, so photos go to object storage (like Amazon S3), built for huge files.",set:{store:[780,150,1,1]},txt:{msg:'1M photos × 2 MB = 2 TB/day ≈ 730 TB/year'},flows:[['api','store','g',500]]},
  {tag:'idea',title:'Step 6: how much bandwidth?',cap:"Bandwidth is how much data leaves per second. At peak, 1,500 requests × about 200 KB per page = 300 MB per second, roughly 2.4 Gbps. That is a lot to push out of one place, so a CDN (copies of photos near users) will serve them. Episode 15 explains it.",set:{cdn:[780,450,1,1]},txt:{msg:'1,500 × 200 KB = 300 MB/s ≈ 2.4 Gbps'},flows:[['store','cdn','g',500],['cdn','users','a',450]]},
  {tag:'problem',title:'Problem: reads overwhelm the database',cap:"Opening one feed page makes about 10 database reads (posts, likes, names). So 1,500 pages per second means 15,000 reads per second. One database handles roughly 5,000 to 10,000. The math just told us the database is the first thing that breaks.",set:{api:[480,300,1,1],db:[780,300,1,1],store:[780,150,1,0],cdn:[780,450,1,0]},meter:{db:96,api:55},txt:{msg:'15,000 reads/s > one database'},lcls:{msg:'bad'},shake:['db'],flows:[['api','db','b',150]]},
  {tag:'fix',title:'Fix: a cache absorbs 90% of reads',cap:"A cache keeps popular answers in fast memory. If 9 of every 10 reads are found there (a 90% hit rate), only 1,500 reads per second reach the database, which it handles easily. The estimate told us a cache is required before we drew anything.",set:{cache:[480,450,1,1]},meter:{db:25,api:55},txt:{msg:'90% hits → only 1,500 DB reads/s'},lcls:{msg:'ok'},flows:[['api','cache','g',200],['api','db','a',900]]},
  {tag:'idea',title:'Numbers worth memorizing',cap:"Keep a tiny cheat sheet in your head. One day is about 100,000 seconds. So 1 million requests a day is about 10 per second. Sizes go up by 1,000 each step: KB, MB, GB, TB, PB. With these three facts you can do most estimates on a whiteboard.",set:{cache:[480,450,1,0],db:[780,300,1,0],api:[480,300,1,0],users:[200,300,1,0],msg:[480,260,1,1]},txt:{msg:'1M/day ≈ 10 QPS · 1 day ≈ 100,000 s · ×1,000 per size'},lcls:{msg:'acc'}},
  {tag:'summary',title:'What to remember',cap:"Users give requests per day, dividing by 100,000 gives QPS, QPS gives server count, and item sizes give storage and bandwidth. Round hard, say your assumptions aloud, and let the numbers choose the architecture.",set:{sum:[480,316,1,1],msg:[480,260,1,0]},dim:['sum']}
 ]},
{id:'idx',n:14,title:'Indexing & storage engines',sub:'B-tree vs LSM tree, SQL vs NoSQL',o3:{},
 actors:[
  ['box','app',{k:'app',t:'Login query',s:'find one email'}],['box','tbl',{k:'db',t:'Users table',s:'50 million rows',cls:'db',meter:20}],['box','bt',{k:'search',label:'B-TREE INDEX',t:'Index on email',s:'sorted, like a book index',cls:'acc',w:215}],
  ['box','wal',{k:'storage',label:'WRITE-AHEAD LOG',t:'Append-only log',s:'safe copy of every write',w:215}],['box','mem',{k:'cache',label:'MEMTABLE',t:'Memtable',s:'sorted list in memory',cls:'acc',w:195}],
  ['box','sst',{k:'storage',label:'SSTABLES',t:'Sorted files on disk',s:'never edited',w:195}],['box','bf',{k:'lock',label:'BLOOM FILTER',t:'Bloom filter',s:'quick “not here” check',w:215}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Indexing in six lines',["1. A table is a huge list of rows; without an index every search reads all of them.","2. An index is a sorted lookup structure, like the index at the back of a book.","3. A B-tree index finds one row in 3 to 4 steps, even among 50 million.","4. Every index makes writes slower, so index only what you search by.","5. An LSM tree writes to memory first and tidies into sorted files later: great for heavy writes.","6. Postgres and MySQL use B-trees; Cassandra and RocksDB use LSM trees."],"Interview line: “B-tree for read-heavy, LSM for write-heavy, and index only the columns you query.”")],
 scenes:[
  {tag:'start',title:'A table is a giant notebook',cap:"A database table is like a huge notebook with one line per row. Our Users table has 50 million lines. When Priya logs in, the app must find her line using her email address. How fast that search is decides how fast login feels.",set:{app:[200,300,1,1],tbl:[680,300,1,1],msg:[440,140,1,1]},txt:{msg:'find the row where email = priya@…'},lcls:{msg:'acc'},flows:[['app','tbl','a',500]]},
  {tag:'problem',title:'Problem: reading every single row',cap:"With no index the database has only one option: start at row 1 and check each row until it finds her email. That is a full table scan of up to 50 million checks. It takes seconds and keeps the database busy for everyone else.",meter:{tbl:95},txt:{msg:'full scan: up to 50,000,000 rows checked'},lcls:{msg:'bad'},shake:['tbl'],flows:[['app','tbl','b',200]]},
  {tag:'idea',title:'Think of the index at the back of a book',cap:"To find “photosynthesis” in a textbook you do not read every page. You look in the index: words in alphabetical order, each with a page number. A database index is the same: a sorted list of emails, each pointing to where its row is stored.",set:{bt:[440,170,1,1],msg:[440,430,1,1]},txt:{msg:'email (sorted) → where the row lives'},lcls:{msg:'acc'},flows:[['app','bt','a',500]]},
  {tag:'fix',title:'How a B-tree finds it in 4 steps',cap:"The most common index is a B-tree. The top page says “A to M go left, N to Z go right”. Each next page narrows it further until the right row. Even with 50 million rows that is only about 4 page reads, a few milliseconds instead of seconds.",meter:{tbl:25},txt:{msg:'4 page reads instead of 50 million'},lcls:{msg:'ok'},seq:[['app','bt','a',0],['bt','tbl','a',.9],['tbl','app','g',1.8]]},
  {tag:'idea',title:'The price: writes get slower',cap:"An index is not free. Each time a new user signs up, the database must add the row and also update every index, like rewriting a book's index whenever you add a page. So index the columns you search by, not every column.",txt:{msg:'each INSERT also updates every index'},lcls:{msg:'acc'},flows:[['app','tbl','a',350],['app','bt','y',350]]},
  {tag:'idea',title:'A second design: write on a notepad first',cap:"Some systems, like chat or GPS tracking, receive millions of writes per second. An LSM tree is built for that. Think of scribbling quickly on a notepad and tidying into a notebook later. A write goes to a log (a safe copy in case of a crash) and into a sorted list in memory.",set:{app:[170,300,1,1],bt:[440,170,1,0],tbl:[680,300,1,0],wal:[480,160,1,1],mem:[480,440,1,1],msg:[780,300,1,1]},meter:{tbl:0},txt:{msg:'write = append to log + add to memory'},lcls:{msg:'acc'},flows:[['app','wal','a',500],['app','mem','a',500]]},
  {tag:'idea',title:'Tidying up: sorted files and compaction',cap:"When the in-memory list is full, it is saved to disk as one sorted file and never edited again. Later a background job called compaction merges small files into bigger ones and throws away old versions. All the slow work happens off to the side.",set:{sst:[800,300,1,1],msg:[800,130,1,1]},txt:{msg:'memory full → sorted file · compaction merges'},flows:[['mem','sst','g',600]]},
  {tag:'problem',title:'Problem: reads must check many files',cap:"A read looks in memory first, then in every file from newest to oldest. If the key does not exist, the database may have to open dozens of files to be sure. That makes reads slower than a B-tree.",lcls:{msg:'bad'},txt:{msg:'missing key → check file after file'},flows:[['app','mem','a',500],['app','sst','b',350]]},
  {tag:'fix',title:'Fix: a Bloom filter says “not here”',cap:"Each file gets a tiny checklist in memory called a Bloom filter. It answers “definitely not in this file” or “maybe”. Most files are skipped with no disk read at all. Episode 18 explains how it works inside.",set:{bf:[480,160,1,1],wal:[480,160,1,0]},txt:{msg:'filter: “definitely not here” → skip file'},lcls:{msg:'ok'},flows:[['app','bf','a',500],['bf','sst','g',600]]},
  {tag:'idea',title:'Which one should you choose?',cap:"Use a B-tree database (Postgres, MySQL) for most apps: orders, accounts, anything read often or searched by ranges. Use an LSM database (Cassandra, RocksDB, HBase) when writes are the bottleneck: chat messages, sensor data, location pings.",set:{bf:[480,160,1,0],sst:[800,300,1,0],bt:[440,170,1,1],mem:[480,440,1,1],msg:[780,300,1,1]},txt:{msg:'B-tree: reads · LSM tree: heavy writes'},lcls:{msg:'acc'}},
  {tag:'summary',title:'What to remember',cap:"Without an index, every search reads every row. A B-tree index finds rows in a few steps but slows writes. An LSM tree absorbs heavy writes in memory and tidies later. Choose by what your workload does most.",set:{sum:[480,316,1,1],msg:[780,300,1,0]},dim:['sum']}
 ]},
{id:'cdn',n:15,title:'CDN & edge delivery',sub:'Static content and video, worldwide',o3:{},
 actors:[
  ['crowd','users',{cnt:'Viewers in London'}],['box','origin',{k:'server',t:'Origin server',s:'Mumbai · original copy',meter:25}],['box','dns',{k:'dns',t:'DNS',s:'finds the nearest edge'}],
  ['box','edge',{k:'cdn',t:'Edge: London',s:'local copy',cls:'acc'}],['box','edge2',{k:'cdn',t:'Edge: Singapore',s:'local copy',cls:'acc'}],['box','shield',{k:'cache',label:'ORIGIN SHIELD',t:'Shield cache',s:'asks origin once',w:195}],
  ['box','vid',{k:'storage',t:'Video segments',s:'4-second pieces',w:195}],['pill','msg',{t:'',cls:'acc'}],
  SUM('CDN in six lines',["1. Distance causes delay: far-away servers are slow, however fast they are.","2. A CDN keeps copies of files in many cities; those servers are called edges.","3. DNS sends each viewer to the nearest edge.","4. First request misses and fills the cache; the next ones hit and are instant.","5. Version filenames (app.4f9c2.js) so changed files are never stale; use an origin shield to protect the origin.","6. Video is cut into small pieces at several qualities so playback adapts to the network."],"Interview line: “Static files and video on a CDN, versioned filenames, and an origin shield.”")],
 scenes:[
  {tag:'start',title:'Our photos live in one place: Mumbai',cap:"The app's photos, icons and videos are stored on our origin server in Mumbai. “Origin” just means the original copy. Most of our users are nearby, but now a viewer in London opens the app and asks for the same photos.",set:{users:[160,300,1,1],origin:[780,300,1,1]},flows:[['users','origin','a',500]]},
  {tag:'problem',title:'Problem: distance makes it slow',cap:"Data travels through cables at a fixed speed, so distance costs time. London to Mumbai is about 7,000 km, roughly 180 ms for each round trip. A screen with 50 photos and files adds up to several seconds of waiting, no matter how powerful our server is.",set:{msg:[480,150,1,1]},meter:{origin:60},txt:{msg:'London → Mumbai: ~180 ms for every file'},lcls:{msg:'bad'},flows:[['users','origin','b',450]]},
  {tag:'idea',title:'Think of a restaurant chain',cap:"A famous burger brand does not ship every burger from one kitchen. It opens branches in every city, stocked with popular items. A CDN (Content Delivery Network) does that for files: servers in hundreds of cities, called edges, each holding copies of popular files.",set:{edge:[480,300,1,1]},txt:{msg:'CDN = a chain of local branches for your files'},lcls:{msg:'acc'}},
  {tag:'fix',title:'Fix: serve from the nearest edge',cap:"Now the London viewer gets files from the London edge, a few milliseconds away instead of 180. The Mumbai origin is not involved, so the page loads quickly and our origin stays calm.",meter:{origin:25},txt:{msg:'London edge: ~8 ms'},lcls:{msg:'ok'},flows:[['users','edge','a',350],['edge','users','g',500]]},
  {tag:'idea',title:'How does the viewer reach the nearest edge?',cap:"The app asks DNS, the internet's phone book, for the CDN's address. DNS notices where the question came from and answers with the closest edge. The viewer never picks a server; the network picks one for them.",set:{dns:[480,130,1,1],edge:[480,450,1,1],msg:[480,260,1,0]},seq:[['users','dns','a',0],['dns','users','g',.9]]},
  {tag:'idea',title:'First visitor waits, the rest are instant',cap:"A new edge starts empty. The first viewer causes a cache miss: the edge fetches the photo from the origin and keeps a copy. Every later viewer nearby gets a cache hit, served straight from the edge. Popular files soon almost never reach the origin.",set:{dns:[480,130,1,0],edge:[480,300,1,1],msg:[480,140,1,1]},txt:{msg:'1st request: miss · after that: hit'},lcls:{msg:'acc'},seq:[['users','edge','a',0],['edge','origin','y',.9],['origin','edge','g',1.8],['edge','users','g',2.7]]},
  {tag:'idea',title:'How long should a copy live?',cap:"The origin tells edges how long to keep a file: Cache-Control: max-age. Photos can live for a year. But what if we change app.js? Give changed files a new name, like app.4f9c2.js. A new name means a fresh file, so nobody sees stale content.",txt:{msg:'Cache-Control: max-age=31536000 + versioned names'},lcls:{msg:'acc'},flows:[['origin','edge','g',700],['edge','users','a',500]]},
  {tag:'problem',title:'Problem: every edge asks the origin at once',cap:"After a new release, all the edges around the world are empty for the new file. Each one asks the origin for it at the same moment. The origin is flooded with identical requests, a stampede like the one in Episode 2.",set:{edge2:[480,450,1,1]},meter:{origin:92},shake:['origin'],txt:{msg:'every edge asks the origin at once'},lcls:{msg:'bad'},flows:[['edge','origin','b',200],['edge2','origin','b',260]]},
  {tag:'fix',title:'Fix: an origin shield',cap:"An origin shield is one extra cache between the edges and the origin. Edges ask the shield. If the shield does not have the file, it asks the origin once and shares the answer with everyone. A hundred misses become one.",set:{edge:[330,190,1,1],edge2:[330,410,1,1],shield:[580,300,1,1]},meter:{origin:25},txt:{msg:'100 edge misses → 1 origin request'},lcls:{msg:'ok'},flows:[['edge','shield','a',300],['edge2','shield','a',380],['shield','origin','g',900]]},
  {tag:'idea',title:'Video: many small pieces',cap:"A video is not sent as one giant file. It is cut into 4-second pieces, each stored in a few qualities (low, medium, high). The player downloads piece by piece from the nearby edge and switches quality if the network slows down. That is why video keeps playing instead of freezing.",set:{vid:[780,140,1,1],edge2:[480,450,1,0],shield:[580,300,1,0],edge:[480,300,1,1],msg:[480,140,1,1]},txt:{msg:'HLS: 4-second pieces, 3 quality levels'},flows:[['vid','edge','g',500],['edge','users','a',350]]},
  {tag:'summary',title:'What to remember',cap:"A CDN puts copies of your files in many cities so users get them from nearby. DNS picks the nearest edge, hits are instant, versioned names prevent stale files, an origin shield protects the origin, and video is delivered in small adaptive pieces.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'uid',n:16,title:'Unique ID generation',sub:'Snowflake, UUID, ticket servers',o3:{},
 actors:[
  ['box','sA',{k:'app',t:'Server A',s:'creates orders'}],['box','sB',{k:'app',t:'Server B',s:'creates orders'}],['box','sC',{k:'app',t:'Server C',s:'creates orders'}],
  ['box','auto',{k:'db',label:'ONE COUNTER',t:'AUTO_INCREMENT',s:'1, 2, 3, 4 …',cls:'db',meter:30}],['box','snow',{k:'worker',label:'SNOWFLAKE',t:'ID builder',s:'time + machine + counter',cls:'acc',w:215}],
  ['box','ticket',{k:'db',label:'TICKET SERVER',t:'Hands out ranges',s:'1,001 to 2,000 at a time',cls:'db',w:210}],['box','clock',{k:'monitor',label:'CLOCK',t:'Server clock',s:'kept right by NTP',w:175}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Unique IDs in six lines',["1. Every record needs an ID that is never repeated, like a token number.","2. One database counter (auto-increment) is simple but becomes a bottleneck.","3. UUID: a random 128-bit ID made anywhere, but long and bad for index order.","4. Snowflake: 41-bit time + 10-bit machine + 12-bit counter in 64 bits; sortable by time.","5. If the clock jumps backwards, wait instead of risking a duplicate.","6. Ticket servers hand out whole ranges; UUIDv7 and ULID are time-ordered alternatives."],"Interview line: “Snowflake-style 64-bit IDs: unique per machine, sortable by time, no coordination.”")],
 scenes:[
  {tag:'start',title:'Every order needs its own number',cap:"Each order, message or post needs an ID that no other record ever has, like the token number you get at a clinic. If two orders share an ID, one overwrites the other or the wrong person gets the food. The question: how do many servers create IDs without clashing?",set:{sA:[140,120,1,1],sB:[140,300,1,1],sC:[140,480,1,1]}},
  {tag:'idea',title:'The easy way: one counter',cap:"The simplest idea is one database that counts: 1, 2, 3, 4. Every new order asks it for the next number, like a single bakery counter handing out tickets. For a small app this works perfectly and the IDs are short and in order.",set:{auto:[640,300,1,1],msg:[640,130,1,1]},txt:{msg:'next ID = last ID + 1'},lcls:{msg:'acc'},flows:[['sA','auto','a',600],['sB','auto','a',800]]},
  {tag:'problem',title:'Problem: the counter becomes the bottleneck',cap:"At millions of orders every server queues for that one counter, so it slows down, and if it breaks nobody can create orders. Worse, when data is split over two databases (sharding), both hand out “1001” and the IDs clash.",meter:{auto:92},shake:['auto'],txt:{msg:'one place for everyone: slow, fragile, clashes'},lcls:{msg:'bad'},flows:[['sA','auto','b',200],['sB','auto','b',240],['sC','auto','b',280]]},
  {tag:'idea',title:'Option A: UUID, a random ID',cap:"A UUID is a very long random number (128 bits). Each server can make its own without asking anyone, and the chance of two being equal is so tiny we ignore it. The cost: 36 characters long, and since they are random they scatter across the database index, which slows inserts.",set:{auto:[640,300,1,0],msg:[540,150,1,1]},meter:{auto:0},txt:{msg:'3f2b9c1e-7a44-4d1b-9e0a-… (random, 128 bits)'},lcls:{msg:'acc'}},
  {tag:'idea',title:'Option B: Snowflake, an ID built from parts',cap:"Twitter's Snowflake builds a 64-bit number from three parts: the current time (41 bits), the machine's own number (10 bits) and a small counter for that millisecond (12 bits). Each server builds IDs alone; no asking anyone.",set:{snow:[640,300,1,1],msg:[540,150,1,1],clock:[860,450,1,1]},txt:{msg:'[ time 41 bits | machine 10 bits | counter 12 bits ]'},lcls:{msg:'ok'},flows:[['sA','snow','a',500],['sB','snow','a',560],['sC','snow','a',620],['clock','snow','g',700]]},
  {tag:'idea',title:'Why this never clashes, and sorts by time',cap:"Two machines never clash because the machine part differs. One machine never repeats itself because the counter increases within a millisecond (4,096 IDs per millisecond). And since time comes first, newer IDs are always bigger, so sorting by ID sorts by creation time.",txt:{msg:'different machine bits → no clash · time first → sorted'},lcls:{msg:'ok'},flows:[['snow','sA','g',500],['snow','sB','g',560],['snow','sC','g',620]]},
  {tag:'problem',title:'Problem: the clock jumps backwards',cap:"Snowflake trusts the clock. If a server's time is corrected backwards by 40 ms, it could rebuild an ID it already used. A duplicate ID is a serious bug, much worse than a short delay.",lab:{clock:['Server clock','jumped back 40 ms']},txt:{msg:'clock went backwards → duplicate risk!'},lcls:{msg:'bad'},shake:['clock'],flows:[['clock','snow','b',400]]},
  {tag:'fix',title:'Fix: wait until time catches up',cap:"The generator remembers the last timestamp it used. If the clock shows an earlier time, it simply waits (or returns an error) until time passes that point, then continues. A pause of a few milliseconds is far better than a duplicate.",lab:{clock:['Server clock','waiting 40 ms']},txt:{msg:'clock < last time → wait, never reuse'},lcls:{msg:'ok'},flows:[['clock','snow','g',600],['snow','sA','g',700]]},
  {tag:'idea',title:'Option C: take tickets in bulk',cap:"Another approach: a ticket server hands each service a whole block, like a deli giving you a roll of 1,000 tickets. The service uses them from memory and returns only when the roll is empty. The central server is now asked rarely instead of every time.",set:{snow:[640,300,1,0],clock:[860,450,1,0],ticket:[640,300,1,1]},txt:{msg:'one request → IDs 1,001 to 2,000'},lcls:{msg:'acc'},flows:[['sA','ticket','a',900],['ticket','sA','g',1100]]},
  {tag:'idea',title:'Which one should you pick?',cap:"Small app on one database: auto-increment. Need IDs that nobody can guess and no coordination: UUID (the newer UUIDv7 is time-ordered). Big system that wants sortable 64-bit IDs: Snowflake. Short links: count with a ticket server and write the number in base 62.",set:{ticket:[640,300,1,0],msg:[540,230,1,1]},txt:{msg:'small: counter · random: UUID · scale: Snowflake'},lcls:{msg:'acc'}},
  {tag:'summary',title:'What to remember',cap:"IDs must never repeat. One counter is easy but does not scale, UUIDs avoid coordination but are random and long, Snowflake builds sortable IDs from time, machine and counter, and a backwards clock is the failure to design for.",set:{sum:[480,316,1,1],msg:[540,230,1,0]},dim:['sum']}
 ]},
{id:'api',n:17,title:'API design',sub:'Pagination, versioning, idempotency, bulk',o3:{},
 actors:[
  ['box','app',{k:'phone',t:'Mobile app',s:'asks for data'}],['box','gw',{k:'gateway',t:'API gateway',s:'/v1 /v2 routing',cls:'acc'}],['box','svc',{k:'app',t:'Orders service',s:'answers requests'}],
  ['box','db',{k:'db',t:'Orders database',s:'50 million orders',cls:'db',meter:20}],['box','job',{k:'worker',t:'Export worker',s:'works in background'}],['pill','msg',{t:'',cls:'acc'}],
  SUM('API design in six lines',["1. An API is the agreed way an app asks a server for data, like ordering from a menu.","2. Never return an unbounded list: paginate, and prefer cursors over offsets.","3. Use the right status code (2xx fine, 4xx your mistake, 5xx our fault) and one error shape.","4. Version the API (/v1, /v2) so old apps keep working.","5. Idempotency keys make retries safe; bulk endpoints report success per item.","6. Slow jobs return 202 Accepted plus a status link, and finish in the background."],"Interview line: “Cursor pagination, versioned URLs, idempotency keys, and 202 for long jobs.”")],
 scenes:[
  {tag:'start',title:'An API is a menu and a waiter',cap:"An API is the agreed way two programs talk, like a menu plus a waiter. The app does not walk into the kitchen; it sends a request such as “GET /orders” and the server replies with data. Good API design makes that conversation fast, safe and hard to misuse.",set:{app:[140,300,1,1],gw:[380,300,1,1],svc:[620,300,1,1],db:[860,300,1,1]},flows:[['app','gw','a',500],['gw','svc','a',600]]},
  {tag:'problem',title:'Problem: “give me every order”',cap:"The app asks GET /v1/orders. We have 50 million orders, so the server tries to load and send all of them. Memory fills up, the response is gigabytes, and the phone gives up. Never build an endpoint that can return an unlimited list.",set:{msg:[500,130,1,1]},meter:{db:95},txt:{msg:'GET /v1/orders → 50 million rows'},lcls:{msg:'bad'},shake:['db'],flows:[['app','gw','b',250],['gw','svc','b',300],['svc','db','b',200]]},
  {tag:'fix',title:'Fix: pagination, one page at a time',cap:"Return only 20 orders per request, like one page of a menu, plus a pointer to the next page. The client asks again when the user scrolls. Memory stays small, responses stay fast, and the phone shows data immediately.",meter:{db:25},txt:{msg:'?limit=20 → 20 orders + a way to get the next page'},lcls:{msg:'ok'},flows:[['app','gw','a',300],['gw','svc','a',350],['svc','db','a',400]]},
  {tag:'idea',title:'Offset vs cursor pagination',cap:"Offset says “skip 1,000,000 rows, then give me 20”. The database still counts past all those rows, so later pages get slower. A cursor says “give me 20 after order 8841”, like a bookmark. It jumps straight there, so every page costs the same.",txt:{msg:'cursor: ?limit=20&after=ord_8841'},lcls:{msg:'acc'},seq:[['app','gw','a',0],['gw','svc','a',.8],['svc','db','a',1.6],['db','svc','g',2.4]]},
  {tag:'idea',title:'Status codes: traffic lights for answers',cap:"Every response begins with a number. 2xx means it worked (200 OK, 201 Created). 4xx means the caller made a mistake (400 bad input, 401 not logged in, 404 not found, 429 too many requests). 5xx means our server failed. Add one consistent error body with a message and a request ID.",txt:{msg:'404 { code: "order_not_found", request_id }'},lcls:{msg:'acc'},seq:[['app','gw','a',0],['gw','svc','a',.8],['svc','gw','b',1.6],['gw','app','b',2.4]]},
  {tag:'problem',title:'Problem: changing the API breaks old apps',cap:"We want to rename a field. But millions of people still run old app versions that expect the old name, and many never update. If we change the response, those apps crash.",lab:{app:['Mobile app','old version']},txt:{msg:'new shape → old apps crash'},lcls:{msg:'bad'},shake:['app'],flows:[['svc','gw','b',350],['gw','app','b',420]]},
  {tag:'fix',title:'Fix: version the API',cap:"Keep /v1 working exactly as before and publish the new shape as /v2. Old apps stay on v1, new apps use v2, and we announce when v1 will retire. A safe rule: adding a field is fine; renaming or removing one needs a new version.",lab:{app:['Mobile app','v1 and v2 users']},txt:{msg:'/v1/orders frozen · /v2/orders new'},lcls:{msg:'ok'},flows:[['app','gw','a',300],['gw','svc','a',350]]},
  {tag:'idea',title:'Safe retries with idempotency keys',cap:"Networks fail, so apps retry. If “create order” is retried, we must not create two orders. The app sends a unique Idempotency-Key with the request; the server remembers it and returns the same result for a repeat. Same key, same answer.",txt:{msg:'Idempotency-Key: 9f2c-… (a retry = same order)'},lcls:{msg:'acc'},flows:[['app','gw','y',300],['gw','svc','y',350],['svc','db','a',450]]},
  {tag:'idea',title:'Bulk requests: many items, one call',cap:"Uploading 1,000 menu items with 1,000 separate calls is slow. A bulk endpoint takes all 1,000 at once. The reply lists success or failure for each item, so one bad row does not throw away the other 999.",txt:{msg:'POST /items:batch → 998 ok, 2 failed'},lcls:{msg:'acc'},flows:[['app','gw','a',350],['gw','svc','a',400],['svc','db','a',450]]},
  {tag:'idea',title:'Slow jobs: reply now, finish later',cap:"Exporting a year of orders takes minutes. Do not make the app wait. The API replies at once with 202 Accepted and a status link. A background worker builds the file, and the app checks the link or gets a webhook when it is ready.",set:{job:[860,150,1,1],msg:[500,130,1,1]},txt:{msg:'202 Accepted → check /exports/77 later'},lcls:{msg:'acc'},seq:[['app','gw','a',0],['gw','svc','a',.8],['svc','job','a',1.6],['svc','gw','g',1.8],['gw','app','g',2.6]]},
  {tag:'summary',title:'What to remember',cap:"A good API never returns unlimited data, uses cursors to page, answers with clear status codes, adds a new version instead of breaking old apps, makes retries safe with idempotency keys, and hands slow work to the background.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'prob',n:18,title:'Probabilistic structures',sub:'Bloom filter, HyperLogLog, count-min',o3:{},
 actors:[
  ['crowd','users',{cnt:'Sign-ups'}],['box','set',{k:'db',t:'Exact list',s:'every item stored',cls:'db',meter:20}],['box','bf',{k:'lock',label:'BLOOM FILTER',t:'Bloom filter',s:'row of bits',cls:'acc',w:195}],
  ['box','db',{k:'db',t:'Database',s:'the real answer',cls:'db',meter:20}],['box','hll',{k:'cache',label:'HYPERLOGLOG',t:'HyperLogLog',s:'12 KB, about 1% off',cls:'acc',w:195}],
  ['box','cms',{k:'monitor',label:'COUNT-MIN SKETCH',t:'Count-min sketch',s:'small grid of counters',cls:'acc',w:215}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Probabilistic structures in six lines',["1. They give an approximate answer using a tiny amount of memory.","2. Bloom filter: “is it in the set?” “No” is always right; “yes” is only probably right.","3. HyperLogLog: how many different items? About 12 KB, around 1% error.","4. Count-min sketch: how often did each item appear? It can over-count, never under-count.","5. Plain Bloom filters cannot delete items; counting or cuckoo filters can.","6. Used in Redis, Cassandra, Chrome and analytics pipelines."],"Interview line: “Bloom filter in front of the database; HyperLogLog for uniques; count-min for top-K.”")],
 scenes:[
  {tag:'start',title:'Sometimes “close enough” is much cheaper',cap:"Exact answers can cost a lot of memory. If a dashboard says “482 million visitors” and the true number is 484 million, nobody minds. Probabilistic data structures accept a small, known error and in return use thousands of times less memory.",set:{users:[160,300,1,1],msg:[540,140,1,1]},txt:{msg:'tiny memory, tiny known error'},lcls:{msg:'acc'}},
  {tag:'problem',title:'Problem: is this username taken?',cap:"At sign-up we must check whether a username already exists, among a billion. Keeping every name in memory needs tens of gigabytes. Asking the database each time is slow, and most checks are for names that do not exist, which is wasted work.",set:{set:[560,300,1,1]},meter:{set:95},txt:{msg:'1 billion names = tens of GB in memory'},lcls:{msg:'bad'},shake:['set'],flows:[['users','set','b',250]]},
  {tag:'idea',title:'Bloom filter: a row of light switches',cap:"A Bloom filter is a long row of bits, all 0. To add “pizza”, run it through 3 hash functions (recipes that turn any word into a position) and flip those 3 positions, say 3, 17 and 42, to 1. That is all it stores, never the word itself.",set:{set:[560,300,1,0],bf:[560,300,1,1]},meter:{set:0},txt:{msg:'add “pizza” → switch on bits 3, 17, 42'},lcls:{msg:'ok'},flows:[['users','bf','a',350]]},
  {tag:'idea',title:'Checking: “no” is certain, “yes” is “maybe”',cap:"To check “burger”, compute its 3 positions, say 5, 17 and 60. Bit 5 is off, so “burger” was never added: a certain no. If all 3 bits were on, it is probably present, but other words might have flipped them. Only on “maybe” do we ask the database.",set:{bf:[500,300,1,1],db:[800,300,1,1]},txt:{msg:'any bit off → not here · all on → ask the DB'},lcls:{msg:'acc'},seq:[['users','bf','a',0],['bf','db','y',.9],['db','bf','g',1.8]]},
  {tag:'result',title:'Result: a billion names in about 1.2 GB',cap:"At a 1% false-positive rate, a Bloom filter for a billion items needs about 1.2 GB instead of tens of gigabytes. Roughly 99% of checks for new names end with a quick “no” and never touch the database.",txt:{msg:'1B items ≈ 1.2 GB · 1% false “maybe”'},lcls:{msg:'ok'},meter:{db:15},flows:[['users','bf','a',300]]},
  {tag:'problem',title:'Problem: how many different visitors today?',cap:"To count unique visitors exactly we must remember every visitor ID, to avoid counting someone twice. With hundreds of millions of visitors that is gigabytes of memory just to show one number on a dashboard.",set:{bf:[500,300,1,0],db:[800,300,1,0],set:[560,300,1,1]},meter:{set:92},txt:{msg:'exact unique count = remember everyone'},lcls:{msg:'bad'},shake:['set'],flows:[['users','set','b',250]]},
  {tag:'fix',title:'Fix: HyperLogLog, guess from lucky streaks',cap:"If someone says they flipped 10 heads in a row, you guess they tried about 1,000 times. HyperLogLog hashes every ID and tracks the longest lucky streak it has seen. A rare streak means many different IDs. It estimates millions of uniques within 1% using about 12 KB.",set:{set:[560,300,1,0],hll:[560,300,1,1]},txt:{msg:'12 KB → “about 482 million unique”'},lcls:{msg:'ok'},flows:[['users','hll','a',350]]},
  {tag:'problem',title:'Problem: which hashtags are trending?',cap:"A million tag events arrive every second. Keeping one exact counter for every tag ever seen uses lots of memory, and most tags appear only once. We only care which tags are frequent.",set:{hll:[560,300,1,0],set:[560,300,1,1]},meter:{set:90},txt:{msg:'a counter for every tag ever seen'},lcls:{msg:'bad'},flows:[['users','set','b',200]]},
  {tag:'fix',title:'Fix: a count-min sketch',cap:"A count-min sketch is a small grid of counters. For each event, every row adds 1 to one cell chosen by that row's hash. To read a tag's count, look at its cell in every row and take the smallest. Collisions only inflate counts, so it can over-count but never under-count.",set:{set:[560,300,1,0],cms:[560,300,1,1]},meter:{set:0},txt:{msg:'count = smallest cell across the rows'},lcls:{msg:'ok'},flows:[['users','cms','a',250]]},
  {tag:'idea',title:'Which tool for which question?',cap:"“Have I seen this?” use a Bloom filter. “How many different?” use HyperLogLog. “How often?” or “top trending?” use a count-min sketch. Redis ships HyperLogLog built in, and Cassandra and Chrome use Bloom filters.",set:{cms:[560,300,1,0],bf:[300,300,1,1],hll:[560,300,1,1],set:[560,300,1,0],msg:[540,140,1,1]},txt:{msg:'seen? → Bloom · how many? → HLL · how often? → CMS'},lcls:{msg:'acc'}},
  {tag:'summary',title:'What to remember',cap:"Bloom filters answer “seen it?”, HyperLogLog answers “how many different?”, and count-min sketches answer “how often?”. Each trades a small, known error for a tiny memory footprint.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]},
{id:'txn',n:19,title:'Transactions & isolation',sub:'ACID, anomalies, optimistic vs pessimistic',o3:{},
 actors:[
  ['box','t1',{k:'app',t:'Transaction A',s:'Priya pays ₹500'}],['box','t2',{k:'app',t:'Transaction B',s:'Ravi pays ₹300'}],['box','db',{k:'db',t:'Wallet database',s:'balance = ₹1,000',cls:'db',meter:20,w:210}],
  ['box','lock',{k:'lock',label:'ROW LOCK',t:'Row lock',s:'one at a time',cls:'acc',w:205}],['box','mv',{k:'storage',label:'ROW VERSIONS',t:'Versions (MVCC)',s:'readers see a snapshot',w:205}],
  ['box','saga',{k:'flow',t:'Saga',s:'steps + undo steps'}],['pill','msg',{t:'',cls:'acc'}],
  SUM('Transactions in six lines',["1. A transaction groups steps so they all happen or none do.","2. ACID: atomic, consistent, isolated, durable.","3. Without isolation, two users editing the same row can overwrite each other.","4. Isolation levels trade speed for safety; serializable is the strictest.","5. Pessimistic: lock the row first. Optimistic: check the version at the end.","6. Across services you cannot use one transaction; use sagas with undo steps."],"Interview line: “Pick the isolation level on purpose, lock or version-check hot rows, saga across services.”")],
 scenes:[
  {tag:'start',title:'Moving money must be all or nothing',cap:"Priya sends ₹500 to a friend. That is two steps: subtract ₹500 from her wallet, then add ₹500 to the friend's. If the server crashes between the two steps, ₹500 simply disappears. We need both steps to succeed together or not happen at all.",set:{t1:[160,300,1,1],db:[640,300,1,1],msg:[420,130,1,1]},txt:{msg:'step 1: subtract · step 2: add'},lcls:{msg:'acc'},flows:[['t1','db','a',500]]},
  {tag:'idea',title:'A transaction bundles steps together',cap:"A transaction wraps steps between BEGIN and COMMIT. If everything succeeds, COMMIT makes the changes real together. If anything fails, ROLLBACK undoes every step as if nothing happened. The ₹500 can no longer vanish.",txt:{msg:'BEGIN → steps → COMMIT (or ROLLBACK)'},lcls:{msg:'ok'},seq:[['t1','db','a',0],['db','t1','g',.9]]},
  {tag:'idea',title:'ACID: four promises',cap:"Atomic: all steps or none. Consistent: the rules always hold, such as “a balance never goes below zero”. Isolated: other users do not see your half-finished work. Durable: once committed, it survives a crash, because it was written to a log first.",txt:{msg:'Atomic · Consistent · Isolated · Durable'},lcls:{msg:'ok'},seq:[['t1','db','a',0],['db','t1','g',.9]]},
  {tag:'problem',title:'Problem: two people edit at the same time',cap:"The wallet has ₹1,000. Priya's top-up of ₹500 and Ravi's top-up of ₹300 both read ₹1,000. Each adds their amount and writes back: ₹1,500 and ₹1,300. The last write wins, so one top-up is lost. This bug is called a lost update.",set:{t2:[160,450,1,1]},meter:{db:60},lab:{db:['Wallet database','final = ₹1,300 (should be ₹1,800)']},txt:{msg:'both read ₹1,000 → last write wins'},lcls:{msg:'bad'},shake:['db'],flows:[['t1','db','b',350],['t2','db','b',420]]},
  {tag:'idea',title:'Isolation: how much may transactions see?',cap:"Isolation levels decide how much transactions can see of each other. Weak levels allow dirty reads (seeing uncommitted data) and phantom reads (new rows appearing mid-way). Read committed, repeatable read, and serializable (as if one at a time) get stricter, safer and slower.",lab:{db:['Wallet database','balance = ₹1,000']},meter:{db:25},txt:{msg:'read committed → repeatable read → serializable'},lcls:{msg:'acc'},flows:[['t1','db','a',500],['t2','db','a',600]]},
  {tag:'fix',title:'Fix 1: pessimistic locking',cap:"“Pessimistic” means expecting a clash and locking first, like taking the only key to the cash drawer. SELECT … FOR UPDATE locks the row. Ravi waits until Priya commits, then reads ₹1,500 and adds ₹300 to reach ₹1,800. Safe, but a busy row makes people queue.",set:{lock:[400,300,1,1]},lab:{db:['Wallet database','balance = ₹1,800 ✓']},txt:{msg:'B waits for A’s lock, then reads ₹1,500'},lcls:{msg:'ok'},flows:[['t1','lock','a',500],['lock','db','g',500],['t2','lock','y',900]]},
  {tag:'fix',title:'Fix 2: optimistic version check',cap:"“Optimistic” means expecting no clash and checking at the end. Each row has a version number. The update says “apply only if the version is still 7”. If someone changed it first, nothing is updated and the app simply retries. Cheap when conflicts are rare.",set:{lock:[400,300,1,0]},txt:{msg:'UPDATE … WHERE id=1 AND version=7'},lcls:{msg:'ok'},seq:[['t1','db','a',0],['db','t1','g',.8],['t2','db','b',1.6],['db','t2','y',2.4]]},
  {tag:'idea',title:'MVCC: readers do not wait for writers',cap:"Postgres and MySQL keep several versions of a row. A report that started a minute ago keeps seeing the data as it was, a snapshot, while writers add newer versions. Old versions are cleaned up later. That is why a long report does not freeze checkout.",set:{mv:[400,300,1,1]},txt:{msg:'reader sees snapshot · writer adds new version'},lcls:{msg:'acc'},flows:[['t2','mv','a',500],['t1','db','a',600]]},
  {tag:'idea',title:'Across services: sagas',cap:"One transaction only works inside one database. When an order touches separate payment, stock and delivery services, we use a saga: a chain of small local transactions. If a later step fails, earlier steps are undone with compensating actions, such as refunding the payment.",set:{t1:[160,300,1,1],t2:[160,450,1,0],db:[640,300,1,1],mv:[400,300,1,0],saga:[400,300,1,1]},meter:{db:25},txt:{msg:'step fails → run undo steps (refund)'},lcls:{msg:'acc'},flows:[['t1','saga','a',500],['saga','db','a',500]]},
  {tag:'summary',title:'What to remember',cap:"A transaction makes steps all-or-nothing. Choose an isolation level on purpose, lock the row or check its version when two people may edit it, rely on MVCC so reads do not block writes, and use sagas across services.",set:{sum:[480,316,1,1]},dim:['sum']}
 ]}
);
{const ORD={scale:1,cache:4,db:5};EPS.forEach(e=>{if(!e.n)e.n=ORD[e.id];e.title=e.title||e.name.replace(/^Episode \d+ · /,'')});
 EPS.sort((a,b)=>a.n-b.n);EPS.forEach(e=>{e.name=`Episode ${e.n} · ${e.title}`})}

/* ================= ACTORS ================= */
const stage=$('stage');
function person(g,x,y){E('circle',{class:'person',cx:x,cy:y-9,r:7},g);E('path',{class:'person',d:`M${x-11},${y+12} Q${x-11},${y} ${x},${y} Q${x+11},${y} ${x+11},${y+12} Z`},g)}
function kindOf(id,o){
  if(o.k){const L={phone:'CLIENT',dns:'DNS',cdn:'CDN',gateway:'API GATEWAY',queue:'EVENT STREAM',ext:'EXTERNAL',storage:'OBJECT STORAGE',search:'SEARCH INDEX',monitor:'MONITORING',lock:'AUTH',flow:'WORKFLOW',worker:'WORKER',firewall:'FIREWALL',server:'SERVER',lb:'LOAD BALANCER',router:'ROUTER',app:'SERVICE',db:'DATABASE',cache:'CACHE'};return[o.k,o.label||L[o.k]||o.k.toUpperCase()]}
  if(/^S\d/.test(id))return['server','SERVER'];if(id==='LB')return['lb','LOAD BALANCER'];if(id==='router')return['router','ROUTER'];
  if(id==='redis')return['cache','KEY-VALUE STORE'];if(id==='cache')return['cache','CACHE'];if(id==='app')return['app','APP SERVICE'];
  if(o.cls==='db')return['db',/^sh/.test(id)?'SHARD':/^r\d/.test(id)?'REPLICA':'DATABASE'];return['app','SERVICE']}
function icon(g,k,x,y){const G=E('g',{class:'ico',transform:`translate(${x},${y})`},g);
  if(k==='server'){[0,7,14].forEach((dy,i)=>{E('rect',{x:-8,y:-9+dy,width:16,height:5,rx:1.5},G);E('circle',{class:'led',cx:5,cy:-6.5+dy,r:1.2,style:`animation-delay:${i*.3}s`},G)})}
  else if(k==='lb'){E('circle',{cx:-6,cy:0,r:2.6},G);['M-3,0 L7,-7','M-3,0 L7,0','M-3,0 L7,7'].forEach(d=>E('path',{d,class:'ln'},G));[-7,0,7].forEach(y=>E('circle',{cx:8,cy:y,r:1.8},G))}
  else if(k==='cache'){E('path',{d:'M2,-9 L-6,1 L-0.5,1 L-2,9 L6,-2 L0.5,-2 Z'},G)}
  else if(k==='db'){E('ellipse',{cx:0,cy:-6,rx:8,ry:3},G);E('path',{class:'ln',d:'M-8,-6 V6 A8,3 0 0 0 8,6 V-6 M-8,0 A8,3 0 0 0 8,0'},G)}
  else if(k==='router'){['M-8,-6 H-2 L4,6 H8','M-8,6 H-2 L4,-6 H8'].forEach(d=>E('path',{d,class:'ln'},G))}
  else if(k==='phone'){E('rect',{x:-5,y:-8,width:10,height:16,rx:2.2,class:'ln'},G);E('line',{x1:-2,y1:5,x2:2,y2:5,class:'ln'},G)}
  else if(k==='dns'||k==='cdn'){E('circle',{cx:0,cy:0,r:7.5,class:'ln'},G);E('ellipse',{cx:0,cy:0,rx:3.2,ry:7.5,class:'ln'},G);E('line',{x1:-7.5,y1:0,x2:7.5,y2:0,class:'ln'},G);if(k==='cdn')E('circle',{cx:6,cy:-6,r:2.2},G)}
  else if(k==='gateway'){E('path',{class:'ln',d:'M0,-8 L7,-5 V1 C7,5 3.5,7.2 0,8.5 C-3.5,7.2 -7,5 -7,1 V-5 Z'},G);E('path',{class:'ln',d:'M-3,0 L-0.5,2.5 L3.5,-2.5'},G)}
  else if(k==='queue'){[-6,0,6].forEach((y,i)=>E('rect',{x:-8+i*2,y:y-2,width:14-i*2,height:4,rx:1.2},G))}
  else if(k==='ext'){E('path',{class:'ln',d:'M-6,5 H5.5 A3.8,3.8 0 0 0 5,-2.5 A5,5 0 0 0 -4.5,-1.5 A3.3,3.3 0 0 0 -6,5 Z'},G)}
  else if(k==='storage'){E('ellipse',{cx:0,cy:-5,rx:7,ry:2.6,class:'ln'},G);E('path',{class:'ln',d:'M-7,-5 L-5,7 H5 L7,-5'},G)}
  else if(k==='search'){E('circle',{cx:-1.5,cy:-1.5,r:5,class:'ln'},G);E('line',{x1:2.3,y1:2.3,x2:7,y2:7,class:'ln'},G)}
  else if(k==='monitor'){E('path',{class:'ln',d:'M-8,5 L-3.5,-1 L0.5,2.5 L7.5,-6'},G);E('line',{x1:-8,y1:8,x2:8,y2:8,class:'ln'},G)}
  else if(k==='lock'){E('rect',{x:-6,y:-1,width:12,height:9,rx:2,class:'ln'},G);E('path',{class:'ln',d:'M-3.5,-1 V-4 A3.5,3.5 0 0 1 3.5,-4 V-1'},G)}
  else if(k==='flow'){E('circle',{cx:-6,cy:-4,r:2.4},G);E('circle',{cx:6,cy:-4,r:2.4},G);E('circle',{cx:0,cy:6,r:2.4},G);E('path',{class:'ln',d:'M-3.6,-4 H3.6 M5,-1.8 L1.5,4 M-5,-1.8 L-1.5,4'},G)}
  else if(k==='worker'){E('circle',{cx:0,cy:0,r:3.5,class:'ln'},G);[0,45,90,135].forEach(a=>E('line',{x1:0,y1:-8,x2:0,y2:-5.5,class:'ln',transform:`rotate(${a})`},G));[180,225,270,315].forEach(a=>E('line',{x1:0,y1:-8,x2:0,y2:-5.5,class:'ln',transform:`rotate(${a})`},G))}
  else if(k==='firewall'){E('rect',{x:-8,y:-7,width:16,height:14,rx:1.5,class:'ln'},G);E('path',{class:'ln',d:'M-8,-2.3 H8 M-8,2.3 H8 M-2,-7 V-2.3 M3,-2.3 V2.3 M-3,2.3 V7'},G)}
  else{E('rect',{x:-8,y:-7,width:16,height:14,rx:2.5,class:'ln'},G);E('line',{x1:-8,y1:-3,x2:8,y2:-3,class:'ln'},G);E('circle',{cx:-5,cy:-5,r:.9},G)}
}

// Recap ("What to remember") card: numbered rows + callout, or a two-column compare when the card has a split
function recap(inner,o){
  const W=860,x0=-W/2+30,cw=W-60,L=o.lines,title=(L.find(l=>l[0]==='h')||[0,''])[1];
  const strip=t=>t.replace(/^\d+\.\s*/,'').replace(/^[✓✗]\s*/,'');
  const T=(cls,x,y,t,p)=>E('text',{class:cls,x,y},p||inner,t);
  const callout=(y,h,kind,lines)=>{const g=E('g',{class:'rcall rcall-'+kind},inner);E('rect',{x:x0,y,width:cw,height:h,rx:14},g);E('rect',{class:'stripe',x:x0,y:y+8,width:4,height:h-16,rx:2},g);
    lines.forEach((t,i)=>{const m=/^(Interview line:)\s*(.*)$/.exec(t),y2=y+(h/2)+(lines.length===1?5:-4+i*20);const tx=E('text',{class:'cot',x:x0+20,y:y2},g);if(m){E('tspan',{class:'colab'},tx,m[1]+' ');E('tspan',{},tx,m[2])}else tx.textContent=t})};
  let H;
  if(o.split){
    const items=L.filter(l=>l[0]==='li'),heads=L.filter(l=>l[0]==='h2'),sub=items.slice(0,2),foot=items.slice(2),pc=L.filter(l=>l[0]==='lg'||l[0]==='lb');
    const colW=(cw-24)/2,colH=232,top0=68;H=top0+colH+14+62+24;const top=-H/2;
    E('rect',{class:'c',x:-W/2,y:top,width:W,height:H,rx:24},inner);E('rect',{class:'cbar',x:x0,y:top,width:56,height:4,rx:2},inner);
    T('h',x0,top+46,title);E('text',{class:'chip',x:W/2-30,y:top+44,'text-anchor':'end'},inner,'RECAP');
    [0,1].forEach(c=>{const cx=x0+c*(colW+24),cy=top+top0;
      E('rect',{class:'col',x:cx,y:cy,width:colW,height:colH,rx:16},inner);
      T('h2',cx+20,cy+34,heads[c][1]);T('li2 mut',cx+20,cy+60,sub[c][1]);
      pc.filter(p=>p[3]===(c?430:undefined)).forEach((p,i)=>{const y=cy+98+i*36,ok=p[0]==='lg';
        E('circle',{class:ok?'ic-ok':'ic-bad',cx:cx+30,cy:y-5,r:10},inner);
        E('path',{class:ok?'ic-okp':'ic-badp',d:ok?`M${cx+25.5} ${y-5} l3.2 3.2 l6-6.4`:`M${cx+26} ${y-9} l8 8 M${cx+34} ${y-9} l-8 8`},inner);
        T('li2',cx+50,y,strip(p[1]))})});
    callout(top+top0+colH+14,62,'acc',foot.map(f=>f[1]))}
  else{
    const items=L.filter(l=>l[0]==='li'),co=L.find(l=>l[0]==='lg'||l[0]==='lb'),rowH=36,first=80;
    H=first+items.length*rowH+12+(co?48+24:12);const top=-H/2;
    E('rect',{class:'c',x:-W/2,y:top,width:W,height:H,rx:24},inner);E('rect',{class:'cbar',x:x0,y:top,width:56,height:4,rx:2},inner);
    T('h',x0,top+48,title);E('text',{class:'chip',x:W/2-30,y:top+46,'text-anchor':'end'},inner,'RECAP');
    items.forEach((it,i)=>{const y=top+first+i*rowH+8,t=strip(it[1]);
      E('circle',{class:'nb',cx:x0+14,cy:y-5,r:14},inner);E('text',{class:'num',x:x0+14,y:y-.5},inner,String(i+1));
      T('li2'+(t.length>92?' sm':''),x0+44,y,t);
      if(i<items.length-1)E('line',{class:'sep',x1:x0+44,x2:x0+cw,y1:y+rowH/2-5,y2:y+rowH/2-5},inner)});
    if(co)callout(top+first+items.length*rowH+12,48,co[0]==='lb'?'bad':'acc',[co[1]])}
  return [W/2,H/2]}
function mk(type,id,o,layer){
  const outer=E('g',{class:'actor',opacity:0},layer),inner=E('g',{class:'inner'},outer);const A={id,outer,inner,hw:60,hh:30,type,mv:0};
  if(type==='box'){const w=o.w||190,h=o.meter!=null?112:92;A.hw=w/2;A.hh=h/2;const [k,label]=kindOf(id,o);A.kind=k;
    const cyl=k==='db',off=cyl?7:0,top=-h/2;
    E('rect',{class:'glow',x:-w/2-6,y:top-6,width:w+12,height:h+12,rx:18},inner);
    if(cyl){E('path',{class:'ab '+(o.cls||''),d:`M${-w/2},${top+10} A${w/2},10 0 0 1 ${w/2},${top+10} V${h/2-10} A${w/2},10 0 0 1 ${-w/2},${h/2-10} Z`},inner);
      E('path',{class:'cyl',d:`M${-w/2},${top+10} A${w/2},10 0 0 0 ${w/2},${top+10}`},inner)}
    else E('rect',{class:'ab '+(o.cls||''),x:-w/2,y:top,width:w,height:h,rx:14},inner);
    const hy=top+20+off;E('rect',{class:'icobg '+(o.cls||''),x:-w/2+10,y:hy-11,width:22,height:22,rx:6},inner);icon(inner,k,-w/2+21,hy);
    E('text',{class:'ak',x:-w/2+40,y:hy+4},inner,label);
    A.t=E('text',{class:'at','text-anchor':'middle',y:top+50+off},inner,o.t);A.s=E('text',{class:'as','text-anchor':'middle',y:top+68+off},inner,o.s);
    if(o.meter!=null){const x0=-w/2+16,bw=w-74;A.bw=bw;E('rect',{class:'mbg',x:x0,y:h/2-24-(cyl?6:0),width:bw,height:8,rx:4},inner);
      A.mf=E('rect',{class:'mfill l',x:x0,y:h/2-24-(cyl?6:0),width:0,height:8,rx:4},inner);A.mt=E('text',{class:'mt','text-anchor':'end',x:w/2-14,y:h/2-16.5-(cyl?6:0)},inner,'')}
    const xx=E('g',{class:'xx'},inner);E('circle',{class:'xbg',cx:w/2-6,cy:top+6,r:15},xx);E('line',{x1:w/2-12,y1:top,x2:w/2,y2:top+12},xx);E('line',{x1:w/2,y1:top,x2:w/2-12,y2:top+12},xx);
    const off2=E('g',{class:'offl'},inner);E('rect',{x:-36,y:top+h-2-12,width:72,height:20,rx:10},off2);E('text',{'text-anchor':'middle',y:top+h-2+2},off2,'OFFLINE')}
  else if(type==='crowd'){A.hw=64;A.hh=64;E('circle',{class:'crowdbg',r:70,cy:2},inner);[-34,0,34].forEach(x=>[-36,-2].forEach((y,j)=>person(inner,x+(j?17:0)-8,y)));person(inner,-25,32);person(inner,9,32);
    A.c=E('text',{class:'cnt','text-anchor':'middle',y:96},inner,o.cnt)}
  else if(type==='pill'){outer.setAttribute('class','actor pl '+(o.cls||''));A.r=E('rect',{x:-50,y:-15,width:100,height:30,rx:15},inner);A.c=E('text',{'text-anchor':'middle',y:4.5},inner,'');setPill(A,o.t)}
  else if(type==='ceil'){outer.setAttribute('class','actor ceil');A.hw=o.w/2;E('rect',{class:'cz',x:-o.w/2,y:-46,width:o.w,height:46},inner);E('line',{x1:-o.w/2,y1:0,x2:o.w/2,y2:0},inner);E('text',{'text-anchor':'middle',y:-12},inner,'▲ '+o.t+' ▲')}
  else if(type==='q'){A.hw=30;A.hh=36;E('circle',{class:'qbg',r:40},inner);E('text',{class:'qm','text-anchor':'middle',y:24},inner,'?')}
  else if(type==='card'&&id==='sum'){outer.setAttribute('class','actor card recap');{const r=recap(inner,o);A.hw=r[0];A.hh=r[1]}}
  else if(type==='card'){outer.setAttribute('class','actor card');A.hw=o.w/2;A.hh=o.h/2;const x0=-o.w/2+28,y0=-o.h/2;
    E('rect',{class:'c',x:-o.w/2,y:-o.h/2,width:o.w,height:o.h,rx:18},inner);E('rect',{class:'cbar',x:-o.w/2,y:-o.h/2,width:o.w,height:5,rx:2.5},inner);
    if(o.split)E('line',{class:'sep',x1:-o.w/2+o.split,y1:y0+66,x2:-o.w/2+o.split,y2:y0+250},inner);
    o.lines.forEach(([c,t,y,x])=>E('text',{class:c,x:x!=null?-o.w/2+x+(x?6:28):x0,y:y0+y},inner,t))}
  else if(type==='bars'){A.hw=150;A.hh=40;
    E('text',{class:'as',x:-150,y:-14},inner,'hash % N: data moved when adding shard 4');E('rect',{class:'bar-bg',x:-150,y:-8,width:300,height:12,rx:6},inner);A.b1=E('rect',{class:'bar-b mfill',x:-150,y:-8,width:0,height:12,rx:6},inner);E('text',{class:'mt',x:156,y:2},inner,'75%');
    E('text',{class:'as',x:-150,y:26},inner,'consistent hashing');E('rect',{class:'bar-bg',x:-150,y:32,width:300,height:12,rx:6},inner);A.b2=E('rect',{class:'bar-g mfill',x:-150,y:32,width:0,height:12,rx:6},inner);E('text',{class:'mt',x:156,y:42},inner,'25%')}
  return A;
}
function setPill(A,t){A.c.textContent=t;const w=Math.max(60,t.length*7.6+30);A.r.setAttribute('x',-w/2);A.r.setAttribute('width',w);A.hw=w/2;A.hh=15}
function setMeter(A,v,instant){if(!A.mf)return;A.mf.setAttribute('width',A.bw*v/100);A.mf.setAttribute('class','mfill '+(v<60?'l':v<85?'m':'h'));
  A.outer.classList.toggle('hotload',v>=85);
  const from=A.mv,st=performance.now();A.mv=v;if(instant||RM){A.mt.textContent=v+'%';return}
  (function f(now){const t=Math.min(1,(now-st)/800);A.mt.textContent=Math.round(from+(v-from)*t)+'%';if(t<1)requestAnimationFrame(f)})(st)}


/* ================= 3D (isometric) VIEW ================= */
let MODE='3d';try{if(localStorage.getItem('sd-view')==='2d')MODE='2d'}catch(e){}
const C30=.866;
const ip=(u,v,z)=>[+((u-v)*C30).toFixed(2),+((u+v)*.5-(z||0)).toFixed(2)];
function proj(x,y){return[480+(x-480)*.92,318+(y-290)*.9]}
const pts=a=>a.map(p=>p.join(',')).join(' ');
function cuboid(g,a,b,h,z0,extra){const t=z0+h;
  const L=[ip(-a,b,t),ip(a,b,t),ip(a,b,z0),ip(-a,b,z0)],R=[ip(a,-b,t),ip(a,b,t),ip(a,b,z0),ip(a,-b,z0)],T=[ip(-a,-b,t),ip(a,-b,t),ip(a,b,t),ip(-a,b,t)];
  E('polygon',{class:'f-l',points:pts(L)},g);E('polygon',{class:'f-r',points:pts(R)},g);E('polygon',{class:'f-t',points:pts(T)},g);if(extra)extra(t)}
function onTop(g,z){return E('g',{transform:`matrix(${C30} .5 ${-C30} .5 0 ${-z})`},g)}
function disk(g,R,th,cls){const rx=R*1.2247,ry=R*.7071;
  E('path',{class:'d-s '+(cls||''),d:`M${-rx},0 A${rx},${ry} 0 0 0 ${rx},0 V${th} A${rx},${ry} 0 0 1 ${-rx},${th} Z`},g);
  E('ellipse',{class:'d-t '+(cls||''),cx:0,cy:0,rx,ry},g);return[rx,ry]}
function cyl(g,R,h,z0,bands){const rx=R*1.2247,ry=R*.7071,top=-(z0+h),bot=-z0;
  E('path',{class:'c-s',d:`M${-rx},${top} V${bot} A${rx},${ry} 0 0 0 ${rx},${bot} V${top} Z`},g);
  for(let i=1;i<bands;i++){const y=top+(bot-top)*i/bands;E('path',{class:'c-b',d:`M${-rx},${y} A${rx},${ry} 0 0 0 ${rx},${y}`},g)}
  E('ellipse',{class:'c-t',cx:0,cy:top,rx,ry},g)}
function isoPerson(g,x,y){E('ellipse',{class:'p-sh',cx:x,cy:y+1,rx:7,ry:3.5},g);E('path',{class:'p-b',d:`M${x-5.5},${y} V${y-11} A5.5,3 0 0 1 ${x+5.5},${y-11} V${y} A5.5,3 0 0 1 ${x-5.5},${y} Z`},g);E('circle',{class:'p-h',cx:x,cy:y-18,r:4.8},g)}
function callout(g,A,H,o){const has=o.meter!=null,ph=has?54:40,w=150;A.H=H;
  E('line',{class:'lead',x1:0,y1:-H-3,x2:0,y2:-H-14},g);E('circle',{class:'leaddot',cx:0,cy:-H-3,r:2.4},g);
  const p=E('g',{class:'callout'},g);A.cop=p;p.style.transform=`translate(0px,${-H-14}px)`;const top=-ph;
  E('rect',{class:'co',x:-w/2,y:top,width:w,height:ph,rx:9},p);
  A.t=E('text',{class:'co-t','text-anchor':'middle',y:top+17},p,o.t);A.s=E('text',{class:'co-s','text-anchor':'middle',y:top+32},p,o.s);
  if(has){A.bw=w-58;E('rect',{class:'mbg',x:-w/2+12,y:top+40,width:A.bw,height:6,rx:3},p);A.mf=E('rect',{class:'mfill l',x:-w/2+12,y:top+40,width:0,height:6,rx:3},p);A.mt=E('text',{class:'mt','text-anchor':'end',x:w/2-10,y:top+46.5},p,'')}
  const xx=E('g',{class:'xx'},p);E('circle',{class:'xbg',cx:w/2-6,cy:top,r:12},xx);E('line',{x1:w/2-10.5,y1:top-4.5,x2:w/2-1.5,y2:top+4.5},xx);E('line',{x1:w/2-1.5,y1:top-4.5,x2:w/2-10.5,y2:top+4.5},xx)}
function mk3(type,id,o,layer){
  const outer=E('g',{class:'actor obj'},layer),inner=E('g',{class:'inner'},outer);outer.setAttribute('opacity',0);const A={id,outer,inner,type,mv:0,hw:50,hh:30};
  E('ellipse',{class:'shadow',cx:10,cy:8,rx:70,ry:30},inner);
  if(type==='crowd'){const [rx,ry]=disk(inner,48,7,'');A.rx=rx;A.ry=ry;
    [[-22,-20],[2,-26],[24,-16],[-26,4],[0,0],[26,8],[-10,24],[14,26]].map(([u,v])=>ip(u,v,0)).sort((p,q)=>p[1]-q[1]).forEach(p=>isoPerson(inner,p[0],p[1]-2));
    A.c=E('text',{class:'cnt3','text-anchor':'middle',y:ry+30},inner,o.cnt);return A}
  const [k]=kindOf(id,o);A.kind=k;let H=40,R=40,cls='';
  if(k==='server'){R=40;const [rx,ry]=disk(inner,R,7,'');A.rx=rx;A.ry=ry;
    E('ellipse',{class:'glow3',cx:0,cy:0,rx:rx+8,ry:ry+5},inner);
    for(let i=0;i<3;i++){const z=4+i*19;cuboid(inner,22,22,16,z,()=>{
      E('polygon',{class:'slot',points:pts([ip(-17,22,z+5),ip(13,22,z+5),ip(13,22,z+11),ip(-17,22,z+11)])},inner);
      const l=ip(22,14,z+8);E('circle',{class:'led3',cx:l[0],cy:l[1],r:1.9,style:`animation-delay:${i*.35}s`},inner);const l2=ip(22,6,z+8);E('circle',{class:'led3 b',cx:l2[0],cy:l2[1],r:1.9},inner)})}
    H=4+3*19+6}
  else if(k==='db'){R=40;const [rx,ry]=disk(inner,R,7,'db');A.rx=rx;A.ry=ry;E('ellipse',{class:'glow3',cx:0,cy:0,rx:rx+8,ry:ry+5},inner);outer.classList.add('dbk');cyl(inner,25,50,4,3);H=58}
  else if(k==='cache'){R=40;const [rx,ry]=disk(inner,R,7,'acc');A.rx=rx;A.ry=ry;outer.classList.add('acck');
    cuboid(inner,22,22,30,4,t=>{const tg=onTop(inner,t);E('path',{class:'ico3',d:'M3,-12 L-8,1 L-1,1 L-3,12 L8,-2 L1,-2 Z',transform:'rotate(45)'},tg)});H=40}
  else if(k==='lb'||k==='router'){R=50;const [rx,ry]=disk(inner,R,8,'acc');A.rx=rx;A.ry=ry;outer.classList.add('acck');
    cyl(inner,20,14,4,1);const tg=E('g',{transform:'translate(0,-18)'},inner);
    if(k==='lb'){['M-12,0 L12,-8','M-12,0 L12,0','M-12,0 L12,8'].forEach(d=>E('path',{class:'ln3',d,transform:'scale(1,.58)'},tg));E('circle',{class:'ico3',cx:-12,cy:0,r:3.2},tg)}
    else{['M-12,-4 H-4 L4,4 H12','M-12,4 H-4 L4,-4 H12'].forEach(d=>E('path',{class:'ln3',d,transform:'scale(1,.58)'},tg))}H=26}
  else if(k==='queue'){R=46;const [rx,ry]=disk(inner,R,7,o.cls==='acc'?'acc':'okd');A.rx=rx;A.ry=ry;outer.classList.add(o.cls==='acc'?'acck':'okk');E('ellipse',{class:'glow3',cx:0,cy:0,rx:rx+8,ry:ry+5},inner);
    cuboid(inner,36,14,26,4,t=>{for(let i=0;i<5;i++){const u=-30+i*13;E('polygon',{class:'slot msg',points:pts([ip(u,14,10),ip(u+9,14,10),ip(u+9,14,22),ip(u,14,22)])},inner)}});H=34}
  else if(k==='phone'){R=34;const [rx,ry]=disk(inner,R,7,'');A.rx=rx;A.ry=ry;
    cuboid(inner,6,15,44,4);E('polygon',{class:'screen3',points:pts([ip(-4,15,43),ip(4.5,15,43),ip(4.5,15,9),ip(-4,15,9)])},inner);H=50}
  else if(['dns','cdn','gateway','storage','search','monitor','lock','flow','worker','firewall','ext'].includes(k)){R=40;const ex=k==='ext'||o.cls==='ext';
    const [rx,ry]=disk(inner,R,7,ex?'ext':(o.cls==='acc'?'acc':(o.cls==='db'?'':'')));A.rx=rx;A.ry=ry;
    if(ex)outer.classList.add('extk');else if(o.cls==='acc')outer.classList.add('acck');else if(o.cls==='db')outer.classList.add('dbb');
    E('ellipse',{class:'glow3',cx:0,cy:0,rx:rx+8,ry:ry+5},inner);
    cuboid(inner,22,22,30,4,t=>{const tg=onTop(inner,t);const ig=E('g',{transform:'rotate(45) scale(1.25)'},tg);icon(ig,k,0,0)});H=40}
  else{R=40;const [rx,ry]=disk(inner,R,7,'');A.rx=rx;A.ry=ry;
    cuboid(inner,28,12,40,4,t=>{for(let i=0;i<3;i++)E('polygon',{class:'slot',points:pts([ip(-22,12,t-9-i*9),ip(16,12,t-9-i*9),ip(16,12,t-13-i*9),ip(-22,12,t-13-i*9)])},inner)});H=48}
  callout(inner,A,H,o);
  const off=E('g',{class:'offl'},inner);E('rect',{x:-36,y:A.ry+12,width:72,height:20,rx:10},off);E('text',{'text-anchor':'middle',y:A.ry+26},off,'OFFLINE');
  return A}
function floor(){
  const g=E('g',{class:'floor'},stage);E('rect',{class:'fl',x:0,y:0,width:960,height:540},g);
  const O=[480,330],L=760,tr=p=>[p[0]+O[0],p[1]+O[1]];
  for(let k=-L;k<=L;k+=40){const m=(k/40)%4===0?' m':'';let a=tr(ip(k,-L,0)),b=tr(ip(k,L,0));E('line',{class:'flg'+m,x1:a[0],y1:a[1],x2:b[0],y2:b[1]},g);a=tr(ip(-L,k,0));b=tr(ip(L,k,0));E('line',{class:'flg'+m,x1:a[0],y1:a[1],x2:b[0],y2:b[1]},g)}
  for(let i=0;i<14;i++){const u=(((i*7919)%30)-15)*40,v=(((i*104729)%26)-13)*40;const c=[ip(u,v,0),ip(u+80,v,0),ip(u+80,v+40,0),ip(u,v+40,0)].map(tr);E('polygon',{class:'tile',points:pts(c)},g)}
}

/* ================= PLAYER ================= */
let ep=null,A={},cur=0,playing=false,speed=1,voice=false,gen=0,startT=0,dur=0,raf=0,timers=[],applied={},userPaused=false,seen=false,elapsed=0;
const fx=()=>stage.querySelector('g.fx'),wires=()=>stage.querySelector('g.wires');

function load(i,keepPlay){
  ep=EPS[i];A={};applied={};stop();stage.innerHTML='';
  const defs=E('defs',{},stage);const rg=E('radialGradient',{id:'vig',cx:'50%',cy:'45%',r:'75%'},defs);E('stop',{offset:'60%','stop-color':'var(--stage)','stop-opacity':0},rg);E('stop',{offset:'100%','stop-color':'var(--vig)','stop-opacity':1},rg);
  const pat=E('pattern',{id:'dots',width:24,height:24,patternUnits:'userSpaceOnUse'},defs);E('circle',{cx:12,cy:12,r:1.1,class:'dotg'},pat);
  E('rect',{x:0,y:0,width:960,height:540,fill:'var(--stage)'},stage);if(MODE==='3d'){floor();E('rect',{x:0,y:0,width:960,height:540,fill:'url(#vig)'},stage)}else{E('rect',{x:0,y:0,width:960,height:540,fill:'url(#dots)'},stage);E('rect',{x:0,y:0,width:960,height:540,fill:'url(#vig)'},stage)}stage.classList.toggle('iso',MODE==='3d');
  A._bar=E('rect',{class:'tagbar',x:0,y:0,width:960,height:4},stage);
  E('g',{class:'wires'},stage);
  const layer=E('g',{class:'actors'},stage);A._layer=layer;ep.actors.forEach(([t,id,o])=>{o=o||{};A[id]=(MODE==='3d'&&(t==='box'||t==='crowd'))?mk3(t,id,o,layer):mk(t,id,o,layer);A[id].o0=o});
  E('g',{class:'fx'},stage);
  const ov=E('g',{class:'ovg'},stage);const tg=E('g',{class:'ovtag ov'},ov);A._tagR=E('rect',{x:28,y:24,width:100,height:28,rx:7},tg);A._tagT=E('text',{x:41,y:43},tg,'');A._tag=tg;A._ov=ov;
  A._title=E('text',{class:'ovt',x:28,y:86},ov,'');A._num=E('text',{class:'ovn',x:932,y:43,'text-anchor':'end'},stage,'');
  document.querySelectorAll('#tabs button').forEach((b,j)=>{b.classList.toggle('on',j===i);b.setAttribute('aria-selected',j===i)});
  buildTimeline();
  const tr=$('tr');tr.innerHTML='';
  ep.scenes.forEach((s,k)=>{const li=document.createElement('li');li.tabIndex=0;li.innerHTML=`<span class="n">${String(k+1).padStart(2,'0')}</span><span class="tg ${s.tag}">${TAGS[s.tag]}</span><span class="tx"><b></b><span></span></span>`;
    li.querySelector('b').textContent=s.title;li.querySelector('.tx span').textContent=s.cap;li.onclick=()=>go(k);li.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(k)}};tr.appendChild(li)});
  cur=0;show(0,true);if(keepPlay)play();
}
const sceneDur=s=>Math.max(6500,s.cap.length*62);
const total=()=>ep.scenes.reduce((a,s)=>a+sceneDur(s),0);
const before=k=>ep.scenes.slice(0,k).reduce((a,s)=>a+sceneDur(s),0);
function buildTimeline(){
  const tl=$('tl');tl.innerHTML='<div class="track"><div class="fill"></div><div class="knob"></div></div><div class="marks"></div><div class="tip" role="presentation" hidden></div>';
  const T=total(),track=tl.querySelector('.track'),marks=tl.querySelector('.marks');
  ep.scenes.forEach((s,k)=>{const l=before(k)/T*100,w=sceneDur(s)/T*100;
    if(k>0){const t=document.createElement('span');t.className='tick';t.style.left=l+'%';track.appendChild(t)}
    const b=document.createElement('button');b.type='button';b.className='hit';b.style.left=l+'%';b.style.width=w+'%';b.setAttribute('aria-label',`Scene ${k+1}: ${s.title}`);b.onclick=()=>go(k);track.appendChild(b);
    const showTip=()=>{const tip=tl.querySelector('.tip');tip.innerHTML=`<b>${String(k+1).padStart(2,'0')} · ${TAGS[s.tag]}</b><span></span>`;tip.lastChild.textContent=s.title;tip.hidden=false;const c=l+w/2,r=tl.clientWidth,tw=tip.offsetWidth,px=Math.min(Math.max(c/100*track.clientWidth+track.offsetLeft,tw/2+4),r-tw/2-4);tip.style.left=px+'px'};
    const hideTip=()=>{tl.querySelector('.tip').hidden=true};
    [b].forEach(e=>{e.addEventListener('mouseenter',showTip);e.addEventListener('mouseleave',hideTip);e.addEventListener('focus',showTip);e.addEventListener('blur',hideTip)});
    const m=document.createElement('button');m.type='button';m.className='mark '+s.tag;m.style.left=l+'%';m.style.width=w+'%';m.tabIndex=-1;m.setAttribute('aria-hidden','true');m.innerHTML='<i></i>';m.addEventListener('mouseenter',showTip);m.addEventListener('mouseleave',hideTip);m.onclick=()=>go(k);marks.appendChild(m)});
}
function drawProgress(){const T=total(),p=(before(cur)+Math.min(elapsed,sceneDur(ep.scenes[cur])))/T*100;const tl=$('tl');
  tl.querySelector('.fill').style.width=p+'%';tl.querySelector('.knob').style.left=p+'%';
  [...tl.querySelectorAll('.mark')].forEach((m,j)=>{m.classList.toggle('on',j===cur);m.classList.toggle('done',j<cur)})}

function stateAt(k){
  const st={};Object.keys(A).filter(x=>x[0]!=='_').forEach(id=>{const o=A[id].o0;st[id]={x:480,y:270,s:1,o:0,cls:'',lab:null,txt:o.t||o.cnt||'',meter:o.meter,lcls:o.cls||''}});
  for(let j=0;j<=k;j++){const s=ep.scenes[j];
    for(const id in (s.set||{})){const v=s.set[id];Object.assign(st[id],{x:v[0],y:v[1],s:v[2]!=null?v[2]:1,o:v[3]!=null?v[3]:1})}
    if(MODE==='3d')for(const id in (s.set3||{})){const v=s.set3[id];Object.assign(st[id],{x:v[0],y:v[1],s:v[2]!=null?v[2]:st[id].s})}
    for(const id in (s.cls||{}))st[id].cls=s.cls[id];for(const id in (s.lab||{}))st[id].lab=s.lab[id];
    for(const id in (s.txt||{}))st[id].txt=s.txt[id];for(const id in (s.meter||{}))st[id].meter=s.meter[id];for(const id in (s.lcls||{}))st[id].lcls=s.lcls[id]}
  return st;
}
function ends(a,b,pa,pb){const S=applied[a],T=applied[b],A1=A[a],B1=A[b];if(!S||!T)return null;
  if(MODE==='3d'){const dx=T.x-S.x,dy=T.y-S.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
    const rad=(Z,v)=>Z.rx?1/Math.sqrt((ux/(Z.rx*v.s+6))**2+(uy/(Z.ry*v.s+5))**2):Math.min(Z.hw/Math.abs(ux||1e-9),Z.hh/Math.abs(uy||1e-9))+4;
    const r1=rad(A1,S),r2=rad(B1,T);return[[S.x+ux*r1,S.y+uy*r1],[T.x-ux*r2,T.y-uy*r2]]}
  const clip=(v,hw,hh,dx,dy)=>{const k=Math.min(dx?hw/Math.abs(dx):1e9,dy?hh/Math.abs(dy):1e9);return[v.x+dx*k,v.y+dy*k]};
  const dx=T.x-S.x,dy=T.y-S.y;return[clip(S,A1.hw*S.s+(pa||5),A1.hh*S.s+(pa||5),dx,dy),clip(T,B1.hw*T.s+(pb||8),B1.hh*T.s+(pb||8),-dx,-dy)]}
function show(k,instant){
  gen++;const g=gen;timers.forEach(clearTimeout);timers=[];cur=k;elapsed=0;const s=ep.scenes[k],st=stateAt(k);
  fx().innerHTML='';const W=wires();W.innerHTML='';
  for(const id in st){const a=A[id],v=st[id],prev=applied[id];
    const O3=MODE==='3d'&&ep.o3&&ep.o3[id];const P=O3?O3:(MODE==='3d'&&a.type!=='card'&&a.type!=='bars'&&a.type!=='ceil')?proj(v.x,v.y):[v.x,v.y];
    const tf=`translate(${P[0]}px,${P[1]}px) scale(${v.s})`;
    if(instant||!prev||prev.o===0){a.outer.style.transition='none';a.outer.style.transform=`translate(${P[0]}px,${P[1]}px) scale(${v.s*(v.o&&!instant?0.82:1)})`;a.outer.getBoundingClientRect();a.outer.style.transition=''}
    a.outer.style.transform=tf;
    const dimmed=s.dim&&!s.dim.includes(id)&&v.o>0;a.outer.setAttribute('opacity',dimmed?0.03:v.o);
    a.outer.classList.toggle('dead',v.cls==='dead');
    if(a.cop)a.cop.style.transform=`translate(0px,${-a.H-14}px) scale(${v.s>1?1/v.s:1})`;
    if(a.type==='box'){if(v.lab){a.t.textContent=v.lab[0];a.s.textContent=v.lab[1]}else{a.t.textContent=a.o0.t;a.s.textContent=a.o0.s}if(v.meter!=null)setMeter(a,v.meter,instant||!prev)}
    if(a.type==='crowd')a.c.textContent=v.txt;
    if(a.type==='pill'){setPill(a,v.txt);a.outer.setAttribute('class','actor pl '+(v.lcls||''))}
    if(a.type==='bars'){a.b1.setAttribute('width',v.o?225:0);a.b2.setAttribute('width',v.o?75:0)}
    applied[id]={...v,x:P[0],y:P[1]}}
  if(MODE==='3d'){const order=()=>{const L=A._layer;const kids=[...L.children];const sorted=kids.slice().sort((p,q)=>{const ip_=Object.values(A).find(z=>z&&z.outer===p),iq=Object.values(A).find(z=>z&&z.outer===q);const y=z=>z&&applied[z.id]?(z.type==='card'?1e4:applied[z.id].y):0;return y(ip_)-y(iq)});if(sorted.some((n,i)=>n!==kids[i]))sorted.forEach(n=>L.appendChild(n))};if(instant)order();else timers.push(setTimeout(()=>{if(g===gen)order()},1000))}
  // wires for every connection used in this scene
  const pairs=new Map();(s.flows||[]).forEach(f=>(Array.isArray(f[1])?f[1]:[f[1]]).forEach(b=>{const key=[f[0],b].sort().join('|');if(!pairs.has(key))pairs.set(key,[f[0],b,f[2]])}));
  (s.seq||[]).forEach(q=>{const key=[q[0],q[1]].sort().join('|');if(!pairs.has(key))pairs.set(key,[q[0],q[1],q[2]])});
  pairs.forEach(([a,b,c])=>{if(!applied[a]||!applied[b]||!applied[a].o||!applied[b].o)return;const e=ends(a,b,2,4);if(!e)return;const d=`M${e[0][0]},${e[0][1]} L${e[1][0]},${e[1][1]}`;
    const gW=E('g',{class:'wire'+(MODE==='3d'?' cable':'')},W);E('path',{class:'wb',d},gW);E('path',{class:'wf wf-'+c,d},gW);
    timers.push(setTimeout(()=>gW.classList.add('in'),instant?0:650))});
  (s.shake||[]).forEach(id=>{const n=A[id].inner;n.classList.remove('shake');void n.getBoundingClientRect();if(!RM)n.classList.add('shake')});
  A._tag.setAttribute('class','ovtag ov '+s.tag);A._tagT.textContent=TAGS[s.tag];A._tagR.setAttribute('width',TAGS[s.tag].length*8.4+28);A._bar.setAttribute('class','tagbar '+s.tag);
  A._title.textContent=s.title;A._num.textContent=`SCENE ${k+1} / ${ep.scenes.length}`;
  A._ov.classList.remove('rise');void A._ov.getBoundingClientRect();if(!RM&&!instant)A._ov.classList.add('rise');
  $('capk').innerHTML='';const ct=document.createElement('span');ct.className='tg '+s.tag;ct.textContent=TAGS[s.tag];$('capk').append(ct,` ${ep.name} · scene ${k+1} of ${ep.scenes.length}`);
  $('capt').textContent=s.cap;$('capt').classList.remove('rise');void $('capt').offsetWidth;if(!RM&&!instant)$('capt').classList.add('rise');
  [...$('tr').children].forEach((li,j)=>{li.classList.toggle('on',j===k);li.classList.toggle('done',j<k)});
  {const tr=$('tr'),li=tr.children[k];if(li){const t=li.offsetTop-tr.clientHeight/2+li.offsetHeight/2;tr.scrollTo({top:Math.max(0,t),behavior:(RM||instant)?'auto':'smooth'})}$('trc').textContent=`${k+1} / ${ep.scenes.length}`}
  dur=sceneDur(s);startT=performance.now();drawProgress();updTime();
  if(!RM){const dl=instant?200:950;
    (s.flows||[]).forEach(f=>{const [a,b,c,iv]=f;let rr=0;const tick=()=>{if(g!==gen)return;const to=Array.isArray(b)?b[rr++%b.length]:b;packet(a,to,c,.9,g);timers.push(setTimeout(tick,iv/speed))};timers.push(setTimeout(tick,dl))});
    if(s.seq){const tot=Math.max(...s.seq.map(q=>q[3]+(q[4]||.8)))+1.4;
      const run=()=>{if(g!==gen)return;s.seq.forEach(q=>timers.push(setTimeout(()=>packet(q[0],q[1],q[2],q[4]||.8,g),q[3]*1000/speed)));timers.push(setTimeout(run,tot*1000/speed))};timers.push(setTimeout(run,dl))}}
  if(playing){if(voice)speak(s.cap,g);cancelAnimationFrame(raf);raf=requestAnimationFrame(tickBar)}
}
function packet(a,b,c,du,g){
  const e=ends(a,b);if(!e)return;const [p,q]=e,L=fx();
  const trail=[0,1,2,3].map(i=>E('circle',{r:5.5-i*1.1,class:'pk-'+c,opacity:0},L));const halo=E('circle',{r:12,class:'pk-'+c,opacity:0},L);
  const st=performance.now(),D=du*1000/speed;
  const pos=t=>{t=Math.max(0,Math.min(1,t));const e2=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return[p[0]+(q[0]-p[0])*e2,p[1]+(q[1]-p[1])*e2]};
  (function f(now){if(g!==gen){trail.forEach(x=>x.remove());halo.remove();return}const t=Math.min(1,(now-st)/D);const op=t>.9?(1-t)/.1:Math.min(1,t*8);
    trail.forEach((el,i)=>{const P=pos(t-i*.045);el.setAttribute('cx',P[0]);el.setAttribute('cy',P[1]);el.setAttribute('opacity',op*(i?.5-i*.12:1))});
    const P=pos(t);halo.setAttribute('cx',P[0]);halo.setAttribute('cy',P[1]);halo.setAttribute('opacity',op*.22);
    if(t<1)requestAnimationFrame(f);else{trail.forEach(x=>x.remove());halo.remove();ripple(q,c,g);A[b].outer.classList.remove('ping');void A[b].outer.getBoundingClientRect();A[b].outer.classList.add('ping')}})(st);
}
function ripple(P,c,g){const r=E('circle',{class:'rip rs-'+c,cx:P[0],cy:P[1],r:6},fx());setTimeout(()=>r.remove(),650)}
let spoken=false;
function tickBar(now){if(!playing)return;elapsed=(now-startT)*speed;drawProgress();updTime();
  if(elapsed>=dur&&(!voice||spoken)){next(true);return}raf=requestAnimationFrame(tickBar)}

// Concept notes under the player: definition, key terms, notes and interview questions for the current episode
let notesFor=null;
let curTopic=null;
function renderNotes(force){const N=window.__NOTES,box=$('notes');if(!N||!box||!ep)return;const key=curTopic?curTopic.id:ep.id,d=N[key];if(!d){box.innerHTML='';return}
  if(!force&&notesFor===key)return;notesFor=key;
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const title=curTopic?curTopic.title:ep.name.replace(/^Episode \d+ · /,''),eyebrow=curTopic?`Additional topic · ${window.__EXTRA.indexOf(curTopic)+1} of ${window.__EXTRA.length}`:`Concept notes · Episode ${ep.n||EPS.indexOf(ep)+1} of ${EPS.length}`;
  box.innerHTML=`<header class="nh"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2></header>
<div class="ngrid">
<article class="nc ndef"><h3>What is it?</h3><p>${esc(d.def)}</p><h4>Key terms</h4><dl>${d.terms.map(t=>`<div><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl></article>
<article class="nc nnotes"><h3>Notes to remember</h3><ul>${d.notes.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></article>
</div>
<article class="nc nq"><div class="nqh"><h3>Interview questions <span>${d.qs.length}</span></h3><button type="button" class="go" id="nq-all">Expand all</button></div>
<div class="nql">${d.qs.map((q,i)=>`<details><summary><i>${String(i+1).padStart(2,'0')}</i><span>${esc(q[0])}</span></summary><p>${esc(q[1])}</p></details>`).join('')}</div>
<p class="nsrc">Questions reflect topics that recur across public system design interview guides and question banks (DesignGurus, techinterview.org, PracHub, KodeKloud and others). Answers are short talking points; add your own numbers and examples.</p></article>`;
  const all=$('nq-all');all.onclick=()=>{const ds=box.querySelectorAll('.nql details'),open=[...ds].some(x=>!x.open);ds.forEach(x=>x.open=open);all.textContent=open?'Collapse all':'Expand all'}}

function markExtra(){const x=$('extra');if(!x)return;[...x.children].forEach((b,i)=>{const on=!!curTopic&&window.__EXTRA[i]===curTopic;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}
function buildExtra(){const x=$('extra'),E2=window.__EXTRA;if(!x||!E2||x.children.length)return;
  if(!E2.length){x.hidden=true;const l=$('extra-lbl');if(l)l.hidden=true;return}
  E2.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<i></i><b></b>';b.querySelector('i').textContent=String(EPS.length+i+1).padStart(2,'0');b.querySelector('b').textContent=t.title;b.title=t.sub;
    b.onclick=()=>{curTopic=t;renderNotes(true);window.__setPage&&window.__setPage('topic')};x.appendChild(b)});markExtra()}
window.addEventListener('notes-ready',()=>{renderNotes(true);buildExtra()});
function doneSet(){try{return new Set(JSON.parse(localStorage.getItem('sd-done')||'[]'))}catch(e){return new Set()}}
function updStats(){if(!ep)return;renderNotes();const f=t=>{t=Math.round(t/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const T=total(),p=Math.min(100,Math.round((before(cur)+Math.min(elapsed,dur))/T*100)),d=doneSet(),set=(id,v)=>{const e=$(id);if(e&&e.textContent!==v)e.textContent=v};
set('st-name',ep.name.replace(/^Episode \d+ · /,''));set('st-len',f(T));set('st-scenes',ep.scenes.length+' scenes');set('st-ep','Episode '+(EPS.indexOf(ep)+1)+' of '+EPS.length);
set('st-pct',p+'%');const b=$('st-fill');if(b)b.style.transform='scaleX('+p/100+')';
set('st-done',String(d.size));set('st-done2',String(d.size));set('st-left',String(EPS.length-d.size));set('st-cur',(cur+1)+' / '+ep.scenes.length);
const dots=$('st-dots');if(dots){if(!dots.children.length)EPS.forEach(()=>dots.appendChild(document.createElement('i')));[...dots.children].forEach((x,k)=>x.className=d.has(EPS[k].n)?'on':(EPS[k]===ep?'cur':''))}
renderOverview();const pb=$('st-play');if(pb)pb.textContent=playing?'Pause':(elapsed>0?'Continue watching':'Start watching')}
function renderOverview(){const l=$('ov-list');if(!l)return;const d=doneSet(),sd=e=>e.scenes.reduce((a,x)=>a+sceneDur(x),0),f=t=>{t=Math.round(t/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
if(!l.children.length)EPS.forEach((e,i)=>{const li=document.createElement('li');li.innerHTML='<i></i><div><b></b><span></span></div><em></em><button type="button" class="go"></button>';li.querySelector('i').textContent=String(i+1).padStart(2,'0');li.querySelector('b').textContent=e.name.replace(/^Episode \d+ · /,'');li.querySelector('span').textContent=e.sub;li.querySelector('em').textContent=e.scenes.length+' scenes · '+f(sd(e));li.querySelector('button').onclick=()=>{EPI=i;load(i,false);document.querySelectorAll('#tabs button')[i].click()};l.appendChild(li)});
[...l.children].forEach((li,i)=>{const dn=d.has(EPS[i].n);li.classList.toggle('done',dn);li.querySelector('button').textContent=dn?'Watch again':'Watch'});
const n=d.size,p=Math.round(n/EPS.length*100);$('ov-count').textContent=n+' of '+EPS.length+' finished';$('ov-pct').textContent=p+'%';$('ov-ring').setAttribute('stroke-dasharray',p+' '+(100-p));$('ov-ring').style.opacity=p?1:0;$('ov-sub').textContent=n?(EPS.length-n)+' episodes to go':'Finish an episode to fill the ring.'}
function markDone(){const d=doneSet();d.add(ep.n);try{localStorage.setItem('sd-done',JSON.stringify([...d]))}catch(e){}updStats()}
function updTime(){updStats();const f=t=>{t=Math.round(t/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};$('time').textContent=f((before(cur)+Math.min(elapsed,dur))/speed)+' / '+f(total()/speed)}
function speak(t,g){spoken=false;try{const ss=window.speechSynthesis;if(!ss){spoken=true;return}ss.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=speed;
  const vs=ss.getVoices();const v=vs.find(v=>/en-IN/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang));if(v)u.voice=v;u.onend=()=>{if(g===gen)spoken=true};u.onerror=()=>{spoken=true};ss.speak(u);
  setTimeout(()=>{if(g===gen)spoken=true},t.length*110+4000)}catch(e){spoken=true}}
function play(){playing=true;lbl($('bplay'),'pause','Pause');$('player').classList.add('playing');const keep=elapsed;show(cur);if(keep&&keep<dur){elapsed=keep;startT=performance.now()-keep/speed}}
function pause(){const keep=elapsed;stop();elapsed=keep;drawProgress();updTime()}
function stop(){playing=false;cancelAnimationFrame(raf);try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}lbl($('bplay'),'play','Play');if($('player'))$('player').classList.remove('playing')}
function next(auto){if(cur<ep.scenes.length-1)show(cur+1);else if(auto){stop();elapsed=dur;drawProgress();markDone();updTime()}}
function go(k){show(k)}
$('st-play')&&($('st-play').onclick=()=>$('bplay').click());
$('bplay').onclick=()=>{if(playing){pause();userPaused=true}else{userPaused=false;if(cur===ep.scenes.length-1&&elapsed>=dur){cur=0;elapsed=0}play()}};
$('bprev').onclick=()=>show(Math.max(0,cur-1));$('bnext').onclick=()=>show(Math.min(ep.scenes.length-1,cur+1));
$('brestart').onclick=()=>{cur=0;elapsed=0;userPaused=false;if(playing)show(0);else play()};
$('bspeed').onclick=()=>{speed=speed===1?1.5:speed===1.5?.75:1;lbl($('bspeed'),'speed',speed+'×');show(cur)};
lbl($('bplay'),'play','Play');lbl($('bprev'),'back','Back');lbl($('bnext'),'next','Next');lbl($('brestart'),'restart','Restart');lbl($('bspeed'),'speed','1×');lbl($('bvoice'),'volOff','Voice off');
const vb=$('bvoice');if(!('speechSynthesis' in window))vb.hidden=true;
vb.onclick=()=>{voice=!voice;vb.classList.toggle('on',voice);vb.setAttribute('aria-pressed',voice);lbl(vb,voice?'volOn':'volOff',voice?'Voice on':'Voice off');if(!voice){try{speechSynthesis.cancel()}catch(e){}spoken=true}show(cur)};
document.querySelector('.screen').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();$('bnext').click()}else if(e.key==='ArrowLeft'){e.preventDefault();$('bprev').click()}else if(e.key===' '){e.preventDefault();$('bplay').click()}});
const tabs=$('tabs');EPS.forEach((e,i)=>{if(i===12){const h=document.createElement('p');h.className='lbl';h.setAttribute('role','presentation');h.textContent='ADDITIONAL TOPICS';tabs.appendChild(h)}const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.innerHTML=`<i>${String(i+1).padStart(2,'0')}</i><b></b><span></span>`;b.querySelector('b').textContent=e.name.replace(/^Episode \d+ · /,'');b.querySelector('span').textContent=e.sub+' · '+e.scenes.length+' scenes';b.onclick=()=>{EPI=i;load(i,playing)};tabs.appendChild(b)});
let EPI=0;
function setView(m){if(m===MODE)return;MODE=m;try{localStorage.setItem('sd-view',m)}catch(e){}const k=cur,wp=playing;load(EPI,false);show(k,true);if(wp)play();syncView()}
function syncView(){document.querySelectorAll('#view button').forEach(b=>{const on=b.dataset.v===MODE;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}
document.querySelectorAll('#view button').forEach(b=>b.onclick=()=>setView(b.dataset.v));syncView();
{const m=/^#ep(\d+)$/.exec(location.hash||'');const ix=m?EPS.findIndex(e=>e.n===+m[1]):-1;EPI=ix>=0?ix:0;}
load(EPI,false);
if(!RM&&'IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting&&!seen&&!userPaused){seen=true;play()}else if(!en.isIntersecting&&playing)pause()}),{threshold:.5}).observe($('player'));
// Overview (dashboard) vs episode player
{const wrap=document.querySelector('.wrap'),ov=$('nav-overview');
const setPage=v=>{wrap.dataset.view=v;ov.classList.toggle('on',v==='overview');ov.setAttribute('aria-pressed',v==='overview');if(v!=='topic'&&curTopic){curTopic=null;renderNotes(true)}markExtra();if(v!=='video'&&playing)pause();if(v==='video'||v==='topic')window.scrollTo(0,0)};
window.__setPage=setPage;
ov.onclick=()=>setPage('overview');
$('tabs').addEventListener('click',()=>setPage('video'),true);
const sp=$('st-play');if(sp)sp.addEventListener('click',()=>setPage('video'),true);
if(location.hash==='#overview')setPage('overview')}
// Mobile drawer
{const root=document.documentElement,mb=$('menu'),sc=$('scrim'),sb=$('sidebar');
const set=o=>{root.classList.toggle('nav-open',o);mb.setAttribute('aria-expanded',o);mb.setAttribute('aria-label',o?'Close menu':'Open menu');sc.hidden=!o;if(o){const a=sb.querySelector('.tabs button.on')||sb.querySelector('.mi');a&&a.focus&&a.focus({preventScroll:true})}else if(document.activeElement&&sb.contains(document.activeElement))mb.focus()};
mb.onclick=()=>set(!root.classList.contains('nav-open'));sc.onclick=()=>set(false);
sb.addEventListener('click',e=>{if(e.target.closest('.tabs button,.mi'))set(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('nav-open'))set(false)});
matchMedia('(min-width:1081px)').addEventListener('change',e=>{if(e.matches)set(false)})}
buildExtra();
})();
