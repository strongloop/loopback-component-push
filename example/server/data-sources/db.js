/**
 * Dependencies
 */

var loopback = require('loopback');

var env = process.env.NODE_ENV || 'development';

if((env === 'test' || env === 'development') && !process.env.MONGODB) {
  console.log('Using an in-memory database');
  module.exports = loopback.createDataSource({
    connector: require('loopback').Memory
  });

} else {
  var url = process.env.MONGODB;
  if(!url) {
    url = env === 'production' ?
      'mongodb://demo:L00pBack@demo.strongloop.com/demo' :
      'mongodb://127.0.0.1/demo';
  }
  console.log('Using a MongoDB database: ' + url);
  module.exports = loopback.createDataSource({
    connector: require('loopback-connector-mongodb'),
    url: url
  });
}
