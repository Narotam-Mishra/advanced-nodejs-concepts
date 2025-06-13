
# Section 1 -  The Internals of Node

## 001 Staring With Node Internals (00:00)

# V8 - It is open source JS engine created by Google. The purpose of this project is to execute JS code outside of the browser.

# libuv - It is a open source C++ project that gives Node access to the Operating System (OS), underlying File System (fs), Networking and it also handles some aspects of concurrency as well.

# Node - Node gives us a nice interface to use, to relate our JS side of our application to the actual C++ that running under the hood on our computer to actually interpret and execute JS code. Apart of these, Node provide series of wrappers and very unified and consistent APIs.

# `lib` - this folder contains all JS specific code of Node

# `src` - this folder contain mainly C++ specific implementation of Node

## 002 Module Implementations (03:47)

# Activity
- Pick a function in Node standard libaray
- Find where its implemented in the Node source code
- See how V8 and libuv are used to implement that function,

# We will choose `pbkdf2` function (function in Node's `crypto` libaray)
 
# this `pbkdf2` function is used for hashing some library data. It is usually used to hash a password for storage inside a database.

## 003   Node Backed by C (12:11)

# process.binding() - this statement used to connects JS and C++ functions.

# V8 is used to translate the Nodejs values that you and I place inside of our different programs like a boolean or a function or an object and translate into their C++ equivalent.

# libuv used for lot of concurrency and processing constructs on the C++ side.

## 004   The Basics of Threads (18:44)

# Event loop is used by Node to handle asynchronous code that we write inside JS code.

# Whenever we run programs on our computer we start something called process. A process is an instance of a computer program that is being executed. Within a single process we can have multiple things called threads. We can think of threads as being like a little Todo list that has some number of instructions that need to be executed by the CPU of the computer.

# A single process can have multiple threads inside of it.

# Scheduling refers to Operating System's ability to decide which thread to process at any given instant.

# In order to more quickly process threads or process more at one given time we can first add in additional CPU cores to our machine so if we have more than one core inside of our CPU then we can easily process multiple threads at the same time.

# Technically one core of CPU can process more than one thread at a time through multi-threading (or hyper-threading)

# Threads are unit of instructions that are waiting to be executed by CPU.

# Deciding which order to execute these threads in is referred to as `Scheduling` and Scheduling is controlled by OS.

# Two ways of improving the rate at which we process threads are 1). add more CPU cores to machine, 2). to allow OS Scheduler to detect big pauses in processing time due to expensive input and output operations. 

##  005   The Node Event Loop (25:14)

# Whenever we start up a node program our computer, node automatically creates one thread and execute all of our code inside of that one single thread. Inside of this single thread (represented by blue box) there is something called `Event Loop`.

# We can think of Event Loop as being like a control structure that decides what our one thread should be doing at any given point of time.

## 006   The Event Loop Implementation (31:48)

# Conditions under whcih Event Loop runs :-
- 1st check - any pending  setTimeout, setInterval, setImmediate
- 2nd check - any pending OS tasks ? (like http server listening to port)
- 3rd check - any pending long running operations ? (like fs module)

# Node automatically detects when our JS code that we write sets up something like setTimeout call or issue a new call to `fs` module. These automatic detections occur even during that initial run of file (where JS code is written)

## 007   Event Loop Ticks (39:11)
- 1). Node looks at pending timers and sees if any functions are ready to be called (i.e, setTimeout & setInterval) 

- 2). Node looks at pendingOSTasks and pendingOperations and calls relevant callbacks 
    
- 3). Pause execution, continue whenever ....
    - a new pendingOSTask is done
    - a new pendingOperation is done
    - a timer is about to complete

- 4). Look at pendingTimers and call any setImmediate (But this time Node doesn't care about `setTimeout` & `setInterval` function calls, it only looks for functions that have been registered with `setImmediate`)

- 5). handle any `close` events (clean up task)

## 008   Is Node Single Threaded? (45:58)

# Node's Event Loop is truly single threaded i.e, when we start up a program with Node a single instance of the Event Loop is created and placed into one thread.

# Some of the functions that are included inside of the standard library of Node are not actually single threaded that means some of the functions that are included inside of Node that we used to run, run outside of Event Loop and outside of single thread so simply declaring that Node is single threaded is not absolutely true.

## 009   Testing for Single Threads (51:04)

# Node Event Loop ----> Single threaded

# Some of Node Framework / Std Lib -----> Not single threaded

