const mongoose = require('mongoose');
const config = require('../../config');
const logger = require('../logger');

const dbInfo = config.database.connections[config.database.default];
const mongoDB = `mongodb://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`;

mongoose
  .connect(mongoDB, {
    useCreateIndex: true,
    useNewUrlParser: true
  })
  .catch(() => {
    logger.error('*** Can Not Connect to Mongo Server:', mongoDB);
  });

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.once('open', () => {
  logger.debug(`Connected to mongo at ${mongoDB}`);
});

db.on('error', error => {
  logger.error('error', error);
});

module.exports = db;
