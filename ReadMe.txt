
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
