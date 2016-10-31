"use strict";
var Enum = require('enum');
module.exports = {
    ITEM: new Enum(['DEFAULT', 'FOLDER']),
    ICON: new Enum(['FOLDER', 'DISK_1', 'DISK_2']),
    ICON_TYPE: new Enum(['DEFAULT', 'SVG', 'IMG'])
};
