(function(){
"use strict";
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const T={ // name, colour, mark, mark text colour
 aws:["AWS","#FF9900","aws","#232F3E"],docker:["Docker","#2496ED","Dk","#fff"],k8s:["Kubernetes","#326CE5","K8","#fff"],hpa:["K8s Autoscaler","#326CE5","HP","#fff"],
 rn:["React Native","#61DAFB","RN","#0b2530"],cloudfront:["CloudFront","#8C4FFF","CF","#fff"],route53:["Route 53","#8C4FFF","53","#fff"],
 alb:["AWS ALB","#8C4FFF","LB","#fff"],nlb:["AWS NLB","#8C4FFF","LB","#fff"],kong:["Kong","#14324B","K","#fff"],envoy:["Envoy","#AC6199","Ev","#fff"],
 go:["Go","#00ADD8","Go","#fff"],node:["Node.js","#5FA04E","N","#fff"],grpc:["gRPC","#244C5A","g","#fff"],ws:["WebSocket","#5B6B7F","WS","#fff"],
 redis:["Redis","#DC382D","R","#fff"],postgres:["PostgreSQL","#4169E1","Pg","#fff"],aurora:["Aurora","#527FFF","Au","#fff"],
 citus:["Citus","#3E7DD6","Ci","#fff"],pgbouncer:["PgBouncer","#336791","PB","#fff"],clickhouse:["ClickHouse","#FFCC01","CH","#1a1600"],
 es:["Elasticsearch","#00BFB3","ES","#fff"],kafka:["Kafka","#231F20","Kf","#fff"],debezium:["Debezium","#91D443","Dz","#13230a"],
 temporal:["Temporal","#141414","T","#fff"],razorpay:["Razorpay","#3395FF","Rp","#fff"],fcm:["Firebase FCM","#FFA000","FB","#2a1a00"],
 istio:["Istio","#466BB0","Is","#fff"],terraform:["Terraform","#844FBA","Tf","#fff"],resilience:["Resilience4j","#5A3E9C","R4","#fff"],
 unleash:["Unleash","#1A4049","U","#fff"],waf:["AWS WAF","#DD344C","W","#fff"],s3:["Amazon S3","#569A31","S3","#fff"],
 lambda:["Lambda","#FF9900","λ","#2a1a00"],h3:["H3 grid","#3B3B3B","H3","#fff"],jwt:["JWT","#D63AFF","J","#fff"],
 msg91:["MSG91","#3D5AFE","M9","#fff"],vault:["Vault","#FFD814","V","#1a1600"],otel:["OpenTelemetry","#425CC7","OT","#fff"],
 prometheus:["Prometheus","#E6522C","P","#fff"],grafana:["Grafana","#F46800","G","#fff"],loki:["Loki","#F46800","Lk","#fff"],
 tempo:["Tempo","#F46800","Tp","#fff"],argo:["Argo Rollouts","#EF7B4D","Ar","#fff"],pagerduty:["PagerDuty","#06AC38","PD","#fff"],sentry:["Sentry","#362D59","S","#fff"]
};
document.querySelectorAll('.tool[data-k]').forEach(el=>{const t=T[el.dataset.k];if(!t)return;el.textContent=t[0];el.dataset.a=t[2];el.style.setProperty('--c',t[1]);el.style.setProperty('--tc',t[3])});

/* ---------- diagram specs ----------
 node: [key,x,y,w,title,sub,tools,cls]   edge: [from,to,label,customPath]   zone: [x,y,w,h,label] */
const D={
master:{W:945,H:445,n:[
 ["app",20,190,150,"Priya's app","Madhapur · 8:04 pm",["rn"]],["cdn",210,30,160,"CDN edge","photos · app code",["cloudfront"]],
 ["gw",210,190,160,"API gateway","auth · rate limit",["alb","kong"]],["search",410,10,160,"Search","“biryani” near me",["es"]],
 ["menu",410,100,160,"Menu service","cache first",["redis"]],["order",410,190,160,"Order service","creates the order",["go"],"key"],
 ["pay",410,280,160,"Payment","₹349 via UPI",["razorpay"]],["odb",610,300,150,"Orders DB","primary + replicas",["postgres"],"db"],
 ["kafka",610,190,150,"Event bus","OrderPlaced",["kafka"],"bus"],["notify",790,60,145,"Notifications","push to Priya",["fcm"]],
 ["dispatch",790,190,145,"Dispatch","finds nearest rider",["redis"]],["rider",790,300,145,"Rider app","Ravi · 1.2 km",["rn"]],
 ["track",20,320,150,"Live tracking","open WebSocket",["ws"]]],
 e:[["app","cdn"],["app","gw","HTTPS"],["gw","search"],["gw","menu"],["gw","order"],["order","pay"],["order","odb"],["order","kafka","event"],
 ["kafka","notify"],["kafka","dispatch"],["dispatch","rider","job offer"],["rider","track","GPS every 4 s","M790,345 C620,440 320,440 170,365"],["track","app","WSS"]]},
c1:{W:920,H:430,z:[[390,10,300,130,"Zone A · Mumbai"],[390,150,300,130,"Zone B · Mumbai"],[390,290,300,130,"Zone C · Mumbai"]],n:[
 ["users",20,170,140,"Users","4× traffic at 8 pm",["rn"]],["alb",200,170,150,"Load balancer","spans all 3 zones",["alb"]],
 ["a1",405,50,130,"Order pod","",["k8s"]],["a2",550,50,130,"Order pod","",["k8s"]],["b1",405,190,130,"Order pod","",["k8s"]],["b2",550,190,130,"Order pod","",["k8s"]],
 ["c1",405,330,130,"Order pod","",["k8s"]],["c2",550,330,130,"New pod","",["k8s"],"ext"],
 ["hpa",735,90,170,"Autoscaler","CPU > 60% → add pods",["hpa"]],["db",735,260,170,"Database","scale up, not out",["aurora"],"db"]],
 e:[["users","alb"],["alb","a1"],["alb","b1"],["alb","c1"],["hpa","c2","adds pods"],["b2","db"]]},
c2:{W:960,H:420,n:[
 ["app",20,170,150,"Priya's app","",["rn"]],["dns",220,10,160,"DNS","name → IP",["route53"]],["cdn",220,105,160,"CDN","images · JS",["cloudfront"]],
 ["alb",220,210,160,"Load balancer","HTTPS ends here",["alb"]],["ws",220,320,160,"Tracking server","open connection",["ws"]],
 ["kong",430,210,150,"API gateway","token · route",["kong"]],["order",630,150,150,"Order service","REST handler",["go"],"key"],
 ["pay",630,290,150,"Payment service","",["node"]],["pricing",810,150,140,"Pricing","",["grpc"]],["rzp",810,300,140,"Razorpay","external",["razorpay"],"ext"]],
 e:[["app","dns","lookup"],["app","cdn","assets"],["app","alb","REST"],["app","ws","WSS"],["alb","kong"],["kong","order"],["kong","pay"],["order","pricing","gRPC"],["rzp","pay","webhook"]]},
c3:{W:940,H:430,n:[
 ["app",20,180,140,"Priya's app","",["rn"]],["alb",210,90,160,"L7 balancer","reads the URL path",["alb"]],["nlb",210,290,160,"L4 balancer","for WebSockets",["nlb"]],
 ["o1",450,10,150,"Order pod 1","",["k8s"]],["o2",450,74,150,"Order pod 2","",["k8s"]],["o3",450,138,150,"Order pod 3","",["k8s"]],
 ["m1",450,206,150,"Menu pod","",["k8s"]],["ws1",450,296,150,"WS server 1","",["ws"]],["ws2",450,362,150,"WS server 2","",["ws"]],
 ["loc",690,170,170,"Location service","Ravi's GPS",["go"]],["redis",690,320,170,"Redis pub/sub","shares positions",["redis"],"db"]],
 e:[["app","alb"],["app","nlb"],["alb","o1"],["alb","o2"],["alb","o3"],["alb","m1"],["nlb","ws1"],["nlb","ws2"],["loc","redis","publish"],["redis","ws1"],["redis","ws2"]]},
c4:{W:940,H:400,n:[
 ["app",20,150,150,"Priya's app","",["rn"]],["cdn",230,20,160,"CDN edge","dish photos",["cloudfront"]],["menu",230,150,160,"Menu service","cache-aside",["node"],"key"],
 ["redis",480,60,160,"Redis","menu:7741 · ~1 ms",["redis"],"db"],["pg",480,240,160,"Postgres","source of truth",["postgres"],"db"],
 ["partner",20,300,150,"Restaurant app","marks dish sold out",["rn"]],["kafka",720,240,170,"Event bus","MenuChanged",["kafka"],"bus"],
 ["inval",720,60,170,"Cache invalidator","deletes stale keys",["node"]]],
 e:[["app","cdn"],["app","menu"],["menu","redis","1 GET"],["menu","pg","2 on miss"],["partner","menu","update"],["pg","kafka","change event"],["kafka","inval"],["inval","redis","DEL key"]]},
c5:{W:940,H:420,z:[[10,8,420,404,"Right database for each job"],[470,8,460,404,"When orders outgrow one primary"]],n:[
 ["os",25,40,140,"Order service","",["go"]],["ms",25,135,140,"Menu service","",["node"]],["ls",25,230,140,"Location service","",["go"]],["ev",25,325,140,"Event bus","",["kafka"],"bus"],
 ["pgo",235,40,180,"Orders","ACID transactions",["aurora"],"db"],["pgm",235,135,180,"Menus","relational + cached",["postgres"],"db"],
 ["geo",235,230,180,"Rider positions","40k writes/s · TTL",["redis"],"db"],["ch",235,325,180,"Analytics","billions of rows",["clickhouse"],"db"],
 ["router",490,170,165,"Shard router","by city_id",["citus"],"key"],["s1",740,30,180,"Hyderabad shard","primary + 2 replicas",["postgres"],"db"],
 ["s2",740,170,180,"Bengaluru shard","primary + 2 replicas",["postgres"],"db"],["s3",740,310,180,"Mumbai shard","primary + 2 replicas",["postgres"],"db"]],
 e:[["os","pgo"],["ms","pgm"],["ls","geo"],["ev","ch"],["pgo","router","grows into"],["router","s1"],["router","s2"],["router","s3"]]},
c6:{W:940,H:400,n:[
 ["orch",340,10,260,"Order workflow","remembers every step",["temporal"],"key"],
 ["n1",20,160,195,"1 · Create order","status PENDING",["postgres"]],["n2",250,160,195,"2 · Charge ₹349","UPI, idempotent",["razorpay"]],
 ["n3",480,160,195,"3 · Restaurant accepts","3-minute timer",["rn"]],["n4",710,160,200,"4 · Assign rider","nearest free rider",["redis"]],
 ["c2",250,310,195,"Undo 2 · Refund ₹349","",["razorpay"],"comp"],["c1",20,310,195,"Undo 1 · Cancel order","notify Priya",["postgres"],"comp"]],
 e:[["orch","n1"],["orch","n2"],["orch","n3"],["orch","n4"],["n1","n2"],["n2","n3"],["n3","n4"],["n3","c2","rejected"],["c2","c1"]],dash:["orch"]},
c7:{W:960,H:410,n:[
 ["order",20,160,140,"Order service","",["go"],"key"],["pg",190,160,170,"Postgres","order + outbox row",["postgres"],"db"],
 ["deb",390,160,150,"Outbox relay","reads new rows",["debezium"]],["kafka",570,160,170,"order-events","keyed by order_id",["kafka"],"bus"],
 ["rest",780,10,165,"Restaurant tablet","",["fcm"]],["disp",780,95,165,"Dispatch","",["go"]],["noti",780,180,165,"Push to Priya","",["fcm"]],
 ["ana",780,265,165,"Analytics","",["clickhouse"]],["dlq",570,320,170,"Dead-letter topic","after 3 retries",["kafka"],"off"]],
 e:[["order","pg","1 transaction"],["pg","deb"],["deb","kafka"],["kafka","rest"],["kafka","disp"],["kafka","noti"],["kafka","ana"],["ana","dlq","fails 3×"]]},
c8:{W:960,H:460,n:[
 ["cust",20,60,150,"Customer app","",["rn"]],["rest",20,180,150,"Restaurant app","",["rn"]],["ridr",20,300,150,"Rider app","",["rn"]],
 ["gw",220,180,150,"API gateway","",["kong"],"key"],
 ["user",430,10,200,"User","",["go"]],["cat",430,80,200,"Catalog & menu","",["node"]],["srch",430,150,200,"Search","",["es"]],["cart",430,220,200,"Cart","",["redis"]],["ord",430,290,200,"Order","",["go"]],
 ["disp",700,10,200,"Dispatch","",["go"]],["loc",700,80,200,"Location","",["redis"]],["pric",700,150,200,"Pricing & offers","",["grpc"]],["paym",700,220,200,"Payment","",["razorpay"]],["noti",700,290,200,"Notification","",["fcm"]],
 ["bus",430,385,470,"Event bus","OrderPlaced · RiderAssigned · PaymentCaptured",["kafka"],"bus"]],
 e:[["cust","gw"],["rest","gw"],["ridr","gw"],["gw","cat"],["gw","srch"],["gw","cart"],["gw","ord"],["ord","pric","gRPC"],["ord","paym"],["ord","bus"],["noti","bus"]]},
c9:{W:990,H:400,n:[
 ["users",20,80,150,"Cricket fans","10× traffic",["rn"]],["bots",20,260,150,"Bots","scraping offers",[],"off"],
 ["gw",220,170,170,"API gateway","token bucket per user",["kong","redis"],"key"],["order",440,80,160,"Order service","",["go"]],
 ["reco",440,270,160,"Recommendations","nice to have",["unleash"]],["router",650,80,170,"Payment router","circuit breaker",["resilience"]],
 ["rzp",850,10,130,"Razorpay","primary",["razorpay"],"ext"],["backup",850,170,130,"Backup gateway","secondary",[],"ext"]],
 e:[["users","gw"],["bots","gw"],["gw","order"],["gw","reco"],["order","router"],["router","rzp"],["router","backup"]]},
c10:{W:960,H:432,z:[[10,4,940,128,"Photos"],[10,150,940,128,"Search"],[10,298,940,128,"Nearest rider"]],n:[
 ["partner",30,44,150,"Restaurant app","",["rn"]],["menu",220,44,150,"Menu service","signs upload URL",["node"]],["s3",410,44,150,"S3 bucket","original photo",["s3"],"db"],
 ["resize",600,44,150,"Image resizer","3 sizes · WebP",["lambda"]],["cdn",790,44,150,"CDN","served in Hyderabad",["cloudfront"]],
 ["pg",30,190,150,"Postgres","restaurants, dishes",["postgres"],"db"],["deb",220,190,150,"Change capture","streams changes",["debezium"]],
 ["es",410,190,150,"Search index","inverted + geo",["es"],"db"],["srch",600,190,150,"Search API","“biriyani” → biryani",["node"]],["app2",790,190,150,"Priya's app","",["rn"]],
 ["rapp",30,338,150,"Ravi's app","GPS every 4 s",["rn"]],["loc",220,338,150,"Location service","",["go"]],["geo",410,338,150,"Redis GEO","H3 cell → riders",["redis","h3"],"db"],
 ["disp",600,338,150,"Dispatch","nearby + free?",["go"]],["rst",790,338,150,"Restaurant","pickup point",[],"ext"]],
 e:[["partner","menu","1 ask"],["partner","s3","2 upload directly","M105,116 C105,142 485,142 485,116"],["s3","resize"],["resize","cdn"],
 ["pg","deb"],["deb","es"],["srch","es","query"],["app2","srch"],["rapp","loc"],["loc","geo"],["disp","geo","nearby?"],["disp","rst","assign"]]},
c11:{W:980,H:410,n:[
 ["app",20,170,150,"Priya's app","stores tokens",["rn"]],["waf",210,170,150,"Edge firewall","blocks attacks",["waf"]],
 ["auth",410,20,170,"Auth service","OTP → JWT",["jwt"],"key"],["sms",640,20,150,"SMS OTP","",["msg91"]],
 ["gw",410,170,170,"API gateway","verifies JWT",["kong"]],["order",640,170,170,"Order service","owner check",["go"]],
 ["rzp",410,320,170,"Razorpay checkout","card / UPI",["razorpay"],"ext"],["pay",640,320,170,"Payment service","verifies signature",["node"]],
 ["vault",850,245,120,"Vault","secrets",["vault"]]],
 e:[["app","waf"],["waf","auth","login"],["auth","sms"],["waf","gw"],["gw","order"],["app","rzp","pay"],["rzp","pay","webhook"],["vault","pay"],["vault","order"]],dash:["vault"]},
c12:{W:980,H:420,n:[
 ["s1",20,20,150,"Order service","",["go"]],["s2",20,110,150,"Menu service","",["node"]],["s3",20,200,150,"Dispatch","",["go"]],
 ["otel",230,105,170,"Collector","one pipeline",["otel"],"key"],["prom",460,20,160,"Metrics","",["prometheus"]],["loki",460,110,160,"Logs","",["loki"]],
 ["tempo",460,200,160,"Traces","",["tempo"]],["graf",680,105,150,"Dashboards","orders/min by city",["grafana"]],["pd",860,110,110,"On-call","",["pagerduty"]],
 ["sentry",20,320,150,"App crashes","",["sentry"]],["argo",230,320,170,"Canary rollout","",["argo"]],["v41",460,320,160,"Order v41","95% of users",["k8s"]],["v42",680,320,150,"Order v42","5% of users",["k8s"]]],
 e:[["s1","otel"],["s2","otel"],["s3","otel"],["otel","prom"],["otel","loki"],["otel","tempo"],["prom","graf"],["loki","graf"],["tempo","graf"],["graf","pd","alert"],
 ["argo","v41"],["argo","v42"],["v42","argo","error check","M755,394 C755,418 315,418 315,394"]]}
};

/* steps: t, s, hl, bad, ok, go:[from>to, colour, count, delay, dur], tp: chapter tags */
const S={
master:[
 {tp:[1],t:"8:04 pm, Friday, Hyderabad",s:"About 2 million people across India open the app around the same time for dinner. Priya, in Madhapur, is one of them.",hl:["app"]},
 {tp:[2,4],t:"The app opens instantly",s:"Restaurant photos, banners and app code come from a CDN server in Hyderabad, a few milliseconds away, instead of from Mumbai.",hl:["cdn"],go:[["app>cdn","a"],["cdn>app","g",3,.9]]},
 {tp:[2,3,10],t:"She searches “biryani”",s:"The request goes to the API gateway, which checks her login token and rate limit, then to the search service. Elasticsearch finds biryani places that deliver to her location within 5 km.",hl:["gw","search"],go:[["app>gw","a"],["gw>search","a",1,1],["search>gw","g",1,2],["gw>app","g",1,2.9]]},
 {tp:[4],t:"She opens the restaurant's menu",s:"The menu service finds the menu ready in Redis and answers in about 1 ms. The database isn't touched.",hl:["menu"],go:[["app>gw","a"],["gw>menu","a",1,1],["menu>gw","g",1,1.9],["gw>app","g",1,2.8]]},
 {tp:[2,5],t:"She taps “Place order”",s:"The request carries an idempotency key so a retry can never create a second order. The order service saves order #HYD-48213 as PENDING in Postgres.",hl:["order","odb"],go:[["app>gw","a"],["gw>order","a",1,1],["order>odb","u",1,1.9]]},
 {tp:[6],t:"₹349 is charged by UPI",s:"Payment is one step of a saga. If the restaurant later refuses the order, the saga refunds the money automatically.",hl:["pay"],go:[["order>pay","a"],["pay>order","g",1,1.3]]},
 {tp:[7],t:"One event tells everyone",s:"The order service publishes OrderPlaced to Kafka and its job is done. The restaurant tablet, notifications, dispatch and analytics each react on their own.",hl:["kafka"],go:[["order>kafka","g"],["kafka>notify","g",1,1.1],["kafka>dispatch","g",1,1.1]]},
 {tp:[10,5],t:"Dispatch picks Ravi",s:"Dispatch looks up free riders in the restaurant's map tile in Redis and picks Ravi, 1.2 km away, then sends him the job offer.",hl:["dispatch","rider"],go:[["dispatch>rider","a",1,0,.9]]},
 {tp:[2,3],t:"Priya watches the bike move",s:"Ravi's phone sends its GPS position every 4 seconds. The tracking service pushes each position to Priya over an open WebSocket, so the bike moves on her map.",hl:["track"],go:[["rider>track","u",3,0,1.8],["track>app","g",3,1.8,.6]]},
 {tp:[9,11,12],t:"The safety net around every step",s:"Rate limits and circuit breakers keep it stable, tokens and encryption keep it safe, and traces record every hop so engineers can see problems. 32 minutes later, the biryani arrives.",hl:["gw","order","kafka"]}],
c1:[
 {t:"3 pm: a quiet afternoon",s:"Two copies (pods) of the order service run in each of three zones. Each pod is identical, so the load balancer can send any request to any of them.",hl:["a1","b1","c1"],go:[["users>alb","a",2],["alb>a1","a",1,1],["alb>b1","a",1,1.3]]},
 {t:"8 pm: traffic quadruples",s:"Dinner rush. Every pod's CPU climbs toward 70% as requests pour in.",hl:["alb"],go:[["users>alb","a",6,0,.9],["alb>a1","a",2,1],["alb>b1","a",2,1.1],["alb>c1","a",2,1.2]]},
 {t:"The autoscaler adds pods",s:"Kubernetes notices CPU above 60% and starts new pods in about 30 seconds. Because pods are stateless, a new one can serve users immediately.",hl:["hpa"],ok:["c2"],go:[["hpa>c2","y",1,0,1]]},
 {t:"Zone B loses power",s:"A whole data center building goes dark. Every pod in it disappears at once.",bad:["b1","b2"]},
 {t:"Zones A and C carry the load",s:"Health checks remove zone B within seconds and traffic flows to the other two zones. We always keep 50% spare capacity for exactly this moment.",hl:["a1","a2","c1","c2"],bad:["b1","b2"],go:[["alb>a1","a",3],["alb>c1","a",3,.2]]},
 {t:"The database scales differently",s:"App pods are easy to copy because they hold no data. The database holds the data, so first we make it bigger (vertical scaling) with a standby copy in another zone. Splitting it comes later, in chapter 5.",hl:["db"]}],
c2:[
 {t:"Find our address",s:"The app asks DNS for the IP address of api.ourapp.in. Route 53 replies with the address of our load balancer in Mumbai. The answer is cached, so this is usually instant.",hl:["dns"],go:[["app>dns","a"],["dns>app","g",1,1]]},
 {t:"Fetch static files from the CDN",s:"Images and app code come from the nearest CDN edge, never from our servers.",hl:["cdn"],go:[["app>cdn","a"],["cdn>app","g",2,1]]},
 {t:"REST request for the order",s:"POST /v1/orders travels over HTTPS. The load balancer decrypts it, and the API gateway checks the token and routes it to the order service.",hl:["kong","order"],go:[["app>alb","a"],["alb>kong","a",1,.9],["kong>order","a",1,1.6]]},
 {t:"Internal gRPC call",s:"The order service asks the pricing service for the final amount over gRPC: fast binary messages with a strict contract. Pricing answers ₹349 including the delivery fee.",hl:["pricing"],go:[["order>pricing","a"],["pricing>order","g",1,1]]},
 {t:"Razorpay calls us back",s:"When the UPI payment succeeds, Razorpay sends a webhook to our payment service. We check its signature before trusting it, then mark the order paid.",hl:["rzp","pay"],go:[["rzp>pay","y",1,0,1]]},
 {t:"An open line for live tracking",s:"For tracking, the app opens one WebSocket and keeps it open. The server pushes Ravi's position every 4 seconds without Priya's phone asking each time.",hl:["ws"],go:[["ws>app","g",4,0,.9]]}],
c3:[
 {t:"The L7 balancer reads the path",s:"It looks inside each request. GET /v1/menu goes to menu pods, POST /v1/orders goes to order pods.",hl:["alb"],go:[["app>alb","a"],["alb>o1","a",1,.9],["alb>m1","u",1,.9]]},
 {t:"Least outstanding requests",s:"Pod 1 already has 9 requests in progress, pod 2 has only 2. New order requests go to pod 2 until they even out.",hl:["o2"],go:[["alb>o2","a",3],["alb>o1","a",1,.4]]},
 {t:"Pod 3 fails its health check",s:"Every 5 seconds the balancer calls /healthz. Pod 3 times out twice, so it is marked unhealthy.",bad:["o3"],go:[["alb>o3","y",1,0,.8]]},
 {t:"Traffic routes around it",s:"No new requests go to pod 3 while Kubernetes restarts it. Users see nothing.",hl:["o1","o2"],bad:["o3"],go:[["alb>o1","a",2],["alb>o2","a",2,.2]]},
 {t:"WebSockets use the L4 balancer",s:"Priya's tracking connection lands on WebSocket server 1 and stays there for the whole delivery. L4 balancing handles millions of these cheaply.",hl:["nlb","ws1"],go:[["app>nlb","u"],["nlb>ws1","u",1,.9]]},
 {t:"Pub/sub connects the servers",s:"Ravi's position is published once to Redis. Every WebSocket server receives it, and the one holding Priya's connection pushes it to her phone.",hl:["redis"],go:[["loc>redis","a"],["redis>ws1","g",1,.9],["redis>ws2","g",1,.9]]}],
c4:[
 {t:"Photos come from the CDN",s:"Dish photos are copied to a CDN edge in Hyderabad. Our servers never send image bytes.",hl:["cdn"],go:[["app>cdn","a"],["cdn>app","g",3,.9]]},
 {t:"Ask Redis first",s:"The menu service looks up the key menu:7741 in Redis.",hl:["redis"],go:[["app>menu","a"],["menu>redis","a",1,.8]]},
 {t:"Cache hit: answered in 1 ms",s:"The menu is there, so it goes straight back. About 97 of every 100 menu requests end here.",ok:["redis"],go:[["redis>menu","g"],["menu>app","g",1,.8]]},
 {t:"Cache miss on a less popular restaurant",s:"This menu isn't in Redis. The service reads it from Postgres (about 20 ms) and saves it in Redis with a 10-minute TTL, so the next person gets a hit.",bad:["redis"],hl:["pg"],go:[["menu>redis","a"],["menu>pg","a",1,.8],["pg>menu","g",1,1.6],["menu>redis","y",1,2.4]]},
 {t:"The kitchen runs out of chicken",s:"The restaurant marks Chicken 65 as sold out. The menu service writes the change to Postgres. Redis still holds the old menu.",hl:["partner","pg"],go:[["partner>menu","a"],["menu>pg","a",1,.9]]},
 {t:"Delete the stale copy",s:"The change becomes a MenuChanged event, and the invalidator deletes menu:7741 from Redis. The next request misses once and loads the correct menu.",hl:["inval"],bad:["redis"],go:[["pg>kafka","g"],["kafka>inval","g",1,1],["inval>redis","b",1,1.9]]}],
c5:[
 {t:"Orders go to a strict SQL database",s:"Postgres (Aurora) guarantees an order and its payment record are saved together or not at all.",hl:["pgo"],go:[["os>pgo","a",2]]},
 {t:"Menus: relational and heavily cached",s:"Restaurant → categories → dishes is naturally relational. Redis in front absorbs most reads.",hl:["pgm"],go:[["ms>pgm","a"]]},
 {t:"Rider positions: fast and disposable",s:"40,000 updates a second that are useless after a minute. Redis holds them in memory with a 60 s expiry.",hl:["geo"],go:[["ls>geo","a",5,0,.7]]},
 {t:"Analytics: a separate warehouse",s:"Every event flows to ClickHouse, so heavy reports never slow down live orders.",hl:["ch"],go:[["ev>ch","g",3]]},
 {t:"Too many writes for one primary",s:"As orders grow, one Postgres primary hits its limit. We shard by city, because a Hyderabad order never needs to join with a Mumbai one.",hl:["router"],go:[["pgo>router","y",1,0,1.1]]},
 {t:"Each city gets its own database",s:"Priya's order goes to the Hyderabad shard. A Bengaluru order goes to its own shard. Each shard has a primary and two replicas.",hl:["s1","s2","s3"],go:[["router>s1","a"],["router>s2","u",1,1],["router>s3","y",1,1.6]]}],
c6:[
 {t:"The workflow starts",s:"The order workflow creates the order with status PENDING. The workflow engine saves its progress after every step, so a crash never loses track.",hl:["orch","n1"],go:[["orch>n1","y"]]},
 {t:"Charge the customer",s:"₹349 is charged via Razorpay, using the order ID as the idempotency key. If the call is retried, the customer is still charged once.",hl:["n2"],go:[["n1>n2","g"],["orch>n2","y"]]},
 {t:"Happy path: the restaurant accepts",s:"The kitchen taps Accept on its tablet within the 3-minute timer.",ok:["n3"],go:[["n2>n3","g"]]},
 {t:"A rider is assigned: order confirmed",s:"Dispatch assigns Ravi and the order becomes RIDER_ASSIGNED. All four steps succeeded.",ok:["n3","n4"],go:[["n3>n4","g"]]},
 {t:"Unhappy path: the tablet is offline",s:"Same order, but the restaurant never responds. After 3 minutes the timer fires and step 3 fails.",bad:["n3"],go:[["n2>n3","a"]]},
 {t:"Undo in reverse order",s:"The saga runs compensations: refund ₹349, then cancel the order and tell Priya with a coupon. No money is stuck, even though no single transaction covered all four services.",hl:["c2","c1"],bad:["n3"],go:[["n3>c2","b"],["c2>c1","b",1,1.1]]}],
c7:[
 {t:"One transaction, two rows",s:"The order service saves the order and an “OrderPlaced” row in an outbox table in the same Postgres transaction. Either both are saved or neither is.",hl:["pg"],go:[["order>pg","a",2]]},
 {t:"The relay publishes it",s:"Debezium reads the new outbox row and publishes it to Kafka. If Kafka is briefly down, it simply retries; the event can't be lost.",hl:["deb"],go:[["pg>deb","a"],["deb>kafka","a",1,.9]]},
 {t:"Everyone hears the news",s:"Four consumer groups read the same event independently: the restaurant tablet rings, dispatch starts searching, Priya gets a push, analytics records it.",hl:["kafka"],go:[["kafka>rest","g"],["kafka>disp","g",1,.3],["kafka>noti","g",1,.6],["kafka>ana","g",1,.9]]},
 {t:"Each reads at its own pace",s:"Each group keeps its own position (offset) in the topic. If notifications slow down, dispatch is not affected at all.",hl:["disp","noti"]},
 {t:"A broken event goes aside",s:"The analytics consumer crashes on a malformed event 3 times. It moves the event to a dead-letter topic and continues with the rest. An engineer is alerted.",bad:["dlq"],go:[["kafka>ana","a"],["ana>dlq","b",1,1]]},
 {t:"Nothing is lost during spikes",s:"At the IPL final, events pile up in the topic and workers catch up over minutes. Events are kept for 7 days, so a fixed consumer can replay them.",hl:["kafka"]}],
c8:[
 {t:"Three apps, one front door",s:"Customers, restaurants and riders all talk to the same API gateway, which handles login checks and routing for every service.",hl:["gw"],go:[["cust>gw","a"],["rest>gw","a",1,.3],["ridr>gw","a",1,.6]]},
 {t:"Requests go to the owning service",s:"Each business area is a separate service owned by one team, with its own database and its own release schedule.",hl:["cat","srch","cart","ord"],go:[["gw>cat","a"],["gw>srch","a",1,.3],["gw>cart","a",1,.6],["gw>ord","a",1,.9]]},
 {t:"Direct calls when the answer is needed now",s:"Checkout can't continue without the final price, so the order service calls pricing over gRPC, then payment.",hl:["pric","paym"],go:[["ord>pric","a"],["ord>paym","a",1,.8]]},
 {t:"Events for everything else",s:"Once the order is placed, the order service publishes an event. Notification and others react without the order service knowing they exist.",hl:["bus"],go:[["ord>bus","g"],["bus>noti","g",1,1]]},
 {t:"Each service scales on its own",s:"At dinner the location service runs 60 pods because riders send so many updates, while the user service needs only 4. A monolith would have to scale everything together.",hl:["loc","disp"]}],
c9:[
 {t:"The final over: 10× traffic",s:"Requests flood the gateway as everyone orders at once.",hl:["gw"],go:[["users>gw","a",7,0,.8]]},
 {t:"Bots hit the rate limit",s:"Each user and IP has a token bucket in Redis. Bots scraping offers 50 times a second empty their bucket and get 429 Too Many Requests.",bad:["bots"],go:[["bots>gw","b",4,0,.7],["gw>bots","b",2,1.2,.6]]},
 {t:"Shed the nice-to-haves",s:"A feature flag switches off recommendations. Search, menus and checkout get all the capacity.",bad:["reco"],hl:["order"],go:[["gw>order","a",3]]},
 {t:"Razorpay starts failing",s:"The payment gateway returns errors under its own load. Each failed call makes a user wait.",bad:["rzp"],go:[["order>router","a"],["router>rzp","b",2,.8]]},
 {t:"The breaker opens and switches gateways",s:"After 30% errors in 20 seconds, the circuit breaker stops calling Razorpay and routes new payments to the backup gateway. Users barely notice.",hl:["router"],ok:["backup"],go:[["order>router","a"],["router>backup","g",2,.8]]},
 {t:"Half-open: test and recover",s:"After 30 seconds the breaker lets one payment through to Razorpay. It works, so the breaker closes and traffic returns to the primary gateway.",ok:["rzp"],go:[["router>rzp","y",1,0,1]]}],
c10:[
 {t:"The restaurant asks to upload a photo",s:"The menu service checks the restaurant owns this dish, then returns a presigned URL that allows one upload for 5 minutes.",hl:["menu"],go:[["partner>menu","a"],["menu>partner","g",1,.9]]},
 {t:"Upload straight to S3",s:"The phone sends the 4 MB photo directly to S3. Our API servers never carry the file.",hl:["s3"],go:[["partner>s3","a",2,0,1.4]]},
 {t:"Resize once, serve everywhere",s:"S3 triggers the resizer to make three sizes in WebP. The CDN then serves the right size to each phone.",hl:["resize","cdn"],go:[["s3>resize","a"],["resize>cdn","g",1,.9]]},
 {t:"Keep the search index in sync",s:"When a dish or restaurant changes in Postgres, change-data-capture streams it into the search index within about 2 seconds.",hl:["es"],go:[["pg>deb","a"],["deb>es","a",1,.9]]},
 {t:"Search “biriyani” (with a typo)",s:"The index matches “biriyani” to biryani using fuzzy matching, filters to restaurants within 5 km that are open, and ranks by relevance and rating.",hl:["srch","es"],go:[["app2>srch","a"],["srch>es","a",1,.8],["es>srch","g",1,1.6],["srch>app2","g",1,2.4]]},
 {t:"Riders report their position",s:"Each rider's phone sends GPS every 4 seconds. The location service stores the rider under their H3 hexagon cell in Redis.",hl:["geo"],go:[["rapp>loc","u",3,0,.8],["loc>geo","u",3,.6,.8]]},
 {t:"Find the nearest free rider",s:"Dispatch looks in the restaurant's hexagon and the 6 touching it, filters free riders, ranks by distance, and offers the job to Ravi.",hl:["disp","geo"],go:[["disp>geo","a"],["geo>disp","g",1,.9],["disp>rst","g",1,1.8]]}],
c11:[
 {t:"Log in with an OTP",s:"Priya enters her phone number. The auth service sends a 6-digit code by SMS, limited to 3 attempts per 10 minutes.",hl:["auth"],go:[["app>waf","a"],["waf>auth","a",1,.8],["auth>sms","a",1,1.6]]},
 {t:"She receives a signed token",s:"After the correct code, she gets a JWT valid for 15 minutes containing her user ID and role, signed with our private key.",hl:["auth"],go:[["auth>waf","g"],["waf>app","g",1,.8]]},
 {t:"Every request carries the token",s:"The gateway verifies the signature with our public key. No database lookup is needed, and expired or tampered tokens get 401.",hl:["gw"],go:[["app>waf","a"],["waf>gw","a",1,.8]]},
 {t:"Check she owns this order",s:"The order service compares the order's customer with the token's user. Asking for someone else's order returns 403.",hl:["order"],go:[["gw>order","a"]]},
 {t:"Card and UPI details never touch us",s:"Payment happens inside Razorpay's checkout. We only receive a payment ID, so we never store card numbers.",hl:["rzp"],go:[["app>rzp","a",1,0,1.1]]},
 {t:"Verify the webhook",s:"Razorpay signs its webhook with a shared secret. The payment service checks the signature using the secret from Vault, so nobody can fake “payment succeeded”.",hl:["pay","vault"],go:[["rzp>pay","y"],["vault>pay","y",1,.6]]}],
c12:[
 {t:"Every service reports in",s:"Each service sends metrics, logs and traces through the OpenTelemetry SDK. Every request carries a trace ID from the gateway onward.",hl:["otel"],go:[["s1>otel","a"],["s2>otel","a",1,.2],["s3>otel","a",1,.4]]},
 {t:"Sorted into three stores",s:"Metrics go to Prometheus, logs to Loki, traces to Tempo.",hl:["prom","loki","tempo"],go:[["otel>prom","a"],["otel>loki","y",1,.2],["otel>tempo","u",1,.4]]},
 {t:"One dashboard for everything",s:"Grafana shows orders per minute by city next to latency and error rates, compared with last Friday.",hl:["graf"],go:[["prom>graf","a"],["loki>graf","y",1,.2],["tempo>graf","u",1,.4]]},
 {t:"Checkout success drops: page on-call",s:"An alert rule sees checkout success below 99.5% for 5 minutes and pages the on-call engineer through PagerDuty.",bad:["pd"],go:[["graf>pd","b",2]]},
 {t:"New code goes to 5% first",s:"Argo Rollouts sends 5% of users to version 42 of the order service and keeps 95% on version 41.",hl:["v42"],go:[["argo>v41","a",3],["argo>v42","a",1,.3]]},
 {t:"Automatic rollback",s:"Version 42's error rate is higher than version 41's, so Argo rolls it back within 3 minutes. Only 5% of users saw the bug, briefly.",bad:["v42"],go:[["v42>argo","b",1,0,1.2]]}]
};

/* ---------- renderer ---------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function build(key){
  const d=D[key],N={};let o=`<svg viewBox="0 0 ${d.W} ${d.H}" role="img" aria-label="Animated diagram"><defs><marker id="ar-${key}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="mk"/></marker></defs>`;
  (d.z||[]).forEach(z=>{o+=`<rect class="zone" x="${z[0]}" y="${z[1]}" width="${z[2]}" height="${z[3]}" rx="10"/><text class="zl" x="${z[0]+12}" y="${z[1]+18}">${esc(z[4])}</text>`});
  d.n.forEach(n=>{const [k,x,y,w,t,s,tl,c]=n;const h=tl&&tl.length?(s?72:58):(s?54:44);N[k]={x,y,w,h}});
  const geo=(a,b)=>{const A=N[a],B=N[b];const ax=A.x+A.w/2,ay=A.y+A.h/2,bx=B.x+B.w/2,by=B.y+B.h/2;
    const clip=(R,cx,cy,dx,dy)=>{const s=Math.min(dx?(R.w/2+3)/Math.abs(dx):1e9,dy?(R.h/2+3)/Math.abs(dy):1e9);return[cx+dx*s,cy+dy*s]};
    const p=clip(A,ax,ay,bx-ax,by-ay),q=clip(B,bx,by,ax-bx,ay-by);return`M${p[0].toFixed(1)},${p[1].toFixed(1)} L${q[0].toFixed(1)},${q[1].toFixed(1)}`};
  const custom={};
  d.e.forEach(e=>{const [a,b,l,cp]=e;const p=cp||geo(a,b);if(cp)custom[a+'>'+b]=cp;
    const dash=(d.dash||[]).includes(a)?' dash':'';o+=`<path class="ed${dash}" d="${p}" marker-end="url(#ar-${key})"/>`;
    if(l){const m=p.match(/-?[\d.]+/g).map(Number);let lx,ly;
      if(cp){lx=(m[0]+3*m[2]+3*m[4]+m[6])/8;ly=(m[1]+3*m[3]+3*m[5]+m[7])/8}else{lx=(m[0]+m[2])/2;ly=(m[1]+m[3])/2}
      o+=`<text class="el" x="${lx.toFixed(1)}" y="${(ly-5).toFixed(1)}" text-anchor="middle">${esc(l)}</text>`}});
  d.n.forEach(n=>{const [k,x,y,w,t,s,tl,c]=n;const h=N[k].h;
    o+=`<g><rect class="nd ${c||''}" data-k="${k}" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>`;
    o+=`<text class="nt" x="${x+12}" y="${y+22}">${esc(t)}</text>`;
    if(s)o+=`<text class="ns" x="${x+12}" y="${y+39}">${esc(s)}</text>`;
    let bx=x+10;(tl||[]).forEach(tk=>{const tt=T[tk];if(!tt)return;const bw=Math.round(tt[0].length*6.1+30);
      o+=`<g transform="translate(${bx},${y+h-27})"><rect class="bdgbg" width="${bw}" height="20" rx="5"/><rect class="bdgsq" x="3" y="3" width="14" height="14" rx="3" fill="${tt[1]}"/><text class="bdga" x="10" y="13" text-anchor="middle" fill="${tt[3]}">${esc(tt[2])}</text><text class="bdgn" x="22" y="14">${esc(tt[0])}</text></g>`;bx+=bw+6});
    o+=`</g>`});
  o+='</svg>';
  const rev=p=>{const m=p.match(/-?[\d.]+/g);return`M${m[6]},${m[7]} C${m[4]},${m[5]} ${m[2]},${m[3]} ${m[0]},${m[1]}`};
  const pathFor=(a,b)=>custom[a+'>'+b]||(custom[b+'>'+a]?rev(custom[b+'>'+a]):geo(a,b));
  return {svg:o,pathFor};
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
function fly(svg,d,c,o){
  const du=(o.du||1)*1000;if(RM)return;
  let g=svg.querySelector('g.fx');if(!g){g=document.createElementNS(NS,'g');g.setAttribute('class','fx');svg.appendChild(g)}
  const mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);g.appendChild(e);return e};
  const p=mk('path',{d,fill:'none',stroke:'none'}),L=p.getTotalLength();
  const halo=mk('circle',{r:10,class:'pk-'+c,opacity:0}),dot=mk('circle',{r:5,class:'pk-'+c,opacity:0});
  const st=performance.now()+(o.dl||0)*1000;
  (function f(now){if(!o.alive()){p.remove();halo.remove();dot.remove();return}
    let t=(now-st)/du;if(t<0)return requestAnimationFrame(f);if(t>1)t=1;
    const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,pt=p.getPointAtLength(e*L),op=t>.86?(1-t)/.14:Math.min(1,t*8);
    for(const el of[dot,halo]){el.setAttribute('cx',pt.x);el.setAttribute('cy',pt.y)}dot.setAttribute('opacity',op);halo.setAttribute('opacity',op*.25);
    if(t<1)requestAnimationFrame(f);else{p.remove();halo.remove();dot.remove()}})(performance.now());
}
const TN={1:"Scale",2:"APIs",3:"Load balancing",4:"Caching",5:"Databases",6:"Consistency",7:"Queues",8:"Architecture",9:"Resilience",10:"Storage & geo",11:"Security",12:"Observability"};

function Player(host,key){
  const b=build(key),steps=S[key];
  host.innerHTML=`<div class="scroll">${b.svg}</div><div class="player"><div class="pc"><button type="button" class="pb-play">▶ Play</button><button type="button" class="pb-prev" aria-label="Previous step">‹</button><div class="chips"></div><button type="button" class="pb-next" aria-label="Next step">›</button></div><div class="pbar"><i></i></div><div class="nar" aria-live="polite"><p class="nar-k"></p><p class="nar-t"></p><p class="nar-s"></p></div></div>`;
  const svg=host.querySelector('svg'),btn=host.querySelector('.pb-play'),chips=host.querySelector('.chips'),bar=host.querySelector('.pbar i');
  let i=0,playing=false,gen=0,timer=null,userPaused=false;
  steps.forEach((s,k)=>{const c=document.createElement('button');c.type='button';c.textContent=k+1;c.setAttribute('aria-label','Step '+(k+1)+': '+s.t);c.onclick=()=>show(k);chips.appendChild(c)});
  const R=k=>svg.querySelector(`rect[data-k="${k}"]`);
  function show(k){gen++;const g=gen;clearTimeout(timer);i=k;const s=steps[k];
    svg.querySelectorAll('.hot,.hotb,.hotg').forEach(r=>r.classList.remove('hot','hotb','hotg'));
    (s.hl||[]).forEach(x=>R(x)&&R(x).classList.add('hot'));(s.bad||[]).forEach(x=>R(x)&&R(x).classList.add('hotb'));(s.ok||[]).forEach(x=>R(x)&&R(x).classList.add('hotg'));
    const kk=host.querySelector('.nar-k');kk.textContent='Step '+(k+1)+' of '+steps.length;
    (s.tp||[]).forEach(n=>{const a=document.createElement('a');a.href='#c'+n;a.textContent=String(n).padStart(2,'0')+' '+TN[n];kk.appendChild(a)});
    host.querySelector('.nar-t').textContent=s.t;host.querySelector('.nar-s').textContent=s.s;
    [...chips.children].forEach((c,j)=>c.classList.toggle('on',j===k));bar.style.width=((k+1)/steps.length*100)+'%';
    let dur=0;(s.go||[]).forEach(a=>{const [ab,c,n=1,dl=0,du=1]=a;const [x,y]=ab.split('>');const d=b.pathFor(x,y);
      for(let j=0;j<n;j++)fly(svg,d,c,{dl:dl+j*.3,du,alive:()=>g===gen});dur=Math.max(dur,dl+(n-1)*.3+du)});
    if(playing)timer=setTimeout(()=>{if(g===gen)show((i+1)%steps.length)},Math.max(dur*1000+1100,s.s.length*45,3400));
  }
  const play=()=>{playing=true;btn.textContent='❚❚ Pause';show(i)};
  const pause=()=>{playing=false;clearTimeout(timer);btn.textContent='▶ Play'};
  btn.onclick=()=>{if(playing){pause();userPaused=true}else{userPaused=false;play()}};
  host.querySelector('.pb-prev').onclick=()=>show((i-1+steps.length)%steps.length);
  host.querySelector('.pb-next').onclick=()=>show((i+1)%steps.length);
  show(0);
  if(!RM&&'IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!userPaused&&!playing)play();else if(!e.isIntersecting&&playing)pause()}),{threshold:.4}).observe(host);
}
document.querySelectorAll('.dg[data-d]').forEach(h=>{if(D[h.dataset.d]&&S[h.dataset.d])Player(h,h.dataset.d)});
})();
