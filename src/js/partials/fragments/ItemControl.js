"use strict";

var ViewController = require('../../base/ViewController');
var DomModel = require('agency-pkg-base/DomModel');
var Bounds = require('agency-pkg-base/Bounds');
var Vector = require('agency-pkg-base/Vector');


var ItemCollection = require('../../base/itemControl/ItemCollection');
var ItemSubCollection = require('../../base/itemControl/ItemSubCollection');

var ContextualFragment = require('../../base/ContextualFragment');
var imageTmpl = new ContextualFragment(require('./itemControl/item-image.hbs'));
var svgTmpl = new ContextualFragment(require('./itemControl/item-svg.hbs'));
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
                type: 'object',
                required: true,
                default: function() {
                    return new ItemCollection();
                }
            }
        }
    }),

    initialize: function() {
        ViewController.prototype.initialize.apply(this, arguments);

        this.model.on('change:items', onChangeItems, this);
        this.el.classList.add('icon-control-' + this.cid);
        this.itemElMap = {};
        this.itemsEl = this.queryByHook('items');

        // testItems.forEach(function(data){
        //             var item = new Item(data);
        //             this.model.items.add(item);
        //     renderItem(this, item);
        // }.bind(this));

        if (!this.view) {
            console.log('this.model.items', this.model.items);
            onChangeItems.bind(this)(this.model, this.model.items);
        }

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


function getHelpersEl(scope) {
    if (scope.view) {
        return scope.view.viewControl.helpersEl;
    } else {
        return scope.targetModel.helpersEl;
    }
}

function toggleHelperMove(scope, item, move) {
    if (move) {
        getHelpersEl(scope).appendChild(scope.itemElMap[item.id]);
    } else {
        scope.itemsEl.appendChild(scope.itemElMap[item.id]);
    }
}


function intersectOtherItemControl(scope, item) {
    var views = scope.targetModel.getViewsByZIndex().reverse();
    var itemControl = scope.targetModel.itemControl || scope.view.viewControl.itemControl;
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        var bounds = new Bounds();
        bounds.min.reset(item.screenBounds.min);
        bounds.max.reset(item.screenBounds.max);
        if (view.bounds.intersects(bounds) && !view.itemControl) {
            break;
        } else if (view.bounds.intersects(bounds) && view.itemControl) {
            itemControl = view.itemControl;
            break;
        }
    }
    return itemControl;
}


function moveItem(scope, items, item) {
    var itemData = item.toJSON();
    itemData.position = {
        x: 0,
        y: 0
    };
    console.log(items, itemData);
    (items.add || items.push).apply(items, [itemData]);
    scope.model.items.remove(item);
    setItemsSize(scope);
}

function setItemsSize(scope) {
    var width = 0,
        height = 0;
    scope.model.items.forEach(function(item) {
        if (item.bounds.max.x > width) {
            width = item.bounds.max.x;
        }
        if (item.bounds.max.y > height) {
            height = item.bounds.max.y;
        }


        refreshItemDimensionn(scope, item);

    });
    scope.itemsEl.style.cssText = 'width: ' + width + 'px; height: ' + height + 'px;';
    if (scope.view) {
        scope.view.scrollContent.refresh();
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
        viewModel.getIfExists('itemControl', function(itemControl) {
            itemControl.items = item.items || [];
            item.items = itemControl.items;

        });
    });
}

function selectItem(scope, item) {
    if (!item.disabled) {
        scope.move_item = item;
        if (item.selected) {
            if (TYPES.ITEM_TYPE.DIRECTORY.is(item.type)) {
                scope.targetModel.selectedItems.remove(item);
                showFolder(scope, item);
                item.disabled = true;
            } else {
                scope.targetModel.selectedItems.remove(item);
                switch (item.type) {
                    case TYPES.ITEM_TYPE.LINK:
                        global.open(item.linkUrl, '_blank');
                        break;

                    default:

                }
            }
            scope.move_item = null;
        } else {
            scope.targetModel.selectedItems.add(item);
        }
    }
}

function renderItem(scope, item) {

    item.on('change:title', onRefreshItemTitle, scope);
    item.on('change:icon', onRefreshItemIcon, scope);

    refreshItemElement(scope, item);

    setItemsSize(scope);
}

function refreshItemElement(scope, item) {
    var node;
    var lastNode = scope.itemElMap[item.id];
    if (TYPES.ICON_TYPE.SVG.is(item.iconType) || TYPES.ICON_TYPE.DEFAULT.is(item.iconType)) {
        node = svgTmpl.generate({
            svg: icons[item.icon.key](),
            title: item.title,
        });
    } else if (TYPES.ICON_TYPE.IMG.is(item.iconType)) {
        node = imageTmpl.generate({
            svg: icons[item.icon.key](),
            title: item.title,
        });
    }
    node = node.children[0];
    node.setAttribute('data-id', item.id);
    node.setAttribute('data-type', item.type.key);

    if (lastNode) {
        scope.itemsEl.replaceChild(node, lastNode);
    } else {
        scope.itemsEl.appendChild(node);
    }
    scope.itemElMap[item.id] = node;

    refreshItemDimensionn(scope, item);
}

