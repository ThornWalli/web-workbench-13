"use strict";

var AmpersandCollection = require('ampersand-collection');
var AmpersandModel = require('ampersand-model');

var ItemCollection = AmpersandCollection.extend({
    model: AmpersandModel.extend(require('./itemAttributes'))
});
module.exports = ItemCollection;
