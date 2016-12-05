var store = require('../blackbox/store');
const internalKeys = {id: 'number', timestamp: 'number'};

const validateVideoDEL = function(data) {
    "use strict";

    const video = data.id;

    // Check for missing id
    if (!video) {
        const err = new Error(`Please send a valid id.`);
        err.status = 404;
        throw err;
    }

    // Check for valid id type
    if (typeof video !== internalKeys.id) {
        const err = new Error(`Property of id must be of type ${internalKeys.id}`);
        err.status = 404;
        throw err;
    }

    // Remove invalid properties
    for (let key in data) {
        if (key !== "id") {
            delete data[key];
        }
    }

    //Check for existing video-id in store
    if (store.select('videos', video) == undefined) {
        const err = new Error(`An element with ID ${video} does not exist.`);
        err.status = 404;
        throw err;
    }

    return data;
};

module.exports = validateVideoDEL;