function refreshItemDimensionn(scope, item) {
    if (scope.itemElMap[item.id]) {
        item.dimension.resetValues(scope.itemElMap[item.id].offsetWidth, scope.itemElMap[item.id].offsetHeight);
        refreshBounds(scope, item, item.bounds.min.x, item.bounds.min.y);
    }
}

function refreshItemPosition(scope, item) {
    var bounds = item.bounds;
    if (item.moving) {
        bounds = item.screenBounds;
    }
    scope.itemElMap[item.id].style.cssText = 'position: absolute; left: ' + bounds.min.x + 'px; top: ' + bounds.min.y + 'px;';
}

function refreshBounds(scope, item, x, y) {

    // x = Math.min(Math.max(x, 0), scope.targetModel.dimension.x - item.dimension.x);
    // y = Math.min(Math.max(y, 0), scope.targetModel.dimension.y - item.dimension.y);
    x = Math.min(x, scope.targetModel.dimension.x - item.dimension.x);
    y = Math.min(y, scope.targetModel.dimension.y - item.dimension.y);

    var bounds = item.bounds,
        screenBounds = item.screenBounds;
    bounds.min.x = x;
    bounds.min.y = y;
    bounds.max.x = bounds.min.x + item.dimension.x;
    bounds.max.y = bounds.min.y + item.dimension.y;

    if (scope.view) {
        x += scope.view.bounds.min.x;
        y += scope.view.bounds.min.y;
    }

    screenBounds.min.x = x;
    screenBounds.min.y = y;
    screenBounds.max.x = screenBounds.min.x + item.dimension.x;
    screenBounds.max.y = screenBounds.min.y + item.dimension.y;

    refreshItemPosition(scope, item);
}

// events model

function onChangeItems(model, items) {
    var tmpItems = [];
    if (!(items instanceof ItemSubCollection) && !(items instanceof ItemCollection)) {
        tmpItems = items;
        model.items = items = new ItemSubCollection();
    }
    items.on('add', onAdd, this);
    items.on('reset', onReset, this);
    items.on('remove', onRemove, this);
    items.forEach(function(item) {
        renderItem(this, item);
    }.bind(this));
    console.log('tmpItems', tmpItems.length);
    items.add(tmpItems);
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
    model.itemControl = this.model;
    model.on('destroy', function(model) {
        removeItemEl(this, model.id);
    }, this);
    model.on('event:refreshBounds', function(model) {
        refreshBounds(this, model);
    }, this);
    model.on('change:selected', function(model, selected) {
        this.itemElMap[model.id].classList.toggle('js-selected', selected);
    }, this);
    model.on('change:moving', function(model, moving) {
        this.itemElMap[model.id].classList.toggle('js-moving', moving);
    }, this);
    renderItem(this, model);
}

function onRemove(model) {
    this.itemElMap[model.id].remove();
    model.off(null, null, this);
}

function onRefreshItemTitle(model) {
    refreshItemElement(this, model);
}

function onRefreshItemIcon(model) {
    refreshItemElement(this, model);
}


// events dom

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


function onPointerUpItem() {

    $(document).off('pointerup.itemControl_' + this.cid);
    $(document).off('pointermove.itemControl_' + this.cid);

    if (this.move_moved) {
        this.targetModel.selectedItems.remove(this.move_item);
        toggleHelperMove(this, this.move_item, false);
        this.move_moved = false;
        this.move_item.moving = false;

        var intersectedItemControl = intersectOtherItemControl(this, this.move_item);
        // console.log(intersectedItemControl, this.move_item.itemControl.cid, intersectedItemControl.cid);

        if (intersectedItemControl) {

            var intersectedItem;
            for (var i = 0; i < intersectedItemControl.items.length; i++) {
                intersectedItem = intersectedItemControl.items.models[i];
                if (!intersectedItem.equal(this.move_item) && intersectedItem.screenBounds.intersects(this.move_item.screenBounds)) {
                    break;
                }
                intersectedItem = null;
            }
            if (intersectedItem) {
                // intersects directory icon
                moveItem(this, intersectedItem.items, this.move_item);
            } else if (this.move_item.itemControl.cid !== intersectedItemControl.cid) {
console.log('BAaaaaaaaam!');
                if (this.view && this.view.cid === intersectedItemControl.cid) {
                    // console.log('test!!!!');
                } else {
                    // intersects other icon-control
                    moveItem(this, intersectedItemControl.items, this.move_item);
                }

            }

        }
        refreshBounds(this, this.move_item, this.move_item.bounds.min.x, this.move_item.bounds.min.y);
        this.move_item = null;
    }
}

function onPointerMove(e) {
    var x = e.clientX;
    var y = e.clientY;
    if (!this.move_moved) {
        toggleHelperMove(this, this.move_item, true);
    }
    this.move_moved = true;
    this.move_movePosition.setX(x - this.move_moveOffset.x).setY(y - this.move_moveOffset.y);
    this.move_item.moving = true;
    refreshBounds(this, this.move_item, this.move_movePosition.x, this.move_movePosition.y);
    setItemsSize(this);
}
