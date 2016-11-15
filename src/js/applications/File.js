"use strict";

var ApplicationModel = require('../base/ApplicationModel');
var menuItems = require('./file/menuItems.json');
module.exports = ApplicationModel.extend({

    session: {
        applicationStatic: {
            type: 'boolean',
            required: true,
            default: true
        },
        applicationName: {
            type: 'string',
            required: true,
            default: 'File'
        },
        applicationMenuItems: {
            type: 'object',
            default: function() {
                return menuItems;
            }
        },
        type: {
            type: 'string',
            required: true,
            default: 'file'
        }
    },
    initialize: function() {
        ApplicationModel.prototype.initialize.apply(this, arguments);

        setup_handler(this);

    }

});

function setup_handler(scope) {
    scope.getIfExists('applicationControl', function(applicationControl) {
        applicationControl.core.getIfExists('viewControl', function(viewControl) {
            viewControl.selectedItems.on('all', function() {
                document.querySelectorAll('.js-applications-control-file-edit').forEach(function(node) {
                    node.classList.toggle('js-disabled', viewControl.selectedItems.length < 1);
                });
            }, scope);


            [{
                class: '.js-applications-control-file-new',
                cb: function() {
                    var focusedView = viewControl.focusedView;
                    viewControl.openView('./pages/workbench/applications/core-file/new.html', {
                        scaleable: true,
                        scrollable: false
                    }, function(view) {
                        if (focusedView) {
                            view.getIfExists('application', function(application) {
                            if (focusedView.itemControl) {
                                application.itemControl = focusedView.itemControl;
                            } else {
                                application.itemControl = null;
                            }
                        });
                        }
                    });
                }
            }, {
                class: '.js-applications-control-file-edit',
                cb: function() {
                    viewControl.selectedItems.models.forEach(function(item) {
                        viewControl.openView('./pages/workbench/applications/core-file/edit.html', {
                            scaleable: true,
                            scrollable: false
                        }, function(view) {
                            view.getIfExists('application', function(application) {
                                application.item = item;
                            });
                        });
                    });
                }
            }].forEach(function(data) {
                $(document).on('pointerdown.file_' + scope.cid, data.class, data.cb.bind(scope));
            });

        }, scope);
    }, scope);
}
