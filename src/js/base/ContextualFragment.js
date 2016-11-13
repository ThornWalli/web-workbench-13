"use strict";


var ContextualFragment = function(template) {
    this.template = template;
};

ContextualFragment.prototype.generate = function(data) {
    return document.createRange().createContextualFragment(this.template(data));
};

module.exports = ContextualFragment;