# If Node were single threaded then twice execution of `pbkdf2()` method would have taken 2 seconds of total time. But it's not correct.

# When we started execution of code where `pbkdf2` method has been called twice, started execution from 0 second and then it took exactly 1 second for both those function calls to get to the callback so this is indicating that something is happening to indicate that we are breaking out of a single thread setup with Node because if we only had one single thread we would have seen the first function call complete then the second one start up.

## 010   The Libuv Thread Pool (57:54)

# For some standard library function calls (like pbkdf2 method) the Node's C++ side and Libuv decide to do expensive calculations outside of the Event Loop entirely instead they make use of something called `thread pool`. 

# Thread Pool is a series of four threads that can be used for running computationally intensive tasks such as pbkdf2 function, by default libuv creates four threads in this thread pool which means that in addition to the thread used for the Event Loop  there are four other threads that can be used to offload expensive calculations that need to occur inside our application. Many of the functions included in Node standard library will automatically make use of thread pool. So by using the thread pool we don't have to wait for that 1 second and we can do other things inside of the Event Loop while that calculation is going on. 

# Node is not truly single-threaded because there are other threads that Node uses for doing some computationally intensive tasks.

## 011   Threadpools with Multithreading (01:01:02)

# Detect the presence of thread pool

# In threads.js, the first four calls took `1 seconds (approax)` to complete and the fifth call took 0.5 additional seconds. There are two interesting things to note here :-
1). Notice that the first group (first four calls) took the exact same amount of time and 
2). the last call took roughly 50% extra time.

# The first four calls each got offloaded to one thread that existed inside the thread pool (that consist of 4 threads). We can get kind of some level of concurrency with threads because CPU has access to Multithreading that allows to process more than one thread at once. 

## 012   Changing Threadpool Size (01:07:08)

# Case 1 - Number of threads = 2

# Case 2 - Number of threads = 5

## 013   Common Threadpool Questions (01:12:33)

Q1. Can we use the threadpool for javascript code or can only Nodejs functions use it?
# Yes, We can write custom JS that uses the thread pool.

Q2. What functions in Node Std library use the threadpool?
# All 'fs' module functions make use of thread pool. Some crypto stuff. Depends on OS (window vs unix based).

Q3. How does this threadpool stuff fit into the event loop?
# Tasks running in the threadpool are the `pendingOperations` in our code example.

##  014   Explaining OS Operations (01:15:50)

# Make Network call to `https:/www.google.com` and calculated the time it took to make this call.

## 015   Libuv OS Delegation (01:19:42)

# We will add some more network request calls and when we do so we will find that some of the functions in the Node standard library don't seem to use same kind of thread pool that some other functions use (like pbkdf2 hashing function did)

# After running the code, it seemed that all 7 calls appear to be completed at the same exact time. This is distinctly different behaviour that we saw previously with thread pool.

# As Node standard library has some functions that make use of libuv's threadpool it also has some functions that make use of code that is built into the underlying Operating System through libuv, so in this case libuv sees that we are attempting to make an HTTP request, neither libuv nor Node has any code to handle all of the super low-level operations that are involved with a network request instead libuv delegates the request making to the underlying Operating System (OS) so actually it's Operating System that does the real HTTP request. libuv is used to issue the request and then it just waits for Operating System to emit a signal that some response has come back to the request. so beacuse libuv is delegating the work done to the OS , the OS itself decides whether to make a new thread or not. As OS is making request there is no blocking of our JS code inside Event Loop or anything else inside of our application. So we are not touching the threadpool at all in this case.

## 016   OSAsync Common Questions (01:23:02)

Q1. What functions in node std library use the OS's async features ?
# Almost everything around networking for all OS's. Some other stuff is OS specific.

Q2. How does this OS async stuff fit into the Event Loop?
# Tasks using the underlying OS are reflected in `pendingOSTasks` array.

## 017   Review (01:25:42)

# Once we run our js file (let say index.js), all the code inside that file and any required files (using require) all executed. So the `require` statements those are instantly required in and executed as well. The Node enters `Event Loop` and proceed with further execution.

## 018   Crazy Node Behavior (01:28:31)

## 019 Unexpected Event Loop Events (01:36:10)

# fs module (file system) and http both are asynchronous calls and it take some amount of time to complete its execution. However `fs` and `crypto` both modules make use of threadpool for its execution where as `http` networking call make use of `os` to complete its execution. (http module doesn't make use of threadpool for its execution)

