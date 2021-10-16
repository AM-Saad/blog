const dbPromise = idb.open('bookmark-store', 1, function (db) {
    if (!db.objectStoreNames.contains("bookmarks")) {
        db.createObjectStore('bookmarks', { keyPath: '_id' })
    }
})

function writeData(st, data) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        }).catch(err => {
            console.log(err);
        })
};

function readAllData(st) {
    return dbPromise.then(db =>{
        var tx = db.transaction(st, 'readonly');
        var store = tx.objectStore(st);
        return store.getAll()

    })
};