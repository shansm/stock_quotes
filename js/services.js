'use strict'; /* Services */
stocks.factory('stockData', ['$resource', '$http', '$q', function($resource, $http, $q) {
    var factory = {
        query: function(value) {
            var data = $http.get('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(' + value + ')%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json', {}, {
                query: {
                    method: 'GET',
                    isArray: false
                }
            });
            var deferred = $q.defer();
            deferred.resolve(data);
            return deferred.promise;
        }
    }
    return factory;
}]);
stocks.factory('database', ['$resource', '$http', '$q', function($resource, $http, $q) {
    var dataMethods = {
        addStock: function(stock, nameofcompany) {
            var _this = this;
            console.log("About to add stock");
            var deferred = $q.defer();
            //Get a transaction
            //default for OS list is all, default for type is read
            var transaction = this.db.transaction(["portfolio"], "readwrite");
            //Ask for the objectStore
            var store = transaction.objectStore("portfolio");
            //Define a person
            var stockTemplate = {
                id: Math.floor(Math.random() * 1000000),
                company_name: nameofcompany,
                name: stock,
                created: new Date()
            }
            //Perform the add
            var request = store.add(stockTemplate);
            request.onerror = function(e) {
                console.log("failed to add stock to portflio", e.target.error.name);
                deferred.reject(e);
            }
            request.onsuccess = function(e) {
                console.log("successfully added stock to portfolio");
                deferred.resolve(e);
                //console.log(store);
                //_this.readOnlyStock();
            }
            return deferred.promise;
        },
        readOnlyStock: function() {
            var deferred = $q.defer();
            var transaction = this.db.transaction(["portfolio"], "readonly");
            var store = transaction.objectStore("portfolio");
            // var cursorRequest = store.openCursor();
            var arrayOfStocks = [];
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            cursorRequest.onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    arrayOfStocks.push(cursor.value);
                    //deferred.resolve(arrayOfStocks);
                    //return deferred.promise;
                    cursor.
                    continue ();
                } else {
                    deferred.resolve(arrayOfStocks);
                }
            }
            cursorRequest.onerror = function() {
                console.log('could not fetch data');
            }
            return deferred.promise;
        },
        deleteStock: function(id) {
            var deferred = $q.defer();
            console.log('starting delete');
            var transaction = this.db.transaction(["portfolio"], "readwrite");
            var store = transaction.objectStore("portfolio");
            var request = store.delete(id);
            request.onsuccess = function(e) {
                console.log('deleted item');
                deferred.resolve();
            };
            request.onerror = function(e) {
                console.log(e);
            };
            console.log('done deleting');
            return deferred.promise;
        },
        checkForDuplicate: function(stockRequestedToAdd) {
            var deferred = $q.defer();
            console.log('starting search');
            var transaction = this.db.transaction(["portfolio"]);
            var store = transaction.objectStore("portfolio");
            var index = store.index("name");
            var request = index.get(stockRequestedToAdd);
            request.onsuccess = function(e) {
                deferred.resolve(e);
            };
            request.onerror = function(e) {
                console.log('could not do search');
            };
            return deferred.promise;
        }
    };
    //return dataMethods;
    if (window.indexedDB) {
    //if (navigator.indexedDB || navigator.mozIndexedDB) {
        //window.indexedDB.deleteDatabase('users_stocks');
        console.log('indexeddb is supported');
        var openRequest = indexedDB.open("users_stocks", 7);
        openRequest.onupgradeneeded = function(e) {
            console.log("upgrade needed");
            var thisDB = e.target.result;
            //if (!thisDB.objectStoreNames.contains("portfolio")) {
            console.log('created object store');
            var createStore = thisDB.createObjectStore("portfolio", {
                autoIncrement: true,
                keyPath: "id"
            });
            createStore.createIndex("name", "name", {
                unique: true
            });
            //}
        }
        openRequest.onsuccess = function(e) {
            console.log('connection opened');
            dataMethods.db = e.target.result;
        }
        openRequest.onerror = function(e) {
            console.log('could not open connection');
        }
        return dataMethods;
    } else {
        console.log('indexedDB not supported');
    }
}]);