"use strict";

var map = require('lodash/map');
var template = require('lodash/template');
var lang = require('../../data/globals/lang.json');

var Lang = function() {
    this.data = lang;
};

Lang.prototype.parse = function(value) {
    if (Array.isArray(value)) {
        return parseItems(this, value);
    } else {
        return template(value)({
            lang: this.data
        });
    }
};

module.exports = new Lang();

function parseItems(scope, items) {
    return map(items, function(item) {
        if (item.items) {
            parseItems(scope, item.items);
        }
        if (item.title) {
            item.title = scope.parse(item.title);
        }
        return item;
    });
}
