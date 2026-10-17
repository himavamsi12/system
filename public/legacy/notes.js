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
};
window.dispatchEvent(new Event('notes-ready'));
