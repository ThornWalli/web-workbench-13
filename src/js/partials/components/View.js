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

var cssTransform = true;

module.exports = Controller.extend({


    move_startPosition: null,
    move_movePosition: null,
    move_moveOffset: null,


    scale_startDimension: null,
    scale_startPosition: null,
    scale_movePosition: null,
    scale_dimension: null,




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
            },
            moving: {
                type: 'boolean',
                required: true,
                default: false
            }
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

        'pointerdown [data-partial="components/header/view"]': onPointerDownHelperMove,
        'pointerup [data-partial="components/header/view"] [data-hook="close"]': onPointerUpClose,
        'pointerup [data-partial="components/header/view"] [data-hook="focus-max"]': onPointerUpFocusMax,
        'pointerup [data-partial="components/header/view"] [data-hook="focus-min"]': onPointerUpFocusMin

    },

    bindings: {
        'model.scaling': {
            type: 'booleanClass',
            yes: 'js-scaling'
        },
        'model.moving': {
            type: 'booleanClass',
            yes: 'js-moving'
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        setup(this);

    },

    destroy: function() {
        Controller.prototype.destroy.apply(this, arguments);
    },

    refresh: function() {
        var css = '';
        console.log('????', this.move_movePosition, this.move_startPosition);
        if (cssTransform && (this.model.scaling || this.model.moving)) {
            css += 'left: ' + this.move_startPosition.x + 'px; top: ' + this.move_startPosition.y + 'px;width: ' + this.scale_startDimension.x + 'px; height: ' + this.scale_startDimension.y + 'px;';
            css += 'transform: translate(' + ((this.model.bounds.min.x - this.move_startPosition.x) / this.scale_startDimension.x) * 100 + '%, ' + ((this.model.bounds.min.y - this.move_startPosition.y) / this.scale_startDimension.y) * 100 + '%) scale(' + (this.scale_dimension.x / this.scale_startDimension.x) + ', ' + (this.scale_dimension.y / this.scale_startDimension.y) + ');';

        } else {
            if (this.model.scroll) {
                css += 'left: ' + this.model.bounds.min.x + 'px; top: ' + this.model.bounds.min.y + 'px;width: ' + this.scale_dimension.x + 'px; height: ' + this.scale_dimension.y + 'px;';
            } else {
                css += 'left: ' + this.model.bounds.min.x + 'px; top: ' + this.model.bounds.min.y + 'px;';
            }
        }
        console.log(css);
        this.el.style.cssText = css;
    }
});


