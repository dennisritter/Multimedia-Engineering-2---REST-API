/**
 * Module exporting a separate router for tweets.
 *
 * @author     Nathalie Junker, Jannik Portz, Dennis Ritter
 */
const express = require('express');
const store = require('./../../blackbox/store');

const router = express.Router();

router.route('/')
  /**
   * GET /
   * Retrieves all users
   */
  .get((req, res) => {
    const users = store.select('users');
    const tweets = store.select('tweets');

    // append tweets href
    users.map((user) => {
      user.tweets = {
        href: `http://localhost:3000/users/${user.id}/tweets`
      };
      return user;
    });

    // expand all tweets of every user if required
    if (req.query.expand === 'tweets') {
      users.map((user) => {
        // get all tweets of the user
        const usersTweets = tweets.filter((tweet) => tweet.creator === user.id);

        user.tweets.items = usersTweets.map((tweet) => {
          tweet.href = `http://localhost:3000/tweets/${tweet.id}`;
          tweet.creator = {
            id: tweet.creator,
            href: `http://localhost:3000/users/${tweet.creator}`
          };
          return tweet;
        });

        return user;
      });
    }

    res.status(200).json(users);
  })

  /**
   * POST /
   * Adds a new user to the collection
   */
  .post((req, res) => {
    const id = store.insert('users', req.body);
    res.status(201).json(store.select('users', id));
  });

// relevant operations for a specific user
router.route('/:id')
  /**
   * GET /:id
   * Retrieves a single user
   */
  .get((req, res) => {
    const user = store.select('users', req.params.id);

    user.tweets = {
      href: `http://localhost:3000/users/${user.id}/tweets`
    };

    res.status(200).json(user);
  })

  /**
   * DELETE /:id
   * Deletes a single user
   */
  .delete((req, res) => {
    store.remove('users', req.params.id);
    res.status(200).end();
  })

  /**
   * PUT /:id
   * Replaces a single user
   */
  .put((req, res) => {
    store.replace('users', req.params.id, req.body);
    res.status(200).end();
  });

/**
 * GET /:id/tweets
 * Retrieves collection of all tweets by the specified iser
 */
router.get('/:id/tweets', (req, res) => {
  let tweets = store.select('tweets').filter((tweet) => tweet.creator === parseInt(req.params.id, 10));

  tweets = tweets.map((tweet) => {
    tweet.creator = {
      href: `http://localhost:3000/users/${tweet.creator}`,
      id: tweet.creator
    };

    return tweet;
  });

  res.status(200).json(tweets);
});

module.exports = router;