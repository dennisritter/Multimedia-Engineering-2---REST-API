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
const {filterParserFactory, filterResponseData} = require('./../restapi/filter');

var comments = express.Router();

comments.use(filterParserFactory(Object.keys(allKeys)));

const methodNotAllowed = (req, res, next) => {
    const err = new Error(`Method ${req.method} is not allowed.`);
    err.status = 405;
    next(err);
};

// routes **********************
comments.route('/')
    .get(methodNotAllowed)
    .put(methodNotAllowed)
    .post((req, res, next) => {
        const videoId = req.body.videoid;
        let comment = req.body;

        if(!store.select('videos', videoId)){
            const err = new Error(`A video with id ${videoId} does not exist.`);
            err.status = 404;
            next(err);
            return;
        }
        try {
            comment = validateComment(comment);
            store.insert('comments', comment);
            res.locals.items = comment;
            res.status = 201;
            next();
        }
        catch(err){
            next(err);
        }
    });

comments.route('/:id')
    .get((req, res, next) => {
        const id = req.params.id;
        const comment = store.select('comments', id);
        if (!comment) {
            const err = new Error(`A comment with id '${id}' does not exist.`);
            err.status = 404;
            next(err);
            return;
        }
        res.locals.items = comment;
        next();
    })
    .put((req,res,next) => {
        let comment = req.body;
        let oldComment = store.select('comments', comment.id);
        if (!oldComment) {
            const err = new Error(`A comment with id '${comment.id}' does not exist.`);
            err.status = 404;
            next(err);
            return;
        }
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

    });

comments.use(filterResponseData);

module.exports = comments;
