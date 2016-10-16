"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');

module.exports = Controller.extend({


    modelConstructor: DomModel.extend({

    }),

    events: {},


    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        if (this.targetModel) {


            var windowModel = this.targetModel.getWindowModel($(this.el).closest('[data-partial="components/window"]').attr('data-id'));
            windowModel.on('destroy', function() {

            });
            this.targetModel.on('event:registerWindow', onRefresh, this);
            this.targetModel.on('event:unregisterWindow', onRefresh, this);
            onRefresh.bind(this)();
        }

    }

});

function onRefresh() {
    console.log('refresh');
    this.queryByHook('windows').innerHTML = this.targetModel.windows.length;

}


function generateExport(){

}
