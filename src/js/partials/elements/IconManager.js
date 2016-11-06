"use strict";

var ViewController = require('../../base/ViewController');
var DomModel = require('agency-pkg-base/DomModel');

require('pepjs');

module.exports = ViewController.extend({

    modelConstructor: DomModel.extend(require('../../base/collectionTypeDefinition'), {
        session: {
            core: {
                type: 'object',
                required: true,
                default: null
            }
        }
    }),

    initialize: function() {
        ViewController.prototype.initialize.apply(this, arguments);
        this.targetModel.selectedItems.on('all', function() {
            console.log(this.targetModel.selectedItems.length);
            this.targetModel.core.itemsSelected = this.targetModel.selectedItems.length > 0;
        }, this);
        this.targetModel.core.on('change:itemsSelected', function(model, itemsSelected) {
            document.querySelector('.js-icon-manager-control-discard').classList.toggle('js-disabled', !itemsSelected);
        }, this);


        document.querySelector('pointerdown', '.js-icon-manager-control-new', function() {

        });
        // this.targetModel.createDialog({
        //     title: 'New File',
        //     text: 'Create a new File ?',
        //     buttons: [{
        //         title: 'Yes'
        //     }, {
        //         title: 'No'
        //     }]
        // });
        this.targetModel.createDialog({
            title: 'Discard File',
            text: 'Would you like remove file ?',
            buttons: [{
                name: 'yes',
                title: 'Yes',
                callback: function(dialog) {
                    dialog.close();
                }
            }, {
                name: 'no',
                title: 'No',
                callback: function(dialog) {
                    dialog.close();
                }
            }]
        });
        // this.targetModel.on('change:itemControl', function(model, itemControl){
        //     itemControl.selec
        // },this);
        // $(document).on('click', '.js-click-view-open', onClickWindowOpen.bind(this));
    }
});
