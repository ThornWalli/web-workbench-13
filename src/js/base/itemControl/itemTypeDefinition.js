"use strict";

var Enum = require('enum');
var EnumItem = require('enum/dist/enumItem');
module.exports = {
    dataTypes: {
        ItemEnum: getDefinition('ItemEnum', EnumItem, require('../../utils/types').ITEM),
        IconEnum: getDefinition('IconEnum', EnumItem, require('../../utils/types').ICON),
        IconTypeEnum: getDefinition('IconTypeEnum', EnumItem, require('../../utils/types').ICON_TYPE)
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
