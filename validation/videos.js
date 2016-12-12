const {createValidateComplete, createValidateId} = require('./common');

// Key mapping
const requiredKeys = {title: 'string', src: 'string', length: 'number'};
const optionalKeys = {description: 'string', playcount: 'number', ranking: 'number', comments: 'array'};
const internalKeys = {id: 'number', timestamp: 'number'};
const allKeys = Object.assign({}, requiredKeys, optionalKeys, internalKeys);

// Create a video validator using the createValidateComplete factory
const validateComplete = createValidateComplete(requiredKeys, internalKeys, allKeys);

// Create a video id validator using the createValidateId factory
const validateId = createValidateId('videos');

/**
 * Validates the provided patch data and merged it into the original record
 * @param       {object}  original  The original record stored in DB
 * @param       {object}  data      The request content
 * @returns     {object}            The updated original object
 */
const validatePatch = (original, data) => {
    const validKeys = Object.keys(Object.assign({}, requiredKeys, optionalKeys));

    for (let key in data) {
        if (!data.hasOwnProperty(key)) {
            continue;
        }

        // Ingore invalid properties
        if (validKeys.indexOf(key) < 0) {
            continue;
        }

        // Custom patch mechanism for playcount
        if (key === 'playcount') {
            let value = data[key];
            if (!value.match(/^(?:\+|-)[0-9]+$/)) {
                throw new HTTPError('playcount must be in the format (+|-)[0-9]+ (e.g. +1, -2)', 400);
            }

            original.playcount += parseInt(value);
            continue;
        }

        // Error, if types of values do not match
        if (typeof data[key] !== allKeys[key]) {
            throw new HTTPError(`Property ${key} must be a ${allKeys[key]} but is a ${typeof data[key]}`, 400);
        }

        original[key] = data[key];
    }

    return original;
};


module.exports = {validateComplete, validateId, validatePatch, requiredKeys, optionalKeys, internalKeys, allKeys};