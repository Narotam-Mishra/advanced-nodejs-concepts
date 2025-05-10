
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hi there...')
});

const portNo = 4712
app.listen(portNo, () => {
    console.log(`Server running on port: ${portNo}`)
});
