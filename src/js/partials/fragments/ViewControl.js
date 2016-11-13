"use strict";

var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');
var Controller = require('agency-pkg-base/Controller');
var ApplicationModel = require('../../base/ApplicationModel');
var extend = require('lodash/extend');
var uniqueId = require('lodash/uniqueId');

var ContextualFragment = require('../../base/ContextualFragment');
var template = require('lodash/template');

var TYPES = require('../../utils/types');
// var ItemCollection = require('../../base/itemControl/ItemCollection');

var AmpersandCollection = require('ampersand-collection');
var menuItems = require('./viewControl/menuItems.json');

require('pepjs');

module.exports = Controller.extend({

    modelConstructor: ApplicationModel.extend(require('../../base/collectionTypeDefinition'), {
        session: {
            applicationStatic: {
                type: 'boolean',
                required: true,
                default: true
            },
            applicationName: {
                type: 'string',
                required: true,
                default: 'View-Control'
            },
            applicationMenuItems: {
                type: 'object',
                default: function() {
                    return menuItems;
                }
            },
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
            focusedView: {
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
        register: function(model) {
            this.views.add(model);
            model.viewControl = this;
        },
        openView: function(url, options, callback) {
            this.trigger('ViewControl:openView', this, extend({
                url: url,
                openView_callback: callback
            }, options));
        },
        setViewFocus: function(view) {
            this.trigger('event:changeViewFocus', this, view);
        },
        setViewTopBottom: function(view, top) {
            this.trigger('event:setViewTopBottom', this, {
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

        this.viewsEl = this.queryByHook('views');

        // Events
        this.model.views.on('add', onViewsAdd, this);
        this.model.views.on('remove', onViewsRemove, this);
        this.model.selectedItems.on('add', onSelectedItemsAdd, this);
        this.model.selectedItems.on('remove', onSelectedItemsRemove, this);
        this.model.selectedItems.on('reset', onSelectedItemsReset, this);
        this.model.on('ViewControl:openView', onOpenView, this);
        this.model.on('event:changeViewFocus', onChangeViewFocus, this);
        this.model.on('event:setViewTopBottom', onSetViewTopBottom, this);
        this.model.on('event:createDialog', onCreateDialog, this);

        this.tmpl = {
            view: new ContextualFragment(template(this.el.querySelector('#view-template').innerHTML)),
            dialog: new ContextualFragment(template(this.el.querySelector('#dialog-template').innerHTML)),
            dialogButton: new ContextualFragment(template(this.el.querySelector('#dialog-button-template').innerHTML))
        };


        this.model.getIfExists('core', function(core) {

            // register static application view-control
            core.applicationControl.register(this.model);

            this.model.on('change:focusedView', function(model, focusedView) {
                document.querySelectorAll('.js-click-view-control-position-center').forEach(function(node) {
                    node.classList.toggle('js-disabled', !focusedView.cid);
                });
            }, this);

            core.on('Core:refresh', function() {
                refreshBounds(this);
                this.model.views.forEach(function(view) {
                    view.refreshBounds();
                });
            }.bind(this));
        }, this);

        refreshBounds(this);



        setup_viewPosition(this);

        create_defaultContent(this);

        if (!this.targetModel) {
            console.error('target not defined');
        } else {
            this.targetModel.registerViewControl(this.model);
        }

    }
});

function setup_viewPosition(scope) {
    [{
        class: '.js-click-view-control-position-center',
        cb: function() {
            setViewPosition(this, TYPES.VIEW_POSITION.CENTER, this.model.focusedView);
        }
    }, {
        class: '.js-click-view-control-order-diagonal-left',
        cb: function() {
            var views = [].concat(this.model.views.models);
            views.sort(function(a, b) {
                return a.zIndex > b.zIndex ? 1 : -1;
            });
            var offset = (1 / views.length);
            views.forEach(function(view, i) {
                setViewPosition(this, TYPES.VIEW_POSITION.CENTER, view);
                i = -Math.floor(this.model.views.length / 2) + i;
                var x = view.bounds.min.x - (offset * view.dimension.x) * i,
                    y = view.bounds.min.y + (offset * view.dimension.y) * i;
                view.refreshBounds(x, y);
            }.bind(this));
        }
    }, {
        class: '.js-click-view-control-order-diagonal-right',
        cb: function() {
            var views = [].concat(this.model.views.models);
            views.sort(function(a, b) {
                return a.zIndex > b.zIndex ? 1 : -1;
            });
            var offset = (1 / views.length);
            views.forEach(function(view, i) {
                setViewPosition(this, TYPES.VIEW_POSITION.CENTER, view);
                i = -Math.floor(this.model.views.length / 2) + i;
                var x = view.bounds.min.x + (offset * view.dimension.x) * i,
                    y = view.bounds.min.y + (offset * view.dimension.y) * i;
                view.refreshBounds(x, y);
            }.bind(this));
        }
    }, {
        class: '.js-click-view-control-order-horizontal',
        cb: function() {
            var views = [].concat(this.model.views.models);
            views.sort(function(a, b) {
                return a.zIndex > b.zIndex ? 1 : -1;
            });
            views.forEach(function(view) {
                view.setDimension(this.model.dimension.x / views.length, this.model.dimension.y / views.length);
                // view.refreshBounds(x, y);
            }.bind(this));
        }
    }, {
        class: '.js-click-view-control-order-vertical',
        cb: function() {}
    }].forEach(function(data) {
        $(document).on('pointerdown.view_control_' + scope.cid, data.class, data.cb.bind(scope));
    });
}

// #### #### ####

function refreshBounds(scope) {
    var offset = scope.el.getBoundingClientRect();
    scope.model.dimension.x = offset.width;
    scope.model.dimension.y = offset.height;
    scope.model.bounds.min.resetValues(offset.top, offset.left, 0);
    scope.model.bounds.max.resetValues(scope.model.bounds.min.x + scope.model.dimension.x, scope.model.bounds.min.y + scope.model.dimension.y, 0);
}

// Dialog

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
        buttons.push(scope.tmpl.dialogButton.template(button));
    });

    var dialog = scope.tmpl.dialog.generate({
        text: options.text,
        buttons: buttons
    });

    $(view.contentEl).append(dialog);
    global.animationFrame.add(function() {
        view.refreshDimension();
        view.on('change:dialog', function(model, dialog) {
            dialog.buttons = options.buttons;
        });
        global.js.parse(view.contentEl);
        setViewPosition(TYPES.VIEW_POSITION.CENTER, view);
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
    $(scope.viewsEl).append(scope.tmpl.view.generate({
        id: id
    }));
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


function onViewsAdd() {
    refreshViewZIndex(this);
}

function onViewsRemove(model) {
    if (this.model.focusedView && model.focus && model.cid === this.model.focusedView.cid) {
        this.model.focusedView = {};
    }
}

function onOpenView(model, options) {
    var viewModel = createView(this, options);
    if (options.openView_callback) {
        options.openView_callback(viewModel);
    }
}

function onSetViewTopBottom(model, data) {
    var $view = $('[data-partial="components/view"][data-id="' + data.view.id + '"]');
    if (data.moveTop) {
        if ($view.next().length) {
            $view.next().after($view);
        }
    } else {
        $view.prev().before($view);
    }
    refreshViewZIndex(this);
}

function onChangeViewFocus(model, view) {
    var id = view.id;
    var focusedViews = model.views.filter(function(view) {
        if (view.focus && view.id !== id) {
            return view;
        }
    });
    if (focusedViews.length) {
        focusedViews[0].focus = false;
    }
    view.focus = true;
    this.model.focusedView = view;
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

function refreshViewZIndex(scope) {
    var node, view;
    for (var i = 0; i < scope.viewsEl.children.length; i++) {
        node = scope.viewsEl.children[i];
        view = scope.model.views.get(node.dataset.id);
        view.zIndex = i;
    }
}

// View Position
function setViewPosition(scope, position, view) {
    switch (position) {
        case TYPES.VIEW_POSITION.CENTER:
            if (view) {
                var x = (scope.model.bounds.max.x - view.dimension.x) / 2,
                    y = (scope.model.bounds.max.y - view.dimension.y) / 2;
                view.refreshBounds(x, y);

            }
            break;
        case TYPES.VIEW_POSITION.ORDER_HORIZONTAL:
        case TYPES.VIEW_POSITION.ORDER_VERTICAL:
        case TYPES.VIEW_POSITION.ORDER_DIAGONAL_LEFT:
        case TYPES.VIEW_POSITION.ORDER_DIAGONAL_RIGHT:

            break;
        default:

    }
}





function create_defaultContent(scope) {
    createView(scope, {
        url: './pages/workbench/applications/core-file/new.html',
        scaleable: true,
        scrollable: false
    });
    // createView(scope, {
    //     url: './pages/workbench/applications/core-file/edit.html',
    //     scaleable: true,
    //     scrollable: false
    // });
    // createView(scope, {
    //     url: './pages/workbench/applications/application-manager.html',
    //     scaleable: true,
    //     scrollable: false
    // });


    var testItems = [{
            type: TYPES.ITEM.DEFAULT,
            icon: TYPES.ICON.WORK,
            title: 'Workbench on GitHub',
            position: {
                x: 0,
                y: 0
            }
        },{
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

    ];

    scope.model.getIfExists('itemControl', function(itemControl) {
        itemControl.items.add(testItems);
    }, scope);
}
