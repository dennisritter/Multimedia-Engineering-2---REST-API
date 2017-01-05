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

        const video = new VideoModel(data);
        video.validate((err) => {
            if (err) {
                return next(new HTTPError(err.message, 422));
            }

            const videoObject = video.toObject();
            delete videoObject._id;
            delete videoObject.__v;

            VideoModel.findOneAndUpdate({_id: req.params.id}, {$set: videoObject}, {
                new: true,
                setDefaultsOnInsert: true
            }, (err, item) => {
                if (err) {
                    return next(new HTTPError(err.message, 500));
                }

                res.status(200).json(item);
            });
        });


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
    })
    .patch((req, res, next) => {
        if(req.body._id && (req.params.id !== req.body._id)){
            return next(new HTTPError('The _id sent in body is invalid.'));
        }
        VideoModel.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}, (err, item) => {
            if(err){
                return next(new HTTPError(err.message, 404));
            }
            res.status(200).json(item);
        })
        // const original = store.select('videos', req.params.id);
        // const data = req.body;
        //
        // const updated = validatePatch(original, data);
        //
        // store.replace('videos', req.params.id, updated);
        // res.locals.items = original;
        // next();
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
