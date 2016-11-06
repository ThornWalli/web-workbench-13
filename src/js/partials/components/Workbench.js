"use strict";

var viewport = require('agency-pkg-service-viewport');
var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var workbenchConfig = require('../../services/workbenchConfig');
require('pepjs');

module.exports = Controller.extend({

    errors: [],

    modelConstructor: DomModel.extend({
        session: {
            itemsSelected: {
                type: 'boolean',
                required: true,
                default: false
            }
        },
        refresh : function(){
            this.trigger('event:refresh');
        }
    }),

    bindings: {
        'model.itemsSelected': {
            type: 'booleanClass',
            yes: 'js-workbench-items-selected'
        }
    },


    events: {
        'click .screen-button': function() {
            this.el.classList.toggle('js-workbench-off');
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        workbenchConfig.on('change:core-background-wrapper-1084', function(value) {
            toggleScreenBackground(this, value);
        }.bind(this));
        if (workbenchConfig.get('core-background-wrapper-1084')) {
            toggleScreenBackground(this, true);
        }
    }
});


function toggleScreenBackground(scope, active) {
    scope.el.classList.toggle('js-with-screen', active);
    global.animationFrame.add(function(){
        viewport.update();
        scope.model.refresh();
    });
}
