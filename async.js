
// fetch Google home page

const https = require('https');

const start = Date.now();

https.request('https://www.google.com', res => {
    res.on('data', () => {});
    res.on('end', () => {
        console.log("T1:", Date.now() - start);
    });
}).end();