/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
var express = require('express');
var logger = require('debug')('me2u4:videos');
var store = require('../blackbox/store');
const videoValidator = require('./../validators/videos');
const videoDeleteValidator = require('./../validators/videos-delete');

var videos = express.Router();

// routes **********************
videos.route('/')
    .get(function(req, res, next) {
        const videos = store.select('videos');
        if (videos === undefined) {
            next();
        } else {
            res.locals.items = videos;
            next();
        }
    })
    .post(function(req, res, next) {
        let data = req.body;

        try {
            data = videoValidator(data);
            // Insert new record
            store.insert('videos', data);

            // Send new record back
            res.locals.items = data;
            res.status(201);
            next();
        }
        catch (err) {
            next(err);
        }
    })
    .put(function(req, res, next) {
        const err = new Error('You cannot perform a PUT request on this endpoint (without id).');
        err.status = 405;
        next(err);
    });

videos.route('/:id')
    .get((req, res, next) => {
        const video = store.select('videos', req.params.id);
        if (!video) {
            const err = new Error(`A video with id ${req.params.id} does not exist.`);
            err.status = 404;
            next(err);
            return;
        }

        res.locals.items = video;
    })
    .post(function(req, res, next) {
        const err = new Error('You cannot perform a POST request on this endpoint.');
        err.status = 405;
        next(err);
    })
    .put(function(req,res,next){
        let data = req.body;
        try {
            data = videoValidator(data);
            //replace video with matching id
            store.replace('videos', data.id, data);
            // Send updated record back
            res.locals.items = data;
            res.status(200);
            next();
        }
        catch(err){
            next(err);
        }
    })
    .delete(function(req, res, next) {
        let id = req.params.id;
        try {
            id = videoDeleteValidator(id);
            // Remove video from store
            store.remove('videos', id);
            // Send status without content
            next();
        }
        catch (err) {
            next(err);
        }
    });


// this middleware function can be used, if you like (or remove it)
videos.use(function(req, res, next) {
    // if anything to send has been added to res.locals.items
    if (res.locals.items) {
        // then we send it as json and remove it
        res.json(res.locals.items);
        delete res.locals.items;
    }
    else {
        // otherwise we set status to no-content
        res.set('Content-Type', 'application/json');
        res.status(204).end(); // no content;
    }
});

module.exports = videos;
