"use strict";
var TYPES = require('./types');
var icons = {};
icons[TYPES.ICON.DEFAULT.key] = require('../../tmpl/partials/svgs/icons/disk-1.hbs');
icons[TYPES.ICON.FOLDER.key] = require('../../tmpl/partials/svgs/icons/folder.hbs');
icons[TYPES.ICON.DISK_1.key] = require('../../tmpl/partials/svgs/icons/disk-1.hbs');
icons[TYPES.ICON.DISK_2.key] = require('../../tmpl/partials/svgs/icons/disk-2.hbs');
icons[TYPES.ICON.WORK.key] = require('../../tmpl/partials/svgs/icons/work.hbs');
module.exports = icons;
