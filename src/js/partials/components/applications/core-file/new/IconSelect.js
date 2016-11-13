"use strict";

var ApplicationController = require('../../../../../base/ApplicationController');

var ContextualFragment = require('../../../../../base/ContextualFragment');
var TYPES = require('../../../../../utils/types');
var icons = require('../../../../../utils/icons');
var iconSelectTmpl = new ContextualFragment(require('./iconSelect/icon-select-icons.hbs'));

module.exports = ApplicationController.extend({

    template_listItem: null,

    modelConstructor: ApplicationController.prototype.modelConstructor.extend({
        session: {
            applicationName: {
                type:'string',
                required:true,
                default: 'FileNewIconSelect'
            },
            icon: {
                type: 'IconEnum',
                required: true,
                default: function() {
                    return TYPES.ICON.DEFAULT;
                }
            }
        }
    }),


    events: {
        'change input': onChange
    },

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
        this.model.on('change:icon', function(model, icon) {
            selectIcon(this, icon);
        }, this);
        this.iconsEl = this.queryByHook('icons');
        renderIcons(this);
        selectIcon(this, this.model.icon);
    }

});

function selectIcon(scope, icon) {
    getListNode(scope.iconsEl).querySelector('input[value="' + icon.key + '"]').checked = true;
}

function renderIcons(scope) {
    var templates = [];
    TYPES.ICON.enums.forEach(function(enumType) {
        templates.push({
            svg: icons[enumType.key](),
            name: enumType.key
        });
    }.bind(scope));
    scope.iconsEl.replaceChild(iconSelectTmpl.generate({
        icons: templates,
        id: scope.cid
    }), getListNode(scope.iconsEl));
}

function onChange(e) {
    this.model.icon = e.target.value;
}

function getListNode(node) {
    return node.children[0];
}
