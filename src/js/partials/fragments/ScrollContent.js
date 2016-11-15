"use strict";

var Vector = require('agency-pkg-base/Vector');
var Bounds = require('agency-pkg-base/Bounds');
var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var viewport = require('agency-pkg-service-viewport');
var Enum = require('enum');
var workbenchConfig = require('../../services/workbenchConfig');
require('pepjs');

module.exports = Controller.extend({
    scrollInterval: null,
    SCROLL_DIRECTIONS: new Enum(['LEFT', 'TOP', 'RIGHT', 'BOTTOM']),


    dimension: new Vector(),
    scrollWrapperDimension: new Vector(),
    scrollContentDimension: new Vector(),
    scrollInnerDimension: new Vector(),

    scrollContentEl: null,
    scrollInnerEl: null,

    offsetTop: 0,
    scrollX: 0,
    scrollY: 0,

    bounds: new Bounds(),

    modelConstructor: DomModel.extend({
        session: {
            active: {
                type: 'boolean',
                required: true,
                default: function() {
                    return false;
                }
            }
        },
        refresh: function() {
            this.trigger('ScrollContent:refresh');
        }
    }),

    bindings: {
        'model.active': {
            type: 'booleanClass',
            yes: 'js-active'
        }
    },

    events: {
        'pointerdown [data-hook="scrollbar-arrow-top"]': onClickScrollBarArrowTop,
        'pointerdown [data-hook="scrollbar-arrow-bottom"]': onClickScrollBarArrowBottom,
        'pointerdown [data-hook="scrollbar-arrow-left"]': onClickScrollBarArrowLeft,
        'pointerdown [data-hook="scrollbar-arrow-right"]': onClickScrollBarArrowRight
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        this.scrollWrapperEl = this.el.querySelector('.scroll-wrapper');
        this.scrollContentEl = this.el.querySelector('.scroll-wrapper>.scroll-content');
        this.scrollInnerEl = this.el.querySelector('.scroll-wrapper>.scroll-content>.scroll-inner');
        this.scrollHelperScaleEl = this.el.querySelector('.helper-scale');
        this.scrollRightHelperEl = this.el.querySelector('.scrollbar.right>.range>.helper');
        this.scrollRightSpacerEl = this.el.querySelector('.scrollbar.right>.range>.helper>.spacer');
        this.scrollBottomHelperEl = this.el.querySelector('.scrollbar.bottom>.range>.helper');
        this.scrollBottomSpacerEl = this.el.querySelector('.scrollbar.bottom>.range>.helper>.spacer');

        $(this.scrollRightSpacerEl).on('pointerdown', onPointerDownRightSpacer.bind(this));
        $(this.scrollBottomSpacerEl).on('pointerdown', onPointerDownBottomSpacer.bind(this));

if(this.targetModel) {
        this.targetModel.scrollContent = this.model;}
        // this.targetModel.on('View:refresh', onRefresh, this);
        this.model.on('ScrollContent:refresh', onRefresh, this);

        this.scrollContentEl.addEventListener('scroll', global.animationFrame.throttle('scroll-content' + this.cid, function() {
            updateEl(this);
        }.bind(this), function() {
            refreshScrollbar(this);
        }.bind(this)));

        viewport.on('RESIZE', onRefresh.bind(this));
        onRefresh.bind(this)();

    }
});

/* ################## */

var scroll_startPosition = new Vector(0, 0, 0);
var scroll_startScroll = 0;
var scroll_movePosition = new Vector(0, 0, 0);

// Bottom Spacer


function onPointerDownBottomSpacer(e) {
    scroll_startPosition.setX(e.clientX);
    scroll_startScroll = this.scrollContentEl.scrollLeft;
    $(document).on('pointerup.scroll_' + this.cid, onPointerUpBottomSpacer.bind(this));
    $(document).on('pointermove.scroll_' + this.cid, onPointerMoveBottomSpacer.bind(this));
}

function onPointerMoveBottomSpacer(e) {
    scroll_movePosition.setX(e.clientX);
    scroll_movePosition.subtractLocal(scroll_startPosition);
    this.scrollContentEl.scrollLeft = scroll_startScroll + (this.scrollInnerDimension.x) * scroll_movePosition.x / this.scrollBottomHelperWidth;
}

function onPointerUpBottomSpacer() {
    $(document).off('pointerup.scroll_' + this.cid);
    $(document).off('pointermove.scroll_' + this.cid);
}

/* ################## */

// Right Spacer

function onPointerDownRightSpacer(e) {
    scroll_startPosition.setY(e.clientY);
    scroll_startScroll = this.scrollContentEl.scrollTop;
    $(document).on('pointerup.scroll_' + this.cid, onPointerUpRightSpacer.bind(this));
    $(document).on('pointermove.scroll_' + this.cid, onPointerMoveRightSpacer.bind(this));
}

function onPointerMoveRightSpacer(e) {
    scroll_movePosition.setX(e.clientX).setY(e.clientY);
    scroll_movePosition.subtractLocal(scroll_startPosition);
    this.scrollContentEl.scrollTop = scroll_startScroll + (this.scrollInnerDimension.y) * scroll_movePosition.y / this.scrollRightHelperHeight;
}