# file read operation in Node :-
# when we call read file, Node doesn't just go directly to the hard drive and immediately start reading the file instead it looks at the file on the hard drive and tries to gather some statistics about it like how large the file is, this entrie process involves one round trip to the Hard drive so Node goes to the Hard drive get some statistics about the file and then result comes back to the program, after Node has those stats it now knows how large file it can expect that file to be and then it is ready to actually go and read the file and then eventually calls the callback inside it. So the key things to keep in mind that there were two distinct pauses that occurred :-
1). we had one pause during entire read file where node was just waiting on the hard drive to return some stats about this file ,
2). when Node went back to the hard drive and started to actually read the file contents out.

# Section 2 - Enhancing Node Performance

## 020   Enhancing Performance (01:47:33)

# In this section we will look at how we can setup Node to run inside of cluster mode.

# Cluster mode is used to start up multiple copies of Node that are all running our server inside them. We can't somehow trick Node into running with multiple threads but by starting up mutiple copies we get multiple instances of the Event Loop. So it vaguely somewhat works in a similar fashion as making Node kind of multi-threaded.

# We will also use worker threads to do a lot of performance work inside of our app as well. These worker threads will use the thread pool that is set up by libuv

# Improving Node performance 

1). Use Node in `Cluster` Mode ---> Recommended

2). Use Worker Threads ---> Experimental

## 021   Express Setup (01:49:51)

# setup express to work with clustering 

## 022   Blocking the Event Loop (01:53:13)

# Whenever a request comes into server it get processed inside `one single thread` in Node application that contains `Event Loop`.

# the `doWork` function going to be executed inside Event Loop, this doesn't get thrown out of event loop and doesn't get handled by OS or anything other thing (as it is native JS Code).

# As soon as we start executing JS specific code (like `doWork` method) that takes some amount of time (5 seconds) to execute, then our server will not process the incoming requests as effectively as they would and get blocked and  any other requests that are coming in can do absolutely nothing (5 seconds) until that original request gets resolved and handled. So the effect of long running and computationally intensive code inside of a Node project can be quite catastrophic and not ideal at all.

## 023   Clustering in Theory (02:00:20)

# When we start to use clustering inside of a Node application, we are going to be starting up multiple node processes. There always going to be one parent process or one kind of like overarching process called cluster manager. Cluster Manager is responsible for monitoring the health of individual instances of our application that we are going to launch at same time on our computer. The Cluster Manager itself doesn't actually execute any application code so in other words Cluster Manager isn't really responsible for handling incoming request or fetching data from DB. So, Cluster Manager can start instances, it can stop them, it can restart them, it can send them data, it can do other kind of administrative tasks essentially.

1). Without Clustering

==> RUN node index.js  -----> index.js -----> Node Instance

2). With Cluster

RUN node index.js
        |
        v
   ┌─────────┐
   │ index.js│
   └────┬────┘
        │
        v
 ┌──────────────┐
 │Cluster Manager│
 └──────┬───────┘
        │ cluster.fork()
        ├─→ Worker Instance 1
        ├─→ Worker Instance 2
        └─→ Worker Instance N

# Using Clustering :- When we run the Node application (using `node index.js`), node going to boot our application by reading the content of that file and launching a node instance. the first instance of node that get launched when we run that command is what we refer to as the `Cluster Manager`. The cluster manager is then responsible for starting up worker instances and those worker instances are actually responsible for processing those incoming requests. To create those worker instances the cluster manager is going to require in the cluster module from the node standard library, so cluster module is standard module just like other fs, http, crypto modules.

# There is one particular function on cluster module called fork `cluster.fork()` and whenever we call this function within cluster manager something very interesting happens.

Q. What does `cluster.fork()` do?
# When we call `cluster.fork()`, node internally goes back to the `index.js` file and it executes it for a second time but in slightly different mode i.e, when it executes that file (index.js) for a second time that then starts up worker instance so in other words we can say that `index.js` file is going to be executed multiple times by node. The first time it's going to produce cluster manager and then every time after that it's going to be producing worker instances. 

## 024   Forking Children (02:05:31)

# The cluster manager has that `isMaster` property that is always set to `true`.

# As soon as we start forking off  additional worker instances (using cluster.fork()) however that `isMaster` flag is going to be set `false`

# So, we basically use single property `cluster.isMaster` to decide what `index.js` file do whenever it get executed. As soon as we start doing fork, node is going to execute that `index.js` file a second or third or fourth time. So, when we run this file we need to make sure that we must behave slight differently depending upon whether we are running in the cluster manager or a worker instance.

