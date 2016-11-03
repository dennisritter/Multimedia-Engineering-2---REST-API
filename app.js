/**
 * Created by Dennis Ritter, Jannik Portz, Nathalie Junker
 */

const express = require('express');

const app = express();
const path = require('path');
const fs = require('fs');

const txtFile = path.join(__dirname, 'file.txt');

app.get('/file.txt', (req, res) => {
    const beforeRead = process.hrtime();
    res.setHeader('Content-Type', 'text/plain');
    fs.readFile(txtFile, (err, content) => {
        if (!!err) {
            process.stderr.write(err.toString());
            res.status(500);
            res.send('Error reading file');
            return;
        }

        const diff = process.hrtime(beforeRead);
        content += `\n` + (diff[0] * 1e9 + diff[1]) + ' nanoseconds';
        res.send(content);
    });
});


// if public-folder requested, use static-folder
app.get(/\/public\/.*/, function(req, res) {
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
app.get('/time', function(req, res) {
    const d = new Date();
    const time =  d.getHours() + ":" + d.getMinutes();
    res.set('content-type', 'text/plain');
    res.send('The current time is: ' + time);
});

// Always keep as last registration
app.get(/.*/, function(req, res) {
    res.sendFile(path.join(__dirname + '/helloworld.html'));
});

//ERRORHANDLING
app.use(function(req,res, next){
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
})

app.use(function(err, req, res, next){
    res.status(err.status).end();
})

app.listen(3000, () => console.log("Du hast 1 serwer gestartet! vong port 3000 her."));

