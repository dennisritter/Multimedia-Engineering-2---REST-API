const HTTPError = require('./http-error');

// Key mapping
const requiredKeys = {title: 'string', src: 'string', length: 'number'};
const optionalKeys = {description: 'string', playcount: 'number', ranking: 'number', comments: 'array'};
const internalKeys = {id: 'number', timestamp: 'number'};
const allKeys = Object.assign({}, requiredKeys, optionalKeys, internalKeys);

/**
 * Validates the data as a new record (can be used for POST and PUT) and fills in default values
 * @param       {object}  data      The object to be validated
 * @returns     {object}            The new object
 * @throws      {HTTPError}         If video data is invalid
 */
const validateComplete = (data) => {

  // Check if required keys present
  for (let key in requiredKeys) {
    if (!data.hasOwnProperty(key)) {
      throw new HTTPError(`Required property ${key} must be present`, 400);
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
    if (!allKeys.hasOwnProperty(key)) {
      continue;
    }

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

module.exports = {validateComplete, validatePatch, requiredKeys, optionalKeys, internalKeys, allKeys};