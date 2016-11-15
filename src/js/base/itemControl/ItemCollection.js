"use strict";

var AmpersandCollection = require('ampersand-collection');
var Model = require('../Model');

var ItemCollection = AmpersandCollection.extend({
    model: Model.extend(require('./itemTypeDefinition'), require('./itemAttributes'))
});
module.exports = ItemCollection;
