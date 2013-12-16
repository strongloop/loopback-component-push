/**
 * Dependencies
 */

var loopback = require('loopback');

if(process.env.NODE_ENV === 'test') {
  console.log('Using an in-memory database');
  module.exports = loopback.createDataSource({
    connector: require('loopback').Memory
  });

} else {
  console.log('Using a MongoDB database at demo.strongloop.com');
  module.exports = loopback.createDataSource({
    connector: require('loopback-connector-mongodb'),
    url: 'mongodb://demo:L00pBack@demo.strongloop.com/demo'
  });
}
