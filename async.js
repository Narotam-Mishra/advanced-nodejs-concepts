
// fetch Google home page

const https = require('https');

const start = Date.now();

function doRequest(){
    https.request('https://www.google.com', res => {
        res.on('data', () => {});
        res.on('end', () => {
            console.log("T1:", Date.now() - start);
        });
    }).end();
}

doRequest();
doRequest();
doRequest();
doRequest();
doRequest();
doRequest();
doRequest();

