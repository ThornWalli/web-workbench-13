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
var dom = require('../../utils/dom');
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
            helpersEl: {
                type: 'HTMLElement',
                required: false
            },
            // root itemControl
            itemControl: {
                type: 'object',
                required: true,
                default: null
            },
            selectedItems: {
                type: 'AmpersandCollection',
                required: true
            },
            core: {
                type: 'object',
                required: true,
                default: null
            },
            focusedView: {
                type: 'object',
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
            this.trigger('ViewControl:changeViewFocus', this, view);
        },
        setViewTopBottom: function(view, top) {
            this.trigger('ViewControl:setViewTopBottom', this, {
                view: view,
                moveTop: top || false
            });
        },
        createDialog: function(options) {
            this.trigger('ViewControl:createDialog', options);
        },
        deselectItems: function() {
            this.selectedItems.reset();
        },
        getViewsByZIndex: function() {
            return this.views.models.sort(function(a, b) {
                return a.zIndex > b.zIndex ? 1 : -1;
            });
        }
    }),

    events: {
        'click': function(e) {
            console.log(!dom.closestWithView('[data-partial="components/view"]', e.target) , this.model.focusedView);
            if (!dom.closestWithView('[data-partial="components/view"]', e.target) && this.model.focusedView) {
                this.model.focusedView = null;
            }
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        this.viewsEl = this.queryByHook('views');
        this.model.helpersEl = this.queryByHook('helpers');

        // Events
        this.model.views.on('add', onViewsAdd, this);
        this.model.views.on('remove', onViewsRemove, this);
        this.model.selectedItems.on('add', onSelectedItemsAdd, this);
        this.model.selectedItems.on('remove', onSelectedItemsRemove, this);
        this.model.selectedItems.on('reset', onSelectedItemsReset, this);
        this.model.on('ViewControl:openView', onOpenView, this);
        this.model.on('ViewControl:changeViewFocus', onChangeViewFocus, this);
        this.model.on('ViewControl:setViewTopBottom', onSetViewTopBottom, this);
        this.model.on('ViewControl:createDialog', onCreateDialog, this);

        this.tmpl = {
            view: new ContextualFragment(template(this.el.querySelector('#view-template').innerHTML)),
            dialog: new ContextualFragment(template(this.el.querySelector('#dialog-template').innerHTML)),
            dialogButton: new ContextualFragment(template(this.el.querySelector('#dialog-button-template').innerHTML))
        };


        this.model.getIfExists('core', function(core) {

            // register static application view-control
            core.applicationControl.register(this.model);

            this.model.on('change:focusedView', function(model, focusedView) {
                if (focusedView) {
                    document.querySelectorAll('.js-menu-item-view-control-position-center').forEach(function(node) {
                        node.classList.toggle('js-disabled', !focusedView.cid);
                    });
                }
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
        class: '.js-menu-item-view-control-position-center',
        cb: function() {
            setViewPosition(this, TYPES.VIEW_POSITION.CENTER, this.model.focusedView);
        }
    }, {
        class: '.js-menu-item-view-control-order-diagonal-left',
        cb: function() {
            var views = [].concat(this.model.getViewsByZIndex());

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
        class: '.js-menu-item-view-control-order-diagonal-right',
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
        class: '.js-menu-item-view-control-icon-rearrange-icons',
        cb: function() {
            var itemControl = getCurrentIconControl(this);

            console.log('current icon control', itemControl, itemControl.items);
        }
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

function getCurrentIconControl(scope) {
    var itemControl = scope.model.itemControl;
    if (scope.model.focusedView && scope.model.focusedView.itemControl) {
        itemControl = scope.model.focusedView.itemControl;
    }
    return itemControl;
}

// Dialog

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
    var view = controller.model;
    if (options.dimension) {
        view.dimension.resetValues(options.dimension.x, options.dimension.y);
    }
    if (options.bounds) {
        view.bounds.min.reset(options.bounds.min);
        view.bounds.max.reset(options.bounds.max);
    }
    onChangeViewFocus.bind(scope)(scope.model, view);
    return view;
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



// events model (properties)

var lastFocusedView = null;
function onChangeViewFocus(model, view) {


    console.log('change view focused', view);
    var id;
    if (view) {
        id = view.id;
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
        lastFocusedView = view;
    } else {
        if(lastFocusedView) {
            lastFocusedView.focus = false;
            lastFocusedView = null;
        }
        model.focusedView.focus = false;
        model.focusedView = null;
    }
}



// events model (custom)


function onCreateDialog(options) {
    createDialog(this, options);
}


function onOpenView(model, options) {
    var viewModel = createView(this, options);
    if (options.openView_callback) {
        options.openView_callback(viewModel);
    }
}

// events collection

// views

function onViewsAdd() {
    refreshViewZIndex(this);
}

function onViewsRemove(model) {
    if (this.model.focusedView && model.focus && model.cid === this.model.focusedView.cid) {
        this.model.focusedView = {};
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




function create_defaultContent(scope) {
    // createView(scope, {
    //     url: './pages/workbench/applications/core-file/new.html',
    //     scaleable: true,
    //     scrollable: false
    // });
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
    // createView(scope, {
    //     url: './pages/workbench/iframe.html',
    //     scaleable: true,
    //     scrollable: true
    // });

    var testItems = [{
        "position": {
            "x": 0,
            "y": 0
        },
        "iconType": "DEFAULT",
        "icon": "WORK",
        "type": "LINK",
        "title": "Workbench on GitHub",
        "linkUrl": "http://github.com",
        "code": "",
        "src": ""
    }, {
        "position": {
            "x": 181,
            "y": 0
        },
        "iconType": "DEFAULT",
        "icon": "FOLDER",
        "type": "DIRECTORY",
        "title": "Dir 1.",
        "linkUrl": "",
        "code": "",
        "src": "",
        "items": []
    }, {
        "position": {
            "x": 181,
            "y": 100
        },
        "iconType": "DEFAULT",
        "icon": "FOLDER",
        "type": "DIRECTORY",
        "title": "Dir 2.",
        "linkUrl": "",
        "code": "",
        "src": "",
        "items": []
    }];

    scope.model.getIfExists('itemControl', function(itemControl) {
        itemControl.items.add(testItems);
    }, scope);
}
