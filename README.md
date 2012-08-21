# Pickyfill

Offline caching for [picturefill](https://github.com/scottjehl/picturefill) responsive images. 

* Author: Rich Trott
* Copyright: Regents of the University of California (c) 2012
* License: MIT

**Demo URL:** [http://trott.github.com/pickyfill/](http://trott.github.com/pickyfill/)

## What is it?

Responsive images and offline application caching do not play well together. For an explanation, see "Gotcha #6" of Jake Archibald's ["Application Cache is a Douchebag"](http://www.alistapart.com/articles/application-cache-is-a-douchebag/).

Pickyfill (partially) solves the problem using Scott Jehl's picturefill as a starting point. Pickyfill stores responsive images as data URLs in LocalStorage. If your page is using the HTML5 offline Appcache, pickyfill will detect this and store picturefill images as they are loaded. It will only store the images that your device displays, so (for example) an iPhone will only cache iPhone-sized images; it will not download and store crazy large images designed for large screens.  

Pickyfill makes the cached images available if the user is offline. It can also improves page load time if the user is on a slow network.

## Support, or Where Won't This Work?

Pickyfill requires ApplicationCache, LocalStorage, and Canvas. If a browser that does not support these features visits a site that uses pickyfill, then pickyfill will do nothing and the experience will gracefully degrade to straight-up picturefill.

<table>
    <tr><th>Browser</th><th>Version</th><th>Support</th></tr>
    <tr><td>Internet Explorer</td><td>10.0+</td><td>full support</td></tr>
    <tr><td>Internet Explorer</td><td>&lt; 10.0</td><td>degrades to regular picturefill</td></tr>
    <tr><td>Firefox</td><td>3.5+</td><td>partial support*</td></tr>
    <tr><td>Chrome</td><td>4.0+</td><td>full support</td></tr>
    <tr><td>Safari (OS X, Windows)</td><td>4.0+</td><td>full support</td></tr>
    <tr><td>Safari (iOS)</td><td>3.2+</td><td>full support</td></tr>
    <tr><td>Opera</td><td>10.6+</td><td>full support</td></tr>
    <tr><td>Android</td><td>All versions</td><td>it's complicated**</td></tr>
</table>

*In Firefox, pickyfill will cache images on load, but not on resize. This is to avoid caching truncated/corrupted images. On resize, behavior gracefully degrades to regular picturefill behavior.

**Android browser in Android 2.3 (and probably others) does not implement `toDataURL()` completely/correctly. Pickyfill will detect the problem and degrade gracefully to regular picturefill behavior. Otherwise, pickyfill is fully supported in Android. 

## How do I use it?

Use picturefill the same way you would without pickyfill. The only changes will be to load `pickyfill.js` after `picturefill.js` and to give your site/page an HTML5 Appcache manifest.

```html
<html manifest="/manifest.appcache">
    <head>
...
        <script src="/assets/js/matchmedia.js"></script>
        <script src="/assets/js/picturefill.js"></script>
        <script src="/assets/js/pickyfill.js"></script>
...
```

Although it would be better to minify and concatenate the JS files, the above code is for clarity.

Because pickyfill will only cache images that are actually displayed, it is possible for a user to visit the site, then visit the site again while offline, resize their browser, and end up with a broken image (because the image that is required at the new browser size was never downloaded before and therefore has not been cached). For this reason, it is important to have an appropriate small `FALLBACK` image in your offline Appcache.