/**
 * Module Dependencies
 */

var db = require("../data-sources/db");
var config = require("./device-registration.json");

/**
 * DeviceRegistration Model
 */
var DeviceRegistration = module.exports = db.createModel(
    config.name,
    config.properties,
    config.options
);                                                  