/** Main app for server to start a small REST API for videos
 * The included ./blackbox/store.js gives you access to a "database" which contains
 * nothing this time.
 * On each restart the db will be reset (it is only in memory).
 *
 * Note: set your environment variables
 * NODE_ENV=development
 * debug=me2u4:*
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var requestLogger = require('morgan');
var debug = require('debug')('me2u4:server');

// own modules
var restAPIchecks = require('./restapi/request-checks.js');
var {filterParser, filterResponseData} = require('./restapi/filter.js');
//routes
var videos = require('./routes/videos');
var comments = require('./routes/comments');
const HTTPError = require('./validators/http-error');



// app creation
var app = express();

// Middlewares *************************************************
app.use(favicon(path.join(__dirname, 'public', 'images/faviconbeuth.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// logging
app.use(requestLogger('dev'));

// API request checks for API-version and JSON etc. (same checks as in Ü3)
app.use(restAPIchecks);

// Routes ******************************************************
app.use('/videos', videos);
app.use('/comments', comments);

// this middleware function can be used, if you like (or remove it)
app.use(function(req, res) {
    // if anything to send has been added to res.locals.items
    if (res.locals.items) {
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    }
    else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        res.sendStatus(204);
    }
});

// (from express-generator boilerplate  standard code)
// Errorhandling and requests without proper URLs ************************
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    debug('Catching unmatched request to answer with 404', req.url);
    next(new HTTPError('Not Found', 404));
});

// error handlers (express recognizes it by 4 parameters!)
// development error handler
// will print stacktrace as JSON response
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        debug('Server responds with error: ', err.stack);
        res.status = err.status || 500;
        res.json({
            error: {
                message: err.message,
                error: err.stack,
                code: err.status || 500
            }
        });
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message,
                error: {},
                code: err.status || 500
            }
        });
    });
}
// Start server ****************************
app.listen(3000, function(err) {
    if (err !== undefined) {
        console.log('Error on startup, ',err);
    }
    else {
        debug('Listening on port 3000');
    }
});