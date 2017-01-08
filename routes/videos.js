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
const MongooseValidationError = require('./../validation/mongoose-validation-error');

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
            if (err) {
                // Any error here must be related to internal error reasons
                return next(new HTTPError('Internal Server Error', 500));
            }

            res.status(200).json(items);
        })
    })
    .post(function(req, res, next) {
        const video = new VideoModel(req.body);
        video.save((err) => {
            if (err) {
                return next(new MongooseValidationError(err));
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
            if (!item) {
                return next(new HTTPError('Resource does not exist.', 404));
            }

            if (err) {
                // Any error here must be related to internal error reasons
                return next(new HTTPError(err.message, 500));
            }

            res.status(200).json(item);
        })
    })
    .put((req,res,next) => {
        const data = req.body;

        // Treat put data as completely new record
        const video = new VideoModel(data);
        // Validate new record
        video.validate((err) => {
            if (err) {
                return next(new HTTPError(err.message, 400));
            }

            // Create plain object with model data
            const videoObject = video.toObject();

            // Delete id and version from updates (avoid change of id and version)
            delete videoObject._id;
            delete videoObject.__v;

            // Replace old record with new record
            VideoModel.findOneAndUpdate({_id: req.params.id}, {$set: videoObject}, {
                new: true,
                setDefaultsOnInsert: true
            }, (err, item) => {
                if (err) {
                    return next(new HTTPError(err.message, 500));
                }

                // Respond with new record data
                res.status(200).json(item);
            });
        });


    })
    .delete(function(req, res, next) {
        VideoModel.findByIdAndRemove(req.params.id, (err, item) => {
            if (err) {
                return next(new HTTPError(err.message, 500));
            }

            if (!item) {
                return next(new HTTPError('Resource does not exist', 404));
            }

            next();
        })
    })
    .patch((req, res, next) => {
        if(req.body._id && (req.params.id !== req.body._id)){
            return next(new HTTPError('The _id sent in body is invalid.', 400));
        }
        VideoModel.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}, (err, item) => {
            if(err){
                return next(new HTTPError(err.message, 404));
            }
            res.status(200).json(item);
        });
    })
    .post(methodNotAllowed);

videos.use(searchResponseFilterFactory(allKeys));
videos.use(filterResponseData);

module.exports = videos;
