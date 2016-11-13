"use strict";

var ApplicationController = require('../../../base/ApplicationController');
var workbenchConfig = require('../../../services/workbenchConfig');

module.exports = ApplicationController.extend({

    modelConstructor: ApplicationController.prototype.modelConstructor.extend({
        session: {
            applicationName: {
                type: 'string',
                required: true,
                default: 'Settings'
            }
        }
    }),

    events: {
        'submit [data-hook="form"]': onFormSubmit
    },

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
        this.model.applicationForm.setData(workbenchConfig.data);
        this.model.on('Application:unregister', function() {
            this.destroy();
        }, this);
    }

});

function save(scope) {
    var data = scope.model.applicationForm.getData();
    workbenchConfig.set(data);
    if (scope.view) {
        scope.view.close();
    }
}

// dom events

function onFormSubmit(e) {
    this.model.applicationForm.submit(e, function() {
        save(this);
    }, this);
}
