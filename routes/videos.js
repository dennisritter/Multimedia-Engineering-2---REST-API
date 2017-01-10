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

const {filterParserFactory} = require('./../restapi/filter');

//load mongoose VideoModel
var VideoModel = require('./../models/video');

//load HTTPError constructor
const HTTPError = require('./../validation/http-error');
const MongooseValidationError = require('./../validation/mongoose-validation-error');

var videos = express.Router();

videos.use(filterParserFactory(Object.keys(VideoModel.schema.paths)));

const methodNotAllowed = (req, res, next) => {
    return next(new HTTPError(`Method ${req.method} is not allowed.`, 405));
};

// routes **********************
videos.route('/')
    .get(function(req, res, next) {

        VideoModel.find({}, res.locals.filterParams.filter, {limit: res.locals.filterParams.limit, skip: res.locals.filterParams.offset}, (err, items) => {
            if (err) {
                // Any error here must be related to internal error reasons
                return next(HTTPError.Error500);
            }

            res.status(200).json(items);
        })
    })
    .post(function(req, res, next) {
        delete req.body._id;
        delete req.body.__v;

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

        VideoModel.findById(req.params.id, res.locals.filterParams.filter, (err, item) => {
            if (!item) {
                return next(HTTPError.Error404);
            }

            if (err) {
                // Any error here must be related to internal error reasons
                return next(new HTTPError(err.message, 500));
            }

            res.locals.items = item;
            next();
        })
    })
    .put((req,res,next) => {
        const data = req.body;

        // Treat put data as completely new record
        const video = new VideoModel(data);
        // Validate new record
        video.validate((err) => {
            if (err) {
                return next(new MongooseValidationError(err));
            }

            // Create plain object with model data
            const videoObject = video.toObject();

            // videoObject._id is an ObjectID and must be compared with .equals method
            if (!videoObject._id.equals(req.params.id)) {
                return next(new HTTPError('The provided _id does not match the one specified in the resource url', 409));
            }

            // Delete id and version from updates (avoid change of id and version)
            delete videoObject._id;
            delete videoObject.__v;

            VideoModel.findById(req.params.id, (err, item) => {
                if (err) {
                    return next(HTTPError.Error500);
                }

                if (!item) {
                    return next(HTTPError.Error404);
                }

                if (item.updatedAt.toString() !== videoObject.updatedAt.toString()) {
                    return next(new HTTPError('The provided updatedAt timestamp does not match the current resource state.', 409));
                }

                VideoModel.findOneAndUpdate({_id: req.params.id}, {$set: videoObject}, {new: true}, (err, item) => {
                    if (err) {
                        return next(HTTPError.Error500);
                    }

                    res.locals.items = item;
                    next();
                });
            });
        });


    })
    .delete(function(req, res, next) {
        VideoModel.findByIdAndRemove(req.params.id, (err, item) => {
            if (err) {
                return next(HTTPError.Error500);
            }

            if (!item) {
                return next(HTTPError.Error404);
            }

            next();
        })
    })
    .patch((req, res, next) => {
        if(req.body._id && (req.params.id !== req.body._id)){
            return next(new HTTPError('The provided _id does not match the one specified in the resource url.', 400));
        }

        delete req.body._id;
        delete req.body.__v;

        VideoModel.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}, (err, item) => {
            if (err) {
                return next(new MongooseValidationError(err));
            }

            if (!item) {
                return next(HTTPError.Error404);
            }

            res.locals.items = item;
            next();
        });
    })
    .post(methodNotAllowed);

module.exports = videos;
