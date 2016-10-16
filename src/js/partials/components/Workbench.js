"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
require('pepjs');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend({
        session: {}
    }),
    
    events: {
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

    }
});
