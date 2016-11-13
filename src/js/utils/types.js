"use strict";
var Enum = require('enum');
module.exports = {
    ITEM: new Enum(['DEFAULT', 'FOLDER']),
    ICON: new Enum(['DEFAULT', 'FOLDER', 'DISK_1', 'DISK_2', 'WORK']),
    ICON_TYPE: new Enum(['DEFAULT', 'SVG', 'IMG']),
    VIEW_POSITION : new Enum(['CENTER', 'ORDER_HORIZONTAL', 'ORDER_VERTICAL', 'ORDER_DIAGONAL_LEFT', 'ORDER_DIAGONAL_RIGHT'])
};
