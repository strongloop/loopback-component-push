/**
 * Dependencies
 */

var loopback = require('loopback');

if(process.env.NODE_ENV === 'test') {

    // use memory adapter
    module.exports = loopback.createDataSource({
        connector: require('loopback').Memory
    });

} else {
    // export the oracle data source
    module.exports = loopback.createDataSource({
        connector: require('loopback-connector-mongodb'),
        url: 'mongodb://demo:L00pBack@demo.strongloop.com/demo'
    });
}
