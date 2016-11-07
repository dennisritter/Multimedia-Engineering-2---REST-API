/**
 * Simple Express server containing static file delivery, cached delivery of file.txt and endpoint for current system time.
 *
 * @author Dennis Ritter, Jannik Portz, Nathalie Junker
 */

"use strict";

const express = require('express');
const path = require('path');
const fs = require('fs');

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
                    callback(err, null);
                } else {
                    // If reading file succeeded, put contents into cache and pass to callback
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
app.get('/file.txt', (req, res) => {
    // Capture current system time before file read
    const beforeRead = process.hrtime();
    res.setHeader('Content-Type', 'text/plain');
    readFile(txtFile, (err, content) => {
        if (!!err) {
            // Send error response
            process.stderr.write(err.toString());
            res.status(500);
            res.send('Error reading file');
            return;
        }

        // Calculate difference when file has been read
        const diff = process.hrtime(beforeRead);

        // Append time difference to content
        content += `\n` + (diff[0] * 1e9 + diff[1]) + ' nanoseconds';
        res.send(content);
    });
});


// if public-folder requested, use static-folder
app.get(/\/public\/.*/, (req, res) => {
    const errorFile = path.join(__dirname + '/error.html');
    const reqPath = path.join(__dirname + '/static/' + req.originalUrl.substring(8));
    const exists = fs.existsSync(reqPath);

    if(exists){
        res.sendFile(path.join(reqPath));
    }else{
        res.sendFile(errorFile);
    }
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

// Throw error when no middleware has handled the request by now
app.use((req,res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handling
// Catch all errors and send corresponding response
app.use((err, req, res, next)  => res.status(err.status).end());

/**
 * START SERVER
 */
app.listen(3000, () => console.log("Du hast 1 serwer gestartet! vong port 3000 her."));

