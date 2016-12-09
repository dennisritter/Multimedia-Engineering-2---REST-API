const requiredKeys = {title: 'string', src: 'string', length: 'number'};
const optionalKeys = {description: 'string', playcount: 'number', ranking: 'number', comments: 'array'};
const internalKeys = {id: 'number', timestamp: 'number'};
const allKeys = Object.assign({}, requiredKeys, optionalKeys, internalKeys);
const HTTPError = require('./http-error');

const validateVideo = function (data) {
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
    if (!allKeys.hasOwnProperty(key)) {
      continue;
    }

    if (data.hasOwnProperty(key) && typeof data[key] !== allKeys[key]) {
      throw new HTTPError(`Property ${key} must be of type ${allKeys[key]}`, 400);
    }
  }

  // Check for positive numbers
  for (let key in allKeys) {
    if (typeof data[key] === "number" && data[key] < 0){
      throw new HTTPError(`${key} must not be negative. Please enter a positive value.`, 400);
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
    description: '',
    playcount: 0,
    ranking: 0,
    timestamp: new Date().getTime()
  }, data);

  return data;
};

module.exports = {validateVideo, requiredKeys, optionalKeys, internalKeys, allKeys};