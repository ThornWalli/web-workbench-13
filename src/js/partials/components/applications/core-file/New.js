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
            },
            itemControl: {
                type: 'object',
                required: false,
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
        'click [data-hook="icon-select"]': onClickHookIconSelect,
        'change [data-hook="type"]': onChangeHookType,
        'click [data-hook="cancel"]': onClickHookCancel,
        'submit [data-hook="form"]': onSubmitHookForm
    },

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
        this.model.on('change:icon', onChangeIcon, this);
        this.model.on('change:type', onChangeType, this);
        this.previewIconEl = this.queryByHook('preview-icon');
        this.iconEl = this.queryByHook('icon');
        this.iconSelectEl = this.queryByHook('icon-select');
        refreshIcon(this);
    }

});


function save(scope) {
    var formData = scope.model.applicationForm.getData();
    scope.applicationControl.core.viewControl.openView('./pages/workbench/applications/core-file/edit.html', {
        scaleable: true,
        scrollable: false
    }, function(view) {
        view.getIfExists('application', function(application) {
            application.preItemData = formData;
            application.itemControl = scope.model.itemControl;
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

function onChangeType(model, type) {
    console.log(this.iconSelectEl);
    if (TYPES.ITEM_TYPE.DIRECTORY.is(type)) {
        model.icon = TYPES.ICON.FOLDER;
        this.iconSelectEl.disabled = true;
    } else {
        this.iconSelectEl.disabled = false;
    }
}




// events dom
function onChangeHookType(e) {
    this.model.type = e.target.value;
}

function onSubmitHookForm(e) {
    this.model.applicationForm.submit(e, function() {
        save(this);
    }, this);
}

function onClickHookIconSelect() {
    var viewControl = this.applicationControl.core.viewControl;
    viewControl.openView('./pages/workbench/applications/core-file/new/icon-select.html', {
        id: this.cid
    }, function(view) {
        view.getIfExists('application', function(application) {
            application.icon = this.model.icon;
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

function onClickHookCancel() {
    this.view.close();
}
