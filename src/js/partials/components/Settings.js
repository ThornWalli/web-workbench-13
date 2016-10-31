"use strict";

var Controller = require('agency-pkg-base/Controller');
var DomModel = require('agency-pkg-base/DomModel');
var workbenchConfig = require('../../services/workbenchConfig');

module.exports = Controller.extend({


    modelConstructor: DomModel.extend({

    }),

    events: {
        'change input': onChange,
        'change select': onChange
    },


    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        getFields(this);

        loadData(this, workbenchConfig.data);
        // getFormData(this)
    }

});

function onChange() {

    var data = getFormData(this);
    workbenchConfig.set(data);

}

function getFields(scope) {

    var fields = scope.queryAll('input,textarea,select');
    scope.fieldMap = {};
    fields.forEach(function(element) {
        if (element.name) {
            scope.fieldMap[element.name] = element;
        }
    });
    console.log(fields, scope.fieldMap);
    return fields;
}

function loadData(scope, data) {
    console.log('loadData', data);
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
    scope.queryAll('input,select').forEach(function(input) {
        console.log(input);
        data[input.name] = getValue(input);
    });
    console.log('data', data);
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
