"use strict";



var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');


var imageTmpl = require('./iconControl/icon-image.hbs');
var svgTmpl = require('./iconControl/icon-svg.hbs');
var icons = require('../../utils/icons');
var TYPES = require('../../utils/types');

require('pepjs');


module.exports = Controller.extend({

    modelConstructor: DomModel.extend(require('../../base/collectionTypeDefinition'), {
        session: {
            items: {
                type: 'ItemCollection',
                required: true
            }
        }
    }),


    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        function onChangeItems(model, items) {
            console.log(arguments, 'Adsd');
            items.on('reset', onReset, this);
            items.on('add', onAdd, this);
            items.forEach(function(item) {
                renderItem(this, item);
            }.bind(this));
        }
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





        $(document).on('pointermove.iconControl_' + this.cid, onPointerMove.bind(this));
        $(document).on('pointerdown.iconControl_' + this.cid, '.icon-control-' + this.cid + '>.items>*', onPointerDownItem.bind(this));

        var $viewEl = $(this.el).closest('[data-partial="components/view"]');
        if ($viewEl.length > 0) {
            this.viewModel = this.targetModel.getViewModel($viewEl.attr('data-id'));
            this.viewModel.iconControl = this.model;
            this.viewModel.on('destroy', function() {
                $(document).off('pointermove.iconControl_' + this.cid);
                $(document).off('pointerdown.iconControl_' + this.cid);
            }.bind(this));
        } else {
            this.targetModel.iconControl = this.model;
        }

    }
});

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
    console.log('IconControl ADD', model.title);
    console.log(arguments);
    model.on('destroy', function(model) {
        removeItemEl(this, model.id);
    }, this);
    renderItem(this, model);
}

function onPointerMove() {

}

function onPointerDownItem(e) {
    selectItem(this, this.model.items.get(e.currentTarget.dataset.id));
}

function showFolder(scope, item) {
    scope.targetModel.openView('./pages/workbench/folder.html', {
        title: item.title
    }, function(viewModel) {
        viewModel.on('destroy', function() {
            scope.itemElMap[item.id].classList.remove('js-selected');
            item.disabled = false;
        });

        function changeIconControl(model, iconControl) {
            console.log('item.items', item.items);
            iconControl.items = item.items;
        }
            viewModel.on('change:iconControl', changeIconControl);
        if (viewModel.iconControl) {
            changeIconControl(scope.model, viewModel.iconControl);
        }
    });
}

function selectItem(scope, item) {
    if (!item.disabled) {
        console.log(item.type);
        if (TYPES.ITEM.FOLDER.is(item.type)) {
            console.log('select FOLDER', item);
            showFolder(scope, item);
            scope.itemElMap[item.id].classList.add('js-selected');
            item.disabled = true;
        } else {
            console.log('select Item', item);
        }
    }
}


function renderItem(scope, item) {
    var html;
    if (TYPES.ICON_TYPE.SVG.is(item.iconType) || TYPES.ICON_TYPE.DEFAULT.is(item.iconType)) {
        console.log( item.icon.key,icons);
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
        console.log('render item', item, item.title);
    scope.iconBuilderEl.innerHTML = html;
    var element = scope.iconBuilderEl.children[0];
    element.setAttribute('data-id', item.id);
    scope.itemsEl.appendChild(element);

    scope.itemElMap[item.id] = element;
}
