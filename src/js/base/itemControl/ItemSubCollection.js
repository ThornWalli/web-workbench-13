"use strict";

var AmpersandCollection = require('ampersand-collection');
var Model = require('../Model');

var ItemSubCollection = AmpersandCollection.extend({
    model: Model.extend(require('./itemTypeDefinition'), require('./itemAttributes'))
});
module.exports = ItemSubCollection;
