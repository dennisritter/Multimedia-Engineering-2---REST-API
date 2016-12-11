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
const {validateComplete, validatePatch, allKeys} = require('./../validators/videos');
const videoDeleteValidator = require('./../validators/videos-delete');
const {filterParserFactory, filterResponseData} = require('./../restapi/filter');
const {searchParserFactory, searchResponseFilterFactory} = require('./../restapi/search');
const HTTPError = require('./../validators/http-error');

var videos = express.Router();

videos.use(filterParserFactory(Object.keys(allKeys)));
videos.use(searchParserFactory(allKeys));

const methodNotAllowed = (req, res, next) => {
    const err = new Error(`Method ${req.method} is not allowed.`);
    err.status = 405;
    next(err);
};

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
            data = validateComplete(data);
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
    .put(methodNotAllowed)
    .patch(methodNotAllowed)
    .delete(methodNotAllowed);

videos.route('/:id')
    .get((req, res, next) => {
        const video = store.select('videos', req.params.id);
        if (!video) {
            return next(new HTTPError(`A video with id ${req.params.id} does not exist.`, 404));
        }

        res.locals.items = video;
        next();
    })
    .put(function(req,res,next){
        let data = req.body;
        try {
            // TODO: make sure id and timestamp are not being updated
            data = validateComplete(data);
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
            //select all comments
            let comments = store.select('comments');
            //if there is atleast one comment
            if(comments){
                comments.forEach((comment) => {
                    if(comment.videoid === parseInt(id, 10)){
                        try{
                            store.remove('comments', comment.id);
                        }
                        catch(err){
                            next(err);
                        }
                    }
                });
            }

            // Remove video from store
            store.remove('videos', id);
            res.status = 200;
            // Send status without content
            next();
        }
        catch (err) {
            next(err);
        }
    })
    .patch((req, res, next) => {
        const original = store.select('videos', req.params.id);
        const data = req.body;

        const updated = validatePatch(original, data);

        store.replace('videos', req.params.id, updated);
        res.locals.items = original;
        next();
    })
    .post(methodNotAllowed);

videos.use(searchResponseFilterFactory(allKeys));
videos.use(filterResponseData);

module.exports = videos;
