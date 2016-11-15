"use strict";

var uniqBy = require('lodash/uniqBy');
var ApplicationController = require('../../../../base/ApplicationController');
var Item = require('../../../../base/itemControl/Item');

module.exports = ApplicationController.extend({

    template_listItem: null,

    modelConstructor: ApplicationController.prototype.modelConstructor.extend({
        session: {
            applicationName: {
                type: 'string',
                required: true,
                default: 'FileEdit'
            },
            fileType: {
                type: 'string',
                required: true,
                default: 'link'
            },
            preItemData: {
                type: 'object',
                required: false
            },
            item: {
                type: 'object',
                required: false
            },
            itemControl: {
                type: 'object',
                required: false,
            }
        }
    }),

    bindings: {
        'model.item': {
            type: function(el, value, previousValue) {
                if (previousValue && previousValue.type) {
                    el.classList.remove('js-' + (value.previousValue.type.key || value.previousValue.type).toLowerCase());
                }
                if (value && value.type) {
                    el.classList.add('js-' + (value.type.key || value.type).toLowerCase());
                }
            }
        },
        'model.preItemData': {
            type: function(el, value) {
                el.classList.toggle('js-create', value);
                if (value) {
                    var type = value.find(function(property) {
                        if (property.name === 'type') {
                            return property;
                        }
                    });
                    el.classList.add('js-' + type.value.toLowerCase());
                }
            }
        }
    },

    events: {
        'click [data-hook="cancel"]': onClickCancel,
        'change [data-hook="file-type"]': onChangeFileType,
        'submit [data-hook="form"]': onFormSubmit
    },

    initialize: function() {
        ApplicationController.prototype.initialize.apply(this, arguments);
        this.model.getIfExists('applicationForm', function(applicationForm) {
            this.model.getIfExists('item', function(item) {
                if (item) {
                    applicationForm.setData(parseItems(item));
                }
            });
        }, this);
        this.model.getIfExists('preItemData', function(preItemData) {
            this.model.getIfExists('applicationForm', function(applicationForm) {
                applicationForm.setData(preItemData);
            });
        }, this);
    }

});

function addProperty(name, value) {
    return {
        name: name,
        value: value.key || value
    };
}

function parseItems(item) {
    var properties = [];
    var propertyNames = ['type', 'icon', 'name', 'title', 'linkUrl', 'code', 'src'];
    propertyNames.forEach(function(property) {
        properties.push(addProperty(property, item.get(property)));
    });
    return properties;
}

function parseItemData(itemData) {
    var data = {};
    itemData.forEach(function(property) {
        data[property.name] = property.value;
    });
    return data;
}


function save(scope) {
    var formData = scope.model.applicationForm.getData();
    var properties = parseItemData(uniqBy(formData.concat(scope.model.preItemData || []), 'name'));
    properties.name = (properties.name || properties.title).toLowerCase().replace(/ /g, '_').replace(/[^[a-z_]]/g, '');
    if (scope.model.item) {
        scope.model.item.set(properties);
    } else {
        scope.model.item = new Item(properties);
        // TODO: Smaller?
        var viewControl = scope.applicationControl.core.viewControl;
        if (scope.model.itemControl) {
            scope.model.itemControl.items.add(properties);
        } else {
            viewControl.itemControl.items.add(properties);
        }
    }
    console.log('formData', formData, JSON.stringify(properties));
    scope.view.close();
}

// events dom

function onFormSubmit(e) {
    this.model.applicationForm.submit(e, function() {
        save(this);
    }, this);
}

function onChangeFileType(e) {
    this.model.fileType = e.target.value;
}

function onClickCancel() {
    this.view.close();
}
