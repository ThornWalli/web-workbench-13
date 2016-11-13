"use strict";

var ViewController = require('./ViewController');
var ApplicationModel = require('./ApplicationModel');

var Form = require('../services/Form');

module.exports = ViewController.extend({

    applicationControl: null,
    form: null,

    modelConstructor: ApplicationModel.extend({
        session: {}
    }),

    initialize: function() {
        ViewController.prototype.initialize.apply(this, arguments);
        var controller = $(this.el).closest('[data-partial="components/core"]').data('controller');
        if (controller && controller.model) {
            this.applicationControl = controller.model.applicationControl;
            this.model.on('Application:register', this.register, this);
            this.model.on('Application:unregister', this.unregister, this);
            this.applicationControl.register(this.model);
            if (this.view) {
                this.view.application = this.model;
                this.view.on('destroy', function() {
                    this.applicationControl.unregister(this.model);
                }, this);
            }
        }
        var formEl = this.queryByHook('form');
        if (formEl) {
            this.model.applicationForm = new Form(formEl);
        }
    },

    register: function() {
        console.log('application', 'register', this.model.applicationName);
    },
    unregister: function() {
        console.log('application', 'unregister', this.model.applicationName);
    }

});
