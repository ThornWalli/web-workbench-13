"use strict";

var ApplicationController = require('../../../base/ApplicationController');
var DomModel = require('agency-pkg-base/DomModel');

module.exports = ApplicationController.extend({

    modelConstructor: DomModel.extend({}),

    events: {},

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
    }

});
