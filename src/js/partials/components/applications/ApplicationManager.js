"use strict";

var ApplicationController = require('../../../base/ApplicationController');
var ContextualFragment = require('../../../base/ContextualFragment');
var fieldItemsTmpl = new ContextualFragment(require('./application-manager/field-items.hbs'));

module.exports = ApplicationController.extend({


    modelConstructor: ApplicationController.prototype.modelConstructor.extend({
        session: {
            applicationName: {
                type: 'string',
                required: true,
                default: 'Application-Manager'
            }
        }
    }),

    events: {},


    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);

        if (this.view) {
            this.viewControl = this.view.viewControl;
            this.model.on('Application:unregister', function() {
                if (this.view) {
                    this.applicationControl.off(null, null, this);
                }
            }, this);
            this.applicationControl.on('ApplicationControl:register', onRefresh, this);
            this.applicationControl.on('ApplicationControl:unregister', onRefresh, this);
        }

        onRefresh.bind(this)();
    }

});

function onRefresh() {
    var scope = this;
    var itemsData = [];
    this.applicationControl.applications.forEach(function(application) {
        itemsData.push({
            multiple: false,
            label: application.applicationName,
            name: getName(scope),
            value: application.cid,
            disabled: application.applicationStatic
        });
    });
    var listNode = this.query('ul');
    listNode.parentNode.replaceChild(fieldItemsTmpl.generate(itemsData), listNode);

    this.view.refreshDimension();

}

function getName(scope) {
    return 'application-manager-' + scope.cid;
}
