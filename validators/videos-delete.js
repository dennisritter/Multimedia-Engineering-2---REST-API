var store = require('../blackbox/store');
const internalKeys = {id: 'number', timestamp: 'string'};

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
        const err = new Error(`Property of id must be of type ${internalKeys.id} or a parsable string`);
        err.status = 404;
        throw err;
    }

    //Check for existing video-id in store
    if (!store.select('videos', video)) {
        const err = new Error(`An element with ID ${video} does not exist.`);
        err.status = 404;
        throw err;
    }

    return video;
};

module.exports = validateVideoDEL;
