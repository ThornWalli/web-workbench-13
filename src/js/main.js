"use strict";

var js = require('agency-pkg-service-parser')(require('./packages'));

(function(){
    $(function() {
        js.parse();
    });
})();
