"use strict";

var req = require('request');

exports.register = function (server, options, next) {
    server.route({
        method: 'GET',
        path: '/getmenuconfig',
        config: {
            auth: false,
            handler: function (request, reply) {
                req(request.query.url, function(error, response, body) {
                    console.log(body);
                    reply(body);
                });
            }
        }
    });
    next();
};

exports.register.attributes = {
    name: 'getMenuConfig',
    version: '1.0.0'
};
