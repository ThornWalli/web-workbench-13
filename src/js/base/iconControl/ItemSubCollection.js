"use strict";

var AmpersandCollection = require('ampersand-collection');
var AmpersandModel = require('ampersand-model');

var ItemSubCollection = AmpersandCollection.extend({
    model: AmpersandModel.extend(require('./itemAttributes'))
});
module.exports = ItemSubCollection;
