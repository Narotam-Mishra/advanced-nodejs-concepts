
/*

life cycle of a node application

*/

// node myFile.js

const pendingTimers = [];
const pendingOSTasks = [];
const pendingOperations = [];

// New timers, tasks, operations are recorded from myFile running
myFile.runContent();

function shouldContinue(){
    // 1st check - any pending  setTimeout, setInterval, setImmediate
    // 2nd check - any pending OS tasks ? (Like http server listening to port)
    // 3rd check - any pending long running operations ? (like fs module)

    return pendingTimers.length || pendingOSTasks.length || pendingOperations.length;
}

// entire body executes in one `tick`
while(shouldContinue()){
    //1). Node looks at pending timers and sees if any functions are ready to be called (i.e, setTimeout & setInterval)
    
    //2). Node looks at pendingOSTasks and pendingOperations and calls relevant callbacks 
    
    // 3). Pause execution, continue whenever ....
    // - a new pendingOSTask is done
    // - a new pendingOperation is done
    // - a timer is about to complete

    // 4). Look at pendingTimers and call any setImmediate (But this time Node doesn't care about `setTimeout` & `setInterval` function calls, it only looks for functions that have been registered with `setImmediate`)

    // 5). handle any `close` events (clean up task)

}


// exit back to terminal