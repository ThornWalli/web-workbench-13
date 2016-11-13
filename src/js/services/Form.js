"use strict";

var Form = function(formEl) {
    this.el = formEl;
    this.fieldMap = {};
    getFields(this);
};
/**
 * override this
 */
Form.prototype.submit = function(formEvent, cb, scope) {
    formEvent.preventDefault();
    if (scope) {
        cb.bind(scope)();
    } else {
        cb();
    }
};
/**
 * @type HTMLElement
 */
Form.prototype.el = null;
Form.prototype.fieldMap = null;
Form.prototype.fieldSelector = ['input[type="hidden"]', 'input[type="text"]', 'input[type="checkbox"]', 'input[type="radio"]', 'input[type="number"]', 'input[type="email"]', 'select', 'textarea'];

Form.prototype.getData = function() {
    return getData(this);
};
Form.prototype.setData = function(data) {
    return setData(this, data);
};

function getFields(scope) {
    var fields = scope.el.querySelectorAll('input,textarea,select');
    fields.forEach(function(element) {
        if (element.name) {
            scope.fieldMap[element.name] = element;
        }
    });
    return fields;
}

function getData(scope) {
    var data = [];
    scope.el.querySelectorAll(scope.fieldSelector.join(',')).forEach(function(el) {
        if (!el.disabled && !el.dataset.formIgnore) {
            data.push({
                name: el.name,
                value: getValue(el)
            });
        }
    });
    return data;

}

function setData(scope, data) {
    data.forEach(function(entry) {
        var el = scope.fieldMap[entry.name];
        if (el && isInput(el)) {
            if (isInputCheckbox(el) || isInputRadio(el)) {
                el.checked = entry.value;
            } else if(isSelect(el)) {
                el.value = entry.value;
            } else if(isTextarea(el)) {
                el.innerHTML = entry.value;
            } else {
                el.value = entry.value;
            }
        }
    });
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

function isTextarea(el) {
    return el.tagName.toLowerCase() === 'select';
}

function isSelect(el) {
    return el.tagName.toLowerCase() === 'select';
}

module.exports = Form;
