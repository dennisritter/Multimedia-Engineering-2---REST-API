const requiredKeys = {videoid: 'number', text: 'string'};
const optionalKeys = {likes: 'number', dislikes: 'number'};
const internalKeys = {id: 'number', timestamp: 'number'};
const allKeys = Object.assign({}, requiredKeys, optionalKeys, internalKeys);

const validateComment = function(data) {
    // Check if required keys present
    for (let key in requiredKeys) {
        if (!data.hasOwnProperty(key)) {
            const err = new Error(`Required property ${key} must be present`);
            err.status = 400;
            throw err;
        }
    }

    // Check for valid types
    for (let key in allKeys) {
        if (data.hasOwnProperty(key) && typeof data[key] !== allKeys[key]) {
            console.log(typeof data[key], "!=", allKeys[key]);
            const err = new Error(`Property ${key} must be of type ${allKeys[key]}`);
            err.status = 400;
            throw err;
        }
    }

    // Check for positive numbers
    for (let key in allKeys) {
        if (typeof data[key] === "number" && data[key] < 0) {
            const err = new Error(`${key} must not be negative. Please enter a positive value.`);
            err.status = 400;
            throw err;
        }
    }

    // Remove invalid properties
    for (let key in data) {
        if (!allKeys.hasOwnProperty(key) || key === "timestamp") {
            delete data[key];
        }
    }

    // Set default values and timestamp
    data = Object.assign({
        likes: 0,
        dislikes: 0,
        timestamp: new Date().getTime()
    }, data);

    return data;
};

module.exports = {validateComment, requiredKeys, optionalKeys, internalKeys, allKeys};