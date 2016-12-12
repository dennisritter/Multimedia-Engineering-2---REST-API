const store = require('./../blackbox/store');
const HTTPError = require('./http-error');

const createValidateComplete = (requiredKeys, internalKeys, allKeys) => {

  return (data) => {

    Object.keys(internalKeys).forEach((key) => delete data[key]);

    // Check if required keys present
    for (let key in requiredKeys) {
      if (!requiredKeys.hasOwnProperty(key)) {
        continue;
      }

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
      if (!data.hasOwnProperty(key)) {
        continue;
      }

      if (!allKeys.hasOwnProperty(key) || key === "timestamp") {
        delete data[key];
      }
    }

    return data;
  };
};

const createValidateId = (resourceCollection) => {

  return (id) => {
    // Check for missing id
    if (!id) {
      throw new HTTPError('Please send a valid id.', 400);
    }

    id = parseInt(id, 10);

    // Check for valid id type
    if (isNaN(id)) {
      throw new HTTPError(`Property of id must be of type ${internalKeys.id} or a parsable string`, 404);
    }

    //Check for existing video-id in store
    if (!store.select(resourceCollection, id)) {
      throw new HTTPError(`An element with ID ${id} does not exist.`, 404);
    }

    return id;
  };
};

module.exports = {createValidateComplete, createValidateId, HTTPError};