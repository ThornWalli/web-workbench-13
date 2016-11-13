"use strict";

var template = require('lodash/template');
var ApplicationController = require('../../../../base/ApplicationController');
var workbenchConfig = require('../../../../services/workbenchConfig');

module.exports = ApplicationController.extend({

    template_listItem: null,

    modelConstructor: ApplicationController.prototype.modelConstructor.extend({
        session: {
            applicationName: {
                type:'string',
                required:true,
                default: 'SettingsDebug'
            }
        }
    }),

    events: {},

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
        this.template_listItem = template(this.queryByHook('template-list-items').innerHTML);

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
