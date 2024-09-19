/*
 * ah_sworker.js
 * MobileApp PWA
 *
 * MobileApp service worker script.
 *
 * The goal of this service worker is to 1) cache fetch requests for static content, and 2) ensure
 * that Google believes we are a proper PWA.
 *     One potential problem is stale caches. When an older version is discovered then we notify the
 * client and invalidate the old cache.
 *
 * column positioning:                          //                          //                      !
 *
 * Copyright (c) 2020-2024 by Richard C. Zulch
 *
 */

var CurrentCacheName = "MobileApp-$Version$";


//
// locals
//

var upgradeMsgPorts = {};                       // message ports for sources that need upgrading
var abortables = [];                            // requests that can be aborted
var terminated;

/*
 * initialize
 *
 *     Initiate listening for incoming messages from our clients. This waits for any client responses
 * and then quits. Any clients that want to participate after that must unilaterally send a port for
 * communication.
 *
 */

(function initialize() {
    console.log("[$Version$] initialize");

    // self.onmessage events
    //
    // This receives channel port messages from the Apps as they either 1) respond to a request to
    // register, or 2) spontaneously register themselves as they notice that we're running.
    //
    self.addEventListener('message', function(event) {
        var msgport = event.data.hereIsYourPort;                            // message port of a client
        var pubID = event.data.hereIsMyID;
        var pubVersion = event.data.hereIsMyVersion;
        var sourceId = event.source.id;                                     // client id of sender of message
        console.log("[$Version$] received new msgport for", sourceId, pubID, "-", pubVersion);
        msgport.postMessage({
            id: "text",
            text: "[$Version$] adding source ".concat(sourceId),
            version: "$Version$"
        });
        if (pubVersion != "$Version$") {
            if (upgradeMsgPorts) {                                          // if not activated
                console.log("[$Version$] update pending:", sourceId, "to $Version$");
                upgradeMsgPorts[sourceId] = msgport;
            }
            else {
                msgport.postMessage({                                       // notify new version available
                    id: "upgrade",
                    version: "$Version$"
                });
                console.log("[$Version$] update:", sourceId, "to $Version$");
            }
        }
        
        // terminate
        //
        // Terminate our service worker.
        //
        function terminate() {
            terminated = true;
            abortables.forEach(function(item) {
                item.aborted = true;
                item.abortcon.abort();
            });
            self.registration.unregister().then(function () {
                return self.clients.matchAll();
            }).then(function (clients) {
                clients.forEach(function (client) {
                    client.navigate(client.url);
                });
            });
        }
        
        // msgport.onmessage events
        //
        // This receives channel port messages that are responding to our fetch requests. The IDE
        // can also send a text message for logging, but that is used only for debugging.
        //
        msgport.onmessage = function(msg) {
            msg = msg.data;
            if (msg.id == "skipWaiting") {
                console.log("[$Version$] attempting skipWaiting");
                self.skipWaiting();
            } else if (msg.id == "terminate") {
                console.log("[$Version$] terminated");
                terminate();
            } else if (msg.id == "abortURL") {
                var href = new URL(msg.url).href;
                abortables.forEach(function(item) {
                    if (item.href == href) {
                        item.aborted = true;
                        item.abortcon.abort();
                    }
                });
            } else if (msg.id == "text")
                console.log("[$Version$] msg received:", msg.text);
        };
    });
})();


/*
 * ClearCaches
 *
 * Clear obsolete caches, returning a promise.
 *
 */

function ClearCaches() {
    var promise = caches.keys().then(function(cacheNames) {                 // delete old cache entries
            return (Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName != CurrentCacheName) {
                        console.log('[$Version$] deleting old cache:', cacheName);
                        return (caches.delete(cacheName));
                    }
                })
            ));
        }).then(function() {                                                // claim all clients
            console.log('[$Version$] claiming clients');
            return (self.clients.claim());
        }).then(function() {
            console.log('[$Version$] clients claimed');
            return (Promise.resolve(true));
        });
    return (promise);
}


/*
 * install event
 *
 *     Received when the service worker is first installed.
 *
 */

self.addEventListener('install', function(event) {
    console.log("[$Version$] install");
    self.skipWaiting();
});


/*
 * activate event
 *
 *     Received when our service worker is actually started, so remove any old cache data and claim clients.
 *
 */

self.addEventListener('activate', function(event) {
    console.log("[$Version$] activate");
    var promise = ClearCaches().then(function() {
        for (var sourceId in upgradeMsgPorts) {
            upgradeMsgPorts[sourceId].postMessage({                         // notify new version available
                id: "upgrade",
                version: "$Version$"
            });
        }
        upgradeMsgPorts = false;
    });
    if (event.waitUntil)
        event.waitUntil(promise);
});


/*
 * fetch event
 *
 *     Received when a page within scope is asking for a site resource.
 *
 */

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response)
        {
            if (response && response.status != 299)
                return (response);
            if (terminated)
                return (new Response(undefined, {
                    status: 299,
                    statusText: "Request Cancelled"
                }));
            var request = event.request;
            var promise;
            var url = new URL(request.url);
            var nocache = request.method != "GET"
                || url.search.length !== 0 && url.searchParams.get("naanver") !== "$CacheBuster$"
            var abortcon = new AbortController();
            var abortItem = {
                href: url.href,
                abortcon: abortcon
            };
            abortables.push(abortItem);
            request = new Request(event.request, { signal: abortcon.signal });
            promise = fetch(request).catch(function (e) {
                abortables = abortables.filter(function(item) {
                    return (item !== abortItem);
                });
                if (abortItem.aborted) {
                    nocache = true;                                         // don't cache the 299!
                    return (new Response(undefined, {
                        status: 299,
                        statusText: "Request Cancelled"
                    }));
                }
                console.log("[$Version$] fetch failed", request.url, e);    // generally "TypeError: Failed to fetch" even if net::ERR_FAILED
                return (new Response(undefined, {
                    status: 408,                                            // 408 is retriable, and not server's fault
                    statusText: "Fetch Failed"
                }));
            });
            return (promise.then(function(response) {
                if (!nocache) {
                    var responseClone = response.clone();
                    caches.open(CurrentCacheName).then(function(cache) {
                        cache.put(request, responseClone);
                    });
                }
                abortables = abortables.filter(function(item) {
                    return (item !== abortItem);
                });
                return (response);
            }));
        })
    );
});
