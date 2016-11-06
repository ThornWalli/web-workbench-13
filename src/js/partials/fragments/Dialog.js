"use strict";

var ViewController = require('../../base/ViewController');
var DomModel = require('agency-pkg-base/DomModel');

require('pepjs');

module.exports = ViewController.extend({

    buttonElMap: null,
    buttonsEl: null,

    modelConstructor: DomModel.extend(require('../../base/collectionTypeDefinition'), {
        session: {
            buttons: {
                type: 'array',
                required: true,
                default: function() {
                    return [];
                }
            }
        },
        close: function() {
            this.trigger('event:close');
        }
    }),

    initialize: function() {
        ViewController.prototype.initialize.apply(this, arguments);
        this.model.on('event:close', function() {
            this.view.close();
        }, this);
        setupButtons(this);

        if (this.view) {
            this.view.dialog = this.model;
            this.view.on('destroy', function() {}.bind(this));
        } else if (this.targetModel) {
            this.targetModel.dialog = this.model;
        }
    }
});

function setupButtons(scope) {
    scope.buttonsEl = scope.queryByHook('buttons');
    scope.buttonElMap = {};

    scope.buttonsEl.querySelectorAll('[data-partial^="elements/button"]').forEach(function(el) {
        scope.buttonElMap[el.getAttribute('name')] = el;
    });

    // Map ButtonEl with Button Object
    scope.model.on('change:buttons', function(model, buttons) {
        buttons.forEach(function(button) {
            button.el = scope.buttonElMap[button.name];
            button.el.addEventListener('pointerup', function(e) {
                e.preventDefault();
                e.stopPropagation();
                button.callback(scope.model, e);
            });
        });
    });
}
