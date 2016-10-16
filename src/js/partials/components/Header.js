"use strict";

var Controller = require('agency-pkg-base/Controller');

module.exports = Controller.extend({

    events: {},

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);
        this.setup();
    },
    setup: function() {
        /**
         * Override this function
         */
        if (this.targetModel) {
            $(document).on('click', '.js-click-window-open', onClickWindowOpen.bind(this));
        }
    }

});

function onClickWindowOpen(e) {
    e.preventDefault();
    this.targetModel.openWindow(e.currentTarget.getAttribute('href'), {
        scrollbar: e.currentTarget.dataset.scrollbar || false
    });
}
