/**
 * Simple Express server containing static file delivery, cached delivery of file.txt and endpoint for current system time.
 *
 * @author Dennis Ritter, Jannik Portz, Nathalie Junker
 */

"use strict";

// node module imports
const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();

const txtFile = path.join(__dirname, 'file.txt');

// Create wrapper memoizing function around fs.readFile
const memoizeReadFile = function (readFile) {
    // Dictionary mapping file name to cached file contents
    const cache = {};

    // Create new function
    return (path, callback) => {
        if (cache.hasOwnProperty(path)) {
            // If file content exist in cache, serve it synchronously without error
            callback(undefined, cache[path]);
        } else {
            // If file is not present in cache, load it asynchronously from fs
            readFile(path, (err, data) => {
                if (err) {
                    // If error while reading file, pass it to callback without content
                    // --> fs.readFile callback is not decorated in this case
                    callback(err, null);
                } else {
                    // If reading file succeeded, put contents into cache and pass to callback
                    // --> fs.readFile callback is decorated. Data is stored in cache before fs.readFile callback is executed
                    cache[path] = data;
                    callback(undefined, data);
                }
            });
        }
    };
};

// Register express static middleware to provide files in static directory
app.use('/public', express.static(path.join(__dirname, 'static')));

// Create memoized version of fs.readFile
const readFile = memoizeReadFile(fs.readFile);
app.get('/file.txt', (req, res, next) => {
    // Capture current system time before file read
    const beforeRead = process.hrtime();
    res.setHeader('Content-Type', 'text/plain');
    readFile(txtFile, (err, content) => {
        if (!!err) {
            // Define Error and pass to errorhandler
            var err = new Error('Error reading file');
            err.status = 500;
            next(err);
        }else{
            // Calculate difference when file has been read
            const diff = process.hrtime(beforeRead);

            // Append time difference to content
            content += `\n` + (diff[0] * 1e9 + diff[1]) + ' nanoseconds';
            res.send(content);
        }
    });
});

// display time
app.get('/time',(req, res) => {
    const d = new Date();
    const time =  d.getHours() + ":" + d.getMinutes();
    res.set('content-type', 'text/plain');
    res.send('The current time is: ' + time);
});

// Always keep as last registration
app.get(/.*/, (req, res) => { res.sendFile(path.join(__dirname + '/helloworld.html')) });

// Error handling
// Throw error when no middleware has handled the request by now
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Catch all errors and send corresponding response
app.use((err, req, res, next) => {
    res.status(err.status).end();
    console.log(err);
    console.log(err.stack);
});

// Start server
app.listen(3000, () => console.log("Du hast 1 serwer gestartet! vong port 3000 her."));

