const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const { MONGODB_HOST, MONGODB_PORT, MONGODB_DBNAME } = process.env;

const db = mongoose.connect(`mongodb:${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DBNAME}`);

module.exports = exports = db;