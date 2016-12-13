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

const {validateComplete, validatePatch, validateId, allKeys} = require('./../validation/videos');
const {filterParserFactory, filterResponseData} = require('./../restapi/filter');
const {searchParserFactory, searchResponseFilterFactory} = require('./../restapi/search');

const HTTPError = require('./../validation/http-error');

var videos = express.Router();

videos.use(filterParserFactory(Object.keys(allKeys)));
videos.use(searchParserFactory(allKeys));

const methodNotAllowed = (req, res, next) => {
    return next(new HTTPError(`Method ${req.method} is not allowed.`, 405));
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
            data = Object.assign({
                description: '',
                playcount: 0,
                ranking: 0,
            }, data);

            data.timestamp = new Date().getTime();

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
            const id = validateId(req.params.id);
            const original = store.select('videos', id);

            data = validateComplete(data);
            data = Object.assign(original, data);
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
        try {
            const id = validateId(req.params.id);

            //select all comments
            let comments = store.select('comments');
            if (Array.isArray(comments)) {
                comments.filter(c => c.videoId === id)
                    .forEach((c) => store.remove('comments', c.id));
            }

            // Remove video from store
            store.remove('videos', id);
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


videos.route('/:id/comments')
    .get((req,res,next) => {
        const videoId = req.params.id;
        const video = store.select('videos', videoId);

        // check if video with id:{videoId} exists
        if(!video){
            return next(new HTTPError(`A video with id ${videoId} does not exist.`, 404));
        }
        let comments = store.select('comments');
        if(comments) {
            comments = comments.filter((comment) => comment.videoid === parseInt(videoId, 10));
            if (comments.length < 1){
                next();
            }else {
                res.locals.items = comments;
                res.status = 200;
                next();
            }
        }
    })
    .delete((req,res,next) => {
        const videoId = req.params.id;
        // check if video with id:{videoId} exists
        const video = store.select('videos', videoId);
        if(!video){
            return next(new HTTPError(`A video with id ${videoId} does not exist.`, 404));
        }
        try{
            let comments = store.select('comments');
            if(comments){
                comments.forEach((comment) => {
                    if(comment.videoid === parseInt(videoId, 10)){
                        let id = validateId(comment.id);
                        store.remove('comments', id);
                    }
                });
            }
            next();
        }
        catch(err){
            next(err);
        }
    })
    .post(methodNotAllowed)
    .patch(methodNotAllowed)
    .put(methodNotAllowed);
videos.use(searchResponseFilterFactory(allKeys));
videos.use(filterResponseData);

module.exports = videos;
