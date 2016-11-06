"use strict";

var uniqueId = require('lodash/uniqueId');
var TYPES = require('../../utils/types');
var AmpersandModel = require('ampersand-model');

module.exports = {

    // dataTypes: {
    //
    // },


    session: {
        bounds: {
            type: 'Bounds',
            required: true
        },
        dimension: {
            type: 'Vector',
            required: true
        },
        selected: {
            type: 'boolean',
            required: true,
            default: false
        },
        disabled: {
            type: 'boolean',
            required: true,
            default: false
        },
        id: {
            type: 'string',
            required: true,
            default: function() {
                return uniqueId();
            }
        },
        iconType: {
            type: 'IconTypeEnum',
            required: true,
            default: function() {
                return TYPES.ICON_TYPE.DEFAULT;
            }
        },
        icon: {
            type: 'IconEnum',
            required: true,
            default: function() {
                return TYPES.ICON.DISK_1;
            }
        },
        type: {
            type: 'ItemEnum',
            required: true,
            default: function() {
                return TYPES.ITEM.DEFAULT;
            }
        },
        title: {
            type: 'string',
            required: true,
            default: function() {
                return 'Item Title';
            }
        },
        items: {
            type: 'ItemSubCollection',
            required: false
        }
    },

    // #########################

    initialize: function(options) {
        AmpersandModel.prototype.initialize.apply(this, arguments);
        if (options.position) {
            this.bounds.min.x = options.position.x;
            this.bounds.min.y = options.position.y;
        }
    },

    refreshBounds: function() {
        this.trigger('event:refreshBounds');
    },

    toArray: function() {
        function getItems(items) {
            var data = [];
            items.forEach(function(item) {
                console.log(item);
                data.push(!!item.toArray ? item.toArray() : item);
            });
            return data;
        }
        var data = {
            position: {
                x: this.bounds.min.x,
                y: this.bounds.min.y
            },
            // id: this.id,
            iconType: this.iconType.key,
            icon: this.icon.key,
            type: this.type.key,
            title: this.title,
        };
        if (this.items) {
            data.items = getItems(this.items);
        }
        return data;
    },


    /**
     * Override sync for disable ajax from ampersand-model
     */
    sync: function() {
        return;
    }
};
