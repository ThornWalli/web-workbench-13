"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('../../base/DomModel');

require('pepjs');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend(require('../../base/collectionTypeDefinition'), {
        session: {
            core: {
                type: 'object',
                required: true,
                default: null
            },
            applications: {
                type: 'ApplicationCollection',
                required: true
            }
        },

        register: function(application) {
            this.applications.add(application);
            application.applicationControl = this;
            application.trigger('Application:register', application, this);
            this.trigger('ApplicationControl:register', this);
        },
        unregister: function(application) {
            this.applications.remove(application);
            application.trigger('Application:unregister', application, this);
            this.trigger('ApplicationControl:unregister', this);
        }
    }),

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        if (!this.targetModel) {
            console.error('target not defined');
            return;
        } else {
            this.targetModel.applicationControl = this.model;
            this.model.core = this.targetModel;
        }

        var core = this.model.core;
        core.getIfExists('ready', function() {
            core.viewControl.selectedItems.on('all', function() {
                core.itemsSelected = core.viewControl.selectedItems.length > 0;
            }, this);
            core.on('change:itemsSelected', function(model, itemsSelected) {
                document.querySelector('.js-applications-control-file').classList.toggle('js-disabled', !itemsSelected);
            }, this);


            // core.viewControl.createDialog({
            //     title: lang.applications.file.dialogs.discard.title,
            //     text: lang.applications.file.dialogs.discard.text,
            //     buttons: [{
            //         name: 'yes',
            //         title: 'Yes',
            //         callback: function(dialog) {
            //             dialog.close();
            //         }
            //     }, {
            //         name: 'no',
            //         title: 'No',
            //         callback: function(dialog) {
            //             dialog.close();
            //         }
            //     }]
            // });
        }.bind(this));
    }
});
