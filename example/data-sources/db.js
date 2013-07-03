/**
 * Dependencies
 */

var asteroid = require('asteroid');

if(process.env.NODE_ENV === 'test') {

    // use memory adapter
    module.exports = asteroid.createDataSource({
        connector: require('asteroid').Memory
    });

} else {
    // export the oracle data source
    module.exports = asteroid.createDataSource({
        connector: require('jugglingdb-mongodb'),
        url: 'mongodb://127.0.0.1/asteroid'
    });
}
