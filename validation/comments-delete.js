const store = require('../blackbox/store');
const HTTPError = require('./http-error');

const {internalKeys} = require('.//comments');

const commentsDelete = function(id) {
    "use strict";
    var comment = id;
    // Check for missing id
    if (!comment) {
        const err = new Error(`Please send a valid id.`);
        err.status = 404;
        throw err;
    }

    //if id sent as a string, parse it so type changes to number
    if(typeof comment === 'string'){
        comment = parseInt(comment, 10);
    }
    // Check for valid id type
    if (typeof comment !== internalKeys.id) {
        throw new HTTPError(`Property of id must be of type ${internalKeys.id} or a parsable string`, 404);
    }

    //Check for existing comment-id in store
    if (!store.select('comments', comment)) {
        throw new HTTPError(`An element with ID ${comment} does not exist.`, 404);
    }

    return comment;
};

module.exports = {commentsDelete};
