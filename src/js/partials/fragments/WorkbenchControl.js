"use strict";

var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');
var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var extend = require('lodash/extend');
var uniqueId = require('lodash/uniqueId');

require('pepjs');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend({
        session: {
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

        registerWindow: function(windowModel) {
            this.windows.push(windowModel);
            this.trigger('event:registerWindow', this, windowModel);
        },
        unregisterWindow: function(windowModel) {
            this.windows.slice(this.windows.indexOf(windowModel), 1);
            this.trigger('event:unregisterWindow', this, windowModel);
        },
        openWindow: function(url) {
            var data = {
                url: url
            };
            this.trigger('event:openWindow', this, data);
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
        this.model.on('event:openWindow', onOpenWindow, this);
        this.model.on('event:registerWindow', onRegisterWindow, this);
        this.model.on('event:unregisterWindow', onUnregisterWindow, this);
        this.model.on('event:changeWindowFocus', onChangeWindowFocus, this);

        this.tmpl = {
            default: null,
            scroll: null
        };
        this.tmpl.default = this.el.querySelector('#window-template').innerHTML;
        this.tmpl.scroll = this.el.querySelector('#window-scroll-template').innerHTML;
        console.log(this.tmpl);

        this.windowsEl = this.queryByHook('windows');
        createWindow(this, {
            scroll: true,
            url: './pages/start.html'
        });
    }
});

function createWindow(scope, data) {
    data = extend({
        url: null,
        title: null,
        scroll: false
    }, data);
    var tmpl = data.scroll ? scope.tmpl.scroll : scope.tmpl.default;
    var id = uniqueId('window_');
    tmpl = tmpl.replace(/@id/g, id);
    $(scope.windowsEl).append(tmpl);
    var windowEl = scope.windowsEl.querySelector('[data-id="' + id + '"]');
    if (data.url) {
        windowEl.setAttribute('data-url', data.url);
    }
    var windowHeaderEl = windowEl.querySelector('[data-partial="components/header/window"]');
    if (data.title) {
        windowHeaderEl.setAttribute('data-title', data.title);
    }
    parseJS(windowEl);
}

function parseJS(element) {
    require('agency-pkg-services/parser/js')(require('../../packages')).parse(element);
}

function onRegisterWindow(model, windowModel) {
    console.log('onRegisterWindow', model, windowModel);
}

function onUnregisterWindow(model, windowModel) {
    console.log('onUnregisterWindow', model, windowModel);
}

function onOpenWindow(model, data) {
    console.log('openWindow', model, data);
    createWindow(this, data);
}

function onChangeWindowFocus(model, data) {
    var $window = $('[data-partial="components/window"][data-id="' + data.id + '"]');
    if (data.moveTop) {
        if ($window.next().length) {
            $window.next().after($window);
        }
    } else {
        $window.prev().before($window);
    }
}

function refreshBounds(scope) {
    var offset = scope.el.getBoundingClientRect();
    scope.model.dimension.x = offset.width;
    scope.model.dimension.y = offset.height;
    scope.model.bounds.min.resetValues(offset.top, offset.left, 0);
    scope.model.bounds.max.resetValues(scope.model.bounds.min.x + scope.model.dimension.x, scope.model.bounds.min.y + scope.model.dimension.y, 0);
}
