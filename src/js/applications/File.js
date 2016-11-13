"use strict";

var ApplicationModel = require('../base/ApplicationModel');
var menuItems = require('./file/menuItems.json');
module.exports = ApplicationModel.extend({

    session: {
        applicationStatic: {
            type: 'boolean',
            required: true,
            default: true
        },
        applicationName: {
            type: 'string',
            required: true,
            default: 'File'
        },
        applicationMenuItems: {
            type: 'object',
            default: function() {
                return menuItems;
            }
        },
        type: {
            type: 'string',
            required: true,
            default: 'file'
        }
    },
    initialize: function() {
        ApplicationModel.prototype.initialize.apply(this, arguments);
    }

});
