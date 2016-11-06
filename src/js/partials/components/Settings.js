"use strict";

var ViewController = require('../../base/ViewController');
var DomModel = require('agency-pkg-base/DomModel');
var workbenchConfig = require('../../services/workbenchConfig');

module.exports = ViewController.extend({


    modelConstructor: DomModel.extend({

    }),

    events: {
        'change input': onChange,
        'change select': onChange,
        'click [data-hook="save"]': onClickSave,
        'click [data-hook="debug-overview"]': onClickDebugOverview
    },


    initialize: function() {
        ViewController.prototype.initialize.apply(this, arguments);
        getFields(this);
        loadData(this, workbenchConfig.data);
        if (this.view) {
            this.view.on('destroy', function() {
                this.destroy();
            }, this);
        }
    }

});

function save(scope, cb) {
    var data = getFormData(scope);
    workbenchConfig.set(data);
    cb();
}

function onChange() {
    save(this);
}

function onClickSave() {
    save(this, function() {
        if (this.view) {
            this.view.close();
        }
    }.bind(this));
}

function onClickDebugOverview() {

}

function getFields(scope) {

    var fields = scope.queryAll('input,textarea,select');
    scope.fieldMap = {};
    fields.forEach(function(element) {
        if (element.name) {
            scope.fieldMap[element.name] = element;
        }
    });
    return fields;
}

function loadData(scope, data) {
    data.forEach(function(entry) {
        var el = scope.fieldMap[entry.name];
        if (el && isInput(el)) {
            if (isInputCheckbox(el) || isInputRadio(el)) {
                el.checked = entry.value;
            }
        }
    });
}

function getFormData(scope) {
    var data = [];
    scope.queryAll('input[type="text"],input[type="checkbox"],input[type="radio"],input[type="number"],input[type="email"],select,textarea').forEach(function(input) {
        data.push({
            name: input.name,
            value: getValue(input)
        });
    });
    return data;

}

function getValue(element) {

    if (isInput(element)) {

        if (isInputCheckbox(element) || isInputRadio(element)) {

            if (element.checked) {
                return element.value === 'on' ? true : element.value;
            }
            return false;

        } else {
            return element.value;
        }

    } else if (isSelect(element)) {
        return element.value;
    }

    return false;
}

function isInputRadio(el) {
    return el.type === 'radio';
}

function isInputCheckbox(el) {
    return el.type === 'checkbox';
}

function isInput(el) {
    return el.tagName.toLowerCase() === 'input';
}

function isSelect(el) {
    return el.tagName.toLowerCase() === 'select';
}
