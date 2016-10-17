"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');

module.exports = Controller.extend({


    modelConstructor: DomModel.extend({

    }),

    events: {
        'click [data-hook="import"]': onClickImport,
        'click [data-hook="export"]': onClickExport
    },


    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        if (this.targetModel) {


            var windowModel = this.targetModel.getWindowModel($(this.el).closest('[data-partial="components/view"]').attr('data-id'));
            windowModel.on('destroy', function() {

            });
            this.targetModel.views.on('add', onRefresh, this);
            this.targetModel.views.on('remove', onRefresh, this);
            onRefresh.bind(this)();
        }

    }

});

function onRefresh() {
    console.log('refresh');
    this.queryByHook('windows').innerHTML = this.targetModel.windows.length;

}


function onClickImport() {

}

function onClickExport() {
    generateExport(this);
}

function generateExport(scope) {
    var data = {};
    // windows
    data.windows = [];
    scope.targetModel.windows.forEach(function(windowModel) {
        data.windows.push({
            url: windowModel.url
        });
    });
    data = JSON.stringify(data);
var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
window.open(url, '_blank');
window.focus();
    console.log(data);
}
