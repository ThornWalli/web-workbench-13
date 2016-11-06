"use strict";

var handlebars = require('handlebars/dist/handlebars');
var ApplicationController = require('../../../../base/ApplicationController');
var DomModel = require('agency-pkg-base/DomModel');
var workbenchConfig = require('../../../../services/workbenchConfig');

module.exports = ApplicationController.extend({

    template_listItem: null,

    modelConstructor: DomModel.extend({}),

    events: {},

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
        this.template_listItem = handlebars.compile(this.queryByHook('template-list-items').innerHTML);

        this.listEl = this.queryByHook('list');
        refreshList(this);

        if (this.view) {
            workbenchConfig.on('change', function() {
                refreshList(this);
            }, this);
            this.view.on('destroy', function() {
                workbenchConfig.off(null, null, this);
                this.destroy();
            }, this);
        }

    }

});

function refreshList(scope) {
    scope.listEl.innerHTML = '';
    workbenchConfig.data.forEach(function(property) {
        scope.listEl.innerHTML += scope.template_listItem([property]);
    });
}
