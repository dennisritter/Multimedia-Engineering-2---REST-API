/**
 * Module exporting the main express app
 * Registers middleware and routers
 *
 * @author    Nathalie Junker, Jannik Portz, Dennis Ritter
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const tweets = require('./routers/tweets');
const users = require('./routers/users');
const middleware = require('./middleware');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Middleware BEFORE individual routes
app.use(middleware.apiVersionControl);
app.use(middleware.acceptJson);

// Register routers
app.use('/tweets', tweets);
app.use('/users', users);

// Middleware AFTER individual routes
app.use(middleware.notFound);

if (app.get('env') === 'development') {
  app.use(middleware.sendErrorsDev);
}

app.use(middleware.sendErrors);

module.exports = app;