"use strict";

// var loadingUrlTmpl = require('../../../tmpl/partials/elements/messages/loading-url.hbs');
// var errorFromUrlTmpl = require('../../../tmpl/partials/elements/messages/error-from-url.hbs');
var loadingUrlTmpl = require('../../tmpl/messages/loading-url.hbs');
var errorFromUrlTmpl = require('../../tmpl/messages/error-from-url.hbs');

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');
// var history = require('agency-pkg-services/history');

var contentLoader = require('../services/contentLoader');

require('pepjs');

module.exports = Controller.extend({
test :loadingUrlTmpl,
    modelConstructor: DomModel.extend({
        session: {
            header: {
                type: 'object',
                required: true,
                default: null
            },
            id: {
                type: 'string',
                required: true,
                default: function() {
                    return 'window_default_id';
                }
            },
            title: {
                type: 'string',
                required: true,
                default: null
            },
            url: {
                type: 'string',
                default: null
            },
            scroll: {
                type: 'boolean',
                required: true,
                default: false
            },
            // ####
            dimension: {
                type: 'Vector',
                required: true,
                default: function() {
                    return new Vector(240, 160, 0);
                }
            },
            bounds: {
                type: 'Bounds',
                required: true,
                default: function() {
                    return new Bounds();
                }
            },
            screenBounds: {
                type: 'Bounds',
                required: true,
                default: function() {
                    return null;
                }
            },
            scaling: {
                type: 'boolean',
                required: true,
                default: false
            }
        },


        setDimension: function(width, height) {
            this.dimension.setX(width).setY(height);
            this.trigger('event:updateDimension');
        },

        refresh: function() {
            this.trigger('event:refresh');
        },

        // #########################

        /**
         * Override sync for disable ajax from ampersand-model
         */
        sync: function() {
            return;
        }
    }),

    events: {

        'pointerdown [data-partial="components/header/window"]': onPointerDownHelperMove,
        'pointerup [data-partial="components/header/window"] [data-hook="close"]': onPointerUpClose,
        'pointerup [data-partial="components/header/window"] [data-hook="focus-max"]': onPointerUpFocusMax,
        'pointerup [data-partial="components/header/window"] [data-hook="focus-min"]': onPointerUpFocusMin

    },

    bindings: {
        'model.scaling': {
            type: 'booleanClass',
            yes: 'js-scaling'
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        this.contentEl = this.queryByHook('window-content');
        this.model.screenBounds = this.targetModel.bounds;

        // Events
        this.model.on('event:updateDimension', onUpdateDimension, this);
        this.model.on('change:header', function() {

            if (this.model.url) {
                this.contentEl.innerHTML = loadingUrlTmpl({
                    url: this.model.url
                });
                contentLoader.load(this.model.url, function(html) {
                    this.contentEl.innerHTML = html;
                    if (this.contentEl.children.length && this.contentEl.children[0].dataset.title) {
                        console.log(this.model.header, this.contentEl.children[0].dataset.title);
                        this.model.header.title = this.contentEl.children[0].dataset.title;
                    }
                    this.model.refresh();
                    // this.refresh();
                }.bind(this), function(e) {
                    this.contentEl.innerHTML += errorFromUrlTmpl({
                        url: this.model.url,
                        status: e.status
                    });
                }.bind(this));
            }

            // history.register('window-' + this.cid, function() {
            //     console.log('window open');
            // });

            if (this.targetModel) {
                this.targetModel.registerWindow(this.model);
            } else {
                console.error('Window has no Target');
            }

            this.refresh();

        }, this);

    },

    destroy: function() {
        Controller.prototype.destroy.apply(this, arguments);
        this.targetModel.unregisterWindow(this.model);
    },

    refresh: function() {
        if (this.model.scroll) {
            this.el.style.cssText = 'left: ' + this.model.bounds.min.x + 'px; top: ' + this.model.bounds.min.y + 'px;width: ' + this.model.dimension.x + 'px; height: ' + this.model.dimension.y + 'px;';
        } else {
            this.el.style.cssText = 'left: ' + this.model.bounds.min.x + 'px; top: ' + this.model.bounds.min.y + 'px;';
        }
    }
});

function onUpdateDimension() {
    this.refresh();
}

function onPointerUpClose() {
    this.destroy();
}

function onPointerUpFocusMax() {
    this.targetModel.setWindowFocus(this.model, true);
}

function onPointerUpFocusMin() {
    this.targetModel.setWindowFocus(this.model, false);
}
/**
 *
 *
 *
 *
 */


var move_startPosition = new Vector();
var move_startSize = new Vector();
var move_movePosition = new Vector();
var move_offsetX = 0;
var move_offsetY = 0;

function onPointerDownHelperMove(e) {
    var x = e.clientX;
    var y = e.clientY;
    move_offsetX = x - this.model.bounds.min.x;
    move_offsetY = y - this.model.bounds.min.y;
    move_startSize.setX(this.el.offsetWidth).setY(this.el.offsetHeight);
    move_startPosition.setX(x).setY(y);
    $(document).on('pointermove.move_' + this.cid, onPointerMoveHelperMove.bind(this));
    $(document).on('pointerup.move_' + this.cid, onPointerUpHelperMove.bind(this));
}

function onPointerMoveHelperMove(e) {
    var x = e.clientX;
    var y = e.clientY;
    move_movePosition.setX(x - move_offsetX).setY(y - move_offsetY);
    x = Math.min(Math.max(move_movePosition.x, 0), this.targetModel.dimension.x - this.model.dimension.x);
    y = Math.min(Math.max(move_movePosition.y, 0), this.targetModel.dimension.y - this.model.dimension.y);

    this.model.bounds.min.x = x;
    this.model.bounds.min.y = y;
    this.model.bounds.max.x = this.model.bounds.min.x + this.model.dimension.x;
    this.model.bounds.max.y = this.model.bounds.min.y + this.model.dimension.y;
    this.refresh();

}

function onPointerUpHelperMove() {
    $(document).off('pointerup.move_' + this.cid);
    $(document).off('pointermove.move_' + this.cid);
    // global.animationFrame.add(onRefresh.bind(this));
}
