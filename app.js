/**
 * Created by Dennis Ritter, Jannik Portz, Nathalie Junker
 */

const express = require('express');

const app = express();
const path = require('path');

app.get(/.*/, function(req, res){
    res.sendFile(path.join(__dirname + '/helloworld.html'));
})

app.listen(3000, () => console.log("hallo!") );

//app.use(express.static('static'); Zusatz: Nur bei /public ?