function onPointerUpRightSpacer() {
    $(document).off('pointerup.scroll_' + this.cid);
    $(document).off('pointermove.scroll_' + this.cid);
}

function updateEl(scope) {
    if (workbenchConfig.get('core-css-transform')) {
        scope.scrollBottomSpacerEl.style.cssText = 'width: ' + Math.min((scope.scrollBottomSpacerWidth / scope.scrollBottomHelperWidth) * 100, 100) + '%;transform: translateX(' + scope.scrollX * 100 + '%);';
        scope.scrollRightSpacerEl.style.cssText = 'height: ' + Math.min((scope.scrollRightSpacerHeight / scope.scrollRightHelperHeight) * 100, 100) + '%;transform: translateY(' + scope.scrollY * 100 + '%);';
    } else {
        scope.scrollBottomSpacerEl.style.cssText = 'width: ' + Math.min((scope.scrollBottomSpacerWidth / scope.scrollBottomHelperWidth) * 100, 100) + '%;left: ' + (scope.scrollX * scope.scrollBottomSpacerWidth) + 'px;';
        scope.scrollRightSpacerEl.style.cssText = 'height: ' + Math.min((scope.scrollRightSpacerHeight / scope.scrollRightHelperHeight) * 100, 100) + '%;top: ' + (scope.scrollY * scope.scrollRightSpacerHeight) + 'px;';
    }
}

function refreshScrollbar(scope) {
    value = scope.scrollContentEl.scrollLeft / (scope.scrollInnerDimension.x - scope.scrollWrapperDimension.x);
    value = (value * 100) / 100;
    value *= -1 + scope.scrollBottomHelperWidth / scope.scrollBottomSpacerWidth;
    scope.scrollX = value;

    var value = (scope.scrollContentEl.scrollTop) / (((scope.scrollInnerDimension.y - scope.offsetTop) - scope.scrollWrapperDimension.y));
    value = (value * 100) / 100;
    value *= -1 + scope.scrollRightHelperHeight / scope.scrollRightSpacerHeight;
    scope.scrollY = value;
}


function onRefresh() {
    global.animationFrame.add(function() {
        this.offsetTop = this.el.offsetTop;
        refreshScrollbar(this);
        this.dimension.resetValues(this.el.offsetWidth, this.el.offsetHeight, 0);
        this.scrollContentDimension.resetValues(this.scrollContentEl.offsetWidth, this.scrollContentEl.offsetHeight, 0);
        this.scrollWrapperDimension.resetValues(this.scrollWrapperEl.offsetWidth, this.scrollWrapperEl.offsetHeight, 0);
        this.scrollInnerDimension.resetValues(this.scrollInnerEl.offsetWidth, this.scrollInnerEl.offsetHeight, 0);

        this.scrollBottomHelperWidth = this.scrollBottomHelperEl.offsetWidth;
        this.scrollBottomSpacerWidth = (this.scrollContentDimension.x / (this.scrollInnerDimension.x)) * this.scrollBottomHelperWidth;

        this.scrollRightHelperHeight = this.scrollRightHelperEl.offsetHeight;
        this.scrollRightSpacerHeight = (this.scrollContentDimension.y / this.scrollInnerDimension.y) * this.scrollRightHelperHeight;

        updateEl(this);
    }.bind(this));
}


function setScrollByEvent(scope, direction) {

    global.clearInterval(scope.scrollInterval);
    scope.scrollInterval = setInterval(function() {
        console.log(direction);
        switch (direction) {
            case scope.SCROLL_DIRECTIONS.LEFT:
                scope.scrollContentEl.scrollLeft -= 16;
                break;
            case scope.SCROLL_DIRECTIONS.TOP:
                scope.scrollContentEl.scrollTop -= 16;
                break;
            case scope.SCROLL_DIRECTIONS.RIGHT:
                scope.scrollContentEl.scrollLeft += 16;
                break;
            case scope.SCROLL_DIRECTIONS.BOTTOM:
                scope.scrollContentEl.scrollTop += 16;
                break;
        }
        setScrollByEvent(scope, direction);
    }, 125);

}

function onClickScrollBarArrowTop() {
    $(document).on('pointerup.scroll_content_arrow_button_' + this.cid, onPointerUpScrollBarArrow.bind(this));
    setScrollByEvent(this, this.SCROLL_DIRECTIONS.TOP);
}

function onClickScrollBarArrowBottom() {
    $(document).on('pointerup.scroll_content_arrow_button_' + this.cid, onPointerUpScrollBarArrow.bind(this));
    setScrollByEvent(this, this.SCROLL_DIRECTIONS.BOTTOM);
}

function onClickScrollBarArrowLeft() {
    $(document).on('pointerup.scroll_content_arrow_button_' + this.cid, onPointerUpScrollBarArrow.bind(this));
    setScrollByEvent(this, this.SCROLL_DIRECTIONS.LEFT);
}

function onClickScrollBarArrowRight() {
    $(document).on('pointerup.scroll_content_arrow_button_' + this.cid, onPointerUpScrollBarArrow.bind(this));
    setScrollByEvent(this, this.SCROLL_DIRECTIONS.RIGHT);
}

function onPointerUpScrollBarArrow() {
    $(document).off('pointerup.scroll_content_arrow_button_' + this.cid);
    global.clearInterval(this.scrollInterval);
}
