const store = require('../blackbox/store');
const HTTPError = require('./http-error');

const {internalKeys} = require('./../validators/videos');

const validateVideoDEL = function(id) {
    "use strict";
    var video = id;
    // Check for missing id
    if (!video) {
        const err = new Error(`Please send a valid id.`);
        err.status = 404;
        throw err;
    }

    //if id sent as a string, parse it so type changes to number
    if(typeof video === 'string'){
        video = parseInt(video, 10);
    }
    // Check for valid id type
    if (typeof video !== internalKeys.id) {
        throw new HTTPError(`Property of id must be of type ${internalKeys.id} or a parsable string`, 404);
    }

    //Check for existing video-id in store
    if (!store.select('videos', video)) {
        throw new HTTPError(`An element with ID ${video} does not exist.`, 404);
    }

    return video;
};

module.exports = validateVideoDEL;
