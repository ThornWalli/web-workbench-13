"use strict";

var Vector = require('agency-pkg-base/Vector');
var Bounds = require('agency-pkg-base/Bounds');
var Controller = require('agency-pkg-base/Controller');
var viewport = require('agency-pkg-services/viewport');

require('pepjs');

var SCROLLBAR_WIDTH = 16;
var SCROLLBAR_HEIGHT = 16;

module.exports = Controller.extend({

    scrollContentWidth: 0,
    scrollContentHeight: 0,
    scrollInnerHeight: 0,
    scrollContentEl: null,
    scrollInnerEl: null,

    scrollX: 0,
    scrollY: 0,

    bounds: new Bounds(),

    events: {



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


        $(this.scrollHelperScaleEl).on('pointerdown', onPointerDownHelperScale.bind(this));
        $(this.scrollRightSpacerEl).on('pointerdown', onPointerDownRightSpacer.bind(this));
        $(this.scrollBottomSpacerEl).on('pointerdown', onPointerDownBottomSpacer.bind(this));

        this.targetModel.on('event:refresh', onRefresh, this);
        this.scrollContentEl.addEventListener('scroll', onScroll.bind(this));

        viewport.on('RESIZE', onRefresh.bind(this));

        global.animationFrame.add(onRefresh.bind(this));

    }
});

var scale_startPosition = new Vector();
var scale_startSize = new Vector();
var scale_movePosition = new Vector();

function onPointerDownHelperScale(e) {
    scale_startPosition.setX(e.pageX).setY(e.pageY);
    scale_startSize.setX(this.el.offsetWidth).setY(this.el.offsetHeight);
    $(document).on('pointermove.scale_' + this.cid, onPointerMoveHelperScale.bind(this));
    $(document).on('pointerup.scale_' + this.cid, onPointerUpHelperScale.bind(this));
    this.targetModel.scaling = true;
}

function onPointerMoveHelperScale(e) {
    scale_movePosition.setX(e.clientX).setY(e.clientY);
    scale_movePosition.subtractLocal(scale_startPosition);
    var width = scale_startSize.x + scale_movePosition.x;
    var height = scale_startSize.y + scale_movePosition.y + 20;

    console.log(this.targetModel.bounds.min.x + width, this.targetModel.screenBounds.max.x - this.targetModel.screenBounds.min.x);
    width = Math.min(this.targetModel.bounds.min.x + width, this.targetModel.screenBounds.max.x - this.targetModel.screenBounds.min.x);
    width -= this.targetModel.bounds.min.x;
    height = Math.min(this.targetModel.bounds.min.y + height, this.targetModel.screenBounds.max.y - this.targetModel.screenBounds.min.y);
    height -= this.targetModel.bounds.min.y;
    // height = Math.min(Math.max(height, 0), this.targetModel.dimension.y - this.model.dimension.y);

        // this.targetModel.setDimension(Math.max(width, 150), Math.max(height, 170));
            this.targetModel.setDimension(width, height);

}

function onPointerUpHelperScale() {
    $(document).off('pointerup.scale_' + this.cid);
    $(document).off('pointermove.scale_' + this.cid);
    global.animationFrame.add(onRefresh.bind(this));
    this.targetModel.scaling = false;
}

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
    this.scrollContentEl.scrollLeft = scroll_startScroll + (this.scrollWidth) * scroll_movePosition.x / this.scrollBottomHelperWidth;
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
    this.scrollContentEl.scrollTop = scroll_startScroll + (this.scrollInnerHeight) * scroll_movePosition.y / this.scrollRightHelperHeight;
}

function onPointerUpRightSpacer() {
    $(document).off('pointerup.scroll_' + this.cid);
    $(document).off('pointermove.scroll_' + this.cid);
}

function updateEl(scope) {

    scope.scrollBottomSpacerEl.style.cssText = 'width: ' + scope.scrollBottomSpacerWidth + 'px;transform: translateX(' + scope.scrollX + '%);';
    scope.scrollRightSpacerEl.style.cssText = 'height: ' + scope.scrollRightSpacerHeight + 'px;transform: translateY(' + scope.scrollY + '%);';
}

function refreshScrollbar(scope) {
    value = scope.scrollContentEl.scrollLeft / (scope.scrollWidth - scope.scrollWrapperWidth);
    value = Math.round(value * 100) / 100;
    value *= -1 + scope.scrollBottomHelperWidth / scope.scrollBottomSpacerWidth;
    value *= 100;
    scope.scrollX = value;

    var value = scope.scrollContentEl.scrollTop / ((scope.scrollInnerHeight - scope.scrollWrapperHeight));
    value = Math.round(value * 100) / 100;
    value *= -1 + scope.scrollRightHelperHeight / scope.scrollRightSpacerHeight;
    value *= 100;
    scope.scrollY = value;
}

function onScroll() {
    var scope = this;

    global.animationFrame.throttle('scroll-content' + this.cid, function() {
        refreshScrollbar(scope);
    }, function() {
        updateEl(scope);
    })();
}

function onRefresh() {
    this.scrollContentWidth = this.scrollContentEl.offsetWidth;
    this.scrollContentHeight = this.scrollContentEl.offsetHeight;
    this.scrollWrapperWidth = this.scrollWrapperEl.offsetWidth;
    this.scrollWrapperHeight = this.scrollWrapperEl.offsetHeight;

    this.scrollWidth = this.scrollContentEl.scrollWidth + SCROLLBAR_WIDTH;
    this.scrollHeight = this.scrollContentEl.scrollHeight + SCROLLBAR_HEIGHT;

    this.scrollInnerWidth = this.scrollInnerEl.offsetWidth;
    this.scrollInnerHeight = this.scrollInnerEl.offsetHeight;
    this.scrollBottomHelperWidth = this.scrollBottomHelperEl.offsetWidth;
    this.scrollBottomSpacerWidth = Math.round((this.scrollContentWidth / (this.scrollWidth)) * this.scrollBottomHelperWidth);

    this.scrollRightHelperHeight = this.scrollRightHelperEl.offsetHeight;
    this.scrollRightSpacerHeight = Math.round(Math.min(this.scrollContentHeight / this.scrollInnerHeight, 1) * this.scrollRightHelperHeight);

    refreshScrollbar(this);
    updateEl(this);

}
