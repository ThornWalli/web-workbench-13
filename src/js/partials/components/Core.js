"use strict";

var viewport = require('agency-pkg-service-viewport');
var Controller = require('agency-pkg-base/Controller');
var ApplicationModel = require('../../base/ApplicationModel');
var workbenchConfig = require('../../services/workbenchConfig');
require('pepjs');

// Libs
var FileApplication = require('../../applications/File');
var menuItems = require('./core/menuItems.json');

module.exports = Controller.extend({

    // ViewControl, ApplicationControl
    readyMaxCount: 2,
    readyCount: 0,

    errors: [],

    modelConstructor: ApplicationModel.extend({
        session: {
            applicationStatic: {
                type: 'boolean',
                required: true,
                default: true
            },
            applicationName: {
                type: 'string',
                required: true,
                default: 'Core'
            },
            applicationMenuItems: {
                type: 'object',
                default: function() {
                    return menuItems;
                }
            },
            ready: {
                type: 'boolean',
                required: true,
                default: false
            },
            itemsSelected: {
                type: 'boolean',
                required: true,
                default: false
            },
            viewControl: {
                type: 'object',
                required: true,
                default: null
            },
            applicationControl: {
                type: 'object',
                required: true,
                default: null
            }
        },
        refresh: function() {
            this.trigger('Core:refresh');
        },

        registerViewControl: function(control) {
            this.viewControl = control;
            control.core = this;
        },
        registerApplicationControl: function(control) {
            this.viewControl = control;
            control.core = this;
        }
    }),

    bindings: {
        'model.itemsSelected': {
            type: 'booleanClass',
            yes: 'js-workbench-items-selected'
        }
    },


    events: {
        'click .screen-button': function() {
            this.el.classList.toggle('js-workbench-off');
        }
    },

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        this.model.on('change:ready', onReady, this);
        this.model.getIfExists('viewControl', onChangeCheckReady, this);
        this.model.getIfExists('applicationControl', onChangeCheckReady, this);

        workbenchConfig.on('change:core-background-wrapper-1084', function(value) {
            toggleScreenBackground(this, value);
        }.bind(this));
        if (workbenchConfig.get('core-background-wrapper-1084')) {
            toggleScreenBackground(this, true);
        }
        viewport.on('RESIZE', function() {
            this.model.refresh();
        }.bind(this));

// prevent context menu
        // global.addEventListener('contextmenu', function (e) {
        //     e.preventDefault();
        // });
    }

});

function onReady(model) {
    // register static application core
    model.applicationControl.register(this.model);
    model.applicationControl.register(new FileApplication());
}

function onChangeCheckReady() {
    this.readyCount++;
    this.model.ready = this.readyCount === this.readyMaxCount;
}

function toggleScreenBackground(scope, active) {
    scope.el.classList.toggle('js-with-screen', active);
    global.animationFrame.add(function() {
        viewport.update();
        scope.model.refresh();
    });
}
