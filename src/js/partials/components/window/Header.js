"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend({
        session: {
            title: {
                type: 'string',
                required: true,
                default: null
            }
        }
    }),

    events: {},


    bindings: {
        'model.title': {
            type: 'innerHTML',
            hook: 'window-title'
        }
    },


    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        if (this.targetModel) {
            this.targetModel.header = this.model;
        }
    },
    setup: function() {}

});
