"use strict";

var Bounds = require('agency-pkg-base/Bounds');

var uniqueId = require('lodash/uniqueId');
var TYPES = require('../../utils/types');

module.exports = {
    session: {
        bounds: {
            type: 'Bounds',
            required: true,
            default: function() {
                return new Bounds();
            }
        },
        disabled: {
            type: 'boolean',
            required: true,
            default: function() {
                return false;
            }
        },
        id: {
            type: 'string',
            required: true,
            default: function() {
                return uniqueId();
            }
        },
        iconType: {
            type: 'enum',
            required: true,
            default: function() {
                return TYPES.ICON_TYPE.DEFAULT;
            }
        },
        icon: {
            type: 'enum',
            required: true,
            default: function() {
                return TYPES.ICON.DISK_1;
            }
        },
        type: {
            type: 'enum',
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

    /**
     * Override sync for disable ajax from ampersand-model
     */
    sync: function() {
        return;
    },

    toArray: function() {
        function getItems(items) {
            var data = [];
            items.forEach(function(item) {
                console.log(item);
                data.push(item.toArray());
            });
            return data;
        }
        var data = {
            position: {
                x: this.bounds.min.x,
                y: this.bounds.min.y
            },
            id: this.iconType.key,
            iconType: this.iconType.key,
            icon: this.icon.key,
            type: this.type.key,
            title: this.title,
        };
        if (this.items) {
            data.items = getItems(this.items);
        }
        return data;
    }
};