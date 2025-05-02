
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
    // 2nd check - any pending OS tasks ? (Like server listening to port)
    // 3rd check - any pending long running operations ? (like fs module)

    return pendingTimers.length || pendingOSTasks.length || pendingOperations.length;
}

// entire body executes in one `tick`
while(shouldContinue()){
    
}






// exit back to terminal