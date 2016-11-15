"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');

var ContextualFragment = require('../../base/ContextualFragment');
var contextMenuTmpl = new ContextualFragment(require('./header/context-menu-tmpl.hbs'));

var lang = require('../../services/lang');

module.exports = Controller.extend({

    core: null,

    modelConstructor: DomModel.extend({
        session: {
            items: {
                type: 'object'
            }
        },
        renderItems: function(items) {
            this.items = items;
            this.trigger('Navigation:renderItems');
        }
    }),

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

            this.core = this.targetModel;
            this.core.getIfExists('ready', function() {
                this.menuEl = this.queryByHook('menu');
                this.model.on('change:items', onChangeItems, this);
                this.core.applicationControl.on('ApplicationControl:register', onRefreshNavigation, this);
                this.core.applicationControl.on('ApplicationControl:unregister', onRefreshNavigation, this);
                onRefreshNavigation.bind(this)(this.core.applicationControl);
            }, this);

        }
    }

});


function onChangeItems() {

    lang.parse(this.model.items);
    if (this.menuEl.childElementCount > 0) {
        this.menuEl.replaceChild(contextMenuTmpl.generate(this.model.items), this.menuEl.children[0]);
    } else {
        this.menuEl.appendChild(contextMenuTmpl.generate(this.model.items));
    }

}

function onRefreshNavigation(applicationControl) {
    console.log(applicationControl);
    var items = [];
    applicationControl.applications.forEach(function(application) {
        if (application.applicationMenuItems) {
            items = items.concat(application.applicationMenuItems);
        }
    }.bind(this));
    items.sort(function(a, b) {
        if (a.order > b.order) {
            return 1;
        } else if (a.order === b.order) {
            return 0;
        }
        return -1;
    });

    lang.parse(items);
    this.model.items = items;
}

function onClickWindowOpen(e) {
    e.preventDefault();
    console.log(e.currentTarget.dataset);
    this.core.viewControl.openView(e.currentTarget.dataset.viewPath || e.currentTarget.href, {
        scaleable: e.currentTarget.dataset.scaleable || false,
        scrollable: e.currentTarget.dataset.scrollable || false
    });
}
