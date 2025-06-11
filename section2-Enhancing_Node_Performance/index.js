process.env.UV_THREADPOOL_SIZE = 1;
const cluster = require('cluster');

// console.log("Is Master:", cluster.isMaster);

// Is the file being executed in master mode?
if (cluster.isMaster) {
  // cause `index.js` to be executed *again* but
  // in child mode (slave mode)
  cluster.fork();
  cluster.fork();
} else {
  // I am child, i am going to act like a server
  // and do nothing else  
  const express = require("express");
  const crypto = require('crypto');
  const app = express();

  app.get("/", (req, res) => {
    crypto.pbkdf2("a", "b", 100000, 512, "sha512", () => {
      res.send("Hi there...");
    });
  });

  app.get('/fast', (req, res) => {
    res.send('This was fast!!');
  })

  const portNo = 4712;
  app.listen(portNo, () => {
    console.log(`Server running on port: ${portNo}`);
  });
}


