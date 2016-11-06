"use strict";

var Controller = require('agency-pkg-base/Controller');

module.exports = Controller.extend({

    view: null,
    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        var controller = $(this.el).closest('[data-partial="components/view"]').data('controller');
        if (controller && controller.model) {
            this.view = controller.model;
        }
    }

});
