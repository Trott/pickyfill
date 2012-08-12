/*! Pickyfill - Offline caching for picturefill responsive image polyfill. Author: Rich Trott | Copyright: Regents of University of California, 2012 | License: MIT */

(function( w ) {
    "use strict";

    var localStorage = w.localStorage,
        applicationCache = w.applicationCache,
        image,
        imageSrc,
        dataUri,
        pf_index_string,
        pf_index,
        canvasTest = document.createElement('canvas');

    // Don't run any of this stuff if application cache doesn't exist or isn't being used,
    //     or localStorage or canvas are not available.
    if ( (! applicationCache) || (applicationCache.status === applicationCache.UNCACHED) ||
        (! localStorage) || (!(canvasTest.getContext && canvasTest.getContext('2d'))) ) {
            return;
    }

    pf_index_string = localStorage.getItem('pf_index') || '{}';
    pf_index = JSON.parse(pf_index_string);

    // We'll use this to clear the pickyfill cache when appcache updates.
    var clearCache = function () {
        localStorage.removeItem('pf_index');
        for (var prop in pf_index) {
            localStorage.removeItem(prop);
        }
    };

    // Unfortunately, reloading is the most reliable way to get stuff into the
    //  pickyfill cache. If you wait for the user to reload, they may be offline
    //  at that time. If we just had an updateready event, chances are very good
    //  that they are still online. Another possibility is to just try to reload
    //  the images that are currently shown, but there's no guarantee that those
    //  images are in the new page or that the current page isn't missing important
    //  images that will display in the new page and need to be cached.
    var refreshCache = function () {
        clearCache();
        w.location.reload();
    };

    // If appcache updates, refresh the pickyfill cache to get new items.
    // If appcache is obsolete, clear the pickyfill cache.
    // Appcache == IE10 or later == no need to worry about attachEvent (IE8 and earlier)
    // Anything that has appcache is going to have addEventListener.
    applicationCache.addEventListener('updateready', refreshCache, false);
    applicationCache.addEventListener('obsolete', clearCache, false);

    // If the event has already fired and we missed it, clear/refresh the pickyfill cache.
    if(applicationCache.status === applicationCache.UPDATEREADY) {
        refreshCache();
    }

    if (applicationCache.status === applicationCache.OBSOLETE) {
        clearCache();
    }

    var srcFromCacheRan = false;
    var srcFromCache = function ( ps ) {
        var sources, src, newSrc;

        // Loop the pictures
        for( var i = 0, il = ps.length; i < il; i++ ){
            if( ps[ i ].getAttribute( "data-picture" ) !== null ){

                sources = ps[ i ].getElementsByTagName( "div" );
                // See which ones are cached in localStorage. Use the cached value.
                for( var j = 0, jl = sources.length; j < jl; j++ ){
                    if ((src = sources[j].getAttribute( "data-src" )) !== null ) {
                        if ( pf_index.hasOwnProperty('pf_s_' + src)) {
                            newSrc = localStorage.getItem('pf_s_' + src);
                            if (newSrc !== null) {
                                sources[j].setAttribute('data-src', localStorage.getItem('pf_s_' + src));
                            }
                        }
                    }
                }
            }
        }
    };

    var cacheImage = function () {
        var canvas, ctx, imageSrc;

        imageSrc = this.getAttribute("src");
        if ((imageSrc === null) || (imageSrc.length === 0)) {
            return;
        }

        canvas = w.document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        try {
            dataUri = canvas.toDataURL();

        } catch (e) {
            // TODO: Improve error handling here. For now, if canvas.toDataURL()
            //   throws an exception, don't cache the image and move on.
            return;
        }

        // Do not cache if the resulting cache item will take more than 128Kb.
        if (dataUri.length > 131072) {
            return;
        }

        pf_index["pf_s_"+imageSrc] = 1;

        try {
            localStorage.setItem("pf_s_"+imageSrc, dataUri);
            localStorage.setItem("pf_index", JSON.stringify(pf_index));
        } catch (e) {
            // Caching failed. Remove item from index object so next cached item
            //   doesn't wrongly indicate this item was successfully cached.
            delete pf_index["pf_s_"+imageSrc];
        }
    };

    w.picturefillOrig = w.picturefill;
    w.picturefill = function () {
        var ps = w.document.getElementsByTagName( "div" );

        if (! srcFromCacheRan ) {
            srcFromCacheRan = true;
            srcFromCache( ps );
        }

        w.picturefillOrig();

        // Loop the pictures
        for( var i = 0, il = ps.length; i < il; i++ ){
            if( ps[ i ].getAttribute( "data-picture" ) !== null ){

                image = ps[ i ].getElementsByTagName( "img" )[0];
                if (image) {
                    if ((imageSrc = image.getAttribute("src")) !== null) {
                        if (imageSrc.substr(0,5) !== "data:") {
                            image.addEventListener("load", cacheImage, false);
                        }
                    }
                }
            }
        }
    };

}( this ));
