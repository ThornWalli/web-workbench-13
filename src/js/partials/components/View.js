"use strict";

var template = require('lodash/template');

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('../../base/DomModel');
var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');

var lang = require('../../../data/globals/lang.json');
var workbenchConfig = require('../../services/workbenchConfig');

var contentLoader = require('../../services/contentLoader');

require('pepjs');
module.exports = Controller.extend({

    template_loadingUrl: template(lang.view.loadingUrl),
    template_errorFromUrl: template(lang.view.errorFromUrl),

    // move
    move_startPosition: null,
    move_movePosition: null,
    move_moveOffset: null,

    // scale
    scale_startDimension: null,
    scale_startPosition: null,
    scale_movePosition: null,

    contentEl: null,
    contentSize: null,

    modelConstructor: DomModel.extend({

        session: {
            viewControl: {
                type: 'object',
                required: true,
                default: null
            },
            header: {
                type: 'object',
                required: true,
                default: null
            },
            dialog: {
                type: 'object',
                required: true,
                default: null
            },
            application: {
                type: 'object',
                required: true,
                default: null
            },
            itemControl: {
                type: 'object',
                required: true,
                default: null
            },
            scrollContent: {
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
            zIndex: {
                type: 'number',
                required: true,
                default: -1
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
            scaleable: {
                type: 'boolean',
                required: true,
                default: true
            },
            scrollable: {
                type: 'boolean',
                required: true,
                default: false
            },
            focus: {
                type: 'boolean',
                required: true,
                default: false
            },
            // ####
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
            },
            loading: {
                type: 'boolean',
                required: true,
                default: false
            },
            contentEl: {
                type: 'HTMLElement',
                required: false
            }
        },

        initialize: function() {
            DomModel.prototype.initialize.apply(this, arguments);
            this.on('change:scrollContent', function(model, scrollContent) {
                if (scrollContent) {
                    model.scroll = true;
                } else {
                    model.scroll = false;
                }
            });

        },


        close: function() {
            this.trigger('View:close');
        },

        refresh: function(options) {
            this.trigger('View:refresh', options);
        },

        refreshBounds: function(xMin, yMin) {
            this.trigger('View:refreshBounds', xMin || this.bounds.min.x, yMin || this.bounds.min.y);
        },

        refreshDimension: function() {
            this.trigger('View:setInitialDimension');
        },
        setInitialDimension: function() {
            this.trigger('View:setInitialDimension');
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
        'pointerdown': onPointerDown,
        'pointerdown .helper-scale': onPointerDownHelperScale,
        'pointerdown [data-partial="components/header/view"] > .title': onPointerDownHelperMove,
        'pointerup [data-partial="components/header/view"] [data-hook="move-top"]': onPointerUpMoveTop,
        'pointerup [data-partial="components/header/view"] [data-hook="move-bottom"]': onPointerUpMoveBottom,
        'pointerup [data-partial="components/header/view"] [data-hook="close"]': onPointerUpClose

    },

    bindings: {
        'model.scrollable': {
            type: 'booleanClass',
            yes: 'js-scrollable'
        },
        'model.scaleable': {
            type: 'booleanClass',
            yes: 'js-scaleable'
        },
        'model.scaling': {
            type: 'booleanClass',
            yes: 'js-scaling'
        },
        'model.moving': {
            type: 'booleanClass',
            yes: 'js-moving'
        },
        'model.loading': {
            type: 'booleanClass',
            yes: 'js-loading'
        },
        'model.focus': {
            type: 'booleanClass',
            yes: 'js-focus'
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        setupView(this);
    },

    destroy: function() {
        Controller.prototype.destroy.apply(this, arguments);
    },

    refresh: function(options) {
        options = options || {};
        if (!this.model.loading) {
            var css = '';
            if (workbenchConfig.get('core-css-transform') && (this.model.scaling || this.model.moving)) {
                css += 'left: ' + this.move_startPosition.x + 'px; top: ' + this.move_startPosition.y + 'px;width: ' + this.scale_startDimension.x + 'px; height: ' + this.scale_startDimension.y + 'px;';
                css += 'transform: translate(' + ((this.model.bounds.min.x - this.move_startPosition.x) / this.scale_startDimension.x) * 100 + '%, ' + ((this.model.bounds.min.y - this.move_startPosition.y) / this.scale_startDimension.y) * 100 + '%) scale(' + (this.model.dimension.x / this.scale_startDimension.x) + ', ' + (this.model.dimension.y / this.scale_startDimension.y) + ');';

            } else {
                css += 'left: ' + this.model.bounds.min.x + 'px; top: ' + this.model.bounds.min.y + 'px;';
                if (!options.withoutSize) {
                    css += 'width: ' + this.model.dimension.x + 'px; height: ' + this.model.dimension.y + 'px';
                }
            }
            this.el.style.cssText = css;

            this.model.scrollContent.refresh();

        }
    }
});


function setupView(scope) {

    //  Events

    scope.model.on('View:close', function() {
        this.destroy();
    }, scope);
    scope.model.on('View:refreshBounds', function(xMin, yMin) {
        refreshBounds(this, xMin, yMin);
    }, scope);
    scope.model.on('View:refresh', scope.refresh, scope);
    scope.model.on('change:loading', onChangeLoading, scope);
    scope.model.on('change:focus', onChangeFocus, scope);
    scope.model.on('View:setInitialDimension', onSetInitialDimension, scope);
    scope.model.on('change:scrollable', function(model, scrollable) {
        model.scrollContent.active = scrollable;
    });
    scope.model.on('change:scrollContent', function(model, scrollContent) {
        scrollContent.active = this.model.scrollable;
    }, scope);

    scope.model.contentEl = scope.queryByHook('view-content');
    scope.contentSize = new Vector();
    scope.model.dimension = new Vector(150, 100, 0);
    scope.model.screenBounds = scope.targetModel.bounds;

    // move
    scope.move_startPosition = new Vector();
    scope.move_movePosition = new Vector();
    scope.move_moveOffset = new Vector();
    // scale
    scope.scale_startDimension = new Vector();
    scope.scale_startPosition = new Vector();
    scope.scale_movePosition = new Vector();

    if (scope.targetModel) {
        scope.targetModel.register(scope.model);
    } else {
        console.error('View has no Target');
    }

    // Events
    scope.model.getIfExists('header', function(header) {
        if (this.model.url) {
            this.model.contentEl.innerHTML = this.template_loadingUrl({
                url: this.model.url
            });
            this.model.loading = true;
            contentLoader.load(this.model.url, function(html) {
                this.model.contentEl.innerHTML = html;
                this.model.refresh({
                    withoutSize: true
                });
                global.js.parse(this.model.contentEl);
                if (this.model.contentEl.children.length && this.model.contentEl.children[0].dataset.title) {
                    header.title = this.model.contentEl.children[0].dataset.title;
                }
                this.model.loading = false;
                this.model.refreshDimension(this);

            }.bind(this), function(e) {
                this.model.contentEl.innerHTML += this.template_errorFromUrl({
                    url: this.model.url,
                    status: e.status
                });
                header.title = 'Error';
                global.animationFrame.add(function() {
                    this.model.loading = false;
                    this.model.refreshDimension(this);
                }.bind(this));
            }.bind(this));
        } else {
            this.refresh();
        }
    }, scope);


}

var borderSize = 2;
var rightScrollBarWidth = 14;

function getContentSize(scope) {
    var size = {
        x: scope.model.contentEl.offsetWidth + borderSize * 2,
        y: scope.model.contentEl.offsetHeight + borderSize * 2
    };
    if (scope.model.scaleable) {
        size.x += rightScrollBarWidth;
    }
    return size;
}

function onSetInitialDimension(size) {
    this.contentSize.reset(size || getContentSize(this));
    setDimension(this, this.contentSize.x, this.contentSize.y);

    this.scale_startDimension.reset(this.model.dimension);
    this.model.refresh();

    if (!size && !this.model.scrollable) {
        // check content size
        var checkSize = getContentSize(this);
        if (this.contentSize.x !== checkSize.x || this.contentSize.y !== checkSize.y) {
            onSetInitialDimension.bind(this)(this.contentSize);
        }
    }
}

// events model


function onChangeFocus(model, focus) {
    if (focus) {
        this.el.focus();
    }
}

function onChangeLoading(model, loading) {
    var id = '.view-resize-' + this.cid;
    if (!loading) {
        // textarea resizing
        $(this.el.querySelectorAll('textarea')).on('pointerdown' + id, function() {
            $(document).on('pointermove' + id, function() {
                model.refreshDimension();
            });
        });
        $(this.el.querySelector('textarea')).on('pointerup' + id, function() {
            $(document).off(id);
        });
    } else {
        $(this.el.querySelectorAll('textarea')).off('pointerdown' + id);
    }
}



function refreshBounds(scope, x, y) {

    x = Math.min(Math.max(x, 0), scope.targetModel.dimension.x - scope.model.dimension.x);
    y = Math.min(Math.max(y, 0), scope.targetModel.dimension.y - scope.model.dimension.y);

    scope.model.bounds.min.x = x;
    scope.model.bounds.min.y = y;
    scope.model.bounds.max.x = scope.model.bounds.min.x + scope.model.dimension.x;
    scope.model.bounds.max.y = scope.model.bounds.min.y + scope.model.dimension.y;

    scope.refresh();
}



function setDimension(scope, width, height) {
    width = Math.max(width, 150);
    height = Math.max(height, 100);
    if (!scope.model.scrollable || !scope.model.scrollContent.active) {
        width = Math.max(width, scope.contentSize.x);
        height = Math.max(height, scope.contentSize.y);
    }
    width = Math.min(scope.model.bounds.min.x + width, scope.model.screenBounds.max.x - scope.model.screenBounds.min.x);
    width -= scope.model.bounds.min.x;
    height = Math.min(scope.model.bounds.min.y + height, scope.model.screenBounds.max.y - scope.model.screenBounds.min.y);
    height -= scope.model.bounds.min.y;
    scope.model.dimension.resetValues(width, height, 0);
}

/**
 *
 *
 *
 *
 */

// events dom

function onPointerDown() {
    this.targetModel.setViewFocus(this.model);
}

function onPointerUpClose() {
    this.destroy();
}

function onPointerUpMoveTop() {
    this.targetModel.setViewTopBottom(this.model, true);
}

function onPointerUpMoveBottom() {
    this.targetModel.setViewTopBottom(this.model, false);
}

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
    refreshBounds(this, this.move_movePosition.x, this.move_movePosition.y);
}

function onPointerUpHelperMove() {
    $(document).off('pointerup.move_' + this.cid);
    $(document).off('pointermove.move_' + this.cid);
    this.model.moving = false;
    this.model.refresh();
}


function onPointerDownHelperScale(e) {
    $(document).on('pointermove.scale_' + this.cid, onPointerMoveHelperScale.bind(this));
    $(document).on('pointerup.scale_' + this.cid, onPointerUpHelperScale.bind(this));
    this.scale_startPosition.setX(e.pageX).setY(e.pageY);
    this.scale_startDimension.reset(this.model.dimension);
    this.model.scaling = true;
}

function onPointerMoveHelperScale(e) {
    this.scale_movePosition.setX(e.clientX).setY(e.clientY);
    this.scale_movePosition.subtractLocal(this.scale_startPosition);
    setDimension(this, this.scale_startDimension.x + this.scale_movePosition.x, this.scale_startDimension.y + this.scale_movePosition.y);
    this.refresh();
}

function onPointerUpHelperScale() {
    $(document).off('pointerup.scale_' + this.cid);
    $(document).off('pointermove.scale_' + this.cid);
    // global.animationFrame.add(onRefresh.bind(this)());
    this.scale_startDimension.reset(this.model.dimension);
    this.model.scaling = false;
    refreshBounds(this, this.model.bounds.min.x, this.model.bounds.min.y);
    this.model.refresh();
}
