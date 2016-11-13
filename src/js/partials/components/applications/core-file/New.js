"use strict";

var ApplicationController = require('../../../../base/ApplicationController');
var ContextualFragment = require('../../../../base/ContextualFragment');

var TYPES = require('../../../../utils/types');
var svgIcons = require('../../../../utils/icons');

var nodeCache = {};

module.exports = ApplicationController.extend({

    template_listItem: null,

    modelConstructor: ApplicationController.prototype.modelConstructor.extend({
        session: {
            applicationName: {
                type: 'string',
                required: true,
                default: 'FileNew'
            },
            type: {
                type: 'string',
                required: true,
                default: 'file'
            },
            icon: {
                type: 'IconEnum',
                required: true,
                default: function() {
                    return TYPES.ICON.DEFAULT;
                }
            }
        }
    }),

    bindings: {
        'model.type': {
            type: function(el, value, previousValue) {
                el.classList.remove('js-' + previousValue);
                el.classList.add('js-' + value);
                if (this.view) {
                    this.view.refreshDimension();
                }
            }
        }
    },

    events: {
        'click [data-hook="icon-select"]': onClickIconSelect,
        'change [data-hook="type"]': onChangeType,
        'click [data-hook="cancel"]': onClickCancel,
        'submit [data-hook="form"]': onFormSubmit
    },

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
        this.model.on('change:icon', onChangeIcon, this);
        this.previewIconEl = this.queryByHook('preview-icon');
        this.iconEl = this.queryByHook('icon');
        refreshIcon(this);
    }

});


function save(scope) {

    var formData = [];
    formData = scope.model.applicationForm.getData();
    console.log('formData', formData);

    scope.applicationControl.core.viewControl.openView('./pages/workbench/applications/core-file/edit.html', {
        scaleable: true,
        scrollable: false
    }, function(view) {
        view.getIfExists('application', function(application) {
            application.getIfExists('applicationForm', function(applicationForm) {
                applicationForm.setData(formData.filter(function(field) {
                    if (field.name === 'name') {
                        return field;
                    }
                }));
            });
        });
        scope.view.close();
    });
}

// events

function refreshIcon(scope) {
    if (!nodeCache[scope.model.icon]) {
        nodeCache[scope.model.icon] = new ContextualFragment(svgIcons[scope.model.icon]);
    }
    scope.iconEl.value = scope.model.icon;
    scope.previewIconEl.replaceChild(nodeCache[scope.model.icon].generate(), scope.previewIconEl.children[0]);
    scope.view.refreshDimension();
}


// events model

function onChangeIcon() {
    refreshIcon(this);
}

function onChangeType(e) {
    this.model.type = e.target.value;
}


// events dom

function onFormSubmit(e) {
    this.model.applicationForm.submit(e, function() {
        save(this);
    }, this);
}

function onClickIconSelect() {
    var viewControl = this.applicationControl.core.viewControl;
    viewControl.openView('./pages/workbench/applications/core-file/new/icon-select.html', {
        id: this.cid
    }, function(view) {
        view.getIfExists('application', function(application) {
            application.on('change:icon', function(model, icon) {
                this.model.icon = icon;
            }, this);
            this.model.on('Application:unregister', function() {
                application.off(null, null, this);
                this.iconSelectView = null;
            }, this);
        }, this);
    }.bind(this));
}

function onClickCancel() {
    this.view.close();
}
