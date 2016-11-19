/**
 * Module exporting a separate router for tweets.
 *
 * @author     Nathalie Junker, Johannes Konert, Jannik Portz, Dennis Ritter
 */

const express = require('express');
const store = require('./../../blackbox/store');

const router = express.Router();

/**
 * GET /
 * Retrieves a single tweet
 */
router.get('/', (req, res) => {
  res.json(store.select('tweets'));
});

/**
 * POST /
 * Adds a new tweet to the collection
 */
router.post('/', function (req, res) => {
  var id = store.insert('tweets', req.body);
  res.status(201).json(store.select('tweets', id));
});

/**
 * GET /:id
 * Retrieves a single tweet
 */
router.get('/:id', (req, res) => {
  res.json(store.select('tweets', req.params.id));
});

/**
 * DELETE /:id
 * Deletes a single tweet
 */
router.delete('/:id', (req, res) => {
  store.remove('tweets', req.params.id);
  res.status(200).end();
});

/**
 * PUT /:id
 * Replaces data of a single tweet
 */
router.put('/:id', (req, res) => {
  store.replace('tweets', req.params.id, req.body);
  res.status(200).end();
});

/**
 * PATCH /:id
 * Replaces only specified properties of a single tweet
 */
router.patch('/:id', (req, res) => {
  let id = req.params.id;

  // Check if id is actually a number
  if (!id.match(/^[1-9][0-9]*$/)) {
    const error = new Error(`The id parameter must be an integer`);
    error.status = 422;
    next(error);
    return;
  }

  id = parseInt(id);

  // Retrieve tweet and check if it exists
  const tweet = store.select('tweets', id);
  if (!tweet) {
    const error = new Error(`A tweet with id ${id} does not exist`);
    error.status = 404;
    next(error);
    return;
  }

  // For each property on tweet, check if it present in request and replace the value
  ['message', 'creator'].forEach((prop) => {
    if (req.body.hasOwnProperty(prop))
      tweet[prop] = req.body[prop];
  });

  // Save the tweet
  store.replace('tweets', id, tweet);

  // Send 200 OK status
  res.sendStatus(200);
});

module.exports = router;