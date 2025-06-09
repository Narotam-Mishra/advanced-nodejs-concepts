const cluster = require('cluster');

// console.log("Is Master:", cluster.isMaster);

// Is the file being executed in master mode?
if (cluster.isMaster) {
  // cause `index.js` to be executed *again* but
  // in child mode (slave mode)
  cluster.fork();
  console.log("Forked!!");
} else {
  // I am child, i am going to act like a server
  // and do nothing else  
  const express = require("express");
  const app = express();

  function doWork(duration) {
    const start = Date.now();
    while (Date.now() - start < duration) {}
  }

  app.get("/", (req, res) => {
    doWork(5000);
    res.send("Hi there...");
  });

  const portNo = 4712;
  app.listen(portNo, () => {
    console.log(`Server running on port: ${portNo}`);
  });
}


