
## 001 Staring With Node Internals (00:00)

# V8 - It is open source JS engine created by Google. The purpose of this project is to execute JS code outside of the browser.

# libuv - It is a open source C++ project that gives Node access to the Operating System (OS), File System (fs), Networking and it also handles some aspects of concurrency as well.

# Node - Node gives us a nice interface to use, to relate our JS side of our application to the actual C++ that running under the hood on our computer to actually interpret and execute JS code. Apart of these, Node provide series of wrappers and very unified and consistent APIs.

## 002 Module Implementations (03:47)

# Activity
- Pick a function in Node standard libaray
- Find where its implemented in the Node source code
- See how V8 and libuv are used to implement that function,

# We will choose `pbkdf2` function (function in Node's `crypto` libaray)
 
# this `pbkdf2` function is used for hashing some library data. It is usually used to hash a password for storage inside a database.

## 003   Node Backed by C (12:11)

## 004   The Basics of Threads (18:44)

# Event loop is used by Node to handle asynchronous code that we write inside JS code.

# Whenever we run programs on our computer we start something called process. A process is an instance of a computer program that is being executed. Within a single process we can have multiple things called threads. We can think of threads as being like a little Todo list that has some number of instructions that need to be executed by the CPU of the computer.

# A single process can have multiple threads inside of it.

# Deciding which order to execute these threads in is referred to as `Scheduling`.

# Scheduling refers to Operating System's ability to decide which thread to process at any given instant.

# In order to more quickly process threads or process more at one given time we can first add in additional CPU cores to our machine so if we have more than one core inside of our CPU then we can easily process multiple threads at the same time.

# Technically one core of CPU can process more than one thread at a time through multi-threading (or hyper-threading)

##  005   The Node Event Loop (25:14)

# Whenever we start up a node program our computer, node automatically creates one thread and execute all of our code inside of that one single thread. Inside of this single thread (represented by blue box) there is something called `Event Loop`.

# We can think of Event Loop as being like a control structure that decides what our one thread should be doing at any given point of time.

## 006   The Event Loop Implementation (31:48)

# Conditions under whcih Event Loop runs :-
- 1st check - any pending  setTimeout, setInterval, setImmediate
- 2nd check - any pending OS tasks ? (Like server listening to port)
- 3rd check - any pending long running operations ? (like fs module)

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

# Thread Pool is a series of four threads that can be used for running computationally intensive tasks such as pbkdf2 function, by default libuv creates four threads in this thread pool which means that in addition to the thread used for the Event Loop  there are four other threads that can be used to offload expensive calculations that need to occur inside our application. Many of the functions included in Node standard library will automatically use thread pool. So by using the thread pool we don't have to wait for that 1 second and we can do other things inside of the Event Loop while that calculation is going on. 

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
# We can write custom JS that uses the thread pool.

Q2. What functions in Node Std library use the threadpool?
# All 'fs' module functions. Some crypto stuff. Depends on OS (window vs unix based).

Q3. How does this threadpool stuff fit into the event loop?
# Tasks running in the threadpool are the `pendingOperations` in our code example.

##  014   Explaining OS Operations (01:15:50)

# Make Network call to `https:/www.google.com` and calculated the time it took to make this call.

## 015   Libuv OS Delegation (01:19:42)

# We will add some more network request calls and when we do so we will find that some of the functions in the Node standard library don't seem to use same kind of thread pool that some other functions use (like pbkdf2 hashing function did)

# After running the code, it seemed that all 7 calls appear to be completed at the same exact time. This is distinctly different behaviour that we saw previously with thread pool.

# As Node standard library has some functions that make use of libuv's threadpool it also has some functions that make use of code that is built into the underlying Operating System through libuv, so in this case libuv sees that we are attempting to make an HTTP reques, neither libuv nor Node has any code to handle all of the super low-level operations that are involved with a network request instead libuv delegates the request making to the underlying Operating System (OS) so actually it's Operating System that does the real HTTP request. libuv is used to issue the request and then it just waits for Operating System to emit a signal that some response has come back to the request. so beacuse libuv is delegating the work done to the OS , the OS itself decides whether to make a new thread or not. As OS is making request there is no blocking of our JS code inside Event Loop or anything else inside of our application. So we are not touching the threadpool at all in this case.

## 016   OSAsync Common Questions (01:23:02)

Q1. What functions in node std library use the OS's async features ?
# Almost everything around networking for all OS's. Some other stuff is OS specific.

Q2. How does this OS async stuff fit into the Event Loop?
# Tasks using the underlying OS are reflected in `pendingOSTasks` array.

## 017   Review (01:25:42)

# Once we run our js file (let say index.js), all the code inside that file and any required files (using require) all executed. So the `require` statements those are instantly required in and executed as well. The Node enters `Event Loop` and proceed with further execution.