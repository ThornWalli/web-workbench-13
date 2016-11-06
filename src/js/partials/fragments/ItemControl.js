"use strict";



var ViewController = require('../../base/ViewController');
var DomModel = require('agency-pkg-base/DomModel');
var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');


var imageTmpl = require('./itemControl/icon-image.hbs');
var svgTmpl = require('./itemControl/icon-svg.hbs');
var icons = require('../../utils/icons');
var TYPES = require('../../utils/types');

require('pepjs');


module.exports = ViewController.extend({

    move_item: null,
    move_startPosition: null,
    move_movePosition: null,
    move_moveOffset: null,
    move_moved: false,

    modelConstructor: DomModel.extend(require('../../base/collectionTypeDefinition'), {
        session: {
            items: {
                type: 'ItemCollection',
                required: true
            }
        }
    }),

    initialize: function() {
        ViewController.prototype.initialize.apply(this, arguments);

        this.model.on('change:items', onChangeItems, this);
        onChangeItems.bind(this)(this.model, this.model.items);
        this.iconBuilderEl = document.createElement('span');
        this.el.appendChild(this.iconBuilderEl);
        this.el.classList.add('icon-control-' + this.cid);
        this.itemElMap = {};
        this.itemsEl = this.queryByHook('items');

        // testItems.forEach(function(data){
        //             var item = new Item(data);
        //             this.model.items.add(item);
        //     renderItem(this, item);
        // }.bind(this));


        // move
        this.move_startPosition = new Vector();
        this.move_movePosition = new Vector();
        this.move_moveOffset = new Vector();


        $(document).on('pointerdown.itemControl_' + this.cid, '.icon-control-' + this.cid, function() {
            this.targetModel.deselectItems();
        }.bind(this));
        $(document).on('pointerdown.itemControl_' + this.cid, '.icon-control-' + this.cid + '>.items>*', onPointerDownItem.bind(this));



        if (this.view) {
            this.view.itemControl = this.model;
            this.view.on('destroy', function() {
                $(document).off('pointermove.itemControl_' + this.cid);
                $(document).off('pointerdown.itemControl_' + this.cid);
                this.model.items.on(null, null, this);
            }.bind(this));
        } else if (this.targetModel) {
            this.targetModel.itemControl = this.model;
        }

    }
});

function onChangeItems(model, items) {
    items.on('reset', onReset, this);
    items.on('add', onAdd, this);
    items.on('remove', onRemove, this);
    items.forEach(function(item) {
        renderItem(this, item);
    }.bind(this));
}

function removeItemEl(scope, id) {
    scope.itemElMap[id].parentNode.removeChild(scope.itemElMap[id]);
    delete scope.itemElMap[id];
}

function onReset() {
    for (var id in this.itemElMap) {
        if (this.itemElMap.hasOwnProperty(id)) {
            removeItemEl(this, id);
        }
    }
}

function onAdd(model) {
    model.on('destroy', function(model) {
        removeItemEl(this, model.id);
    }, this);
    model.on('event:refreshBounds', function(model) {
        refreshBounds(this, model);
    }, this);
    model.on('change:selected', function(model, selected) {
        this.itemElMap[model.id].classList.toggle('js-selected', selected);
    }, this);
    renderItem(this, model);
}

function onRemove(model) {
    model.off(null, null, this);
    renderItem(this, model);
}

function onPointerMove(e) {
    var x = e.clientX;
    var y = e.clientY;
    this.move_moved = true;
    this.move_movePosition.setX(x - this.move_moveOffset.x).setY(y - this.move_moveOffset.y);
    refreshBounds(this, this.move_item, this.move_movePosition.x, this.move_movePosition.y);
    setItemsSize(this);
}

function onPointerUpItem() {
    if (this.move_moved) {
        this.targetModel.selectedItems.remove(this.move_item);
        this.move_moved = false;
    }
    this.move_item = null;
    $(document).off('pointerup.itemControl_' + this.cid);
    $(document).off('pointermove.itemControl_' + this.cid);
}

