"use strict";

var Enum = require('enum');
var EnumItem = require('enum/dist/enumItem');
var types = require('../utils/types');
module.exports = {
    dataTypes: {
        ItemEnum: getDefinition('ItemEnum', EnumItem, types.ITEM),
        ItemTypeEnum: getDefinition('ItemTypeEnum', EnumItem, types.ITEM_TYPE),
        IconEnum: getDefinition('IconEnum', EnumItem, types.ICON),
        IconTypeEnum: getDefinition('IconTypeEnum', EnumItem, types.ICON_TYPE),
        LinkTargetEnum: getDefinition('LinkTargetEnum', EnumItem, types.LINK_TARGET)
    }
};

function getDefinition(type, constructor, defaultValue) {

    return {
        set: function(obj) {
            if (typeof obj === 'string' && defaultValue instanceof Enum) {
                return {
                    val: defaultValue.get(obj) || defaultValue.enums[0],
                    type: type
                };
            } else
            if (obj === defaultValue) {
                return {
                    val: obj,
                    type: type
                };
            } else
            if (obj instanceof constructor) {
                return {
                    val: obj,
                    type: type
                };
            } else if (obj instanceof Object) {
                return {
                    val: new constructor(obj),
                    type: type
                };
            } else {
                return {
                    val: obj,
                    type: typeof obj
                };
            }
        },

        compare: function(currentObj, obj) {
            return currentObj === obj;
        },

        default: function() {
            return new constructor(defaultValue);
        }
    };
}
