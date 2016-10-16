"use strict";

var js = require('agency-pkg-services/parser/js')(require('./packages'));
require('agency-pkg-services/touch-indicator');

(function(){
    $(function() {
        js.parse();
    });
})();
