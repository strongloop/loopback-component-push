// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var extend = require('util')._extend;
var async = require('async');

module.exports = exports = TestDataBuilder;

/**
 * Build many Model instances in one async call.
 *
 * Usage:
 * ```js
 * // The context object to hold the created models.
 * // You can use `this` in mocha test instead.
 * var context = {};
 *
 * var ref = TestDataBuilder.ref;
 * new TestDataBuilder()
 *   .define('application', Application, {
 *     pushSettings: { stub: { } }
 *   })
 *   .define('device', Device, {
 *      appId: ref('application.id'),
 *      deviceType: 'android'
 *   })
 *   .define('notification', Notification)
 *   .buildTo(context, function(err) {
 *     // test models are available as
 *     //   context.application
 *     //   context.device
 *     //   context.notification
 *   });
 * ```
 * @constructor
 */
function TestDataBuilder() {
  this._definitions = [];
}

/**
 * Define a new model instance.
 * @param {string} name Name of the instance.
 *   `buildTo()` will save the instance created as context[name].
 * @param {constructor} Model Model class/constructor.
 * @param {Object.<string, Object>=} properties
 *   Properties to set in the object.
 *   Intelligent default values are supplied by the builder
 *   for required properties not listed.
 * @return TestDataBuilder (fluent interface)
 */
TestDataBuilder.prototype.define = function(name, Model, properties) {
  this._definitions.push({
    name: name,
    model: Model,
    properties: properties,
  });
  return this;
};

/**
 * Reference the value of a property from a model instance defined before.
 * @param {string} path Generally in the form '{name}.{property}', where {name}
 * is the name passed to `define()` and {property} is the name of
 * the property to use.
 */
TestDataBuilder.ref = function(path) {
  return new Reference(path);
};

/**
 * Asynchronously build all models defined via `define()` and save them in
 * the supplied context object.
 * @param {Object.<string, Object>} context The context to object to populate.
 * @param {function(Error)} callback Callback.
 */
TestDataBuilder.prototype.buildTo = function(context, callback) {
  this._context = context;
  async.eachSeries(
    this._definitions,
    this._buildObject.bind(this),
    callback);
};

TestDataBuilder.prototype._buildObject = function(definition, callback) {
  var defaultValues = this._gatherDefaultPropertyValues(definition.model);
  var values = extend(defaultValues, definition.properties || {});
  var resolvedValues = this._resolveValues(values);

  definition.model.create(resolvedValues, function(err, result) {
    if (err) {
      console.error(
        'Cannot build object %j - %s\nDetails: %j',
        definition,
        err.message,
        err.details);
    } else {
      this._context[definition.name] = result;
    }

    callback(err);
  }.bind(this));
};

TestDataBuilder.prototype._resolveValues = function(values) {
  var result = {};
  for (var key in values) {
    var val = values[key];
    if (val instanceof Reference) {
      val = values[key].resolveFromContext(this._context);
    }
    result[key] = val;
  }
  return result;
};

var valueCounter = 0;
TestDataBuilder.prototype._gatherDefaultPropertyValues = function(Model) {
  var result = {};
  Model.forEachProperty(function createDefaultPropertyValue(name) {
    var prop = Model.definition.properties[name];
    if (!prop.required) return;

    switch (prop.type) {
      case String:
        var generatedString = 'a test ' + name + ' #' + (++valueCounter);

        // If this property has a maximum length, ensure that the generated
        // string is not longer than the property's max length
        if (prop.length) {
          // Chop off the front part of the string so it is equal to the length
          generatedString = generatedString.substring(
            generatedString.length - prop.length);
        }
        result[name] = generatedString;
        break;
      case Number:
        result[name] = 1230000 + (++valueCounter);
        break;
      case Date:
        result[name] = new Date(
          2222, 12, 12, // yyyy, mm, dd
          12, 12, 12,   // hh, MM, ss
          ++valueCounter // milliseconds
        );
        break;
      case Boolean:
        // There isn't much choice here, is it?
        // Let's use "false" to encourage users to be explicit when they
        // require "true" to turn some flag/behaviour on
        result[name] = false;
        break;
      // TODO: support nested structures - array, object
    }
  });
  return result;
};

/**
 * Placeholder for values that will be resolved during build.
 * @param {string} path
 * @constructor
 * @private
 */
function Reference(path) {
  this._path = path;
}

Reference.prototype.resolveFromContext = function(context) {
  var elements = this._path.split('.');

  var result = elements.reduce(
    function(obj, prop) {
      return obj[prop];
    },
    context
  );

  return result;
};
