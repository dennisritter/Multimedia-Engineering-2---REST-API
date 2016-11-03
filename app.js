/**
 * Created by Dennis Ritter, Jannik Portz, Nathalie Junker
 */

const express = require('express');

const app = express();
const path = require('path');
const fs = require('fs');


app.get(/\/public\/.*/, function(req, res) {
    const errorFile = path.join(__dirname + '/error.html');
    const reqPath = path.join(__dirname + '/static/' + req.originalUrl.substring(8))
    const exists = fs.existsSync(reqPath);

    if(exists){
        res.sendFile(path.join(reqPath));
    }else{
        res.sendFile(errorFile);
    }
});

app.get(/.*/, function(req, res) {
    res.sendFile(path.join(__dirname + '/helloworld.html'));
});

app.listen(3000, () => console.log("hallo!"));