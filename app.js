/** Main app for server to start a small REST API for tweets
 * The included ./blackbox/store.js gives you access to a "database" which contains
 * already tweets with id 101 and 102, as well as users with id 103 and 104.
 * On each restart the db will be reset (it is only in memory).
 * Best start with GET http://localhost:3000/tweets to see the JSON for it
 *
 * TODO: Start the server and play a little with Postman
 * TODO: Look at the Routes-section (starting line 68) and start there to add your code 
 * 
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";  // tell node.js to be more "strict" in JavaScript parsing (e.g. not allow variables without var before)

// node module imports
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

// our own modules imports
var store = require('./blackbox/store.js');

// creating the server application
var app = express();

// Middleware ************************************
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logging
app.use(function(req, res, next) {
    console.log('Request of type '+req.method + ' to URL ' + req.originalUrl);
    next();
});

// API-Version control. We use HTTP Header field Accept-Version instead of URL-part /v1/
app.use(function(req, res, next){
    // expect the Accept-Version header to be NOT set or being 1.0
    var versionWanted = req.get('Accept-Version');
    if (versionWanted !== undefined && versionWanted !== '1.0') {
        // 406 Accept-* header cannot be fulfilled.
        res.status(406).send('Accept-Version cannot be fulfilled').end();
    } else {
        next(); // all OK, call next handler
    }
});

// request type application/json check
app.use(function(req, res, next) {
    if (['POST', 'PUT'].indexOf(req.method) > -1 &&
        !( /application\/json/.test(req.get('Content-Type')) )) {
        // send error code 415: unsupported media type
        res.status(415).send('wrong Content-Type');  // user has SEND the wrong type
    } else if (!req.accepts('json')) {
        // send 406 that response will be application/json and request does not support it by now as answer
        // user has REQUESTED the wrong type
        res.status(406).send('response of application/json only supported, please accept this');
    }
    else {
        next(); // let this request pass through as it is OK
    }
});


// Routes ***************************************

// TWEETS-RESSOURCE
app.get('/tweets', function(req,res,next) {
    res.json(store.select('tweets'));
});

app.post('/tweets', function(req,res,next) {
    var id = store.insert('tweets', req.body); 
    // set code 201 "created" and send the item back
    res.status(201).json(store.select('tweets', id));
});


app.get('/tweets/:id', function(req,res,next) {
    res.json(store.select('tweets', req.params.id));
});

app.delete('/tweets/:id', function(req,res,next) {
    store.remove('tweets', req.params.id);
    res.status(200).end();
});

app.put('/tweets/:id', function(req,res,next) {
    store.replace('tweets', req.params.id, req.body);
    res.status(200).end();
});

app.patch('/tweets/:id', function(req, res, next) {
    let id = req.params.id;
    if (!id.match(/^[1-9][0-9]*$/)) {
        const error = new Error(`The id parameter must be an integer`);
        error.status = 422;
        next(error);
        return;
    }

    id = parseInt(id);

    const tweet = store.select('tweets', id);
    if (!tweet) {
        const error = new Error(`A tweet with id ${id} does not exist`);
        error.status = 404;
        next(error);
        return;
    }

    ['message', 'creator'].forEach((prop) => {
        if (req.body.hasOwnProperty(prop))
            tweet[prop] = req.body[prop];
    });

    store.replace('tweets', id, tweet);
    res.sendStatus(200);
});


// USERS-RESSOURCE
app.route('/users')
    .get(function(req,res,next) {
        let users = store.select('users');
        let tweets = store.select('tweets');

        // append tweets href
        users.map( (user) => {
            user.tweets = {
                href: `http://localhost:3000/users/${user.id}/tweets`
            };
            return user;
        });

        // expand all tweets of every user if required
        if(req.query.expand === 'tweets'){

            users.map( (user) => {
                // get all tweets of the user
                let usersTweets = tweets.filter( (tweet) => tweet.creator === user.id);

                user.tweets.items = usersTweets.map( (tweet) =>{
                    tweet.href = `http://localhost:3000/tweets/${tweet.id}`;
                    tweet.creator = {
                        id: tweet.creator,
                        href: `http://localhost:3000/users/${tweet.creator}`
                    }
                    return tweet;
                });
                return user;
            });
        }
        res.status(200).json(users);
    })
    .post(function(req,res,next) {
        var id = store.insert('users', req.body);
        // set code 201 "created" and send the item back
        res.status(201).json(store.select('users', id));
    });

// relevant operations for a specific user
app.route('/users/:id')
    .get(function(req,res,next) {
        let user = store.select('users', req.params.id);
        user.tweets = {
            href: `http://localhost:3000/users/${user.id}/tweets`
        };
        res.status(200).json(user);
    })
    .delete(function(req,res,next) {
        store.remove('users', req.params.id);
        res.status(200).end();
    })
    .put(function(req,res,next) {
        store.replace('users', req.params.id, req.body);
        res.status(200).end();
    });

// relevant operations for a specific user's tweets
app.get('/users/:id/tweets', function(req, res, next){
    let tweets = store.select('tweets').filter( (tweet) => tweet.creator === parseInt(req.params.id, 10) );
    tweets = tweets.map( (tweet) => {
        tweet.creator = {
            href: `http://localhost:3000/users/${tweet.creator}`,
            id: tweet.creator
        }
        return tweet;
    });
    res.status(200).json(tweets);
});


// CatchAll for the rest (unfound routes/resources) ********

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers (express recognizes it by 4 parameters!)

// development error handler
// will print stacktrace as JSON response
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log('Internal Error: ', err.stack);
        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message,
                error: err.stack
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            error: {}
        }
    });
});


// Start server ****************************
app.listen(3000, function(err) {
    if (err !== undefined) {
        console.log('Error on startup, ',err);
    }
    else {
        console.log('Listening on port 3000');
    }
});