"use strict";

var AmpersandCollection = require('ampersand-collection');
var ApplicationModel = require('./ApplicationModel');

module.exports = AmpersandCollection.extend({
    model: ApplicationModel
});
