// Concept notes per episode: definition, key terms, notes, and interview questions.
// Compiled from common system design interview question banks and standard references
// (see the Sources list in the project README). Keyed by the episode id used in videos.js.
window.__NOTES = {
scale: {
  def: "Scalability is a system's ability to handle more load (users, requests, data) by adding resources without a redesign. Vertical scaling (scale up) makes one machine bigger. Horizontal scaling (scale out) adds more machines and spreads the work across them, usually behind a load balancer.",
  terms: [
    ["Vertical scaling", "More CPU and RAM on one machine"],
    ["Horizontal scaling", "More ordinary machines sharing the load"],
    ["Stateless server", "Keeps no user data in its own memory, so any copy can serve any request"],
    ["Autoscaling", "Adds or removes servers automatically from a metric such as CPU or requests per second"],
    ["Single point of failure", "One component whose failure takes everything down"],
    ["Throughput vs latency", "Requests per second vs time taken per request"]
  ],
  notes: [
    "Scale up first when you can: no code changes and no new infrastructure. It is a good first step and often right for databases.",
    "Scaling up has a hardware ceiling, cost grows faster than capacity, and it is still one machine, so it is a single point of failure.",
    "Scaling out needs stateless servers. Move sessions and carts to Redis or a database and files to object storage such as S3, so any server can handle any request.",
    "Scaling out needs a load balancer and health checks. It gives you capacity and redundancy at the same time.",
    "Autoscale on a signal that tracks load (CPU, requests per instance, queue depth), add a cooldown to stop flapping, and keep at least two instances in different zones.",
    "Measure before you scale. Find the real bottleneck (CPU, memory, database, network). A slow query is a bug, not a capacity problem.",
    "Do a back-of-envelope estimate: average QPS = requests per day / 86,400, and peak is often 2 to 10 times the average."
  ],
  qs: [
    ["What is the difference between vertical and horizontal scaling, and when would you pick each?", "Vertical means a bigger machine: simple, no code changes, but capped and a single point of failure. Horizontal means more machines behind a load balancer: grows almost without limit and survives failures, but needs stateless services and more operations. Start vertical for simplicity (especially databases), go horizontal for the stateless app tier and sustained growth."],
    ["Why do servers need to be stateless to scale horizontally, and how do you make a stateful app stateless?", "If a server keeps a user's session in its own memory, only that server can serve them, so you cannot add or remove servers freely. Move that state out: sessions to Redis or signed tokens, uploads to S3, carts to a database. The test is that any server can handle any request."],
    ["Your app is slow under load. How do you decide whether to scale?", "Diagnose first: check CPU, memory, database load, queue depth and slow-query logs, and look at p95/p99 latency, not averages. If one query or one dependency is the bottleneck, fix that. Scale only the layer that is actually saturated, and confirm with a load test."],
    ["How does autoscaling work, and what can go wrong?", "A controller watches a metric and adds or removes instances to hold a target. Problems: slow startup (cold start) so scaling lags a spike, flapping from no cooldown, scaling on the wrong metric, hitting account limits, and the database becoming the new bottleneck. Mitigate with warm pools, scheduled scaling, sensible cooldowns and connection pooling."],
    ["Which parts of a system are hardest to scale horizontally?", "Anything stateful, especially the database write path. Reads scale with replicas and caches, but writes need sharding, which brings cross-shard queries and transactions. That is why you scale the stateless tier out and scale the database up for as long as possible."],
    ["How would you estimate capacity for an app with 10 million daily users?", "Say each user makes 20 requests a day: 200M/86,400 is about 2,300 average QPS. Assume peak is 5 times the average, so about 12,000 QPS. If one server handles 500 QPS, you need about 24 servers plus headroom and redundancy. Then estimate storage and bandwidth the same way."],
    ["What is a single point of failure and how do you remove one?", "A component whose failure stops the whole system, such as one server, one database or one load balancer. Remove it with redundancy: multiple instances across zones, replicas with automatic failover, and a redundant load balancer. Then test it by killing components on purpose."],
    ["Sticky sessions or a shared session store?", "Sticky sessions pin a user to one server, which is easy but uneven and loses the session if that server dies. A shared store (Redis) or signed tokens keep servers interchangeable. Prefer the shared store or tokens for horizontal scaling."]
  ]
},

net: {
  def: "Networking and APIs cover how a request travels from a device to your service and back. DNS turns a name into an IP address, TCP and TLS (HTTPS) give a reliable encrypted connection, a CDN serves static files from nearby, and APIs (REST, gRPC, WebSockets, webhooks) define how clients and services talk.",
  terms: [
    ["DNS", "Maps a domain name to an IP address; answers are cached for their TTL"],
    ["TCP vs UDP", "Reliable ordered delivery vs fast best-effort delivery"],
    ["TLS / HTTPS", "Encrypts the connection and proves the server's identity"],
    ["CDN", "Servers near users that cache and serve static files"],
    ["REST vs gRPC", "Resource-style HTTP and JSON vs typed binary calls over HTTP/2"],
    ["Idempotency key", "A unique key so a retried request is processed only once"],
    ["WebSocket / SSE", "Long-lived connections for live two-way or server-to-client updates"],
    ["Webhook", "A partner's server calls your endpoint when something happens"]
  ],
  notes: [
    "DNS answers are cached for their TTL. A low TTL lets you fail over faster but increases lookups.",
    "A TLS handshake costs round trips, so reuse connections (keep-alive), use HTTP/2 multiplexing, and HTTP/3 (QUIC) on bad networks.",
    "REST uses nouns and verbs. GET, PUT and DELETE are idempotent, POST is not. Know the status codes: 200, 201, 400, 401, 403, 404, 409, 429, 5xx.",
    "Make unsafe retries safe with idempotency keys: store the key and the response, enforce uniqueness in the database, and handle two requests with the same key arriving at once.",
    "Paginate with cursors for large or changing lists (offset pagination slows down and skips rows). Version APIs so old clients keep working.",
    "gRPC (protobuf over HTTP/2) is fast and strongly typed, good between internal services, weaker for browsers. Use REST for public APIs.",
    "Real-time options in order: polling, long polling, Server-Sent Events (server to client), WebSockets (two-way). Pick the simplest that fits.",
    "Webhooks: verify the signature, answer 2xx quickly, process asynchronously, and treat duplicates as normal."
  ],
  qs: [
    ["What happens when you type a URL into a browser and press Enter?", "The browser checks its caches, resolves the name through DNS, opens a TCP connection, performs the TLS handshake, sends the HTTP request (possibly via a CDN and load balancer), the server responds, and the browser renders the page and fetches more resources. Mention caching and connection reuse at each step."],
    ["REST vs gRPC vs GraphQL: when do you use each?", "REST is simple, cacheable and universal, so use it for public APIs. gRPC is fast, typed and supports streaming, so use it between internal services. GraphQL lets clients ask for exactly the fields they need, which helps varied mobile and web clients, but adds server complexity and makes caching harder."],
    ["How do you make POST /orders safe to retry?", "The client sends a unique Idempotency-Key header. The server stores the key with the result under a unique constraint. A retry with the same key returns the saved result instead of creating a second order. Handle concurrent duplicates with the unique constraint or a lock, and expire keys after a day or so."],
    ["Polling vs long polling vs SSE vs WebSockets?", "Polling is simple but wasteful. Long polling holds the request open until there is data. SSE is a one-way stream from server to client over HTTP and reconnects automatically. WebSockets are full two-way and best for chat or live tracking, but need sticky or stateful connection handling and reconnect logic."],
    ["What changed between HTTP/1.1, HTTP/2 and HTTP/3?", "HTTP/1.1 handles one request at a time per connection. HTTP/2 multiplexes many requests on one TCP connection with header compression. HTTP/3 runs over QUIC (UDP), which removes TCP head-of-line blocking and speeds up connection setup, especially on mobile networks."],
    ["Offset vs cursor pagination?", "Offset (page=50) is simple but slow on deep pages and can skip or repeat rows when data changes. Cursor (after=last_id) uses an indexed position, stays fast and stable. Use cursors for feeds and large tables."],
    ["401 vs 403?", "401 means not authenticated: no valid credentials. 403 means authenticated but not allowed to do this. Returning 404 for resources a user must not know exist is sometimes used to avoid leaking information."],
    ["How do you change an API without breaking clients?", "Add fields instead of changing or removing them, keep old behaviour, and version breaking changes (URL or header). Announce deprecation with dates, monitor who still uses the old version, and only then remove it."]
  ]
},

lb: {
  def: "A load balancer sits in front of several identical servers and spreads incoming requests across the healthy ones, so no single server is overloaded and one failure is invisible to users. It works at layer 4 (TCP/IP: fast, blind to content) or layer 7 (HTTP: can route by path, host or headers).",
  terms: [
    ["Layer 4 vs layer 7", "Routes on IP and port vs routes on HTTP content"],
    ["Round robin", "Servers take turns; fine when requests are similar"],
    ["Least connections", "Send to the server with the fewest active requests"],
    ["Health check", "A probe that decides whether a server may receive traffic"],
    ["Sticky session", "Keeps one user on the same server"],
    ["Consistent hashing", "Maps keys to servers so adding one moves little data"],
    ["TLS termination", "The balancer decrypts HTTPS so servers do not have to"],
    ["Connection draining", "Finish in-flight requests before removing a server"]
  ],
  notes: [
    "Round robin works when requests are uniform and servers equal. Use least connections or least response time when request durations vary, and weights for unequal machines.",
    "Health checks: active probes (an HTTP /health endpoint) plus passive checks (watching real errors). Remove a server after a few failures, add it back after a few passes.",
    "The load balancer must not be a single point of failure: use a redundant pair, a managed balancer, or DNS and anycast across regions.",
    "Layer 7 enables path routing (/api vs /static), TLS termination, compression, caching and a web application firewall, at a small cost in speed.",
    "Sticky sessions skew the load and lose sessions when a server dies. Prefer stateless servers with a shared session store.",
    "Consistent hashing is the usual answer for caches and stateful backends: adding or removing a node remaps only a small share of keys.",
    "For deploys, use connection draining and rolling updates so users never hit a server that is shutting down.",
    "Long-lived connections (WebSockets) need least-connections routing, draining on deploy, and clients that reconnect with jitter."
  ],
  qs: [
    ["What is the difference between an L4 and an L7 load balancer?", "L4 forwards TCP or UDP connections using only IP and port, so it is very fast and works for any protocol. L7 understands HTTP, so it can route by path, host or header, terminate TLS, and apply policies, at somewhat higher cost. Choose L7 when you need content-based routing."],
    ["Which load balancing algorithm would you choose and why?", "Round robin for uniform, short requests. Least connections when request times vary a lot. Weighted versions for mixed hardware. Hash-based (consistent hashing) when requests for the same key must reach the same node, such as a cache. State the workload first, then justify."],
    ["How does a load balancer know a server is down?", "Active health checks call an endpoint every few seconds and mark the server unhealthy after N failures. Passive checks watch real traffic for errors and timeouts. Use both, and make the health endpoint check real dependencies without being so strict that one slow dependency removes every server."],
    ["How do you avoid the load balancer being a single point of failure?", "Run at least two in active-active or active-passive mode with a floating IP or managed service, spread them across zones, and use DNS or anycast for multiple regions. Monitor and test failover."],
    ["Sticky sessions: pros and cons?", "Pros: simple for apps that keep state in memory, good cache locality. Cons: uneven load, lost sessions when a server fails, harder deploys and scaling. Better to make servers stateless and keep sessions in Redis or signed tokens."],
    ["How do you do zero-downtime deploys behind a load balancer?", "Roll out one batch at a time: take instances out of rotation, drain their connections, update, wait for health checks to pass, then add them back. Combine with canary or blue-green releases for risk control."],
    ["How would you load balance WebSocket or other long-lived connections?", "Use least-connections routing, since connection count matters more than request count. Drain gracefully on deploy by asking clients to reconnect, and add jitter to reconnects so you do not get a thundering herd. Keep connection state small or externalised."],
    ["What is consistent hashing and where does it appear in load balancing?", "It places servers and keys on a hash ring so a key goes to the next server clockwise. When a server is added or removed only about 1/N of keys move. It is used for cache clusters, sharded databases and sticky routing without a session table, often with virtual nodes for even spread."]
  ]
},

cache: {
  def: "A cache keeps a copy of frequently read data in fast storage, usually memory such as Redis, so most reads skip the slow database. In the common cache-aside pattern the app checks the cache first, and on a miss reads the database and stores the result with a time to live (TTL).",
  terms: [
    ["Hit ratio", "Share of reads served from the cache"],
    ["TTL", "How long an entry may live before it expires"],
    ["Cache-aside", "App reads the cache, loads from the database on a miss"],
    ["Write-through / write-behind", "Write to cache and database together vs cache first, database later"],
    ["Invalidation", "Removing or updating cached data when the source changes"],
    ["Stampede", "Many requests rebuild the same expired key at once"],
    ["LRU / LFU", "Evict the least recently used or least frequently used keys"],
    ["Hot key", "One key that gets a huge share of traffic"]
  ],
  notes: [
    "Cache data that is read often and changes rarely. Never cache values that must be exact right now, such as a payment status or stock at checkout.",
    "Patterns: cache-aside (app manages it), read-through, write-through (consistent, slower writes), write-behind (fast but can lose data), write-around (skip the cache on writes).",
    "On a write, update the database and delete the cache key. Deleting is safer than updating because it avoids race conditions that leave stale data.",
    "Give every key a TTL and add random jitter so keys do not all expire together.",
    "Stampede protection: one request rebuilds while others wait (single-flight or a lock), serve stale while revalidating, or refresh before expiry.",
    "LRU is the default eviction policy. LFU suits data with stable popularity.",
    "Use layers: browser cache, CDN, application cache, database cache. Track the hit ratio and the latency of misses.",
    "Plan for the cache being down: short timeouts, fall back to the database with protection (circuit breaker, limits), because a cold cache can overload the database."
  ],
  qs: [
    ["Explain cache-aside, read-through, write-through and write-behind.", "Cache-aside: the app checks the cache, loads from the database on a miss and fills the cache. Read-through: the cache itself loads on a miss. Write-through: writes go to cache and database together, so they stay consistent but writes are slower. Write-behind: write to the cache, flush to the database later; fast but data can be lost if the cache dies."],
    ["How do you keep the cache and database consistent?", "Treat the database as the source of truth. On writes, update the database then delete the key, and use TTLs as a safety net. For stronger needs, publish change events (CDC) that invalidate keys. Accept bounded staleness and decide per data type how stale is acceptable."],
    ["What is a cache stampede and how do you prevent it?", "When a popular key expires, many requests miss at once and all hit the database. Prevent it with a single-flight lock so one request rebuilds, stale-while-revalidate, early refresh, and jittered TTLs."],
    ["How would you implement an LRU cache?", "A hash map for O(1) lookup plus a doubly linked list ordered by recency. On get, move the node to the front. On put, insert at the front and evict the tail when over capacity. Both operations are O(1)."],
    ["What should you not cache?", "Data that must be exactly right at that moment (balances, inventory at checkout, payment state), highly personalised data with low reuse, and very large or rarely read objects."],
    ["What happens if the cache goes down?", "Reads fall back to the database, which may overload. Protect it with rate limits, circuit breakers, request coalescing and a warm replica or cluster. Redis replication or clustering reduces the chance and the blast radius."],
    ["What is the hot key problem?", "One key (a celebrity profile, a viral item) receives far more traffic than a single cache node can serve. Fixes: replicate the key across nodes, add a small local in-process cache, or split it into several keys and read one at random."],
    ["Cache penetration, breakdown and avalanche: what are they?", "Penetration: requests for keys that never exist bypass the cache (fix with negative caching or a Bloom filter). Breakdown: one hot key expires (fix with locks). Avalanche: many keys expire together or the cache fails (fix with TTL jitter, redundancy, and rate limiting)."]
  ]
},

db: {
  def: "Database scaling is the ordered set of steps for handling more reads and writes: tune queries and add indexes, add a cache, scale up, add read replicas, plan for failover, and finally shard, which splits data across several primaries by a shard key.",
  terms: [
    ["Index", "A structure that makes lookups fast at the cost of slower writes"],
    ["Read replica", "A copy that serves reads and follows the primary"],
    ["Replication lag", "How far a replica is behind the primary"],
    ["Failover", "Promoting a replica when the primary dies"],
    ["Sharding", "Splitting data across several databases by a key"],
    ["Shard key", "The field that decides which shard holds a row"],
    ["Consistent hashing", "Spreads keys so adding a shard moves little data"],
    ["Read-your-writes", "A user always sees their own latest write"]
  ],
  notes: [
    "Order of operations: fix queries and add indexes, add a cache, scale up, add read replicas, then shard. Do the next step only when the previous one is not enough.",
    "Replicas scale reads, not writes. Every write still goes to one primary.",
    "Asynchronous replication means replicas can serve stale data. For read-your-writes, send a user's reads to the primary for a short time after they write, or track a log position so only caught-up replicas answer.",
    "Failover has four jobs: detect the failure, promote a replica, fence the old primary, and repoint clients. Async replication can lose acknowledged writes; semi-synchronous replication bounds that loss.",
    "Pick a shard key that matches your queries and spreads load evenly (user_id, city_id). A bad key creates hot shards and is very hard to change later.",
    "Sharding makes cross-shard joins, transactions and global queries hard. Plan for resharding with consistent hashing and virtual nodes.",
    "Use connection pooling, and choose SQL or NoSQL by the access pattern, not by fashion."
  ],
  qs: [
    ["Your database is the bottleneck. How do you scale it?", "In order: find slow queries and add indexes, add a cache, scale up the machine, add read replicas for read-heavy load, then shard when writes outgrow one primary or the data no longer fits on one machine. Explain that you only move to the next step when the previous one is exhausted."],
    ["What is replication lag and how do you handle it?", "With asynchronous replication a replica applies changes slightly after the primary, so reads can be stale. Handle it with read-your-writes routing, reading critical data from the primary, tracking replication position, and showing pending states in the UI."],
    ["Synchronous vs asynchronous replication?", "Synchronous waits for replicas before acknowledging, so no loss but higher latency and lower availability. Asynchronous acknowledges immediately, so it is fast but can lose recent writes on failover. Semi-synchronous (wait for one replica) is the common compromise."],
    ["How does database failover work and what can go wrong?", "A monitor detects the primary is down, promotes the most up-to-date replica, and points clients to it. Risks: lost acknowledged writes, split brain if the old primary comes back (needs fencing), and a stale replica being promoted."],
    ["How do you choose a shard key and a sharding strategy?", "Choose a high-cardinality key that appears in most queries and spreads data and traffic evenly. Range sharding is easy for scans but creates hot ranges. Hash sharding spreads evenly but makes range queries hard. Directory-based sharding is flexible but adds a lookup service."],
    ["What is consistent hashing and why use it for sharding?", "Keys and shards sit on a ring, and a key belongs to the next shard clockwise. Adding or removing a shard moves only a fraction of the keys instead of reshuffling everything. Virtual nodes even out the distribution."],
    ["What are the downsides of sharding?", "Cross-shard joins and transactions are hard, global uniqueness and ordering are harder, rebalancing is painful, operations grow more complex, and a poor key creates hot shards. Delay sharding until needed."],
    ["How do you reshard without downtime?", "Create the new shards, copy data in the background while double-writing new changes, verify, then switch reads and finally writes to the new layout, keeping a rollback path. Consistent hashing reduces how much data moves."]
  ]
},

cons: {
  def: "Consistency in distributed systems is about whether all copies of data agree and what you give up when machines or networks fail. CAP says that during a network partition you must choose between consistency and availability. Quorums keep replicas in step, majorities prevent split brain, and sagas keep multi-service workflows consistent without one big transaction.",
  terms: [
    ["CAP theorem", "During a partition you pick consistency or availability"],
    ["Eventual consistency", "Copies converge if no new writes arrive"],
    ["Quorum", "A set of replicas that must agree; W + R > N guarantees overlap"],
    ["Split brain", "Two nodes both believe they are the leader"],
    ["Fencing token", "An increasing number that lets storage reject a stale leader"],
    ["Saga", "A sequence of local transactions with undo steps"],
    ["Compensating action", "The step that reverses an earlier saga step"],
    ["Two-phase commit", "A blocking protocol for atomic commits across systems"]
  ],
  notes: [
    "Partitions will happen, so the real choice is CP (refuse some requests to stay correct) or AP (stay up and reconcile later), and it can differ per feature: payments lean CP, feeds lean AP.",
    "Quorum rule: with N replicas, write to W and read from R. If W + R > N, every read overlaps the latest write.",
    "Use majorities (and an odd number of nodes) for leader election so two sides of a partition cannot both elect a leader.",
    "Fencing tokens stop a paused or partitioned old leader from corrupting data after a new leader takes over.",
    "Two-phase commit blocks if the coordinator fails and is rarely used across microservices.",
    "A saga is a chain of local transactions with compensating actions. Orchestration uses a central coordinator; choreography lets services react to events.",
    "Every saga step and every compensation must be idempotent and safe to retry, with timeouts and a record of progress.",
    "Eventual consistency is fine when the product handles it: show pending states and confirm later."
  ],
  qs: [
    ["Explain the CAP theorem with an example.", "In a distributed store, when the network splits two replicas apart, you either refuse some requests to keep data consistent (CP) or keep answering and let replicas diverge (AP). Partition tolerance is not optional, so the real trade-off is consistency vs availability during a partition."],
    ["Give examples of CP and AP systems.", "CP-leaning: ZooKeeper, etcd, HBase and strongly consistent configurations of most relational clusters. AP-leaning: Cassandra and DynamoDB (tunable), DNS. Many systems are tunable, so explain the setting, not just the label."],
    ["What is a quorum and what does W + R > N mean?", "With N replicas, a write waits for W acknowledgements and a read asks R replicas. If W + R > N the read set and write set always overlap, so a read sees the latest acknowledged write. Lower W or R trades consistency for speed and availability."],
    ["What is split brain and how do you prevent it?", "Two parts of a cluster each believe they have the leader and accept conflicting writes. Prevent it with majority-based leader election, leases, and fencing tokens so storage rejects writes from an old leader."],
    ["What is the saga pattern and how do orchestration and choreography differ?", "A saga splits a business transaction into local transactions, each with a compensating action. In orchestration a central coordinator tells services what to do and tracks state. In choreography services publish and react to events. Orchestration is easier to follow; choreography is looser but harder to debug."],
    ["Why not use two-phase commit across services?", "It needs every participant to be available and locks resources while waiting, so it hurts availability and latency, and a coordinator failure can block everything. Sagas with idempotent steps and compensations scale better."],
    ["Strong vs eventual consistency: how do you decide?", "Use strong consistency where wrong data costs money or trust (payments, inventory, uniqueness). Use eventual where slight delay is harmless (likes, feeds, search) and design the UI around it."],
    ["What happens if a saga step fails halfway?", "Run the compensating actions for the completed steps in reverse order, retrying them until they succeed, and record the state so a restart can continue. Steps and compensations must be idempotent, and a stuck saga needs timeouts and alerts."]
  ]
},

queue: {
  def: "A message queue or log (SQS, RabbitMQ, Kafka) lets a service hand work off asynchronously: the producer writes an event and returns quickly, and consumers process it later at their own pace. It absorbs traffic spikes and decouples services, at the cost of duplicates, ordering questions and eventual results.",
  terms: [
    ["Producer / consumer", "The side that writes events and the side that processes them"],
    ["Topic and partition", "A named stream split into ordered, parallel pieces"],
    ["Consumer group", "Consumers that share a topic's partitions"],
    ["Offset", "A consumer's position in a partition"],
    ["At-least-once", "Never lost, but may be delivered twice"],
    ["Outbox pattern", "Save the event in the same database transaction, publish it afterwards"],
    ["Idempotent consumer", "Processing a message twice has the same effect as once"],
    ["Dead-letter queue", "Where messages go after repeated failures"]
  ],
  notes: [
    "Use a queue for work the user does not wait for: emails, notifications, payments follow-ups, analytics, and anything that must survive traffic spikes.",
    "In Kafka, a partition is the unit of order and parallelism. Order is guaranteed only within a partition, so key messages by the entity (order_id).",
    "Consumers in a group share partitions, so you cannot usefully have more consumers than partitions.",
    "At-least-once delivery is the practical default, so consumers must be idempotent: dedupe by message id, use upserts or a unique constraint.",
    "Kafka's exactly-once covers idempotent producers and transactions inside Kafka. End to end you still need idempotent consumers.",
    "Dual-write problem: saving to the database and publishing to the queue can disagree. The outbox pattern writes both in one local transaction and a relay or change-data-capture tool publishes.",
    "Retry with backoff, then send the message to a dead-letter queue and alert. Watch consumer lag, which shows when consumers fall behind.",
    "Plan schema changes: keep messages backward compatible so old and new consumers can coexist."
  ],
  qs: [
    ["Why use a message queue?", "To decouple services, absorb traffic spikes, let slow work happen in the background, retry failures, and let several consumers react to the same event. The cost is complexity: eventual results, duplicates and ordering concerns."],
    ["Kafka vs RabbitMQ vs SQS?", "Kafka is a durable, replayable log built for high throughput, ordering per partition and many independent consumers. RabbitMQ is a flexible broker with routing and per-message acknowledgements. SQS is a managed queue that is simple to run. Pick by replay needs, throughput, routing needs and operations burden."],
    ["How does Kafka guarantee ordering?", "Only within a partition. Messages with the same key go to the same partition, so keying by order_id keeps one order's events in order. There is no global order across partitions."],
    ["Explain delivery semantics and exactly-once.", "At-most-once may lose messages, at-least-once may duplicate them, and exactly-once means the effect happens once. In practice you get it with at-least-once delivery plus idempotent processing, optionally using Kafka transactions for read-process-write inside Kafka."],
    ["What is the outbox pattern and why is it needed?", "Saving a row and publishing an event are two separate systems, so one can succeed and the other fail. The outbox writes the event to a table in the same transaction as the business change, and a relay or CDC process publishes it, so nothing is lost and nothing is published without the change."],
    ["How do you handle duplicate messages?", "Make the consumer idempotent: record processed message ids, use upserts, or rely on a unique constraint, so repeating a message changes nothing."],
    ["What is a dead-letter queue and how do you handle poison messages?", "A DLQ holds messages that keep failing after limited retries. Alert on it, inspect and fix the cause, then replay. Without it, one bad message can block a partition forever."],
    ["What causes consumer lag and how do you fix it?", "Consumers slower than producers, slow downstream calls, skewed partitions, or rebalances. Fix by adding consumers (up to the partition count), speeding up processing, batching, adding partitions, or applying backpressure upstream."]
  ]
},

arch: {
  def: "Architecture style decides how code and teams are split. A monolith is one deployable unit: simple to build, test and run. Microservices split the system by business capability into independently deployable services that each own their data and talk through an API gateway and events, giving more independence at the price of much more operational complexity.",
  terms: [
    ["Monolith", "One codebase and one deployment"],
    ["Microservice", "A small service owning one business capability and its data"],
    ["Bounded context", "A business area with its own language and model"],
    ["API gateway", "Single entry point that routes, authenticates and rate limits"],
    ["Database per service", "Each service owns its data; no shared tables"],
    ["Strangler fig", "Gradually replace a monolith piece by piece"],
    ["Event-driven", "Services react to published events instead of direct calls"],
    ["CQRS", "Separate models for writing and reading"]
  ],
  notes: [
    "Start with a well-structured (modular) monolith and split only when team size, deployment conflicts or scaling needs differ by area.",
    "Split by business capability or bounded context (orders, payments, delivery), not by technical layer.",
    "Each service owns its data. Other services use its API, events, or a read model. A shared database couples services and defeats the purpose.",
    "An API gateway handles routing, authentication, rate limiting and aggregation, but should not hold business logic.",
    "Beware the distributed monolith: services that must deploy together or call each other constantly have the costs of both styles.",
    "Synchronous calls couple availability and cause cascading failures. Use timeouts, circuit breakers, and events where the user does not need an immediate answer.",
    "Migrate with the strangler fig pattern: route one capability at a time to a new service, then delete the old code. Avoid big-bang rewrites.",
    "Microservices cost you network latency, tracing and monitoring, data consistency work and harder testing."
  ],
  qs: [
    ["Monolith vs microservices: which would you choose?", "It depends on team size and needs. A monolith is simpler, faster to build and easier to debug, so it is the right start for most products. Microservices pay off when many teams need independent deploys, parts need different scaling, or failures must be isolated. A good answer is: monolith first, split when a real pressure justifies it."],
    ["How do you decide service boundaries?", "Follow business capabilities and bounded contexts, keep services cohesive with few cross-service calls, and align them with team ownership. If two services always change and deploy together, they probably should be one."],
    ["If every service has its own database, how do you do joins and reports?", "Use API composition (a service calls others and combines results), keep a denormalised read model built from events (CQRS), or feed a data warehouse for reporting. Avoid reaching into another service's tables."],
    ["What does an API gateway do, and what are the risks?", "It is the single entry point: routing, authentication, rate limiting, TLS, request aggregation and monitoring. Risks: becoming a bottleneck or single point of failure, and accumulating business logic. Run it redundantly and keep it thin."],
    ["How would you migrate a monolith to microservices?", "Use the strangler fig pattern: put a gateway or proxy in front, extract one bounded context at a time with its own database, route traffic to it, and remove the old code. Do it incrementally with feature flags and monitoring."],
    ["Synchronous vs asynchronous communication between services?", "Synchronous (REST or gRPC) is simple and immediate but couples availability and latency. Asynchronous events decouple services and absorb spikes but make flows eventually consistent and harder to trace. Use sync for queries needing an answer now, async for follow-up work."],
    ["What is a distributed monolith?", "A system split into services that are still tightly coupled: shared database, lockstep releases, chatty calls. It has all the operational cost of microservices and none of the independence. Fix boundaries and reduce coupling."],
    ["How do you handle a transaction that spans services?", "Use a saga: a series of local transactions with compensating actions, coordinated by orchestration or events, with idempotent steps. Avoid distributed transactions."]
  ]
},

res: {
  def: "Resilience is keeping the system useful when parts fail or traffic surges. Rate limiting caps excessive requests, load shedding drops low-priority work first, circuit breakers stop calling a failing dependency, and retries with backoff and jitter recover from short faults without making an outage worse.",
  terms: [
    ["Token bucket", "Tokens refill steadily; each request spends one; allows bursts"],
    ["Sliding window", "Counts requests over a moving time window"],
    ["Circuit breaker", "Stops calls to a failing service (closed, open, half-open)"],
    ["Timeout", "The longest you will wait for a response"],
    ["Backoff and jitter", "Wait longer between retries, with random variation"],
    ["Bulkhead", "Separate resource pools so one failure cannot drain everything"],
    ["Load shedding", "Reject some work early to protect the rest"],
    ["Graceful degradation", "Serve a simpler result instead of failing"]
  ],
  notes: [
    "Rate limit algorithms: token bucket (bursts allowed), leaky bucket (smooth output), fixed window (can allow 2x at window edges), sliding window counter (good balance, little memory).",
    "Limit per user, IP, API key and endpoint. With many servers, keep shared counters in Redis, or accept approximate local limits.",
    "Return 429 with Retry-After and remaining-quota headers. Decide fail-open or fail-closed for when the limiter store is down; public APIs usually fail open.",
    "Always set timeouts on every network call. Without them, slow dependencies exhaust your threads.",
    "Retry only idempotent calls and transient errors, with exponential backoff, jitter and a retry budget. Retries multiply load: three layers with three retries each can mean 27 times the traffic.",
    "A circuit breaker opens after repeated failures, fails fast, then half-opens to test recovery.",
    "Bulkheads isolate resources (separate thread or connection pools) so one slow dependency cannot take down everything.",
    "Shed load by priority (keep checkout, drop recommendations), and degrade gracefully with cached or default responses."
  ],
  qs: [
    ["Design a rate limiter.", "Clarify scope (per user, IP or API key; requests per minute). Pick token bucket or sliding window counter, store counters in Redis with atomic operations, enforce at the gateway, return 429 with Retry-After and quota headers, and decide fail-open or fail-closed. Discuss distributed counters, per-endpoint limits and memory cleanup for idle clients."],
    ["Token bucket vs sliding window?", "Token bucket allows controlled bursts and is cheap, so it suits public APIs. Sliding window counter is smoother at window boundaries with O(1) memory. Fixed window is simplest but allows double the limit at the edges. Sliding window log is exact but costs memory per request."],
    ["Explain the circuit breaker pattern.", "It wraps calls to a dependency. When failures pass a threshold the breaker opens and calls fail immediately, protecting both sides. After a cool-down it goes half-open and lets a few trial calls through; success closes it, failure reopens it."],
    ["What is a retry storm and how do you prevent it?", "When a dependency slows down, clients retry, which adds load and makes it worse, across several layers. Prevent it with timeouts, capped retries, exponential backoff with jitter, retry budgets, circuit breakers, and retrying at only one layer."],
    ["Why add jitter to backoff?", "Without randomness, clients that failed together retry together and hit the server in synchronised waves. Jitter spreads the retries over time."],
    ["How do you choose a timeout?", "Base it on the dependency's observed latency (for example slightly above p99), and keep the total of nested timeouts below the caller's own deadline. Propagate deadlines so downstream work stops once the caller has given up."],
    ["Load shedding vs rate limiting?", "Rate limiting enforces fair or contractual limits per client, regardless of system health. Load shedding reacts to overload and drops low-priority work so critical requests still succeed."],
    ["Give an example of graceful degradation.", "If the recommendation service is down, show a cached or popular list instead of an error. If search is slow, return fewer results. The core flow (checkout) stays available."]
  ]
},

store: {
  def: "Storage, search and geo cover where different kinds of data live. Big files go to object storage (S3), uploaded directly with presigned URLs and delivered through a CDN. Text search uses an inverted index (Elasticsearch or OpenSearch) fed from the main database. 'Near me' queries use geo cells such as geohash instead of checking every distance.",
  terms: [
    ["Object storage", "Cheap, durable storage for files addressed by key (S3)"],
    ["Presigned URL", "A temporary signed link that lets a client upload or download directly"],
    ["Multipart upload", "Uploading a large file in parts, in parallel and resumable"],
    ["CDN", "Edge servers that cache content near users"],
    ["Inverted index", "Maps each word to the documents that contain it"],
    ["Change data capture", "Streaming database changes to other systems"],
    ["Geohash / quadtree", "Ways to turn locations into searchable cells"],
    ["Block vs object vs file", "Raw disks, key-addressed blobs, and shared folders"]
  ],
  notes: [
    "Do not store files in the database or stream them through your app servers. Store them in object storage and keep only metadata (key, owner, size) in the database.",
    "Presigned URLs let the client upload straight to S3. Limit the key, size, content type and expiry (keep it short), then confirm the upload with a callback or event.",
    "Use multipart upload for large files so uploads are parallel and resumable.",
    "Serve files through a CDN. Use versioned file names to avoid invalidation, and signed URLs or cookies for private content.",
    "Search: an inverted index maps terms to documents, with analysers (tokenising, stemming) and ranking (BM25). The database stays the source of truth.",
    "Keep the search index in sync with change data capture or a queue, and accept a small delay.",
    "Nearby search: compute a geohash, query the cell and its eight neighbours, then filter by exact distance. Quadtrees adapt to density; Redis GEO or PostGIS are practical options.",
    "Live locations (riders, drivers) belong in a fast store such as Redis with short TTLs, with history streamed to durable storage."
  ],
  qs: [
    ["How would you design file upload for a large app?", "The client asks the API for a presigned URL (with key, size and type limits and a short expiry), uploads directly to object storage (multipart for big files), then the storage event or a callback confirms the upload and the API saves the metadata. Serve downloads through a CDN."],
    ["Block vs object vs file storage?", "Block storage is raw volumes attached to a server (databases, low latency). File storage is a shared folder with a hierarchy (NFS). Object storage is a flat, highly durable store of blobs addressed by key (S3), ideal for media and backups."],
    ["How does a CDN work and how do you invalidate content?", "Edge locations cache responses close to users, fetching from the origin on a miss and honouring cache headers. For updates, prefer versioned file names (app.v123.js) and long TTLs; use explicit purges only when needed."],
    ["How does full-text search work?", "Documents are tokenised and an inverted index maps each term to the documents containing it. A query looks up its terms, intersects or merges the lists, and ranks results with a scoring function such as BM25."],
    ["How do you keep a search index in sync with the database?", "Keep the database as the source of truth and stream changes through change data capture or a queue into the index. Make updates idempotent, support reindexing from scratch, and accept slight lag."],
    ["Design 'find nearby restaurants or riders'.", "Index locations by geohash (or H3 or a quadtree). Query the user's cell plus the neighbouring cells, filter by exact distance, then rank. Cache by cell, category and radius. Mention the boundary problem, and that a quadtree handles uneven density better."],
    ["How do you track live rider locations at scale?", "Riders send updates every few seconds over a lightweight channel; store the latest position in Redis (with TTL) keyed by geo cell for matching, stream history to Kafka and durable storage, and push updates to customers over WebSockets or SSE."],
    ["How would you build typeahead or autocomplete?", "Use a prefix structure (trie or an index with edge n-grams), keep top suggestions per prefix precomputed and cached, update from query logs, and debounce requests on the client."]
  ]
},

sec: {
  def: "Security in system design means proving who the caller is (authentication), checking what they may do (authorization) on every request, protecting sensitive data, verifying who calls your webhooks, and stopping attacks early at the edge. Short-lived signed tokens (JWT), per-object ownership checks and a firewall are the core building blocks.",
  terms: [
    ["Authentication vs authorization", "Who you are vs what you may do"],
    ["JWT", "A signed token the server can verify without a lookup"],
    ["Session cookie", "A server-side session referenced by a cookie"],
    ["OAuth 2.0 / OIDC", "Delegated access, and identity on top of it"],
    ["IDOR / BOLA", "Reading another user's object by changing an id"],
    ["HMAC signature", "A keyed hash proving a message came from the sender"],
    ["WAF", "A firewall that filters malicious web requests"],
    ["Tokenisation", "Replacing card data with a safe token"]
  ],
  notes: [
    "Login (OTP or password) returns a short-lived access token (about 15 minutes) plus a refresh token kept in an httpOnly cookie.",
    "JWTs are stateless but hard to revoke. Use short lifetimes, rotate refresh tokens, and a deny-list in Redis when you need immediate logout. Sessions can be revoked instantly but need a shared store.",
    "Authorization is separate from authentication. Check on every request that the object belongs to the caller (order.owner == token.user) and return 403. Random ids help but do not replace the check; broken object-level authorization is the top API risk.",
    "Hash passwords with bcrypt or argon2, never log secrets, and keep keys in a secrets manager.",
    "Payments: let the provider (Razorpay, Stripe) collect card data so it never touches your servers, and use their tokens.",
    "Webhooks: verify the HMAC signature and timestamp, deduplicate event ids, return 2xx quickly and process asynchronously.",
    "At the edge use HTTPS everywhere, a WAF, rate limits and bot protection to stop attacks before they reach services.",
    "For OTP login: short expiry, limited attempts, store only a hash of the code, rate limit by phone and IP."
  ],
  qs: [
    ["Authentication vs authorization?", "Authentication verifies who you are (password, OTP, token). Authorization decides what you are allowed to do or see. A valid token does not mean the user may access every object, so you must check permissions on each request."],
    ["JWT vs server-side sessions?", "Sessions store state on the server, so they can be revoked instantly but need a shared store when scaled out. JWTs are self-contained and verified by signature, so servers stay stateless, but they stay valid until they expire unless you add a deny-list. A common design uses short-lived JWTs with refresh tokens."],
    ["How do you revoke or log out a JWT?", "Keep access tokens short-lived, delete or rotate the refresh token on logout, and keep a deny-list of revoked token ids in Redis for the rest of their lifetime when immediate revocation matters."],
    ["Explain OAuth 2.0 and OpenID Connect.", "OAuth 2.0 lets a user grant an app limited access to their data without sharing a password (authorization code flow with PKCE for apps). OpenID Connect adds an ID token on top of OAuth so the app learns who the user is, which gives you 'Sign in with Google'."],
    ["What is IDOR (broken object-level authorization) and how do you prevent it?", "A user changes an id in a request (GET /orders/123) and sees someone else's data because the server only checked that the user was logged in. Prevent it by verifying ownership or permission for every object on the server, using policy checks in a shared layer, and testing with two accounts."],
    ["How do you verify a webhook is genuine?", "The provider signs the raw body with a shared secret (HMAC). Recompute the signature, compare in constant time, check the timestamp to block replays, deduplicate event ids, and respond quickly."],
    ["Where should the client store tokens?", "httpOnly, Secure, SameSite cookies protect tokens from JavaScript (XSS) but need CSRF protection. localStorage is easy but readable by any injected script. For browsers prefer httpOnly cookies; mobile apps use the platform secure storage."],
    ["How do you handle card payments securely?", "Never let card numbers touch your servers. Use the provider's hosted fields or SDK to create a token, charge using the token, verify the result through signed webhooks, and keep your PCI scope small."]
  ]
},

obs: {
  def: "Observability is understanding what a system is doing from the outside using its outputs: metrics (numbers over time), logs (events) and traces (a request's path across services). With alerts on user-visible symptoms, service level objectives (SLOs) and safe releases such as canaries with automatic rollback, teams find and fix problems fast.",
  terms: [
    ["Metrics, logs, traces", "Numbers over time, event records, and a request's journey"],
    ["Four golden signals", "Latency, traffic, errors, saturation"],
    ["SLI / SLO / SLA", "The measurement, the target, and the contract"],
    ["Error budget", "How much unreliability the SLO allows"],
    ["Trace ID", "An id passed through every service call and log line"],
    ["Cardinality", "How many distinct label values a metric has"],
    ["Canary release", "Send new code to a small share of users first"],
    ["Blue-green", "Run old and new side by side and switch traffic"]
  ],
  notes: [
    "Golden signals: latency, traffic, errors and saturation. Add business metrics such as orders per minute next to them.",
    "Metrics tell you something is wrong, traces show where, and logs show why.",
    "Pass a trace or correlation id through every service and log line, and write structured (JSON) logs.",
    "Use percentiles (p50, p95, p99), not averages. Watch metric cardinality: do not label by user id.",
    "Alert on symptoms users feel (error rate, latency, SLO burn rate), not just causes such as high CPU. Every alert should be actionable and link to a runbook.",
    "An SLO of 99.9% leaves about 43 minutes of error budget a month. Spend the budget on releases; when it is gone, slow down and fix reliability.",
    "Most outages come from changes. Release to 1 to 5% of users, compare error rate and latency with the old version, then promote or roll back automatically.",
    "Blue-green gives an instant switch and rollback; feature flags let you turn features off without a deploy."
  ],
  qs: [
    ["Metrics vs logs vs traces?", "Metrics are cheap numeric time series for dashboards and alerts. Logs are detailed event records that explain what happened. Traces follow a single request across services to show where time was spent. Use metrics to detect, traces to locate, logs to explain."],
    ["What are the four golden signals?", "Latency (how long requests take, separate successes from errors), traffic (demand), errors (rate of failed requests) and saturation (how full the resources are). From the Google SRE book; start dashboards and alerts there."],
    ["Explain SLI, SLO, SLA and error budget.", "An SLI is a measured indicator (percentage of successful requests). An SLO is the target (99.9% over 30 days). An SLA is the external contract with penalties. The error budget is the allowed failure (0.1%), and it guides how fast you can ship."],
    ["Dashboards are green but customers cannot pay. What do you do?", "Start from user impact: check a synthetic or real checkout, look at error rates and traces for the payment path, compare with recent deploys and provider status, mitigate (roll back, fail over), then add the missing symptom-based alert."],
    ["How do you debug a latency spike across microservices?", "Check the golden signals per service, find the slow span in a distributed trace, then drill into that service's logs, dependencies and saturation. Compare against recent deploys or traffic changes."],
    ["How do you avoid alert fatigue?", "Alert on user-facing symptoms and SLO burn rate, not every cause. Page only for urgent, actionable problems, send the rest to tickets, tune thresholds, deduplicate and group alerts, and keep runbooks."],
    ["Canary vs blue-green vs rolling deployments?", "Rolling replaces instances gradually, simple but slower to roll back. Blue-green keeps two full environments and switches traffic, giving instant rollback at double the cost. Canary sends a small share of real traffic to the new version and promotes it only if metrics stay healthy."],
    ["When should a rollout roll back automatically?", "When the canary's error rate, latency or saturation is worse than the baseline beyond a threshold for a set time, or an SLO burn alert fires. Define the metrics and thresholds before the release, and keep the rollback fast and tested."]
  ]
}
,

est: {
  def: "Back-of-envelope estimation is quick, rounded maths that turns a product idea into numbers: queries per second (QPS), storage and bandwidth. It tells you the size of the problem and the first hard limit in the opening minutes of a design, so you can choose between one machine, a cache, replicas or sharding.",
  terms: [
    ["QPS", "Queries (requests) per second: average and peak"],
    ["DAU", "Daily active users, the usual starting number"],
    ["Peak factor", "How much higher peak traffic is than the average, often 2 to 3 times (more for spikes)"],
    ["Read:write ratio", "How many reads happen per write; decides caching and replicas"],
    ["Replication factor", "Number of copies stored, commonly 3, so raw storage is multiplied"],
    ["Powers of two", "2^10 is about a thousand (KB), 2^20 a million (MB), 2^30 a billion (GB)"],
    ["Latency numbers", "RAM about 100 ns, SSD about 100 microseconds, disk seek about 10 ms, cross-continent round trip about 150 ms"],
    ["Order of magnitude", "Being right to the nearest power of ten is enough"]
  ],
  notes: [
    "Follow a fixed recipe: users (DAU), actions per user per day, QPS, peak QPS, storage per item, storage per year, bandwidth, then servers.",
    "Average QPS = DAU x actions per user per day / 86,400. Treat a day as about 100,000 seconds to keep the maths fast, and take peak as 2 to 3 times the average.",
    "Storage per year = items per day x size per item x 365, then multiply by the replication factor (about 3) and add headroom for indexes and growth.",
    "Bandwidth = QPS x average payload size. Work out inbound and outbound separately; outbound drives CDN and egress cost.",
    "Rough capacity per machine: a database around 1,000 to 5,000 simple QPS, an application server 1,000 to 10,000, a cache server 100,000 or more. Use them only to size an order of magnitude.",
    "Use the numbers to decide: read-heavy and under a few thousand QPS means one database plus a cache; huge writes or data means sharding; large files or video means CDN and object storage.",
    "State assumptions out loud, round aggressively, show units, and sanity-check the result against a known system."
  ],
  qs: [
    ["Estimate the QPS and storage for a Twitter-like service with 300 million daily users.", "Assume each user reads 100 tweets and posts 0.5 a day. Reads: 300M x 100 / 100,000 s is about 300,000 QPS (peak about 900,000). Writes: 300M x 0.5 / 100,000 is about 1,500 QPS. At 300 bytes a tweet that is about 45 GB a day, about 16 TB a year, about 50 TB with 3 copies, before media. Conclusion: heavily read-skewed, so caching and fan-out matter more than write throughput."],
    ["How many servers do you need for 50,000 QPS?", "If one application server safely handles about 2,000 QPS, you need about 25 servers for the average, plus headroom for peak (say 2 times) and redundancy across zones, so roughly 50 to 60. Then check that the database and cache can take the load, because the app tier is rarely the limit."],
    ["How do you estimate bandwidth for a video service?", "Concurrent viewers x bitrate. 1 million viewers at 3 Mbps is 3 Tbps outbound, which is why video is served from CDN edges, not from your origin. Storage is hours uploaded x file size x number of encodings."],
    ["Why do interviewers ask for estimation first?", "It shows you can size a problem and make decisions from data. The numbers justify the architecture: for example, 100 QPS needs no sharding, while 1 million QPS or petabytes of data does."],
    ["What latency numbers should you remember?", "Memory is about 100 ns, SSD about 100 microseconds, a disk seek about 10 ms, a round trip inside a data centre about 0.5 ms, and across continents about 150 ms. They explain why caches, replicas near users and avoiding network hops matter."],
    ["How do you account for peak traffic and growth?", "Multiply average by a peak factor (2 to 3, or more for events), add 30 to 50% headroom, and project growth for one to three years. Design for the peak and scale automatically for the rest."],
    ["How much storage do 100 million users with 1 MB of data each need?", "100M x 1 MB = 100 TB. With 3 copies that is 300 TB raw, plus indexes and backups, so plan for roughly 400 to 500 TB, and say what would change the number (compression, deduplication, tiering to cold storage)."],
    ["How do you sanity-check an estimate?", "Compare with a known system, check units, make sure the answer is not off by an obvious factor of 1,000, and check that the parts add up. Interviewers care about reasoning and assumptions more than the exact figure."]
  ]
},

idx: {
  def: "A database index is an extra data structure that lets the database find rows without scanning the whole table, trading slower writes and more storage for faster reads. Storage engines decide how data is laid out on disk: B-tree engines (most relational databases) update pages in place, while LSM-tree engines (Cassandra, RocksDB) append writes in memory and merge them to disk in the background.",
  terms: [
    ["B-tree index", "A sorted, balanced tree; fast reads and range scans"],
    ["LSM tree", "Writes go to memory and sorted files that are merged later"],
    ["Write amplification", "Physical writes caused by one logical write"],
    ["Compaction", "Background merging of LSM files that removes old versions"],
    ["Composite index", "An index on several columns; the column order matters"],
    ["Covering index", "An index containing every column the query needs"],
    ["Bloom filter (in LSM)", "Lets a read skip files that cannot hold the key"],
    ["Normalisation vs denormalisation", "Avoid duplicated data vs duplicate it to speed up reads"]
  ],
  notes: [
    "Indexes speed up reads (lookups, joins, sorting, range queries) but every insert, update and delete must also update each index, so more indexes mean slower writes and more storage.",
    "B-trees keep data sorted in pages, update in place, and give predictable reads and range scans. They are the default in PostgreSQL, MySQL and most relational databases.",
    "LSM trees buffer writes in a memtable, flush sorted files (SSTables) and compact them in the background. Writes are very fast; reads may check several files, helped by Bloom filters.",
    "Rule of thumb: B-tree pays on the write to keep reads simple; LSM pays on the read and in compaction to keep writes cheap. Choose B-tree for read-heavy or mixed transactional work, LSM for write-heavy or time-series workloads.",
    "Index design: put equality columns first and range columns last in a composite index, index columns used in WHERE, JOIN and ORDER BY, and use covering indexes for hot queries. Check plans with EXPLAIN.",
    "Deletes in LSM engines write tombstones, which are cleaned up only during compaction, so many tombstones can slow reads.",
    "SQL vs NoSQL: choose relational for structured data, joins and transactions; choose key-value, document, wide-column or graph stores when the access pattern or scale demands it. Model NoSQL data around your queries, and accept duplication."
  ],
  qs: [
    ["How does a database index work, and why can it slow down writes?", "An index keeps a sorted copy of selected columns with pointers to the rows, usually as a B-tree, so lookups take O(log n) instead of scanning the table. Every write must update the table and all its indexes, so more indexes mean slower writes and more storage. Index only what your queries need."],
    ["B-tree vs LSM tree: how do they differ and when would you pick each?", "A B-tree updates sorted pages in place: predictable reads and range scans, higher write cost. An LSM tree appends writes to memory and merges sorted files later: very high write throughput, but reads may touch several files and compaction uses background I/O. Pick B-tree for read-heavy or transactional workloads, LSM for heavy writes, logs and time series."],
    ["What is write amplification?", "The number of physical writes caused by one logical write. B-trees rewrite whole pages and log records; LSM trees rewrite data repeatedly during compaction across levels, which can multiply writes many times. It affects SSD wear, throughput and tail latency."],
    ["What is a composite index and how does column order matter?", "An index over several columns, sorted by the first, then the second, and so on. It can serve queries that use a leftmost prefix of the columns. Put equality filters first and the range or sort column last, and match the order to your most important queries."],
    ["What is a covering index?", "An index that holds every column a query needs, so the database answers from the index alone without reading table rows. It speeds up hot queries at the cost of a larger index."],
    ["Why might the database ignore your index?", "The query returns a large share of rows (a scan is cheaper), the function or type conversion on the column prevents use of the index, the leading column of a composite index is missing, statistics are stale, or the table is tiny. Check the plan with EXPLAIN."],
    ["SQL or NoSQL for a new product?", "Start with the data and access patterns. Relational databases suit structured data, joins, constraints and transactions. NoSQL suits massive scale, flexible schemas, simple key lookups or write-heavy workloads, but you give up joins and often strong transactions. Many systems use both."],
    ["How do you model data in a NoSQL store like DynamoDB or Cassandra?", "Start from the queries, not the entities. Choose a partition key that spreads load and groups items read together, use a sort key for ordering, denormalise and duplicate data to avoid joins, and create extra tables or indexes for each additional access pattern."]
  ]
},

cdn: {
  def: "A content delivery network (CDN) is a worldwide network of edge servers that cache your content close to users, so static files and video are delivered fast and your origin servers see far less traffic. Edge locations answer cache hits directly and fetch from the origin only on a miss.",
  terms: [
    ["Edge / POP", "A CDN data centre close to users"],
    ["Origin", "Your own server or storage that holds the original content"],
    ["Pull vs push CDN", "Fetch on first request vs upload content in advance"],
    ["Cache-Control / TTL", "Headers that say how long content may be cached"],
    ["Cache key", "What identifies a cached object (URL, selected headers, query strings)"],
    ["Origin shield", "A middle cache layer that protects the origin"],
    ["HLS / DASH", "Video streamed in small chunks at several bitrates"],
    ["Anycast / GeoDNS", "Ways to send each user to a nearby edge"]
  ],
  notes: [
    "A CDN cuts latency (content is nearby), protects the origin (most requests never reach it) and absorbs spikes and attacks.",
    "Pull CDNs fetch from the origin on a miss and are the default. Push CDNs suit rarely changing, large files you upload yourself.",
    "Control caching with Cache-Control headers (max-age, s-maxage, stale-while-revalidate). Keep the cache key tight so one file is not cached many times.",
    "Prefer versioned or hashed file names (app.4f2a.js) with very long TTLs, and use explicit purge only for emergencies. Invalidation is slow and costs money.",
    "Video: encode into several bitrates and cut into short chunks (HLS or DASH). The player picks a quality per chunk based on bandwidth, which is adaptive bitrate streaming.",
    "Private content uses signed URLs or cookies with an expiry. Add an origin shield so many edges share one request to the origin.",
    "Dynamic content can still benefit: cache API responses for short times, use edge functions, and keep connections to the origin warm.",
    "Track cache hit ratio, origin traffic, and time to first byte."
  ],
  qs: [
    ["How does a CDN work?", "DNS or anycast routes the user to a nearby edge. On a hit the edge returns the cached object. On a miss it fetches from the origin (or a shield), stores it according to the cache headers, and returns it, so later users get it fast."],
    ["Pull vs push CDN?", "Pull: the CDN fetches content from the origin on the first request; easy and efficient for most sites. Push: you upload content to the CDN in advance; useful for large, rarely changing files, but you manage uploads and cleanup."],
    ["How do you invalidate or update cached content?", "Best is to avoid it: use versioned file names with long TTLs, so a new version is a new URL. For HTML or API responses use short TTLs or stale-while-revalidate. Use purge APIs only when needed, since propagation takes time."],
    ["How would you stream video to millions of users?", "Transcode into several resolutions and bitrates, split into short chunks with a manifest (HLS or DASH), store in object storage, and serve through a CDN. The player switches quality per chunk based on network speed. Popular content stays hot at the edge; use pre-warming for big launches."],
    ["What should you put in the cache key?", "The URL and only the headers or query parameters that truly change the response (for example language or device class). Ignoring tracking parameters and normalising case raises the hit ratio."],
    ["How do you serve private or paid content through a CDN?", "Use signed URLs or signed cookies with a short expiry, restrict by token or IP when needed, and keep the origin private so it only accepts requests from the CDN."],
    ["What is an origin shield?", "An extra caching tier between edges and the origin. Edges ask the shield, and only the shield goes to the origin, which collapses many simultaneous misses into one request and protects the origin."],
    ["How do you measure and improve a CDN setup?", "Watch cache hit ratio, origin bandwidth and request rate, and time to first byte by region. Improve with longer TTLs, better cache keys, compression, an origin shield, and moving more content to static or cacheable forms."]
  ]
},

uid: {
  def: "Unique ID generation is how a distributed system creates identifiers that never collide across many servers, without a single bottleneck. Common choices are random UUIDs, time-ordered IDs such as Snowflake, ULID or UUIDv7, and database tickets or sequences; the right one depends on ordering, size and coordination needs.",
  terms: [
    ["UUID v4", "128-bit random id; no coordination, but unordered"],
    ["UUID v7 / ULID", "Time-ordered 128-bit ids that sort by creation"],
    ["Snowflake ID", "64-bit id: timestamp + machine id + sequence"],
    ["Ticket server", "A central service or table that hands out numbers"],
    ["Auto-increment", "A database counter; simple but one writer"],
    ["Clock skew", "Servers' clocks disagree, or jump backwards"],
    ["k-sortable", "Roughly ordered by time, good for indexes"],
    ["Sequence number", "Counter that separates ids created in the same millisecond"]
  ],
  notes: [
    "Requirements to clarify first: unique across machines, roughly time-sortable or not, size (64 or 128 bits), guessable or not, and expected rate.",
    "Auto-increment or a ticket server is simple but is a single point of failure and a bottleneck; you can run several with different offsets, at the cost of weaker ordering.",
    "UUID v4 needs no coordination, but its randomness scatters inserts across the index, which hurts write locality on large tables. 128 bits is also bigger than 64.",
    "Snowflake: 41 bits of millisecond timestamp (about 69 years), 10 bits machine id, 12 bits sequence (about 4,096 ids per millisecond per machine). IDs are compact and sort by time.",
    "Clock problems: if a clock moves backwards, a Snowflake generator can issue smaller or duplicate ids. Wait until the clock catches up for small skews, refuse and alert for large ones, and use NTP carefully.",
    "UUID v7 and ULID give time-ordered ids with no machine id assignment, which suits modern databases and avoids index fragmentation.",
    "Do not expose sequential ids publicly if guessing them is a risk (IDOR). Use random or encoded ids externally, with an internal ordered id."
  ],
  qs: [
    ["Design a distributed unique ID generator.", "Clarify needs (time-sortable, 64-bit, rate). A Snowflake-style design: each machine composes a 64-bit id of 41-bit millisecond timestamp, 10-bit machine id and 12-bit sequence that resets each millisecond. Machine ids come from a coordination service at startup. Discuss clock skew, sequence overflow, and failure of a node."],
    ["UUID vs Snowflake vs auto-increment?", "Auto-increment is simple but centralised. UUID v4 is coordination-free but large and random, hurting index locality. Snowflake is compact, time-sorted and fast, but needs machine ids and sound clocks. Pick by ordering, size and coordination needs; UUID v7 or ULID are good modern defaults."],
    ["Why can random UUIDs hurt database performance?", "Random keys insert into random places in a B-tree index, causing page splits, poor cache locality and more disk I/O than sequential keys. Time-ordered ids (UUID v7, ULID, Snowflake) append near the end of the index."],
    ["What happens if the clock moves backwards in a Snowflake generator?", "It could produce ids lower than or equal to ones already issued. Detect it by comparing with the last timestamp, wait for small differences, throw an error and alert for large ones, and keep the last timestamp persisted or in memory."],
    ["How do you assign machine ids safely?", "Use a coordination service (ZooKeeper, etcd) or a database with leases to hand out unique worker ids at startup, and reclaim them when machines stop. Never let two live machines share one."],
    ["What if you need ids to be strictly increasing across all machines?", "That needs a single sequencer or consensus, which limits throughput. Most systems accept roughly time-ordered ids, which are enough for sorting feeds, and use a single partition or log when strict order is truly required."],
    ["How does a ticket server work, and what are its risks?", "A service (or database table) returns the next number, often in blocks so clients hand out ids locally. Risks are a single point of failure and a bottleneck; mitigate with several servers using different offsets and by caching ranges of ids."],
    ["Should ids be sequential in public URLs?", "Usually not: sequential ids leak volume and make scraping or IDOR guessing easy. Use non-guessable public ids and always enforce authorisation."]
  ]
},

api: {
  def: "API design is shaping the contract between clients and services so it stays correct, fast and compatible as it grows. In interviews it covers resource modelling, pagination, versioning, idempotency, error handling, bulk operations and how long-running work is exposed.",
  terms: [
    ["Offset vs cursor pagination", "Page numbers vs an opaque position marker"],
    ["Versioning", "Evolving an API without breaking existing clients"],
    ["Idempotency key", "A client-chosen key that makes retries safe"],
    ["Bulk / batch API", "One call that handles many items"],
    ["PUT vs PATCH", "Replace a whole resource vs change part of it"],
    ["202 Accepted", "Work was queued; check a status URL later"],
    ["Rate limit headers", "Tell clients their quota and when to retry"],
    ["Backward compatibility", "New server versions still work with old clients"]
  ],
  notes: [
    "Model resources as nouns, use HTTP verbs correctly, return the right status codes, and keep error bodies consistent (code, message, details, request id).",
    "Offset pagination (page, limit) is simple but slow on deep pages and unstable when data changes. Cursor (keyset) pagination uses the last seen key, stays fast and stable, and is the choice for feeds and large tables.",
    "Version by URL (/v2) or header. Prefer additive changes (new optional fields), never repurpose fields, and deprecate with a timeline.",
    "Idempotency keys: the client sends a unique key on POST; the server stores key plus result under a unique constraint and returns the same result on retry. Concurrent duplicates must be handled and keys expire.",
    "Bulk APIs reduce round trips. Define partial failure clearly (per-item status, for example 207 Multi-Status), limit batch size, and make items idempotent.",
    "Long-running operations return 202 with a status URL (or webhook) instead of holding the connection open.",
    "Add filtering, sorting and field selection; return rate limit headers and 429 with Retry-After; support conditional requests (ETag) for caching."
  ],
  qs: [
    ["Offset vs cursor pagination: when do you use each?", "Offset is fine for small, stable lists and when users need to jump to a page. Cursor pagination fits large or fast-changing data: it stays fast (indexed seek), doesn't skip or repeat rows when data changes, and works well for infinite scroll. The cost is no random page access."],
    ["How do you version an API?", "Put the version in the URL (/v1/orders) or a header, keep changes additive within a version, publish a deprecation policy, monitor usage of old versions, and support them until traffic drops. Avoid breaking changes: removing fields, changing types or meanings."],
    ["How would you design an idempotent payment or order API?", "Require an Idempotency-Key header. Store the key with the request fingerprint and the response in a table with a unique constraint. On a retry return the stored response; if a request with the same key is still running, return 409 or wait. Reject the same key with a different body, and expire keys after a period."],
    ["How do you design a bulk API?", "Accept an array with a size limit, process items independently or atomically (document which), and return a per-item result with a status and error. Make it idempotent, consider async processing with 202 for big batches, and apply rate limits per item as well as per request."],
    ["PUT vs PATCH vs POST?", "POST creates (or triggers an action) and is not idempotent. PUT replaces the full resource and is idempotent. PATCH applies a partial change and may or may not be idempotent depending on the operation."],
    ["How do you handle long-running operations in an API?", "Return 202 Accepted with a Location header pointing to a status resource, process in the background with a queue, and let clients poll the status or receive a webhook or event when it finishes."],
    ["What makes a good error response?", "The right HTTP status, a stable machine-readable error code, a human message, field-level details for validation errors, and a request id for support. Never leak stack traces or internal details."],
    ["How do you protect an API from abuse and overload?", "Authenticate every call, rate limit per key and per endpoint with 429 and Retry-After, validate and cap payload sizes, paginate everything, use timeouts and circuit breakers downstream, and cache safe GET responses with ETags."]
  ]
},

prob: {
  def: "Probabilistic data structures trade a small, controlled error for huge savings in memory and time. A Bloom filter answers 'is this item in the set?' (never a false negative, sometimes a false positive), HyperLogLog estimates how many distinct items were seen, and a count-min sketch estimates how often each item appeared.",
  terms: [
    ["Bloom filter", "Bit array plus hash functions for membership checks"],
    ["False positive", "Says 'maybe present' for something that is not"],
    ["HyperLogLog", "Estimates distinct count in about 12 KB with roughly 1% error"],
    ["Cardinality", "The number of distinct elements"],
    ["Count-min sketch", "Counters in several hashed rows to estimate frequency"],
    ["Heavy hitters / top-K", "The most frequent items in a stream"],
    ["Mergeable sketch", "Sketches from different servers or days can be combined"],
    ["Cuckoo filter", "A Bloom alternative that supports deletes"]
  ],
  notes: [
    "Bloom filter: add an item by setting k bits chosen by k hashes; to check, test those bits. If any bit is 0 the item is definitely absent; if all are 1 it is probably present.",
    "Size a Bloom filter for the expected item count and false-positive rate; about 10 bits per item gives roughly 1% false positives. It cannot delete items (use a counting or cuckoo filter if you need that).",
    "Use a Bloom filter in front of an expensive lookup: 'is this username taken?', 'have we crawled this URL?', 'does this row exist in this SSTable?', protecting a database from lookups for missing keys.",
    "HyperLogLog counts distinct items (unique visitors, unique viewers) in a fixed small memory (Redis uses about 12 KB per key, around 0.8% standard error) and sketches can be merged, for example daily into weekly.",
    "Count-min sketch counts frequency, never underestimates, and can overestimate because of collisions. Pair it with a small heap for top-K trending items.",
    "These structures give approximate answers, so use them when exactness is not required, and confirm positives against the source of truth when it matters.",
    "Choose by question: membership means Bloom, how many distinct means HyperLogLog, how often means count-min."
  ],
  qs: [
    ["How would you check whether a username already exists among a billion users?", "Put a Bloom filter in front of the database. If the filter says no, the name is free (no false negatives), so you skip the query. If it says maybe, check the database to confirm. This removes most lookups while keeping answers correct, and costs roughly 1 to 1.5 GB for a billion names at 1% false positives."],
    ["How do you count unique viewers of a video at massive scale?", "Use HyperLogLog: add each viewer id to a per-video sketch (Redis PFADD) and read the estimate (PFCOUNT) in about 12 KB per video with around 1% error. Sketches can be merged (PFMERGE) to get weekly or global unique counts. If you need exact counts, you need far more memory or a database."],
    ["How does a Bloom filter work, and can it return false negatives?", "It is a bit array and k hash functions. Adding sets k bits; checking tests those bits. It never gives a false negative, but it can give a false positive when other items set the same bits. Plain Bloom filters do not support deletion."],
    ["How would you find the top 10 trending hashtags in a stream?", "Use a count-min sketch to estimate each hashtag's frequency in a sliding window and keep a min-heap of the current top K candidates. Merge sketches from several nodes, or use time-bucketed counters. For exactness at smaller scale, use sharded counters and periodic aggregation."],
    ["What are the trade-offs of these structures?", "Huge memory and speed savings versus approximate answers. Bloom filters have false positives, HyperLogLog has a small relative error and cannot list members, count-min overestimates. Choose them when approximate is acceptable or when they only guard an exact check."],
    ["How do you choose the size of a Bloom filter?", "Pick the expected number of items n and a target false-positive rate p, then compute the bit-array size m and number of hash functions k from standard formulas (about 10 bits per item and 7 hashes for 1%). If n grows beyond the plan, the error rate rises, so use scalable Bloom filters or rebuild."],
    ["Where do databases use Bloom filters internally?", "LSM-tree stores such as Cassandra, RocksDB and HBase keep a Bloom filter per file so a read can skip files that definitely do not contain the key, which avoids disk reads for missing keys."],
    ["Can you delete from a Bloom filter?", "Not from a standard one, since bits may be shared. Use a counting Bloom filter (counters instead of bits), a cuckoo filter, or rebuild the filter periodically from the source of truth."]
  ]
},

txn: {
  def: "A transaction groups several database operations into one all-or-nothing unit. ACID describes its guarantees: atomicity, consistency, isolation and durability. Isolation levels decide how much concurrent transactions can see of each other, and locking (optimistic or pessimistic) is how conflicts are prevented or detected.",
  terms: [
    ["ACID", "Atomic, Consistent, Isolated, Durable"],
    ["Dirty read", "Reading another transaction's uncommitted data"],
    ["Non-repeatable read", "Reading the same row twice and getting different values"],
    ["Phantom read", "A repeated query returns new rows another transaction added"],
    ["Snapshot isolation / MVCC", "Each transaction reads a consistent snapshot of the data"],
    ["Write skew", "Two transactions each read overlapping data and write different rows, breaking a rule"],
    ["Optimistic locking", "Assume no conflict; check a version at commit"],
    ["Pessimistic locking", "Lock the data first (SELECT ... FOR UPDATE)"]
  ],
  notes: [
    "Atomicity: all or nothing (rollback on failure). Consistency: constraints hold before and after. Isolation: concurrent transactions do not see each other's partial work. Durability: committed data survives crashes (write-ahead log).",
    "Isolation levels, weakest to strongest: read uncommitted, read committed (no dirty reads), repeatable read (no non-repeatable reads), serializable (no phantoms or other anomalies). Higher isolation means fewer anomalies but more locking or retries.",
    "Most databases default to read committed (PostgreSQL, Oracle, SQL Server) or repeatable read (MySQL InnoDB). Know your database's default and what it actually guarantees.",
    "MVCC keeps several versions of rows so readers do not block writers. Snapshot isolation prevents most anomalies but still allows write skew, which needs serializable isolation or explicit locks.",
    "Pessimistic locking (SELECT ... FOR UPDATE) is safest under high contention but can block and deadlock. Optimistic locking uses a version column and retries on conflict, which works best when conflicts are rare.",
    "Keep transactions short, access rows in a consistent order to avoid deadlocks, and set timeouts.",
    "Across services you cannot use one ACID transaction: use sagas, the outbox pattern and idempotent steps."
  ],
  qs: [
    ["What does ACID mean?", "Atomicity: a transaction fully succeeds or fully rolls back. Consistency: it moves the database from one valid state to another, respecting constraints. Isolation: concurrent transactions behave as if run in some order. Durability: once committed, data survives a crash, typically via a write-ahead log."],
    ["Explain the isolation levels and the anomalies they prevent.", "Read uncommitted allows dirty reads. Read committed blocks dirty reads. Repeatable read also blocks non-repeatable reads (and in many databases phantoms through snapshots). Serializable blocks all anomalies, including phantoms and write skew, at the cost of locking or aborts."],
    ["What are dirty, non-repeatable and phantom reads?", "Dirty: reading uncommitted data that may be rolled back. Non-repeatable: the same row read twice gives different values because another transaction committed a change. Phantom: the same query returns a different set of rows because another transaction inserted or deleted matching rows."],
    ["Optimistic vs pessimistic locking: when do you use each?", "Pessimistic locks the rows up front (SELECT FOR UPDATE), which is safe when conflicts are frequent, like a hot inventory row. Optimistic reads freely and checks a version column on update, retrying on conflict, which scales better when conflicts are rare. Choose by contention."],
    ["How would you stop two users booking the last seat?", "Make the update conditional and atomic: UPDATE seats SET status='booked' WHERE id=? AND status='free' and check the affected row count, or use SELECT FOR UPDATE inside a transaction, or a unique constraint on (seat, show). For high contention, serialise through a queue or a short seat hold with expiry."],
    ["What is MVCC?", "Multi-version concurrency control keeps multiple versions of a row, so a reader sees a consistent snapshot while writers create new versions. Readers do not block writers and vice versa; old versions are cleaned up later (vacuum)."],
    ["What is write skew and how do you prevent it?", "Two transactions read the same condition (for example, at least one doctor on call), then each updates a different row, and together they break the rule. Snapshot isolation allows it. Prevent it with serializable isolation, locking the rows that formed the decision, or a constraint."],
    ["How do you handle transactions across microservices?", "You cannot rely on one ACID transaction. Use sagas with compensating actions, the outbox pattern for reliable events, idempotent consumers, and design each step to be retried safely."]
  ]
}
};
// Additional topics (notes only, no video yet): shown in the sidebar under ADDITIONAL TOPICS
window.__EXTRA=[
  {id:'est',title:'Back-of-envelope estimation',sub:'QPS, storage and bandwidth math'},
  {id:'idx',title:'Indexing & storage engines',sub:'B-tree vs LSM tree, SQL vs NoSQL'},
  {id:'cdn',title:'CDN & edge delivery',sub:'Static content and video, worldwide'},
  {id:'uid',title:'Unique ID generation',sub:'Snowflake, UUID, ticket servers'},
  {id:'api',title:'API design',sub:'Pagination, versioning, idempotency, bulk'},
  {id:'prob',title:'Probabilistic structures',sub:'Bloom filter, HyperLogLog, count-min'},
  {id:'txn',title:'Transactions & isolation',sub:'ACID, anomalies, optimistic vs pessimistic'}
];
window.dispatchEvent(new Event('notes-ready'));
