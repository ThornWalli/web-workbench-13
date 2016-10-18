"use strict";

var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');
var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var extend = require('lodash/extend');
var uniqueId = require('lodash/uniqueId');


var AmpersandCollection = require('ampersand-collection');

require('pepjs');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend({
        session: {
            views : {
                type: 'AmpersandCollection',
                required: true,
                default: function (){
                    return new AmpersandCollection();
                }
            },
            windows: {
                type: 'array',
                required: true,
                default: function() {
                    return [];
                }
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
        getWindowModel: function(windowId) {
            return this.windows.find(function(windowModel) {
                console.log(windowModel.id , windowId);
                if (windowModel.id === windowId) {
                    return windowModel;
                }
            });
        },
        registerView: function(model) {
            this.windows.push(model);
            this.views.add(model);
        },
        openWindow: function(url, options) {
            this.trigger('event:openWindow', this, extend({
                url: url
            }, options));
        },
        setWindowFocus: function(windowModel, top) {
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
        this.model.on('event:openWindow', onOpenWindow, this);
        this.model.on('event:changeWindowFocus', onChangeWindowFocus, this);

        this.tmpl = {
            default: null,
            scroll: null
        };
        this.tmpl.default = this.el.querySelector('#view-template').innerHTML;
        this.tmpl.scroll = this.el.querySelector('#view-scroll-template').innerHTML;
        console.log(this.tmpl);

        this.windowsEl = this.queryByHook('windows');
        // createWindow(this, {
        //     scrollbar: false,
        //     url: './pages/start.html',
        // });
        // createWindow(this, {
        //     scrollbar: false,
        //     url: './pages/workbench/runtime_import_export.html'
        // });
        createWindow(this, {
            scrollbar: true,
            url: './pages/debug-view-scroll.html'
        });
    }
});

function createWindow(scope, options) {
    options = extend({
        url: null,
        title: null,
        scrollbar: false
    }, options);
    var tmpl = options.scrollbar ? scope.tmpl.scroll : scope.tmpl.default;
    var id = uniqueId('window_');
    tmpl = tmpl.replace(/@id/g, id);
    $(scope.windowsEl).append(tmpl);
    var windowEl = scope.windowsEl.querySelector('[data-id="' + id + '"]');
    if (options.url) {
        windowEl.setAttribute('data-url', options.url);
    }
    var windowHeaderEl = windowEl.querySelector('[data-partial="components/header/view"]');
    if (options.title) {
        windowHeaderEl.setAttribute('data-title', options.title);
    }
    parseJS(windowEl);
}

function parseJS(element) {
    require('agency-pkg-services/parser/js')(require('../../packages')).parse(element);
}

function onViewsAdd(model, windowModel) {
    console.log('onViewsAdd', model, windowModel);
}

function onViewsRemove(model, windowModel) {
    console.log('onViewsRemove', model, windowModel);
}

function onOpenWindow(model, options) {
    console.log('openWindow', model, options);
    createWindow(this, options);
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
