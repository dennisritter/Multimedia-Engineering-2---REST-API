/**
 * Module containing custom middleware for express app
 *
 * @author    Nathalie Junker, Jannik Portz, Dennis Ritter
 */

/**
 * Loggs each and every request reaching the app
 * @inheritDoc
 */
const logging = (req, res, next) => {
  console.log('Request of type ' + req.method + ' to URL ' + req.originalUrl);
  next();
};

/**
 * Validates Accept-Version Header
 * @inheritDoc
 */
const apiVersionControl = (req, res, next) => {
  // expect the Accept-Version header to be NOT set or being 1.0
  var versionWanted = req.get('Accept-Version');
  if (versionWanted !== undefined && versionWanted !== '1.0') {
    // 406 Accept-* header cannot be fulfilled.
    res.status(406).send('Accept-Version cannot be fulfilled').end();
  } else {
    next(); // all OK, call next handler
  }
};

/**
 * Validates Content-Type of reuqest
 * @inheritDoc
 */
const acceptJson = (req, res, next) => {
  if (['POST', 'PUT'].indexOf(req.method) > -1 && !( /application\/json/.test(req.get('Content-Type')) )) {
    // send error code 415: unsupported media type
    res.status(415).send('wrong Content-Type');  // user has SEND the wrong type
  } else if (!req.accepts('json')) {
    // send 406 that response will be application/json and request does not support it by now as answer
    // user has REQUESTED the wrong type
    res.status(406).send('response of application/json only supported, please accept this');
  }
  else {
    next(); // let this request pass through as it is OK
  }
};

/**
 * Passes 404 error if no route has been matched by reaching the notFound middleware
 * @inheritDoc
 */
const notFound = (req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/**
 * Sends error with full stack trace to client and logs the error to the console
 * @inheritDoc
 */
const sendErrorsDev = (err, req, res, next) => {
  console.log('Internal Error: ', err.stack);
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      error: err.stack
    }
  });
};

/**
 * Sends only the error message to the client
 * @inheritDoc
 */
const sendErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      error: {}
    }
  });
};

module.exports = {logging, apiVersionControl, acceptJson, notFound, sendErrorsDev, sendErrors};