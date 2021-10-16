importScripts('./js/idb.js')
importScripts('./js/utilitiy.js')
const version = '1'
const StaticCacheName = "cache-v33";
const DynamicCacheName = "dynamic-cache-v33";
const resourcesToPrecache = [
    "/",
    "/fallback.html",
    "/bookmarks/",
    "/manifest.json",
    "/css/classes.css",
    "/css/main.css",
    "/css/article.css",
    "/css/about.css",
    "/images/loader.gif",
    "/images/1.jpg",
    "/images/moon2.png",
    "/images/noresult.svg",
    "/js/bookmark.js",
    "/js/main.js",
    "/js/helpers/fetchdata.js",
    "/js/helpers/showmessage.js",
    "/js/update-article.js",
    "/js/idb.js",
    "/js/utilitiy.js"
];

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    })
}
function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}


self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
      caches.open(StaticCacheName)
        .then(function (cache) {
          console.log('[Service Worker] Precaching App Shell');
          cache.addAll(resourcesToPrecache);
        })
    )
  });

self.addEventListener("activate", e => {
    console.log("Service Worker has been activated");

    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== StaticCacheName && key !== DynamicCacheName)
                    .map(key => caches.delete(key))
            );
        })
    );
});


const fetchFromServer = [
    /articles/,
    /api\/\bookmarks/
]

self.addEventListener("fetch", async e => {

    // var toBeindexed = [/bookmarks/];
    // let { request } = event
    // const text = request.url;
    // const isMatch = toBeindexed.some(rx => rx.test(text));
    // if (isMatch) {
    //     event.respondWith(fetch(event.request)
    //         .then(function (res) {
    //             var clonedRes = res.clone();
    //             clonedRes.json()
    //                 .then(function (response) {
    //                     let data = response.bookmark.items
    //                     console.log(data);
    //                     for (var key in data) {
    //                         console.log(data[key])
    //                         writeData('bookmarks',  data[key])
    //                     }
    //                 });
    //             return res;
    //         })
    //     );
    // } else if (isInArray(event.request.url, resourcesToPrecache)) {
    //     event.respondWith(
    //         caches.match(event.request)
    //     );
    // } else {
    //     event.respondWith(
    //         caches.match(event.request)
    //             .then(function (response) {
    //                 if (response) {
    //                     return response;
    //                 } else {
    //                     return fetch(event.request)
    //                         .then(function (res) {
    //                             return caches.open(DynamicCacheName)
    //                                 .then(function (cache) {
    //                                     // trimCache(DynamicCacheName, 3);
    //                                     cache.put(event.request.url, res.clone());
    //                                     return res;
    //                                 })
    //                         })
    //                         .catch(function (err) {
    //                             return caches.open(StaticCacheName)
    //                                 .then(function (cache) {
    //                                     if (event.request.headers.get('accept').includes('text/html')) {
    //                                         return cache.match('/offline.html');
    //                                     }
    //                                 });
    //                         });
    //                 }
    //             })
    //     );
    // }
    let { request } = e
    const text = request.url;
    const isMatch = fetchFromServer.some(rx => rx.test(text));
    console.log(request.mode);
    e.respondWith(
        caches.match(request)
            .then(cachedResponse => {

                return (
                    cachedResponse || fetch(request)
                        .then(fetchRes => {
                            return caches.open(DynamicCacheName)
                                .then(cache => {
                                    if(!isMatch){
console.log('YES!!!');
                                        cache.put(request.url, fetchRes.clone());
                                        limitCacheSize(DynamicCacheName, 20);
                                    }
                                    return fetchRes;
                                });

                        }).catch(err => {
                            if (request.mode === 'navigate') {
                                return caches.match('/fallback.html');
                            }

                        })
                );
            })
            .catch(err => {
                if (request.mode === 'navigate') {
                    return caches.match('/fallback.html');
                }
            })
    );
});


self.addEventListener('notificationclick', function (event) {
    var notification = event.notification;
    var action = event.action;
    console.log(notification);

    if (action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            clients.matchAll()
                .then(function (clis) {
                    var client = clis.find(function (c) {
                        return c.visibilityState === 'visible';
                    });

                    if (client !== undefined) {
                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        clients.openWindow(notification.data.url);
                    }
                    notification.close();
                })
        );
    }
});

self.addEventListener('notificationclose', function (event) {
    console.log('Notification was closed', event);
});


self.addEventListener('push', function (event) {
    console.log('Push Notification received', event);

    var data = { title: 'New!', content: 'Something new happened!', openUrl: '/' };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.content,
        icon: '/src/images/icons/app-icon-96x96.png',
        badge: '/src/images/icons/app-icon-96x96.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});


// self.addEventListener('sync', e => {
//     console.log('[Service Worker] Syncing');
//     if (e.tag === 'sync-add-cart') {
//         e.waitUntil(
//             readAllData('sync-cart')
//                 .then(items => {
//                     for (const data of items) {
//                         fetchdata(csrf, `/shop/api/cart/${data.itemId}?cart=${data.cart}`, 'post', JSON.stringify({ attributes: data.attributes, quantity: data.quantity }), true).then(res => {

//                             if (res) {
//                                 cartComponent(res.json.cart.items, csrf)
//                                 grandtotal(res.json.cart)
//                                 setCartId(res.json.cart.sessionId)
//                                 promoBox(res.json.cart)
//                                 deleteItemFromData('sync-cart', data.id)
//                                 localStorage.setItem('c_s', res.json.cart.sessionId)
//                             }
//                         })

//                     }

//                 })
//         )
//     }
// })
