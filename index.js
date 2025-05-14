
const express = require('express');
const app = express();

function doWork(duration){
    const start = Date.now();
    while(Date.now() - start < duration){}
}

app.get('/', (req, res) => {
    doWork(5000);
    res.send('Hi there...')
});

const portNo = 4712
app.listen(portNo, () => {
    console.log(`Server running on port: ${portNo}`)
});
