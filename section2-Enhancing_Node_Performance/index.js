const express = require("express");
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();

app.get("/", (req, res) => {
  const worker = new Worker(path.join(__dirname, 'worker.js'));

  worker.on('message', (myCounter) => {
    console.log("Counter value:", myCounter);
    res.send(`Counter finished! Value: ${myCounter}`);
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);
    res.status(500).send('Worker error occurred');
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });

  worker.postMessage('start');
});

app.get("/fast", (req, res) => {
  res.send("This was fast!!");
});

const portNo = 4712;
app.listen(portNo, () => {
  console.log(`Server running on port: ${portNo}`);
});