"use strict";
// var dataTypeDefinition = require('agency-pkg-base/dataTypeDefinition');
module.exports = {
    dataTypes: {
        ItemCollection: getDefinition('ItemCollection', require('./itemControl/ItemCollection')),
        ItemSubCollection: getDefinition('ItemSubCollection', require('./itemControl/ItemSubCollection'))
    }
};

function getDefinition(type, constructor) {

    return {
        set: function(obj) {
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
            return new constructor();
        }
    };
}
