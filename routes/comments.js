/** This module defines the routes for comments using the store.js as db memory
 *
 * @author Dennis Ritter
 *
 * @module routes/comments
 * @type {Router}
 */
'use strict';

// modules
var express = require('express');
var logger = require('debug')('me2u4:videos');
var store = require('../blackbox/store');
const {validateComment, allKeys} = require('./../validators/comments');
const {commentsDelete} = require('./../validators/comments-delete');
const {filterParserFactory, filterResponseData} = require('./../restapi/filter');
const HTTPError = require('./../validators/http-error');

var comments = express.Router();

comments.use(filterParserFactory(Object.keys(allKeys)));

const methodNotAllowed = (req, res, next) => {
    const err = new Error(`Method ${req.method} is not allowed.`);
    err.status = 405;
    next(err);
};

// routes **********************
comments.route('/')
    .post((req, res, next) => {
        const videoId = req.body.videoid;
        let comment = req.body;
        // check if video with id:{videoId} exists
        const video = store.select('videos', videoId);
        if(!video){
            return next(new HTTPError(`A video with id ${videoId} does not exist.`, 404));
        }
        try{
            comment = validateComment(comment);
            store.insert('comments', comment);
            res.locals.items = comment;
            res.status = 201;
            next();
        }
        catch(err){
            next(err);
        }
    })
    .get((req, res, next) => {
        const comment = store.select('comments');
        res.locals.items = comment;
        res.status = 200;
        next();
    })
    .put(methodNotAllowed)
    .delete(methodNotAllowed);

comments.route('/:id')
    .get((req, res, next) => {
        const id = req.params.id;
        const comment = store.select('comments', id);
        if(!comment){
            return next(new HTTPError(`A comment with id ${id} does not exist.`, 404));
        }
        res.locals.items = comment;
        res.status = 200;
        next();
    })
    .put((req,res,next) => {
        let comment = req.body;
        try {
            comment = validateComment(comment);
            store.replace('comments', comment.id, comment);
            res.locals.items = comment;
            res.status = 200;
            next();
        }
        catch(err){
            next(err);
        }
    })
    .delete((req,res,next) => {
        let id = req.params.id;
        try{
            //validate id
            id = commentsDelete(id);
            store.remove('comments', id);
            res.status = 200;
            next();
        }
        catch(err){
            next(err);
        }
    })
    .post(methodNotAllowed);

comments.route('/videos/:videoid')
    .get((req,res,next) => {
        const videoId = req.params.videoid;
        const video = store.select('videos', videoId);

        // check if video with id:{videoId} exists
        if(!video){
            return next(new HTTPError(`A video with id ${videoId} does not exist.`, 404));
        }
        let comments = store.select('comments');
        if(comments.length > 0) {
            comments.filter((comment) => comment.videoid === parseInt(videoId, 10));
        }
        res.locals.items = comments;
        res.status = 200;
        next();
    })
    .delete((req,res,next) => {
        const videoId = req.params.videoid;
        // check if video with id:{videoId} exists
        const video = store.select('videos', videoId);
        if(!video){
            return next(new HTTPError(`A video with id ${videoId} does not exist.`, 404));
        }
        try{
            let comments = store.select('comments');
            comments.forEach((comment) => {
                if(comment.videoid === parseInt(videoId, 10)){
                    let id = commentsDelete(comment.id);
                    store.remove('comments', comment.id);
                    res.status = 200;
                    next();
                }
            });
        }
        catch(err){
            next(err);
        }
    })
    .post(methodNotAllowed)
    .put(methodNotAllowed);

comments.use(filterResponseData);

module.exports = comments;
