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
            $(document).on('click', '.js-click-view-open', onClickWindowOpen.bind(this));
        }
    }

});

function onClickWindowOpen(e) {
    e.preventDefault();
    console.log(e.currentTarget.dataset);
    this.targetModel.openView(e.currentTarget.dataset.viewPath || e.currentTarget.href, {
        scaleable: e.currentTarget.dataset.scaleable || false,
        scrollable: e.currentTarget.dataset.scrollable || false
    });
}
