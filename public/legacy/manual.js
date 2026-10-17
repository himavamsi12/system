(function(){
"use strict";
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
function sv(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function layer(svg){let g=svg.querySelector(':scope > g.fx');if(!g)g=sv('g',{class:'fx'},svg);return g}
const wait = ms => new Promise(r=>setTimeout(r,ms));

/* one packet travelling along an SVG path */
function fly(svg,d,c,o){
  o=o||{}; c=c||'a';
  const du=(o.du||1.1)*1000, alive=o.alive||(()=>true);
  if(RM) return wait((o.dl||0)*1000+du*.3);
  const g=layer(svg);
  const p=sv('path',{d:d,fill:'none',stroke:'none'},g);
  const L=p.getTotalLength();
  const halo=sv('circle',{r:9,class:'pk-'+c,opacity:0},g);
  const dot=sv('circle',{r:4.6,class:'pk-'+c,opacity:0},g);
  const start=performance.now()+(o.dl||0)*1000;
  return new Promise(res=>{
    function f(now){
      if(!alive()){halo.remove();dot.remove();p.remove();return res(false)}
      let t=(now-start)/du;
      if(t<0){requestAnimationFrame(f);return}
      if(t>1)t=1;
      const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      const pt=p.getPointAtLength(e*L);
      const op=t>.88?(1-t)/.12:Math.min(1,t*8);
      dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.setAttribute('opacity',op);
      halo.setAttribute('cx',pt.x);halo.setAttribute('cy',pt.y);halo.setAttribute('opacity',op*.28);
      if(t<1)requestAnimationFrame(f);else{halo.remove();dot.remove();p.remove();res(true)}
    }
    requestAnimationFrame(f);
  });
}
function rectAt(svg,x,y){
  let best=null,ba=1e12;
  svg.querySelectorAll('rect,path.na').forEach(r=>{
    if(r.classList.contains('dot')||r.closest('defs')||r.closest('g.fx'))return;
    const b=r.getBBox();
    if(x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height){const a=b.width*b.height;if(a<ba){ba=a;best=r}}
  });
  return best;
}
function onView(node,cb){
  if(!('IntersectionObserver' in window)){cb(true);return}
  new IntersectionObserver(es=>es.forEach(e=>cb(e.isIntersecting)),{threshold:.35}).observe(node);
}

/* ---------- step-by-step scenes for every diagram ----------
   step: t title, s narration, hl highlight points, bad red points,
   go: [pathD, color, count, delaySec, durationSec]                      */
const S={
t1:[
 {t:"It starts with one server",s:"Every user's request goes to a single small machine with 4 CPUs and 8 GB of RAM. For a few thousand users this is perfectly fine.",hl:[[90,130]],go:[["M0,105 L40,118","a",3],["M0,155 L40,142","a",3,.15]]},
 {t:"Traffic grows: buy a bigger machine",s:"The easiest fix is vertical scaling: move the same code to a much bigger server. No code changes needed, so teams always try this first.",hl:[[270,130]],go:[["M145,130 L196,130","a",3,0,.9]]},
 {t:"But a big machine has two problems",s:"There is a maximum size you can buy, and it is still one machine. If it crashes or is being upgraded, every single user is down. That is a single point of failure.",bad:[[270,130]]},
 {t:"Scale out instead",s:"Horizontal scaling puts several ordinary servers behind a load balancer. Users only ever talk to the load balancer's address.",hl:[[460,130]],go:[["M385,130 L409,130","a",4]]},
 {t:"The load balancer spreads the work",s:"Each request goes to a different server. If you need more capacity, you just add Server 4, Server 5, and so on. If one dies, the others keep serving.",hl:[[660,65],[660,130],[660,195]],go:[["M510,125 L597,67","a",2],["M510,130 L597,130","a",2,.2],["M510,135 L597,193","a",2,.4]]},
 {t:"The rule that makes it work: stateless servers",s:"Because a user's next click may land on a different server, servers must not keep login sessions or carts in their own memory. Put that state in Redis or a token, and any server can serve anyone.",hl:[[660,65],[660,130],[660,195]]}
],
t2:[
 {t:"You tap “Place order”",s:"Your phone knows the name swiggy.com but not where that computer is on the internet. It first needs an IP address.",hl:[[63,91]]},
 {t:"DNS turns the name into an address",s:"Your phone asks a DNS resolver, which replies with an IP like 13.235.4.8. The answer is cached for minutes, so most of the time this step is instant.",hl:[[193,91]],go:[["M70,84 L188,84","a",1,0,.8],["M188,98 L70,98","g",1,.9,.8]]},
 {t:"Images and code come from a nearby CDN",s:"Static files like product photos and JavaScript are served from a CDN edge server in a city close to you, so they load in a few milliseconds instead of crossing the world.",hl:[[323,91]],go:[["M63,122 C150,150 250,150 323,122","g",3,0,1.2]]},
 {t:"The API request reaches the gateway",s:"The actual order goes over HTTPS (encrypted with TLS) to the API gateway. It checks your login token and makes sure you are not sending too many requests.",hl:[[453,91]],go:[["M63,122 C200,165 380,165 453,122","a",1,0,1.3]]},
 {t:"The service runs the business logic",s:"The order service validates the cart, calculates the total and decides what to save.",hl:[[583,91]],go:[["M453,91 L583,91","a",1,0,.8]]},
 {t:"The database stores it, and the answer travels back",s:"The order is written to the database. The response travels back along the same route to your phone, usually in under 200 ms in total.",hl:[[713,91]],go:[["M583,91 L713,91","a",1,0,.7],["M713,105 C500,140 250,140 63,110","g",1,.8,1.4]]}
],
t3:[
 {t:"Many users, one address",s:"All users send requests to the load balancer. They never need to know how many servers exist behind it.",hl:[[305,130]],go:[["M120,60 L227,118","a",2],["M120,130 L227,130","a",2,.2],["M120,200 L227,142","a",2,.4]]},
 {t:"Health checks every few seconds",s:"The load balancer quietly calls GET /health on each server. Healthy servers answer “OK”.",go:[["M380,118 L517,55","y",1,0,.7],["M380,130 L517,130","y",1,0,.7],["M380,142 L517,205","y",1,0,.7],["M517,55 L380,118","g",1,.8,.7],["M517,130 L380,130","g",1,.8,.7]],hl:[[595,53],[595,130]]},
 {t:"Server 3 stops answering",s:"Server 3 times out twice in a row, so the load balancer marks it unhealthy and stops sending it traffic. Users never see an error.",bad:[[595,207]]},
 {t:"Least connections picks the least busy server",s:"Server 1 has 40 open connections, Server 2 only 12, so new requests go to Server 2 until the load evens out.",hl:[[595,130]],go:[["M380,130 L517,130","a",4],["M380,118 L517,55","a",1,.6]]},
 {t:"And if the load balancer itself dies?",s:"A standby load balancer watches the active one. If it fails, the standby takes over the same IP address within seconds, so the load balancer is never a single point of failure.",hl:[[305,217]]}
],
t4:[
 {t:"A request for product 42 arrives",s:"The app server needs the product's name, price and photos. It could ask the database every time, but that is slow and expensive.",hl:[[100,132]]},
 {t:"Step 1: check the cache first",s:"The app asks Redis for the key product:42. Redis keeps data in RAM, so the answer comes back in about 1 millisecond.",hl:[[410,56]],go:[["M170,112 L327,52","a",1,0,.8]]},
 {t:"Cache HIT: done in 1 ms",s:"The data is there, so it is returned immediately. The database is not touched at all. On a busy site 90–99% of reads end here.",hl:[[410,56]],go:[["M327,78 L172,132","g",1,0,.8]]},
 {t:"Cache MISS: product 99 was never requested",s:"This time the key is not in Redis. The app has to go to the database, which takes 10–50 ms.",bad:[[410,56]],go:[["M170,112 L327,52","a",1,0,.6],["M170,152 L327,200","a",1,.7,.9]]},
 {t:"Save the result for next time",s:"The database answers, and the app stores the result in Redis with a TTL (time to live) of 10 minutes. The next request for product 99 will be a hit.",hl:[[410,206],[410,56]],go:[["M327,212 L172,158","g",1,0,.8],["M410,175 L410,90","a",1,.9,.7]]},
 {t:"When the price changes",s:"On every update we write to the database and then delete the cache key. The next read misses once, loads the fresh price, and the cache is correct again.",hl:[[410,206]],bad:[[410,56]]}
],
t5:[
 {t:"All writes go to the primary",s:"Inserts and updates always go to one database called the primary, so there is one source of truth.",hl:[[240,66]],go:[["M100,130 L167,70","a",3]]},
 {t:"The primary copies changes to replicas",s:"Every change is streamed to read replicas, usually within milliseconds. This copy is called replication.",hl:[[240,159],[240,239]],go:[["M310,66 C350,66 350,158 312,158","y",2,0,1],["M310,66 C370,66 370,238 312,238","y",2,.2,1.2]]},
 {t:"Reads are spread across replicas",s:"Most apps read 10–100× more than they write, so sending reads to replicas multiplies read capacity. The catch: a replica may be a few ms behind the primary.",hl:[[240,159],[240,239]],go:[["M100,150 L167,158","g",3],["M100,160 L167,235","g",3,.2]]},
 {t:"When writes outgrow one machine: shard",s:"Sharding splits the data itself. A router computes hash(user_id) % 3 to decide which of three databases holds each user.",hl:[[495,149]],go:[["M412,149 L430,149","a",1,0,.4]]},
 {t:"User 42 → Shard 0, user 7 → Shard 1, user 11 → Shard 2",s:"Each shard holds only a third of the users, so each takes a third of the writes. Queries that include user_id go straight to one shard.",hl:[[690,65],[690,150],[690,235]],go:[["M560,140 L617,66","a",1],["M560,149 L617,150","g",1,.5],["M560,158 L617,234","y",1,1]]},
 {t:"Each shard is replicated too",s:"In production every shard has its own primary and replicas. Sharding is powerful but makes cross-user queries and re-balancing hard, so it is the last step, not the first.",hl:[[690,65],[690,150],[690,235]]}
],
t6:[
 {t:"The client writes x = 5",s:"The value is stored on 3 nodes (N = 3) so that losing one machine never loses data. The write is sent to all three.",go:[["M100,122 L187,62","a",1,0,.8],["M100,132 L187,132","a",1,0,.8],["M100,142 L187,203","a",1,0,2.2]]},
 {t:"Two acknowledgements are enough",s:"Node A and Node B confirm. With W = 2, the client is told “success” without waiting for slow Node C.",hl:[[255,59],[255,132]],go:[["M187,62 L100,122","g",1,0,.7],["M187,132 L100,132","g",1,0,.7]]},
 {t:"Reads also ask two nodes",s:"A read asks R = 2 nodes and keeps the newest version. Because R + W (4) is greater than N (3), at least one node in every read has the latest write.",hl:[[255,205]]},
 {t:"A saga: placing an order across services",s:"Order, payment and inventory are separate services with separate databases. Each step commits on its own: the order is created, then the card is charged.",hl:[[445,75],[580,75]],go:[["M445,75 L580,75","g",1],["M580,75 L707,75","g",1,1.1]]},
 {t:"Inventory says: out of stock",s:"The third step fails. We cannot roll back with one database transaction because the data lives in three different databases.",bad:[[707,75]]},
 {t:"Compensate in reverse order",s:"The saga runs undo steps: refund the card, then cancel the order. The customer is told “out of stock, money refunded”. Every step is idempotent so retries are safe.",hl:[[580,185],[445,185]],go:[["M707,100 C707,185 660,185 638,185","b",1,0,1],["M525,185 L503,185","b",1,1.1,.6]]}
],
t7:[
 {t:"Services publish events and move on",s:"After saving an order, the order service publishes “OrderPlaced” to Kafka and immediately answers the user. It doesn't wait for emails or analytics.",hl:[[70,79],[70,164]],go:[["M130,79 L197,105","a",2],["M130,164 L197,140","a",2,.3]]},
 {t:"Events land in partitions by key",s:"The order_id decides the partition, so all events for the same order stay in one partition, in order. Partitions let Kafka spread load across machines.",hl:[[330,85],[330,133],[330,181]],go:[["M205,110 L340,85","a",1,0,.9],["M205,128 L320,133","a",1,.2,.9],["M205,140 L320,181","a",1,.4,.9]]},
 {t:"The email worker reads at its own pace",s:"The “notify” consumer group reads new events and sends confirmation emails. It remembers its position with an offset.",hl:[[615,54]],go:[["M460,95 L537,57","g",3]]},
 {t:"Analytics reads the same events independently",s:"A second consumer group gets every event too, with its own offset. Adding a new consumer never affects the existing ones.",hl:[[615,124]],go:[["M460,125 L537,125","g",3]]},
 {t:"A broken message goes to the dead-letter queue",s:"If one event keeps failing after 3 retries, it is moved aside so it doesn't block the rest. An engineer is alerted to inspect it.",bad:[[615,214]],go:[["M690,60 C750,60 750,214 693,214","b",1,0,1.2]]},
 {t:"Spikes are absorbed, nothing is lost",s:"If 10× orders arrive, the topic simply grows and workers catch up. Events are kept for days, so a fixed consumer can even replay old ones.",hl:[[330,125]]}
],
t8:[
 {t:"A monolith: one app does everything",s:"Users, orders and payments are modules in one codebase, deployed together, sharing one database. Simple and fast to build.",hl:[[120,135]],go:[["M120,40 L120,190","a",3,0,1.4]]},
 {t:"Microservices: the gateway is the front door",s:"Clients call one API gateway. It handles login checks and routing, so services don't each reimplement them.",hl:[[415,137]],go:[["M300,137 L415,137","a",2]]},
 {t:"Each request goes to the service that owns it",s:"/users goes to the user service, /orders to the order service, /pay to payments. Each can be scaled and deployed independently.",hl:[[570,57],[570,137],[570,217]],go:[["M470,125 L507,60","a",1],["M470,137 L507,137","a",1,.3],["M470,149 L507,214","a",1,.6]]},
 {t:"Each service owns its own database",s:"No service reads another's tables. That keeps teams independent, but it means no joins across services.",hl:[[710,57],[710,137],[710,217]],go:[["M630,57 L700,57","g",1],["M630,137 L700,137","g",1,.2],["M630,217 L700,217","g",1,.4]]},
 {t:"Services share news through events",s:"When an order is placed, the order service publishes an event on the bus. Payments, notifications and analytics react to it without being called directly.",hl:[[560,277]],go:[["M545,159 C500,190 500,240 520,262","g",1,0,1],["M520,277 L740,277","g",2,1,1.1]]}
],
t9:[
 {t:"The bucket refills at a steady rate",s:"Each user gets a bucket of up to 20 tokens. 10 new tokens drip in every second. Tokens beyond 20 overflow and are lost.",hl:[[100,150]],go:[["M100,40 L100,165","a",3,0,1]]},
 {t:"Each request spends one token",s:"A request takes a token and is allowed through. Because the bucket can hold 20, short bursts are fine.",go:[["M165,150 L215,150","g",3]]},
 {t:"Bucket empty: 429 Too Many Requests",s:"A script firing 100 requests a second empties the bucket. Extra requests are rejected instantly, protecting the servers behind.",bad:[[100,150]],go:[["M165,197 L215,197","b",3]]},
 {t:"Circuit breaker: CLOSED means normal",s:"Calls to the payment provider pass through while the breaker counts errors.",hl:[[450,97]]},
 {t:"Too many errors: the breaker OPENS",s:"Half the calls in 10 seconds failed. The breaker opens and returns a fallback instantly, instead of making every user wait 30 seconds for a timeout.",bad:[[695,97]],go:[["M515,88 L627,88","b",1,0,.9]]},
 {t:"After 30 s: HALF-OPEN, one test call",s:"The breaker lets a single request through to see if the provider has recovered.",hl:[[570,217]],go:[["M695,124 L625,192","y",1,0,.9]]},
 {t:"Test succeeds: back to CLOSED",s:"Traffic flows normally again. If the test had failed, the breaker would go back to OPEN and wait again.",hl:[[450,97]],go:[["M520,195 L470,127","g",1,0,.9]]}
],
t10:[
 {t:"The user picks a photo to upload",s:"A 5 MB photo should not pass through our app servers: that wastes their bandwidth and memory.",hl:[[65,65]]},
 {t:"Ask the app server for permission",s:"The app checks the user is allowed, then creates a presigned URL: a link to S3 that only allows uploading one file for 5 minutes.",hl:[[265,65]],go:[["M120,58 L197,58","a",1,0,.6],["M197,74 L122,74","g",1,.7,.6]]},
 {t:"Upload straight to object storage",s:"The phone sends the file directly to S3. Our servers never touch the bytes, so a million uploads don't slow down the API.",hl:[[495,65]],go:[["M65,90 C65,135 495,135 495,93","a",3,0,1.4]]},
 {t:"The CDN serves it worldwide",s:"Other users load the photo from a CDN edge near them; S3 is only read once per edge.",hl:[[702,65]],go:[["M570,65 L637,65","g",2]]},
 {t:"Search index: a copy that follows the database",s:"When a product changes in the database, a change-data-capture tool streams the change to Elasticsearch within seconds.",hl:[[275,227],[490,227]],go:[["M140,227 L197,227","a",1],["M350,227 L407,227","a",1,.8]]},
 {t:"Searching “red shoes”",s:"The search API queries the inverted index, which instantly finds documents containing both words, ranks them and returns results. Typos are handled with fuzzy matching.",hl:[[490,227]],go:[["M627,220 L573,220","a",1,0,.6],["M573,236 L627,236","g",1,.7,.6]]}
],
t11:[
 {t:"Log in once",s:"The user enters their password (or uses Google sign-in) with the auth server, never with every service.",hl:[[305,49]],go:[["M100,105 L217,48","a",1,0,.9]]},
 {t:"Receive two tokens",s:"A short-lived access token (15 minutes) and a long-lived refresh token. The access token is a signed JWT containing the user ID and role.",hl:[[612,84]],go:[["M217,66 L120,120","g",1,0,.9]]},
 {t:"Every request carries the token",s:"The app adds Authorization: Bearer &lt;token&gt; to each API call. No password is sent again.",hl:[[305,219]],go:[["M100,159 L217,212","a",2]]},
 {t:"The gateway verifies the signature",s:"Using the auth server's public key, the gateway checks the token is genuine and not expired. No database lookup is needed, which is why JWTs scale well.",hl:[[305,219],[612,84]]},
 {t:"The service checks ownership",s:"Authentication said who you are. The order service still checks authorization: does order 42 belong to user_42? If not, 403 Forbidden.",hl:[[555,219]],go:[["M390,219 L477,219","g",1]]},
 {t:"After 15 minutes the token expires",s:"The gateway answers 401. The app silently uses the refresh token to get a new access token. Short expiry limits the damage if a token is stolen.",bad:[[305,219]],go:[["M217,212 L100,159","b",1,0,.8]]}
],
t12:[
 {t:"Every service emits telemetry",s:"Each service sends metrics (numbers), logs (events) and traces (request journeys) using the OpenTelemetry standard.",go:[["M130,57 L207,120","a",2],["M130,132 L207,132","a",2,.2],["M130,207 L207,144","a",2,.4]],hl:[[285,132]]},
 {t:"The collector sorts it",s:"Metrics go to Prometheus, logs to Loki or Elasticsearch, and traces to Jaeger or Tempo.",hl:[[520,55],[520,132],[520,209]],go:[["M360,122 L427,57","a",1],["M360,132 L427,132","y",1,.2],["M360,142 L427,207","g",1,.4]]},
 {t:"Grafana shows it all in one place",s:"Engineers watch dashboards for latency, traffic, errors and saturation, the four golden signals.",hl:[[715,107]],go:[["M610,57 L657,100","a",1],["M610,132 L657,110","y",1,.2],["M610,209 L657,120","g",1,.4]]},
 {t:"Error rate crosses 1%: page the on-call engineer",s:"An alert rule fires and PagerDuty calls the on-call engineer. Alerts are based on what users feel, not on every CPU blip.",bad:[[715,197]],go:[["M715,134 L715,167","b",2]]},
 {t:"The trace shows exactly where it broke",s:"Because every request carries a trace_id, the engineer opens one slow request and sees it spent 4 seconds waiting on the payment service.",hl:[[520,209]]}
],
pb:[
 {t:"Static files come from the CDN",s:"Images, CSS and JavaScript are served from the CDN, so most bytes never reach your servers.",hl:[[170,65]],go:[["M100,135 L122,72","g",2]]},
 {t:"API calls enter through the load balancer and gateway",s:"The load balancer picks a healthy instance; the gateway checks auth and rate limits, then routes to the right service.",hl:[[170,143],[290,143]],go:[["M100,143 L237,143","a",2,0,1],["M340,143 L367,143","a",2,1,.5]]},
 {t:"Reads try the cache first",s:"Hot data is answered from Redis in about a millisecond.",hl:[[585,55]],go:[["M490,80 L527,57","g",2]]},
 {t:"Writes go to the primary database",s:"The source of truth, with replicas for extra reads and failover.",hl:[[585,123]],go:[["M490,143 L527,123","a",2]]},
 {t:"Slow work becomes an event",s:"Emails, search indexing and analytics are published to Kafka, processed by workers, which also update the search index and files in S3.",hl:[[585,190],[720,190],[720,123]],go:[["M490,206 L527,190","y",1],["M640,190 L667,190","y",1,.7],["M720,170 L720,149","y",1,1.3,.6]]},
 {t:"Around everything: the safety net",s:"Rate limits, timeouts with circuit breakers, authentication, telemetry and multiple availability zones apply to every box. Mention them in every answer.",hl:[[505,270]]}
]};

function Player(fig,steps){
  const svg=fig.querySelector('svg');
  let i=0,playing=false,gen=0,timer=null,userPaused=false;
  const ui=document.createElement('div');ui.className='player';
  ui.innerHTML='<div class="pc"><button type="button" class="pb-play">▶ Play</button><button type="button" class="pb-prev" aria-label="Previous step">‹</button><div class="chips"></div><button type="button" class="pb-next" aria-label="Next step">›</button></div><div class="pbar"><i></i></div><div class="nar" aria-live="polite"><p class="nar-k"></p><p class="nar-t"></p><p class="nar-s"></p></div>';
  const cap=fig.querySelector('figcaption'); fig.insertBefore(ui,cap);
  const chips=ui.querySelector('.chips'),btn=ui.querySelector('.pb-play'),bar=ui.querySelector('.pbar i');
  steps.forEach((s,k)=>{const b=document.createElement('button');b.type='button';b.textContent=k+1;b.setAttribute('aria-label','Step '+(k+1)+': '+s.t);b.onclick=()=>show(k);chips.appendChild(b)});
  function clear(){svg.querySelectorAll('.hot,.hotb').forEach(r=>r.classList.remove('hot','hotb'))}
  function show(k){
    gen++;const g=gen;clearTimeout(timer);clear();i=k;const s=steps[k];
    (s.hl||[]).forEach(p=>{const r=rectAt(svg,p[0],p[1]);if(r)r.classList.add('hot')});
    (s.bad||[]).forEach(p=>{const r=rectAt(svg,p[0],p[1]);if(r)r.classList.add('hotb')});
    ui.querySelector('.nar-k').textContent='Step '+(k+1)+' of '+steps.length;
    ui.querySelector('.nar-t').textContent=s.t;
    ui.querySelector('.nar-s').innerHTML=s.s;
    [...chips.children].forEach((b,j)=>b.classList.toggle('on',j===k));
    bar.style.width=((k+1)/steps.length*100)+'%';
    let dur=0;
    (s.go||[]).forEach(a=>{const n=a[2]||1,dl=a[3]||0,du=a[4]||1.1;
      for(let j=0;j<n;j++)fly(svg,a[0],a[1],{dl:dl+j*.28,du:du,alive:()=>g===gen});
      dur=Math.max(dur,dl+(n-1)*.28+du)});
    if(playing){const read=Math.max(3200,s.s.length*42);
      timer=setTimeout(()=>{if(g===gen)show((i+1)%steps.length)},Math.max(dur*1000+1000,read))}
  }
  function play(){playing=true;btn.textContent='❚❚ Pause';show(i)}
  function pause(){playing=false;clearTimeout(timer);btn.textContent='▶ Play'}
  btn.onclick=()=>{if(playing){pause();userPaused=true}else{userPaused=false;play()}};
  ui.querySelector('.pb-prev').onclick=()=>show((i-1+steps.length)%steps.length);
  ui.querySelector('.pb-next').onclick=()=>show((i+1)%steps.length);
  show(0);
  if(!RM)onView(fig,v=>{if(v&&!userPaused&&!playing)play();else if(!v&&playing)pause()});
}

document.querySelectorAll('section').forEach(sec=>{
  const key=sec.id==='playbook'?'pb':sec.id;const fig=sec.querySelector('figure.dg');
  if(fig&&S[key])Player(fig,S[key]);
});

/* ---------- live hero ---------- */
(function(){
  const fig=document.getElementById('live');if(!fig||RM)return;const svg=fig.querySelector('svg');let vis=true;
  onView(fig,v=>vis=v);
  const srv=[["M280,60 L342,25",23],["M280,66 L342,66",66],["M280,72 L342,108",109]];
  async function req(){
    const k=Math.floor(Math.random()*3),y=srv[k][1];
    await fly(svg,"M60,66 L225,66",'a',{du:.7});
    await fly(svg,`M225,66 L403,${y}`,'a',{du:.6});
    const r=Math.random();
    if(r<.7){await fly(svg,`M403,${y} L595,32`,'a',{du:.6});await fly(svg,`M595,32 L403,${y}`,'g',{du:.6})}
    else{await fly(svg,`M403,${y} L595,100`,'a',{du:.7});await fly(svg,`M595,100 L403,${y}`,'g',{du:.7});
      if(r>.85)fly(svg,`M403,${y} C560,${y} 640,66 716,66`,'y',{du:1})}
  }
  (function loop(){if(vis&&document.visibilityState==='visible')req();setTimeout(loop,380)})();
})();

/* ---------- simulators ---------- */
function panel(after,html){const d=document.createElement('div');d.className='sim';d.innerHTML=html;after.after(d);return d}
function stat(id,label){return `<div class="stat"><b id="${id}">0</b><span>${label}</span></div>`}
function pushLog(log,cls,txt,max){const i=document.createElement('i');i.className=cls;i.textContent=txt;log.prepend(i);while(log.children.length>(max||28))log.lastChild.remove()}

/* Load balancer */
(function(){
  const fig=document.querySelector('#t3 figure.dg');if(!fig)return;
  const d=panel(fig,`<div class="simh"><p class="kicker">Try it yourself</p><h3>Load balancer simulator</h3><p>Requests arrive continuously. Server 3 has a slow disk, so each request takes 3× longer there. Watch its open connections pile up with round robin, then switch to least connections. Kill a server and see traffic route around it.</p></div>
  <div class="simc"><label>Algorithm <select id="lb-alg"><option value="rr">Round robin</option><option value="lc">Least connections</option><option value="rnd">Random</option></select></label>
  <button type="button" class="toggle" id="lb-kill">Kill server 2</button><button type="button" class="toggle" id="lb-spike">Traffic spike</button><button type="button" id="lb-reset">Reset counts</button></div>
  <div class="scroll"><svg viewBox="0 0 640 230" role="img" aria-label="Load balancer simulation">
  <rect class="n" x="10" y="90" width="90" height="50" rx="6"/><text class="t" x="55" y="120" text-anchor="middle">Users</text>
  <rect class="na" x="170" y="85" width="120" height="60" rx="6"/><text class="t" x="230" y="111" text-anchor="middle">Load balancer</text><text class="ts" id="lb-algt" x="230" y="129" text-anchor="middle">round robin</text>
  <g id="lb-s"></g>
  <path class="e" d="M100,115 L167,115" marker-end="url(#ar)"/>
  <path class="e" d="M290,105 L417,45" marker-end="url(#ar)"/><path class="e" d="M290,115 L417,115" marker-end="url(#ar)"/><path class="e" d="M290,125 L417,185" marker-end="url(#ar)"/>
  </svg></div>
  <div class="stats">${stat('lb-q','Requests sent')}${stat('lb-d','Dropped (503)')}${stat('lb-m','Busiest server')}</div>
  <p class="simnote" id="lb-note">Round robin ignores how busy each server is.</p>`);
  const svg=d.querySelector('svg'),g=d.querySelector('#lb-s');
  const S=[{n:'Server 1',slow:1},{n:'Server 2',slow:1},{n:'Server 3 · slow',slow:3}].map((s,k)=>{
    const y=[20,90,160][k];
    s.r=sv('rect',{class:'no',x:420,y:y,width:200,height:50,rx:6},g);
    sv('text',{class:'t',x:520,y:y+21,'text-anchor':'middle'},g).textContent=s.n;
    s.t=sv('text',{class:'ts',x:520,y:y+39,'text-anchor':'middle'},g);
    s.y=y+25;s.a=0;s.sv=0;s.dead=false;return s});
  let rr=0,sent=0,drop=0,spike=false,vis=false;
  const alg=d.querySelector('#lb-alg');
  function draw(){S.forEach(s=>{s.t.textContent=s.dead?'DOWN · health check failing':`open ${s.a} · served ${s.sv}`;
    s.r.setAttribute('class',s.dead?'nw':s.a>=8?'ny':'no')});
    d.querySelector('#lb-q').textContent=sent;d.querySelector('#lb-d').textContent=drop;
    const live=S.filter(s=>!s.dead);const m=live.sort((a,b)=>b.a-a.a)[0];d.querySelector('#lb-m').textContent=m?m.a+' open':'–'}
  function pick(){const live=S.filter(s=>!s.dead);if(!live.length)return null;const v=alg.value;
    if(v==='lc')return live.reduce((a,b)=>b.a<a.a?b:a);
    if(v==='rnd')return live[Math.floor(Math.random()*live.length)];
    for(let k=0;k<3;k++){const s=S[rr++%3];if(!s.dead)return s}return live[0]}
  async function req(){sent++;draw();
    await fly(svg,'M55,115 L230,115','a',{du:.35});
    const s=pick();if(!s){drop++;draw();fly(svg,'M230,130 L55,130','b',{du:.4});return}
    s.a++;draw();await fly(svg,`M290,115 L420,${s.y}`,'a',{du:.45});
    await wait((900+Math.random()*900)*s.slow);s.a--;s.sv++;draw()}
  function loop(){if(vis&&document.visibilityState==='visible')req();setTimeout(loop,spike?150:520)}
  onView(d,v=>vis=v);loop();
  const notes={rr:'Round robin sends every server the same number of requests, so the slow server builds a backlog of open connections.',lc:'Least connections sends new work to whichever server has the fewest requests in progress, so the slow server automatically gets less.',rnd:'Random is simple and roughly even over time, but short-term imbalance is common.'};
  alg.onchange=()=>{d.querySelector('#lb-algt').textContent=alg.options[alg.selectedIndex].text.toLowerCase();d.querySelector('#lb-note').textContent=notes[alg.value]};
  const kill=d.querySelector('#lb-kill');kill.onclick=()=>{S[1].dead=!S[1].dead;kill.classList.toggle('on',S[1].dead);kill.textContent=S[1].dead?'Revive server 2':'Kill server 2';
    d.querySelector('#lb-note').textContent=S[1].dead?'Server 2 failed its health check. The load balancer stopped sending it traffic, and no user request was dropped.':notes[alg.value];draw()};
  const sp=d.querySelector('#lb-spike');sp.onclick=()=>{spike=!spike;sp.classList.toggle('on',spike)};
  d.querySelector('#lb-reset').onclick=()=>{sent=0;drop=0;S.forEach(s=>s.sv=0);draw()};
  draw();
})();

/* Cache */
(function(){
  const fig=document.querySelector('#t4 figure.dg');if(!fig)return;
  const d=panel(fig,`<div class="simh"><p class="kicker">Try it yourself</p><h3>Cache simulator (4 slots, LRU eviction)</h3><p>Open products and watch hits and misses. Popular products stay in the cache; rarely viewed ones push out the least recently used key. Change a price to see invalidation.</p></div>
  <div class="simc"><button type="button" id="c-pop">Open a popular product</button><button type="button" id="c-any">Open a random product</button><button type="button" id="c-upd">Change P1's price</button><button type="button" class="toggle" id="c-auto">Auto traffic</button></div>
  <div class="scroll"><svg viewBox="0 0 640 240" role="img" aria-label="Cache simulation">
  <rect class="n" x="20" y="95" width="120" height="50" rx="6"/><text class="t" x="80" y="125" text-anchor="middle">App server</text>
  <rect class="na" x="250" y="12" width="230" height="134" rx="6"/><text class="t" x="365" y="32" text-anchor="middle">Redis cache · ~1 ms</text><g id="c-slots"></g>
  <rect class="n" x="250" y="176" width="230" height="50" rx="6"/><text class="t" x="365" y="198" text-anchor="middle">Database · ~30 ms</text><text class="ts" x="365" y="214" text-anchor="middle">P1 … P12, source of truth</text>
  <path class="e" d="M140,108 L247,80" marker-end="url(#ar)"/><path class="e" d="M140,132 L247,200" marker-end="url(#ar)"/>
  <text class="ts" id="c-msg" x="500" y="100">Click a button</text>
  </svg></div>
  <div class="stats">${stat('c-h','Hits')}${stat('c-m','Misses')}${stat('c-r','Hit rate')}${stat('c-l','Avg latency')}</div>
  <div class="log" id="c-log" aria-live="polite"></div>
  <p class="simnote" id="c-note">The cache starts empty, so the first requests are all misses (a “cold” cache).</p>`);
  const svg=d.querySelector('svg'),slots=d.querySelector('#c-slots'),msg=d.querySelector('#c-msg'),log=d.querySelector('#c-log');
  const SL=[0,1,2,3].map(k=>{const r=sv('rect',{class:'n',x:264,y:42+k*25,width:202,height:21,rx:4},slots);const t=sv('text',{class:'ts',x:276,y:57+k*25},slots);return{r,t}});
  let cache=[],h=0,m=0,lat=0,busy=Promise.resolve(),auto=false,vis=false;
  function draw(flash,cls){SL.forEach((s,k)=>{const key=cache[k];s.t.textContent=key?key+(k===0?'  \u00b7 most recent':k===3?'  \u00b7 evicted next':''):'(empty slot)';s.r.setAttribute('class',key===flash?cls:'n')});
    d.querySelector('#c-h').textContent=h;d.querySelector('#c-m').textContent=m;
    d.querySelector('#c-r').textContent=(h+m?Math.round(h/(h+m)*100):0)+'%';d.querySelector('#c-l').textContent=(h+m?(lat/(h+m)).toFixed(1):0)+' ms'}
  function setMsg(t){msg.textContent=t}
  function get(key){busy=busy.then(async()=>{
    setMsg('GET '+key+' …');await fly(svg,'M140,108 L250,80','a',{du:.4});
    const ix=cache.indexOf(key);
    if(ix>=0){cache.splice(ix,1);cache.unshift(key);h++;lat+=1;draw(key,'no');setMsg(key+': HIT (1 ms)');pushLog(log,'ok',key+' hit');
      await fly(svg,'M250,92 L140,118','g',{du:.4});
    }else{m++;lat+=31;draw();setMsg(key+': MISS → database');pushLog(log,'bad',key+' miss');
      await fly(svg,'M140,132 L250,200','a',{du:.5});await wait(250);await fly(svg,'M250,210 L140,140','g',{du:.5});
      await fly(svg,'M140,112 L250,84','y',{du:.35});
      cache.unshift(key);let ev='';if(cache.length>4){ev=cache.pop();}
      draw(key,'na');setMsg(ev?'stored '+key+', evicted '+ev:'stored '+key+' in cache');
      if(ev)d.querySelector('#c-note').textContent=`The cache was full, so ${ev}, the least recently used key, was evicted to make room for ${key}.`}
    await wait(150)})}
  const pop=()=>'P'+(1+Math.floor(Math.random()*3)),any=()=>'P'+(1+Math.floor(Math.random()*12));
  d.querySelector('#c-pop').onclick=()=>get(pop());d.querySelector('#c-any').onclick=()=>get(any());
  d.querySelector('#c-upd').onclick=()=>{busy=busy.then(async()=>{setMsg('UPDATE P1 price in DB');await fly(svg,'M140,132 L250,200','a',{du:.5});
    const ix=cache.indexOf('P1');if(ix>=0){draw('P1','nw');await wait(500);cache.splice(ix,1)}draw();setMsg('deleted key P1 from cache');pushLog(log,'mid','P1 invalidated');
    d.querySelector('#c-note').textContent='The price was saved in the database and the P1 key was deleted from the cache. The next read of P1 will miss once and load the new price.'})};
  const au=d.querySelector('#c-auto');au.onclick=()=>{auto=!auto;au.classList.toggle('on',auto)};
  onView(d,v=>vis=v);
  (function loop(){if(auto&&vis)get(Math.random()<.8?pop():any());setTimeout(loop,1500)})();
  draw();
})();

/* Sharding */
(function(){
  const fig=document.querySelector('#t5 figure.dg');if(!fig)return;
  const d=panel(fig,`<div class="simh"><p class="kicker">Try it yourself</p><h3>Why consistent hashing matters</h3><p>24 users are spread across shards. Add a 4th shard and count how many users must move to a different database. Moving data is slow and risky, so fewer moves is better.</p></div>
  <div class="simc"><label>Method <select id="sh-m"><option value="mod">hash(user) % N</option><option value="ring">Consistent hashing</option></select></label><button type="button" class="toggle" id="sh-add">Add a 4th shard</button></div>
  <div class="legend"><span style="--c:var(--s0)">Shard 0</span><span style="--c:var(--s1)">Shard 1</span><span style="--c:var(--s2)">Shard 2</span><span style="--c:var(--s3)" id="sh-l3" hidden>Shard 3 (new)</span></div>
  <div class="uchips" id="sh-u"></div>
  <div class="stats">${stat('sh-mv','Users moved')}${stat('sh-pc','Of all data')}</div>
  <p class="simnote" id="sh-note">Pick a method, then add a shard.</p>`);
  function h32(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}x^=x>>>15;x=Math.imul(x,2246822507);x^=x>>>13;return x>>>0}
  function ring(n){const r=[];for(let i=0;i<n;i++)for(let v=0;v<60;v++)r.push({p:h32('shard'+i+'#'+v),s:i});return r.sort((a,b)=>a.p-b.p)}
  const R={3:ring(3),4:ring(4)};
  function at(id,n,mth){const k=h32('user'+id);if(mth==='mod')return k%n;const r=R[n];for(const e of r)if(e.p>=k)return e.s;return r[0].s}
  const ids=[...Array(24)].map((_,i)=>101+i*7);
  const box=d.querySelector('#sh-u');const chips=ids.map(id=>{const c=document.createElement('div');c.innerHTML=`u${id}<small></small>`;box.appendChild(c);return c});
  let four=false;
  function draw(){const mth=d.querySelector('#sh-m').value;let mv=0;
    ids.forEach((id,k)=>{const a=at(id,3,mth),b=at(id,4,mth),s=four?b:a;chips[k].style.background=`var(--s${s})`;chips[k].querySelector('small').textContent='shard '+s;
      const moved=four&&a!==b;chips[k].classList.toggle('moved',moved);if(moved)mv++});
    d.querySelector('#sh-mv').textContent=four?mv:0;d.querySelector('#sh-pc').textContent=four?Math.round(mv/24*100)+'%':'0%';
    d.querySelector('#sh-l3').hidden=!four;
    d.querySelector('#sh-note').textContent=!four?'Each colour is the database holding that user. Now add a 4th shard.':mth==='mod'?`With % N, changing N from 3 to 4 changes the answer for most keys: ${mv} of 24 users had to move. Imagine moving 75% of a 10 TB database.`:`With consistent hashing, only the users that land on the new shard's slices of the ring move: ${mv} of 24, roughly 1/4. Everyone else stays put.`}
  const add=d.querySelector('#sh-add');add.onclick=()=>{four=!four;add.classList.toggle('on',four);add.textContent=four?'Back to 3 shards':'Add a 4th shard';draw()};
  d.querySelector('#sh-m').onchange=draw;draw();
})();

/* Queue */
(function(){
  const fig=document.querySelector('#t7 figure.dg');if(!fig)return;
  const d=panel(fig,`<div class="simh"><p class="kicker">Try it yourself</p><h3>Queue backlog simulator</h3><p>Orders arrive into a queue; each worker processes 2 jobs per second. If orders arrive faster than workers can handle, the backlog grows. Add workers to drain it. Fire a sale-day spike and watch the queue absorb it.</p></div>
  <div class="simc"><label>Orders arriving / sec <input type="range" id="q-in" min="1" max="20" value="5"><b class="mono" id="q-inv">5</b></label>
  <label>Workers <input type="range" id="q-w" min="1" max="10" value="3"><b class="mono" id="q-wv">3</b></label><button type="button" id="q-spike">Sale spike: +150 orders</button></div>
  <div class="queue" id="q-box" aria-label="Queue contents"></div>
  <div class="stats">${stat('q-d','In queue')}${stat('q-c','Capacity / sec')}${stat('q-t','Wait for new job')}${stat('q-p','Processed')}</div>
  <p class="simnote" id="q-note"></p>`);
  let depth=0,acc=0,done=0,vis=false;const box=d.querySelector('#q-box');onView(d,v=>vis=v);
  const iv=d.querySelector('#q-in'),wv=d.querySelector('#q-w');
  function draw(){const rate=+iv.value,cap=+wv.value*2;d.querySelector('#q-inv').textContent=rate;d.querySelector('#q-wv').textContent=wv.value;
    const show=Math.min(Math.round(depth),160);while(box.children.length<show)box.appendChild(document.createElement('i'));while(box.children.length>show)box.firstChild.remove();
    box.classList.toggle('over',rate>cap);
    d.querySelector('#q-d').textContent=Math.round(depth);d.querySelector('#q-c').textContent=cap;d.querySelector('#q-t').textContent=(depth/cap).toFixed(1)+' s';d.querySelector('#q-p').textContent=Math.round(done);
    d.querySelector('#q-note').textContent=rate>cap?`Orders arrive at ${rate}/s but workers only handle ${cap}/s, so the backlog grows by ${rate-cap} every second. Nothing is lost, but jobs wait longer. Add workers (autoscale on queue depth).`:depth>5?`Workers handle ${cap}/s, more than the ${rate}/s arriving, so the backlog is draining.`:`Capacity (${cap}/s) is above the arrival rate (${rate}/s): jobs are processed almost as soon as they arrive.`}
  iv.oninput=wv.oninput=draw;d.querySelector('#q-spike').onclick=()=>{depth+=150;draw()};
  setInterval(()=>{if(!vis)return;const rate=+iv.value,cap=+wv.value*2;depth+=rate*.2;const out=Math.min(depth,cap*.2);depth-=out;done+=out;if(depth>400)depth=400;draw()},200);
  draw();
})();

/* Rate limiter + circuit breaker */
(function(){
  const fig=document.querySelector('#t9 figure.dg');if(!fig)return;
  const d=panel(fig,`<div class="simh"><p class="kicker">Try it yourself</p><h3>Token bucket rate limiter</h3><p>Capacity 10 tokens, refilling 2 per second. Send single requests, then a burst of 15, and see which ones get 429.</p></div>
  <div class="simc"><button type="button" id="r-one">Send 1 request</button><button type="button" id="r-burst">Send a burst of 15</button><button type="button" class="toggle" id="r-steady">Steady 3 req/sec</button></div>
  <div class="tokens" id="r-tok" aria-label="Tokens in bucket"></div>
  <div class="stats">${stat('r-ok','Allowed (200)')}${stat('r-no','Rejected (429)')}</div>
  <div class="log" id="r-log"></div>
  <p class="simnote" id="r-note">The bucket is full, so a short burst of up to 10 requests is allowed.</p>`);
  let tok=10,ok=0,no=0,steady=false;const T=d.querySelector('#r-tok'),log=d.querySelector('#r-log');
  for(let i=0;i<10;i++)T.appendChild(document.createElement('span'));
  function draw(){[...T.children].forEach((s,i)=>s.classList.toggle('full',i<Math.floor(tok)));d.querySelector('#r-ok').textContent=ok;d.querySelector('#r-no').textContent=no}
  function send(){if(tok>=1){tok-=1;ok++;pushLog(log,'ok','200')}else{no++;pushLog(log,'bad','429');d.querySelector('#r-note').textContent='Bucket empty: extra requests are rejected with 429 and a Retry-After header until tokens refill at 2 per second.'}draw()}
  d.querySelector('#r-one').onclick=send;
  d.querySelector('#r-burst').onclick=()=>{for(let i=0;i<15;i++)setTimeout(send,i*60)};
  const st=d.querySelector('#r-steady');st.onclick=()=>{steady=!steady;st.classList.toggle('on',steady);if(steady)d.querySelector('#r-note').textContent='3 requests per second is more than the 2 per second refill, so the bucket slowly drains and some requests start getting 429.'};
  setInterval(()=>{tok=Math.min(10,tok+.2);draw()},100);
  setInterval(()=>{if(steady)send()},333);
  draw();

  const b=panel(d,`<div class="simh"><p class="kicker">Try it yourself</p><h3>Circuit breaker</h3><p>Your app calls a payment API about once a second. Break the API and watch the breaker open after 5 failures, stop waiting on timeouts, then test recovery.</p></div>
  <div class="simc"><button type="button" class="toggle" id="b-down">Break the payment API</button></div>
  <div class="states"><span class="c" id="b-c">CLOSED</span><span class="o" id="b-o">OPEN</span><span class="h" id="b-h">HALF-OPEN</span></div>
  <div class="stats">${stat('b-f','Recent failures')}${stat('b-w','Seconds users waited on timeouts')}${stat('b-s','Seconds saved by failing fast')}</div>
  <div class="log" id="b-log"></div>
  <p class="simnote" id="b-note">The API is healthy. Calls succeed and the breaker stays closed.</p>`);
  let down=false,state='c',fails=0,openAt=0,waited=0,saved=0,vis=false;const bl=b.querySelector('#b-log');onView(b,v=>vis=v);
  function bdraw(){['c','o','h'].forEach(k=>b.querySelector('#b-'+k).classList.toggle('on',state===k));b.querySelector('#b-f').textContent=fails;b.querySelector('#b-w').textContent=waited;b.querySelector('#b-s').textContent=saved}
  const note=t=>b.querySelector('#b-note').textContent=t;
  function call(){
    if(state==='o'){if(Date.now()-openAt>6000){state='h';note('6 seconds passed: HALF-OPEN. The next call is a test.')}else{saved+=3;pushLog(bl,'mid','fallback');bdraw();return}}
    if(!down){pushLog(bl,'ok','ok');if(state==='h'){state='c';fails=0;note('The test call worked, so the breaker CLOSED again and traffic flows normally.')}else fails=Math.max(0,fails-1)}
    else{waited+=3;pushLog(bl,'bad','timeout 3s');
      if(state==='h'){state='o';openAt=Date.now();note('The test call failed, so the breaker went back to OPEN for another 6 seconds.')}
      else{fails++;if(fails>=5){state='o';openAt=Date.now();note('5 failures: the breaker is OPEN. Calls now return a fallback instantly ("payment delayed, we’ll retry") instead of making each user wait 3 seconds.')}else note(`The API is timing out. Each failed call makes the user wait 3 seconds. Failures: ${fails} of 5.`)}}
    bdraw()}
  const dn=b.querySelector('#b-down');dn.onclick=()=>{down=!down;dn.classList.toggle('on',down);dn.textContent=down?'Fix the payment API':'Break the payment API';if(!down)note('The API is fixed. When the breaker next tries a test call, it will close.')};
  setInterval(()=>{if(vis)call()},1000);bdraw();
})();

})();
