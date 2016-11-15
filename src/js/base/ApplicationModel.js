"use strict";

var Model = require('./Model');

module.exports = Model.extend({
    session: {
        applicationStatic: {
            type: 'boolean',
            required: true,
            default: false
        },
        applicationName: {
            type: 'string',
            required: true,
            default: 'Default Application'
        },
        applicationMenuItems: {
            type: 'object',
            required: true,
            default: null
        },
        applicationForm: {
            type: 'Form',
            required: false,
            default: null
        },
        applicationControl: {
            type: 'object',
            required: true,
            default: null
        }
    }
});
