
"use strict";

module.exports = {
    dataTypes: {
        Form: getDefinition('Form', require('../services/Form'))
    }
};

function getDefinition(type, constructor, defaultValue) {

    return {
        set: function(obj) {
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
