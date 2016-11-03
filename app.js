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

// Always keep as last registration
app.get(/.*/, function(req, res) {
    res.sendFile(path.join(__dirname + '/helloworld.html'));
});

app.listen(3000, () => console.log("hallo!"));