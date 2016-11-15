"use strict";

var uniqueId = require('lodash/uniqueId');
var TYPES = require('../../utils/types');
var Model = require('../Model');
module.exports = {

    session: {

        bounds: {
            type: 'Bounds',
            required: true
        },
        screenBounds: {
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
        moving: {
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
        name: {
            type: 'string',
            required: true
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
            type: 'ItemTypeEnum',
            required: true,
            default: function() {
                return TYPES.ITEM_TYPE.DEFAULT;
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
            type: 'object',
            required: false
        },

        linkUrl: {
            type: 'string',
            required: true,
            default: function() {
                return null;
            }
        },
        code: {
            type: 'string',
            required: true,
            default: function() {
                return null;
            }
        },
        src: {
            type: 'string',
            required: true,
            default: function() {
                return null;
            }
        },
        itemControl: {
            type: 'object',
            required: true,
            default: null
        }

    },

    // #########################

    initialize: function(options) {
        Model.prototype.initialize.apply(this, arguments);
        if (options.position) {
            this.bounds.min.x = options.position.x;
            this.bounds.min.y = options.position.y;
        }
    },

    refreshBounds: function() {
        this.trigger('event:refreshBounds');
    },

    toJSON: function() {
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
            linkUrl: this.linkUrl,
            code: this.code,
            src: this.src,
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

function getItems(items) {
    var data = [];
    items.forEach(function(item) {
        data.push(!!item.toJSON ? item.toJSON() : item);
    });
    return data;
}
