/** This module defines the routes for videos using the store.js as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/videos
 * @type {Router}
 */
"use strict";

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
var express = require('express');
var logger = require('debug')('me2u4:videos');

//load mongoose module
const mongoose = require('mongoose');

//remove?
const {validateComplete, validatePatch, validateId, allKeys} = require('./../validation/videos');
const {filterParserFactory, filterResponseData} = require('./../restapi/filter');
const {searchParserFactory, searchResponseFilterFactory} = require('./../restapi/search');

//load mongoose VideoModel
var VideoModel = require('./../models/video');
//load HTTPError constructor
const HTTPError = require('./../validation/http-error');

var videos = express.Router();

//connect to mongoDB
const db = mongoose.connect('mongodb://localhost:27017/me2');

videos.use(filterParserFactory(Object.keys(allKeys)));
videos.use(searchParserFactory(allKeys));

const methodNotAllowed = (req, res, next) => {
    return next(new HTTPError(`Method ${req.method} is not allowed.`, 405));
};

// routes **********************
videos.route('/')
    .get(function(req, res, next) {
        VideoModel.find({}, (err, items) => {
            if(err){
                return next(new HTTPError(err.message, 404));
            }
            res.status(200).json(items);
        })
    })
    .post(function(req, res, next) {
        var video = new VideoModel(req.body)
        video.save((err) => {
            if(err){
                return next(new HTTPError(err.message, 400));
            }
            res.status(201).json(video);
        });
    })
    .put(methodNotAllowed)
    .patch(methodNotAllowed)
    .delete(methodNotAllowed);

videos.route('/:id')
    .get((req, res, next) => {
        VideoModel.findById(req.params.id, (err, item) => {
            if(err){
                return next(new HTTPError(err.message, 404));
            }
            res.status(200).json(item);
        })
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
        VideoModel.findByIdAndRemove(req.params.id, (err, item) => {
            if(err){
                return next(new HTTPError(err.message, 404));
            }
            // If ID does not exist no error thrown.
            // --> also check for if ID exists?
            next();
        })
        // try {
        //     const id = validateId(req.params.id);
        //
        //     //select all comments
        //     let comments = store.select('comments');
        //     if (Array.isArray(comments)) {
        //         comments.filter(c => c.videoId === id)
        //             .forEach((c) => store.remove('comments', c.id));
        //     }
        //
        //     // Remove video from store
        //     store.remove('videos', id);
        //     next();
        // }
        // catch (err) {
        //     next(err);
        // }
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
