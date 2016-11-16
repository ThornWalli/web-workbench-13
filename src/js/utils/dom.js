"use strict";

module.exports = {
    closestWithView: function(selector, node) {
        if (node.parentElement) {
            var closest = node.parentElement.querySelector(selector);
            if ((!closest || closest && closest !== node)) {
                return this.closestWithView(selector, node.parentElement);
            }
            return closest;
        }
        return null;
    }
};
