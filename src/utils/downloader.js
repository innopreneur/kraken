const fs = require('fs');
const request = require('request');
const progress = require('request-progress');

async function downloadFile(url, destination) {
    console.log(`Downloading File from ${url} and storing in ${destination}`)
    // The options argument is optional so you can omit it 
    progress(request(url), {
        // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms 
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms 
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length 
    })
        .on('progress', function (state) {
            // The state is an object that looks like this: 
            // { 
            //     percent: 0.5,               // Overall percent (between 0 to 1) 
            //     speed: 554732,              // The download speed in bytes/sec 
            //     size: { 
            //         total: 90044871,        // The total payload size in bytes 
            //         transferred: 27610959   // The transferred payload size in bytes 
            //     }, 
            //     time: { 
            //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals) 
            //         remaining: 81.403       // The remaining seconds to finish (3 decimals) 
            //     } 
            // } 
            console.log('progress -> ', state.percent * 100 + '%');
        })
        .on('error', function (err) {
            // Do something with err 
        })
        .on('end', function () {
            // Do something after request finishes 
        })
        .pipe(fs.createWriteStream(destination));
}



module.exports = { downloadFile }