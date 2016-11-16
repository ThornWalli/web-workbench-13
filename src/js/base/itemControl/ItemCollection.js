"use strict";

var AmpersandCollection = require('ampersand-collection');
var Model = require('../Model');

var ItemCollection = AmpersandCollection.extend({
    model: Model.extend(require('./itemAttributes'))
});
module.exports = ItemCollection;
