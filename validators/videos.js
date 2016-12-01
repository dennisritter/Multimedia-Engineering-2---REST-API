const requiredKeys = {title: 'string', src: 'string', length: 'number'};
const optionalKeys = {description: 'string', playcount: 'number', ranking: 'number'};
const internalKeys = {id: 'number', timestamp: 'number'};
const allKeys = Object.assign({}, requiredKeys, optionalKeys, internalKeys);

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
    if (data.hasOwnProperty(key) && typeof data[key] !== allKeys[key]) {
      const err = new Error(`Property ${key} must be of type ${allKeys[key]}`);
      err.status = 400;
      throw err;
    }
  }

  // Remove invalid properties
  for (let key in data) {
    if (!allKeys.hasOwnProperty(key)) {
      delete data[key];
    }
  }

  // Set default values and timestamp
  data = Object.assign({
    description: '',
    playcount: 0,
    ranking: 0,
    timestamp: new Date()
  }, data);

  return data;
};

module.exports = validateVideo;