function setup(scope) {


    scope.helperScaleEl = scope.el.querySelector('.helper-scale');
    $(scope.helperScaleEl).on('pointerdown', onPointerDownHelperScale.bind(scope));

    scope.contentEl = scope.queryByHook('view-content');
    scope.model.screenBounds = scope.targetModel.bounds;

    scope.move_startPosition = new Vector();
    scope.move_movePosition = new Vector();
    scope.move_moveOffset = new Vector();
    scope.scale_startDimension = new Vector();
    scope.scale_startPosition = new Vector();
    scope.scale_movePosition = new Vector();
    scope.scale_dimension = new Vector(240, 160, 0);

    if (scope.targetModel) {
        scope.targetModel.registerView(scope.model);
    } else {
        console.error('View has no Target');
    }

    // Events
    scope.model.on('change:header', function() {

        if (scope.model.url) {
            scope.contentEl.innerHTML = loadingUrlTmpl({
                url: scope.model.url
            });
            contentLoader.load(scope.model.url, function(html) {
                scope.contentEl.innerHTML = html;
                parseJS(scope.contentEl);
                if (scope.contentEl.children.length && scope.contentEl.children[0].dataset.title) {
                    scope.model.header.title = scope.contentEl.children[0].dataset.title;
                }
                global.animationFrame.add(function() {
                    scope.scale_dimension.resetValues(scope.el.offsetWidth, scope.el.offsetHeight, 0);
                    scope.scale_startDimension.reset(scope.scale_dimension);
                    scope.refresh();
                    scope.model.refresh();
                }.bind(scope));
            }.bind(scope), function(e) {
                scope.contentEl.innerHTML += errorFromUrlTmpl({
                    url: scope.model.url,
                    status: e.status
                });
            }.bind(scope));
        }

        // history.register('view-' + scope.cid, function() {
        //     console.log('view open');
        // });

        scope.refresh();

    }, scope);
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




function onPointerDownHelperMove(e) {
    var x = e.clientX;
    var y = e.clientY;
    this.move_moveOffset.resetValues(x - this.model.bounds.min.x, y - this.model.bounds.min.y, 0);
    this.move_startPosition.setX(this.model.bounds.min.x).setY(this.model.bounds.min.y);
    $(document).on('pointermove.move_' + this.cid, onPointerMoveHelperMove.bind(this));
    $(document).on('pointerup.move_' + this.cid, onPointerUpHelperMove.bind(this));
    this.model.moving = true;
}

function onPointerMoveHelperMove(e) {
    var x = e.clientX;
    var y = e.clientY;

    this.move_movePosition.setX(x - this.move_moveOffset.x).setY(y - this.move_moveOffset.y);
    x = Math.min(Math.max(this.move_movePosition.x, 0), this.targetModel.dimension.x - this.scale_dimension.x);
    y = Math.min(Math.max(this.move_movePosition.y, 0), this.targetModel.dimension.y - this.scale_dimension.y);

    this.model.bounds.min.x = x;
    this.model.bounds.min.y = y;
    this.model.bounds.max.x = this.model.bounds.min.x + this.scale_dimension.x;
    this.model.bounds.max.y = this.model.bounds.min.y + this.scale_dimension.y;

    this.refresh();

}

function onPointerUpHelperMove() {
    $(document).off('pointerup.move_' + this.cid);
    $(document).off('pointermove.move_' + this.cid);
    // global.animationFrame.add(onRefresh.bind(this));
    this.model.moving = false;
    this.model.refresh();
    this.refresh();
}


function onPointerDownHelperScale(e) {
console.log('pointer down move');
    $(document).on('pointermove.scale_' + this.cid, onPointerMoveHelperScale.bind(this));
    $(document).on('pointerup.scale_' + this.cid, onPointerUpHelperScale.bind(this));
    this.scale_startPosition.setX(e.pageX).setY(e.pageY);
    this.scale_startDimension.setX(this.el.offsetWidth).setY(this.el.offsetHeight);
    this.model.scaling = true;
}

function onPointerMoveHelperScale(e) {
    this.scale_movePosition.setX(e.clientX).setY(e.clientY);
    this.scale_movePosition.subtractLocal(this.scale_startPosition);
    var width = this.scale_startDimension.x + this.scale_movePosition.x;
    var height = this.scale_startDimension.y + this.scale_movePosition.y;

    width = Math.min(this.model.bounds.min.x + width, this.model.screenBounds.max.x - this.model.screenBounds.min.x);
    width -= this.model.bounds.min.x;
    height = Math.min(this.model.bounds.min.y + height, this.model.screenBounds.max.y - this.model.screenBounds.min.y);
    height -= this.model.bounds.min.y;
    this.scale_dimension.resetValues(width, height, 0);
    this.refresh();
}

function onPointerUpHelperScale() {
    $(document).off('pointerup.scale_' + this.cid);
    $(document).off('pointermove.scale_' + this.cid);
    // global.animationFrame.add(onRefresh.bind(this)());
    this.scale_startDimension.reset(this.scale_dimension);
    this.model.scaling = false;
    this.refresh();
    this.model.refresh();
    console.log('pointer up move');
}

function parseJS(element) {
    require('agency-pkg-service-parser')().parse(element);
}
