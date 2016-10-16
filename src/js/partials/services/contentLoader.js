"use strict";


var ContentLoader = function() {
    this._htmlCache = [];
};

ContentLoader.prototype.load = function(url, complete, error, forceCache) {

    var scope = this;
    var data = scope._htmlCache.find(function(data) {
        if (data.url === url) {
            return data;
        }
    });
    if (data && !forceCache) {
        if (typeof complete === 'function') {
            complete(data.html);
        }
    } else {
        $.ajax({
            method: 'GET',
            url: url,
            dataType: 'html',
            cache: false
        }).done(function(html) {
            addToCache(scope._htmlCache, url, html);
            if (typeof complete === 'function') {
                complete(html);
            }
        }).fail(function(e) {
            if (typeof error === 'function') {
                error(e);
            }
        });
    }


};

function addToCache(cache, url, html) {
    cache.push({
        url: url,
        html: html
    });
}

module.exports = new ContentLoader();
