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
const {validateVideo, allKeys} = require('./../validators/videos');
const videoDeleteValidator = require('./../validators/videos-delete');
const {filterParserFactory, filterResponseData} = require('./../restapi/filter');
const {searchParserFactory, searchResponseFilterFactory} = require('./../restapi/search');

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
            data = validateVideo(data);
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
            const err = new Error(`A video with id ${req.params.id} does not exist.`);
            err.status = 404;
            next(err);
            return;
        }

        res.locals.items = video;
        next();
    })
    .put(function(req,res,next){
        let data = req.body;
        try {
            data = validateVideo(data);
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
    })
    .patch((req, res, next) => {
        const original = store.select('videos', req.params.id);

        const validKeys = Object.keys(allKeys);
        validKeys.splice(validKeys.indexOf('id'), 1);
        const data = req.body;
        for (let key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }

            if (validKeys.indexOf(key) < 0) {
                const err = new Error(`Property ${key} is not allowed in request body`);
                err.status = 400;
                next(err);
                return;
            }

            if (key === 'playcount') {
                let value = data[key];
                if (!value.match(/^(?:\+|-)[0-9]+$/)) {
                    const err = new Error('playcount must be in the format (+|-)[0-9]+ (e.g. +1, -2)');
                    err.status = 400;
                    next(err);
                    return;
                }

                original.playcount += parseInt(value);
                continue;
            }

            if (typeof data[key] !== allKeys[key]) {
                const err = new Error(`Property ${key} must be a ${allKeys[key]} but is a ${typeof data[key]}`);
                err.status = 400;
                next(err);
                return;
            }

            original[key] = data[key];
        }

        store.replace('videos', original.id, original);
        res.locals.items = original;
        next();
    })
    .post(methodNotAllowed);

videos.use(searchResponseFilterFactory(allKeys));
videos.use(filterResponseData);

module.exports = videos;
