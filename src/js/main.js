"use strict";

var js = require('agency-pkg-service-parser');
js.setPackages(require('./packages'));
(function(){
    $(function() {
        js.parse();
    });
})();
