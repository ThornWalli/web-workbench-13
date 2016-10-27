"use strict";

var Vector = require('agency-pkg-base/Vector');
var Bounds = require('agency-pkg-base/Bounds');
var Controller = require('agency-pkg-base/Controller');
var viewport = require('agency-pkg-service-viewport');
var Enum = require('enum');
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

    scrollX: 0,
    scrollY: 0,

    bounds: new Bounds(),

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

        this.targetModel.on('event:refresh', onRefresh.bind(this)(), this);
        this.scrollContentEl.addEventListener('scroll', global.animationFrame.throttle('scroll-content' + this.cid, function() {
            updateEl(this);
        }.bind(this), function() {
            refreshScrollbar(this);
        }.bind(this)));

        viewport.on('RESIZE', onRefresh.bind(this)());
        onRefresh.bind(this)()();

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

    scope.scrollBottomSpacerEl.style.cssText = 'width: ' + (scope.scrollBottomSpacerWidth / scope.scrollBottomHelperWidth) * 100 + '%;transform: translateX(' + scope.scrollX + '%);';
    scope.scrollRightSpacerEl.style.cssText = 'height: ' + (scope.scrollRightSpacerHeight / scope.scrollRightHelperHeight) * 100 + '%;transform: translateY(' + scope.scrollY + '%);';
}

function refreshScrollbar(scope) {
    value = scope.scrollContentEl.scrollLeft / (scope.scrollInnerDimension.x - scope.scrollWrapperDimension.x);
    value = (value * 100) / 100;
    value *= -1 + scope.scrollBottomHelperWidth / scope.scrollBottomSpacerWidth;
    value *= 100;
    scope.scrollX = value;
    var value = scope.scrollContentEl.scrollTop / ((scope.scrollInnerDimension.y - scope.scrollWrapperDimension.y));
    value = (value * 100) / 100;
    value *= -1 + scope.scrollRightHelperHeight / scope.scrollRightSpacerHeight;
    value *= 100;
    scope.scrollY = value;
}


function onRefresh() {
    return global.animationFrame.throttle('scroll-content' + this.cid, function() {
        updateEl(this);
    }.bind(this), function() {

        this.dimension.resetValues(this.el.offsetWidth, this.el.offsetHeight, 0);
        this.scrollContentDimension.resetValues(this.scrollContentEl.offsetWidth, this.scrollContentEl.offsetHeight, 0);
        this.scrollWrapperDimension.resetValues(this.scrollWrapperEl.offsetWidth, this.scrollWrapperEl.offsetHeight, 0);
        this.scrollInnerDimension.resetValues(this.scrollInnerEl.offsetWidth, this.scrollInnerEl.offsetHeight, 0);

        // if (this.scrollContentDimension.x > this.scrollInnerDimension.x) {
        //     this.scrollInnerDimension.x = this.scrollContentDimension.x;
        // }
        this.scrollBottomHelperWidth = this.scrollBottomHelperEl.offsetWidth;
        this.scrollBottomSpacerWidth = (this.scrollContentDimension.x / (this.scrollInnerDimension.x)) * this.scrollBottomHelperWidth;

        this.scrollRightHelperHeight = this.scrollRightHelperEl.offsetHeight;
        this.scrollRightSpacerHeight = (this.scrollContentDimension.y / this.scrollInnerDimension.y) * this.scrollRightHelperHeight;

        refreshScrollbar(this);
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