##  025   Clustering in Action (02:11:09)

# When we start up just one child (using `cluster.fork()` single time) that's not really doing a whole lot for us, when we have one child that's basically doing the same thing as just executing our server in normal mode because we have only one child we still have one instance of the Event Loop and we are not gaining any performance benefit. We can easily start up additional children by simply calling `cluster.fork()` additional time.

# Once we call `cluster.fork()` four times that means in addition to the first time of executing the `index.js` file, it will be executed an additional four times and each time `isMaster` property set to false.

# Without clustering when we load up two instances of `index.js` file with 5 seconds of delay at that time we only had that single instance of the server we had to wait for the first request to be completed we had to wait that full 5 seconds before the 5-seconds request would even start.

# Using Clustering :- we are able to load two separate requests at the same time and the second request went very quickly because we had two separate servers handling each request.

# So, by using clustering we can start up multiple instances of server that more evenly address all the incoming requests that are coming into our application and have some more predictable response time.

## 026   Benchmarking Server Performance (02:16:43)

# Adding a whole bunch of additional children (using `cluster.fork`) really has diminishing returns in some cases it can actually be kind of catastrophic for our application.

# Command to measure perform of Server (using Apache from `bin` directory) - `ab.exe -c 50 -n 500 http://localhost:4712/fast
`

# The cluster mode allows networked Node.js applications (http(s)/tcp/udp server) to be scaled across all CPUs available, without any code modifications. This greatly increases the performance and reliability of your applications, depending on the number of CPUs available. Under the hood, this uses the Node.js cluster module such that the scaled application’s child processes can automatically share server ports.

# How Cluster Works? - https://nodejs.org/api/cluster.html#cluster_how_it_works

## 027   Benchmark Refactor (02:22:00)

# We will replace `doWork` function, it is currently used as blocking code but it doesn't really do a good job of simulating true actual work like some computation some fixed set of data.

# Instead of `doWork` function we will use pbkdf2 hashing function for better computation analysis.

# All of the children inside of the cluster will have one thread available in their thread pool.

# Note - Whenever we create a cluster every single child has their own separate thread pool.

# Normally every child that we would create has a group of four threads that they can use for computation

# By using `process.env.UV_THREADPOOL_SIZE = 1;`, this doesn't restrict the total number of threads in entire cluster, it means that every child in the cluster only has one thread available.

## 028   Need More Children (02:25:55)

# With One child - we can see in Server Benchmarking that it took around 1 second for 2 requests,

# With two childs - it took 0.5 second only for 2 requests

# So by using clustering we have got a very distinct benefit. 

# But when we use 6 child processes, each process took around 1.3 seconds

# When we run our code with 6 child processes at same time that means in those six separate threads that are running on six separate children, we are bouncing between every hash function calls at the exact same time and our CPU is trying to do a little bit of work on each six process all at same time. The result is that we didn't get our code executed six-times faster or anything like this. The result is that it took significantly longer time of 1.3 seconds to eventually get a response.

# So, although we were able to address these incoming requests at the same time but the net result was that our overall performance suffered because CPU was trying to bounce around and process all these different incoming requests at exactly the same time. So, this is a very clear case where we have kind of overallocated instances inside of our cluster and even though we can definetly start processing all these processes at the exact same time but the result is that we have created kind of average bottleneck of mediocrity where we can only do so much at any given time and we've trying to do too much so it slowed down the overall result.

# So, clearly there is an upper bound to the number of children that we want to create inside cluster whenever we have computationally intensive work to do.

Q. How to fix the issue of number of children overallocation?
# Let us reduce the number of children to 2 and the longest request took 1.7 second (where we ran 6 requests parallely)

# In above case, with two children we know we can only process at best two processes (two hash functions) at any given time. Even though we have used fewer children (two only) we actually have ended up with arguably a far better performance than previously with six children.

# So, by increasing the number of children that we have inside our application dramatically beyond the number of actual logical cores that we have in our system, we are going to have net negative effect on the performance of the system.

# In general we want to match the number of children in cluster to either the number of physical cores or logical cores we have in our system.

# Problems associated with Clustering in real world application :-
1). Memory Overhead and Resource Consumption :- Each worker process in a cluster maintains its own memory space, leading to substantial memory overhead. 

2). State Synchronization Issues :- Child Process (Worker processes) cannot directly share memory, making state synchronization extremely complex. 

3). Load Balancer Limitations :- Node's built-in cluster module uses a simple round-robin load balancing approach that doesn't account for actual worker load or request complexity.

4). Debugging and Development Complexity :- Debugging clustered applications is significantly more difficult because issues might be specific to individual workers or occur due to inter-worker communication problems.

5). Database Connection Pool Issues :- Each worker maintains its own database connections, potentially overwhelming the database with too many connections or causing connection pool exhaustion.

6). File System and Shared Resource Conflicts :- Multiple workers trying to access the same files or shared resources can cause race conditions and conflicts.

# More Details - https://claude.ai/share/2cdf28fa-c1ae-4f37-b5f8-6f3cf0c7d4e1

## 029   PM2 Installation (02:42:38)

# Write our own cluster management implementation from scratch is bit challenging. So, if we ever want to use cluster management in a production application there's really one place we should turn to that is `pm2 CLI`.

# PM2 - PM2 is a daemon process manager that will help us manage and keep our application online. 

# PM2 - https://github.com/Unitech/pm2

# PM2 Doc - https://pm2.keymetrics.io/docs/usage/quick-start/

## 030   PM2 Configuration (02:45:31)

# PM2 Process Manager is a cluster management solution and it has everything having to do with spawning multiple instances of our application and managing the health of every single of them. If one of the instances ever crashes it's going to automatically restart the instance.

# Command to run node js file using pm2 is - `pm2 start index.js -i 0`

# In above command `-i` is for letting pm2 decide how many instances to create for our application and common option to use with `-i` 0. If we put 0 then, pm2 going to setup a number of instances equal to the number of logical CPU cores on our system.

# Logical cores is the number of pysical cores times the number of threads that they can process at any given point of time.

# Logical cores = Number of pysical cores * number of threads processed at any given time.

# So if we pass `-i` 0 in above command, it will start up a number equal to the number of actual cores on our machine

# Command to get a summary of health of all running instances :- `pm2 list`

# Command to get details of application - `pm2 show application_name` ---> `pm2 show index`

# Command to check health of each instance - `pm2 monit`

# In general we can `pm2` in production environment and it's going to take care of managing the health of every single one of instances. 

# Command to stop pm2 - `pm2 delete index`

## 031   Webworker Threads (02:52:21)

# webworker-threads provides an asynchronous API for CPU-bound tasks that's missing in Node.js

# worker threads are still in the experimental stage. If we want to improve Node application performance then Clustering mode is recommended approach.

# Worker thread uses the same thread pool that is managed by libuv for doing stuff like handling that hashing function. Using worker thread and getting direct access to that is definetly useful but at the end of the day the usage of it is still being limited by the amount of overall processing power of CPU.

# webworker-threads - https://www.npmjs.com/package/webworker-threads

## 032   Worker Threads in Action (02:54:48)

# Architecture: The implementation creates two separate threads - the main application thread (event loop) and a worker thread. These threads communicate through a message-passing system using postMessage() and onMessage properties.

# Communication Pattern:
- The main thread creates a worker interface that spawns the worker thread
- Both sides use `postMessage()` to send data and `onMessage` callbacks to receive data
- Variables cannot be directly shared between threads - all communication must go through the messaging system

# Implementation Steps:
- Import the worker_threads library: const { Worker } = require('worker_threads')
- Create a new Worker instance with a function containing the work logic
- Set up worker.onMessage callback in the main thread to handle responses
- Use worker.postMessage() to send data to the worker
- Inside the worker function, define this.onMessage to handle incoming data
- Use this.postMessage() to send results back to the main thread

# More Details on worker-thread :- https://medium.com/@manikmudholkar831995/worker-threads-multitasking-in-nodejs-6028cdf35e9d 

## 033   Benchmarking Workers (03:06:22)

# Key Points:

- The worker counts from 0 to 1×10^9 (1 billion) in a separate thread
- When the main application calls postMessage(), it triggers the worker's onmessage function
- The worker performs the calculation and sends the result back via postMessage()
- Initially only console logged the result without responding to HTTP requests

## More Detailed Blog realted to Node Cluster and Worker threads

# Clustering and PM2: Multitasking in NodeJS - https://medium.com/@manikmudholkar831995/clustering-and-pm2-multitasking-in-nodejs-c6b10249cfd4

# Child Processes: Multitasking in NodeJS - https://medium.com/@manikmudholkar831995/child-processes-multitasking-in-nodejs-751f9f7a85c8

# Worker Threads : Multitasking in NodeJS - https://medium.com/@manikmudholkar831995/worker-threads-multitasking-in-nodejs-6028cdf35e9d