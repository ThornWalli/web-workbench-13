"use strict";

var Header = require('../Header');
var DomModel = require('agency-pkg-base/DomModel');

module.exports = Header.extend({

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
        Header.prototype.initialize.apply(this, arguments);
        if (this.targetModel) {
            this.targetModel.header = this.model;
        }
    },
    setup: function() {}

});
