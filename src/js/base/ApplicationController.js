"use strict";

var ViewController = require('./ViewController');

module.exports = ViewController.extend({

    application: null,
    ViewController: function() {
        ViewController.prototype.initialize.apply(this, arguments);
        var controller = $(this.el).closest('[data-partial="components/workbench"]').find('[data-partial="elements/applications"]').data('controller');
        if (controller && controller.model) {
            this.view = controller.model;
        }
    }

});
