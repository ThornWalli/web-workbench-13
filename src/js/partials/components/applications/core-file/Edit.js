"use strict";

var ApplicationController = require('../../../../base/ApplicationController');

module.exports = ApplicationController.extend({

    template_listItem: null,

    modelConstructor: ApplicationController.prototype.modelConstructor.extend({
        session: {
            applicationName: {
                type: 'string',
                required: true,
                default: 'FileEdit'
            },
            fileType: {
                type: 'string',
                required: true,
                default: 'link'
            }
        }
    }),

    bindings: {
        'model.fileType': {
            type: function(el, value, previousValue) {
                el.classList.remove('js-' + previousValue);
                el.classList.add('js-' + value);
                if (this.view) {
                    this.view.refreshDimension();
                }
            }
        }
    },

    events: {
        'change [data-hook="file-type"]': onChangeFileType
    },

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);

        setup_form(this);
    }

});

function setup_form(scope) {
    scope.formEl = scope.queryByHook('form');
    scope.formEl.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('submit!');
    });
}

function onChangeFileType(e) {
    this.model.fileType = e.target.value;
}
