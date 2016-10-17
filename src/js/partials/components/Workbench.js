"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
require('pepjs');

module.exports = Controller.extend({

    errors: [],

    modelConstructor: DomModel.extend({
        session: {},
    }),

    events: {
        'click .screen-button': function() {
            this.el.classList.toggle('js-workbench-off');
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

    }
});
