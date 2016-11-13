"use strict";

var AmpersandModel = require('ampersand-model');
var dataTypeDefinition = require('agency-pkg-base/dataTypeDefinition');

module.exports = AmpersandModel.extend(dataTypeDefinition, require('./enumTypeDefinition'), require('./dataTypeDefinition'), {

    initialize: function() {
        AmpersandModel.prototype.initialize.apply(this, arguments);
    },

    getIfExists: function(name, cb, scope) {
        if (this.get(name)) {
            cb.bind(scope || this)(this.get(name));
        } else {
            var onChange = function() {
                cb.bind(scope || this)(this.get(name));
            };
            this.once('change:' + name, onChange);
        }
    }

});
