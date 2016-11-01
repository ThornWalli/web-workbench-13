"use strict";

var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');
var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var extend = require('lodash/extend');
var uniqueId = require('lodash/uniqueId');

var TYPES = require('../../utils/types');
// var ItemCollection = require('../../base/iconControl/ItemCollection');
var Item = require('../../base/iconControl/Item');

var controllerParser = require('agency-pkg-service-parser');

var AmpersandCollection = require('ampersand-collection');

require('pepjs');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend({
        session: {
            views: {
                type: 'AmpersandCollection',
                required: true,
                default: function() {
                    return new AmpersandCollection();
                }
            },
            iconControl: {
                type: 'object',
                required: true,
                default: null
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
        setViewFocus: function(windowModel, top) {
            this.trigger('event:changeWindowFocus', this, {
                id: windowModel.id,
                moveTop: top || false
            });
        }
    }),


    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        this.model.core = this.targetModel;
        refreshBounds(this);

        // Events
        this.model.views.on('add', onViewsAdd, this);
        this.model.views.on('remove', onViewsRemove, this);
        this.model.on('event:openView', onOpenView, this);
        this.model.on('event:changeWindowFocus', onChangeWindowFocus, this);

        this.tmpl = {
            default: null,
            scroll: null
        };
        this.tmpl.default = this.el.querySelector('#view-template').innerHTML;
        console.log(this.tmpl);

        this.viewsEl = this.queryByHook('views');
        // createView(this, {
        //     scrollbar: false,
        //     url: './pages/start.html',
        // });
        // createView(this, {
        //     scrollbar: false,
        //     url: './pages/examples/inputs.html'
        // });
        // createView(this, {
        //     scrollbar: false,
        //     url: './pages/workbench/settings.html'
        // });
        // createView(this, {
        //     scrollbar: true,
        //     url: './pages/debug-view-scroll.html'
        // });
        // createView(this, {
        //     scrollbar: true,
        //     url: './pages/workbench/runtime_import_export.html'
        // });


        var testItems = [{
            type: TYPES.ITEM.DEFAULT,
            icon: TYPES.ICON.DISK_1,
            title: 'Test 1.',
            position: {
                x: 400,
                y: 50
            }
        }, {
            type: TYPES.ITEM.DEFAULT,
            icon: TYPES.ICON.DISK_2,
            title: 'Test 2.',
            position: {
                x: 400,
                y: 50
            }
        }, {
            type: TYPES.ITEM.FOLDER,
            icon: TYPES.ICON.FOLDER,
            title: 'Test 3.',
            position: {
                x: 400,
                y: 50
            },
            items: [{
                title: 'Sub Item 1.',
            }, {
                title: 'Sub Item 2.',
            }, {
                title: 'Sub Item 3.',
            }, {
                title: 'Sub Item 4.',
            }]
        }, {
            type: TYPES.ITEM.FOLDER,
            icon: TYPES.ICON.FOLDER,
            title: 'Test 4.',
            position: {
                x: 400,
                y: 50
            },
            items: [{
                type: TYPES.ITEM.FOLDER,
                icon: TYPES.ICON.FOLDER,
                title: 'Test 4.1.',
                position: {
                    x: 400,
                    y: 50
                },
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
        }];

        this.model.on('change:iconControl', function(model, iconControl) {
            iconControl.items.add(testItems);
        }, this);
    }
});

function createView(scope, options) {
    options = extend({
        url: null,
        title: null,
        scroll: false
    }, options);
    var tmpl = scope.tmpl.default;
    var id = uniqueId('window_');
    tmpl = tmpl.replace(/@id/g, id);
    $(scope.viewsEl).append(tmpl);
    var windowEl = scope.viewsEl.querySelector('[data-id="' + id + '"]');
    if (options.url) {
        windowEl.setAttribute('data-url', options.url);
    }
    var windowHeaderEl = windowEl.querySelector('[data-partial="components/header/view"]');
    if (options.title) {
        windowHeaderEl.setAttribute('data-title', options.title);
    }
    controllerParser.parse(windowEl);
    var controller = $(windowEl).data('controller');
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

function onChangeWindowFocus(model, data) {
    var $view = $('[data-partial="components/view"][data-id="' + data.id + '"]');
    if (data.moveTop) {
        if ($view.next().length) {
            $view.next().after($view);
        }
    } else {
        $view.prev().before($view);
    }
}

function refreshBounds(scope) {
    var offset = scope.el.getBoundingClientRect();
    scope.model.dimension.x = offset.width;
    scope.model.dimension.y = offset.height;
    scope.model.bounds.min.resetValues(offset.top, offset.left, 0);
    scope.model.bounds.max.resetValues(scope.model.bounds.min.x + scope.model.dimension.x, scope.model.bounds.min.y + scope.model.dimension.y, 0);
}
