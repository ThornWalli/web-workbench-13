"use strict";

var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');
var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var extend = require('lodash/extend');
var uniqueId = require('lodash/uniqueId');

var handlebars = require('handlebars/dist/handlebars');

var TYPES = require('../../utils/types');
// var ItemCollection = require('../../base/itemControl/ItemCollection');

var AmpersandCollection = require('ampersand-collection');

require('pepjs');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend(require('../../base/collectionTypeDefinition'), {
        session: {
            views: {
                type: 'AmpersandCollection',
                required: true,
                default: function() {
                    return new AmpersandCollection();
                }
            },
            // root itemControl
            itemControl: {
                type: 'object',
                required: true,
                default: null
            },
            selectedItems: {
                type: 'ItemCollection',
                required: true
            },
            core: {
                type: 'object',
                required: true,
                default: null
            },
            dimension: {
                type: 'Vector',
                required: true,
                default: function() {
                    return new Vector();
                }
            },
            bounds: {
                type: 'Bounds',
                required: true,
                default: function() {
                    return new Bounds();
                }
            }
        },
        getViewModel: function(viewId) {
            return this.views.models.find(function(viewModel) {
                if (viewModel.id === viewId) {
                    return viewModel;
                }
            });
        },
        registerView: function(model) {
            this.views.add(model);
        },
        openView: function(url, options, callback) {
            this.trigger('event:openView', this, extend({
                url: url,
                openView_callback: callback
            }, options));
        },
        setViewFocus: function(view, top) {
            this.trigger('event:changeViewFocus', this, {
                view: view,
                moveTop: top || false
            });
        },
        createDialog: function(options) {
            this.trigger('event:createDialog', options);
        },
        deselectItems: function() {
            this.selectedItems.reset();
        }
    }),

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        this.model.core = this.targetModel;
        this.model.core.on('event:refresh', function() {
            console.log('refresh');
            refreshBounds(this);
            this.model.views.forEach(function(view) {
                view.refreshBounds();
            });
        }.bind(this));
        refreshBounds(this);

        // Events
        this.model.views.on('add', onViewsAdd, this);
        this.model.views.on('remove', onViewsRemove, this);
        this.model.selectedItems.on('add', onSelectedItemsAdd, this);
        this.model.selectedItems.on('remove', onSelectedItemsRemove, this);
        this.model.selectedItems.on('reset', onSelectedItemsReset, this);
        this.model.on('event:openView', onOpenView, this);
        this.model.on('event:changeViewFocus', onChangeViewFocus, this);
        this.model.on('event:createDialog', onCreateDialog, this);

        this.tmpl = {
            view: handlebars.compile(this.el.querySelector('#view-template').innerHTML),
            dialog: handlebars.compile(this.el.querySelector('#dialog-template').innerHTML),
            dialogButton: handlebars.compile(this.el.querySelector('#dialog-button-template').innerHTML)
        };

        this.viewsEl = this.queryByHook('views');
        // createView(this, {
        //     scrollbar: false,
        //     url: './pages/start.html',
        // });
        createView(this, {
            scrollbar: false,
            url: './pages/examples/inputs.html'
        });
        // createView(this, {
        //     scrollbar: true,
        //     url: './pages/debug-view-scroll.html'
        // });
        // createView(this, {
        //     scrollbar: true,
        //     url: './pages/workbench/runtime_import_export.html'
        // });
        // createView(this, {
        //     url: './pages/workbench/settings.html'
        // });
        // createView(this, {
        //     url: './pages/workbench/settings/debug.html'
        // });
        // createView(this, {
        //     url: './pages/examples/dialog.html',
        //     scaleable: true,
        //     scrollable: false
        // });


        var testItems = [{
                type: TYPES.ITEM.DEFAULT,
                icon: TYPES.ICON.DISK_1,
                title: 'Google',
                position: {
                    x: 400,
                    y: 50
                }
            }, {
                type: TYPES.ITEM.FOLDER,
                icon: TYPES.ICON.FOLDER,
                title: 'Folder 2.',
                position: {
                    x: 150,
                    y: 100
                },
                items: [{
                    type: TYPES.ITEM.FOLDER,
                    icon: TYPES.ICON.FOLDER,
                    title: 'Test 4.1.',
                    items: [{
                        title: 'Sub Item 1.',
                    }, {
                        title: 'Sub Item 2.',
                    }, {
                        title: 'Sub Item 3.',
                    }, {
                        title: 'Sub Item 4.',
                    }]
                }]
            }
            // , {
            //     type: TYPES.ITEM.DEFAULT,
            //     icon: TYPES.ICON.DISK_2,
            //     title: 'Facebook',
            //     position: {
            //         x: 400,
            //         y: 50
            //     }
            // }, {
            //     type: TYPES.ITEM.FOLDER,
            //     icon: TYPES.ICON.FOLDER,
            //     title: 'Folder 1.',
            //     position: {
            //         x: 400,
            //         y: 50
            //     },
            //     items: [{
            //         title: 'Sub Item 1.',
            //     }, {
            //         title: 'Sub Item 2.',
            //     }, {
            //         title: 'Sub Item 3.',
            //     }, {
            //         title: 'Sub Item 4.',
            //     }]
            // },

        ];

        this.model.on('change:itemControl', function(model, itemControl) {
            itemControl.items.add(testItems);
        }, this);
    }
});

