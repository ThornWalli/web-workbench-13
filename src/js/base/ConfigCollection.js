"use strict";
var Events = require('ampersand-events');
var assign = require('lodash.assign');
var Enum = require('enum');

var coreConfig = [{
    name: 'core-css-transform',
    value: false
}];

var ConfigCollection = function(storageType) {

    setStorage(this, storageType);

    // prepare config
    this.data.forEach(function(entry) {
        this.dataMap[entry.name] = entry;
    }.bind(this));

};
ConfigCollection.prototype.STORAGE_TYPES = new Enum(['NONE', 'AUTO', 'LOCAL', 'SESSION']);
ConfigCollection.prototype.storageType = ConfigCollection.prototype.STORAGE_TYPES.NONE;
ConfigCollection.prototype.get = function(name) {
    if (!this.dataMap[name]) {
        console.error('can\'t found ', name);
        return undefined;
    }
    return this.dataMap[name].value;
};
ConfigCollection.prototype.set = function(data, value) {
    if (typeof data === 'object') {
        if (Array.isArray(data)) {
            data.forEach(function(entry) {
                if (!this.dataMap[name]) {
                    this.data.push(entry);
                    this.dataMap[name] = entry;
                }
                entry.value = data[name];
                this.trigger('change:' + name, value);
            }.bind(this));
        } else {
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    var entry = this.dataMap[name] || createEntry(name, data[name]);
                    if (!this.dataMap[name]) {
                        this.data.push(entry);
                        this.dataMap[name] = entry;
                    }
                    entry.value = data[name];
                    this.trigger('change:' + name, value);
                }
            }
        }
    } else {
        this.dataMap[data].value = value;
        this.trigger('change:' + data, value);
    }
    save(this);
    this.trigger('change', value);
};

ConfigCollection.prototype.data = [].concat(coreConfig);
ConfigCollection.prototype.dataMap = {};
assign(ConfigCollection.prototype, Events);

module.exports = ConfigCollection;

function detectStorage(scope, name) {
    var exist = null;
    [{
        enum: scope.STORAGE_TYPES.LOCAL,
        storage: global.localStorage
    }, {
        enum: scope.STORAGE_TYPES.SESSION,
        storage: global.sessionStorage
    }].forEach(function(storageData) {
        try {
            if (!!storageData.storage[name]) {
                exist = storageData.enum;
            }

        } catch (e) {
            console.error('can\'t access storage', storageData.enum.key);
        }
    });
    return exist;
}

function setStorage(scope, storageType) {
    storageType = scope.STORAGE_TYPES.AUTO.is(storageType) ? detectStorage(scope, 'workbench13') : storageType;
    switch (storageType) {
        case scope.STORAGE_TYPES.LOCAL:
            scope.storage = global.localStorage;
            break;
        case scope.STORAGE_TYPES.SESSION:
            scope.storage = global.sessionStorage;
            break;
        default:
            scope.storage = {
                workbench13: {
                    data: []
                }
            };
            break;
    }
    if (!!scope.storage.workbench13) {
        scope.data = JSON.parse(scope.storage.workbench13).data;
        console.log('loaded config', scope.storage);
    }
}

function save(scope) {
    scope.storage.workbench13 = JSON.stringify({
        data: scope.data
    });
}

function createEntry(name, value) {
    return {
        name: name,
        value: value
    };
}