function setItemsSize(scope) {
    var width = 0,
        height = 0;
    scope.model.items.forEach(function(item) {
        if (item.bounds.max.x > width) {
            console.log('bounds', item.bounds.min, item.bounds.max);
            width = item.bounds.max.x;
        }
        if (item.bounds.max.y > height) {
            height = item.bounds.max.y;
        }
    });
    scope.itemsEl.style.cssText = 'width: ' + width + 'px; height: ' + height + 'px;';
    console.log(scope.targetModel.scrollContent);
    if (scope.view) {
        scope.view.scrollContent.refresh();
    }

}

function onPointerDownItem(e) {
    e.preventDefault();
    e.stopPropagation();
    selectItem(this, this.model.items.get(e.currentTarget.dataset.id));
    if (this.move_item) {
        var x = e.clientX;
        var y = e.clientY;
        this.move_moveOffset.resetValues(x - this.move_item.bounds.min.x, y - this.move_item.bounds.min.y, 0);
        this.move_startPosition.setX(this.move_item.bounds.min.x).setY(this.move_item.bounds.min.y);
        $(document).on('pointerup.itemControl_' + this.cid, onPointerUpItem.bind(this));
        $(document).on('pointermove.itemControl_' + this.cid, onPointerMove.bind(this));
    }
}

function showFolder(scope, item) {
    scope.targetModel.openView('./pages/workbench/folder.html', {
        title: item.title,
        scaleable: true,
        scrollable: true
    }, function(viewModel) {
        scope.itemElMap[item.id].classList.add('js-selected-open');
        viewModel.on('destroy', function() {
            this.itemElMap[item.id].classList.remove('js-selected-open');
            item.disabled = false;
        }, scope);

        function changeItemControl(model, itemControl) {
            console.log('item.items', item.items);
            itemControl.items = item.items;
            item.items = itemControl.items;
        }
        viewModel.on('change:itemControl', changeItemControl);
        if (viewModel.itemControl) {
            changeItemControl(item, viewModel.itemControl);
        }
    });
}

function selectItem(scope, item) {

    if (!item.disabled) {
        scope.move_item = item;
        if (item.selected) {
            if (TYPES.ITEM.FOLDER.is(item.type)) {
                scope.targetModel.selectedItems.remove(item);
                console.log('select FOLDER', item);
                showFolder(scope, item);
                item.disabled = true;
            } else {
                console.log('select Item', item);
                scope.targetModel.selectedItems.remove(item);
            }
        } else {
            scope.targetModel.selectedItems.add(item);
        }
    }
}

function renderItem(scope, item) {
    var html;
    if (TYPES.ICON_TYPE.SVG.is(item.iconType) || TYPES.ICON_TYPE.DEFAULT.is(item.iconType)) {
        console.log(item.icon.key, icons);
        html = svgTmpl({
            svg: icons[item.icon.key](),
            title: item.title,
        });
    } else if (TYPES.ICON_TYPE.IMG.is(item.iconType)) {
        html = imageTmpl({
            svg: icons[item.icon.key](),
            title: item.title,
        });
    }
    scope.iconBuilderEl.innerHTML = html;
    var el = scope.iconBuilderEl.children[0];
    el.setAttribute('data-id', item.id);
    scope.itemsEl.appendChild(el);
    scope.itemElMap[item.id] = el;

    item.dimension.resetValues(el.offsetWidth, el.offsetHeight);
    refreshBounds(scope, item, item.bounds.min.x, item.bounds.min.y);

    setItemsSize(scope);
}

function refreshIcon(scope, item) {
    scope.itemElMap[item.id].style.cssText = 'position: absolute; left: ' + item.bounds.min.x + 'px; top: ' + item.bounds.min.y + 'px;';
}

function refreshBounds(scope, item, x, y) {

    x = Math.min(Math.max(x, 0), scope.targetModel.dimension.x - item.dimension.x);
    y = Math.min(Math.max(y, 0), scope.targetModel.dimension.y - item.dimension.y);

    item.bounds.min.x = x;
    item.bounds.min.y = y;
    item.bounds.max.x = item.bounds.min.x + item.dimension.x;
    item.bounds.max.y = item.bounds.min.y + item.dimension.y;
    console.log('move', item.bounds.min);
    refreshIcon(scope, item);
}