function refreshBounds(scope) {
    var offset = scope.el.getBoundingClientRect();
    scope.model.dimension.x = offset.width;
    scope.model.dimension.y = offset.height;
    scope.model.bounds.min.resetValues(offset.top, offset.left, 0);
    scope.model.bounds.max.resetValues(scope.model.bounds.min.x + scope.model.dimension.x, scope.model.bounds.min.y + scope.model.dimension.y, 0);
}

/**
 * Setup for Header ItemControls
 */
function setupItemControlMenu(scope) {

}

// Dialog
//
function onCreateDialog(options) {
    createDialog(this, options);
}

function createDialog(scope, options) {

    var view = createView(scope, {
        title: options.title,
        scaleable: true,
        scrollable: false
    });


    var buttons = [];
    options.buttons.forEach(function(button) {
        buttons.push(scope.tmpl.dialogButton(button));
    });


    var dialog = scope.tmpl.dialog({
        text: options.text,
        buttons: buttons
    });
    $(view.contentEl).append(dialog);
    global.animationFrame.add(function() {

        view.setInitialDimension(scope);
        view.on('change:dialog', function(model, dialog) {
            dialog.buttons = options.buttons;
        });
        global.js.parse(view.contentEl);
        view.setPosition('center');
    });


}

// Views

function createView(scope, options) {
    options = extend({
        url: null,
        title: null,
        scale: false,
        scroll: false
    }, options);
    var id = uniqueId('window_');
    var tmpl = scope.tmpl.view({
        id: id
    });
    $(scope.viewsEl).append(tmpl);
    var viewEl = scope.viewsEl.querySelector('[data-id="' + id + '"]');
    if (options.url) {
        viewEl.setAttribute('data-url', options.url);
    }
    var viewHeaderEl = viewEl.querySelector('[data-partial="components/header/view"]');
    if (options.title) {
        viewHeaderEl.setAttribute('data-title', options.title);
    }
    viewEl.setAttribute('data-scaleable', options.scaleable ? 'true' : 'false');
    viewEl.setAttribute('data-scrollable', options.scrollable ? 'true' : 'false');
    global.js.parse(viewEl);
    var controller = $(viewEl).data('controller');
    if (options.dimension) {
        controller.model.dimension.resetValues(options.dimension.x, options.dimension.y);
    }
    if (options.bounds) {
        controller.model.bounds.min.reset(options.bounds.min);
        controller.model.bounds.max.reset(options.bounds.max);
    }
    return controller.model;
}


function onViewsAdd(model, windowModel) {
    console.log('onViewsAdd', model, windowModel);
}

function onViewsRemove(model, windowModel) {
    console.log('onViewsRemove', model, windowModel);
}

function onOpenView(model, options) {
    var viewModel = createView(this, options);
    if (options.openView_callback) {
        options.openView_callback(viewModel);
    }
}

function onChangeViewFocus(model, data) {
    var $view = $('[data-partial="components/view"][data-id="' + data.id + '"]');
    var focusedViews = model.views.filter(function(view) {
        if (view.focus && view.id !== data.view.id) {
            return view;
        }
    });
    if (focusedViews.length) {
        focusedViews[0].focus = false;
    }
    data.view.focus = true;
    if (data.moveTop) {
        if ($view.next().length) {
            $view.next().after($view);
        }
    } else {
        $view.prev().before($view);
    }
}

// Selected Items

function onSelectedItemsAdd(item) {
    item.selected = true;
}

function onSelectedItemsRemove(item) {
    item.selected = false;
}

function onSelectedItemsReset(collection, options) {
    options.previousModels.forEach(function(item) {
        console.log('reset', item.selected);
        item.selected = false;
    });
}
