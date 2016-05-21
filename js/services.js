'use strict'; /* Services */
stocks.factory('stockData', ['$resource', '$http', '$q',
  function($resource, $http, $q) {
    var factory = {
      query: function(value) {
        var data = $http.get(
          'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(' +
          value +
          ')%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json', {}, {
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
stocks.factory('database', ['$resource', '$http', '$q',
  function($resource, $http, $q) {
    var dataMethods = {
      addStock: function(stock, nameofcompany) {
        var _this = this;
        var deferred = $q.defer();
        var transaction = this.db.transaction(["portfolio"], "readwrite");
        var store = transaction.objectStore("portfolio");
        var stockTemplate = {
          id: Math.floor(Math.random() * 1000000),
          company_name: nameofcompany,
          name: stock,
          created: new Date()
        }
        var request = store.add(stockTemplate);
        request.onerror = function(e) {
          deferred.reject(e);
        }
        request.onsuccess = function(e) {
          deferred.resolve(e);
        }
        return deferred.promise;
      },
      readOnlyStock: function() {
        var deferred = $q.defer();
        var transaction = this.db.transaction(["portfolio"], "readonly");
        var store = transaction.objectStore("portfolio");
        var arrayOfStocks = [];
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);
        cursorRequest.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            arrayOfStocks.push(cursor.value);
          } else {
            deferred.resolve(arrayOfStocks);
          }
        }
        return deferred.promise;
      },
      deleteStock: function(id) {
        var deferred = $q.defer();
        var transaction = this.db.transaction(["portfolio"], "readwrite");
        var store = transaction.objectStore("portfolio");
        var request = store.delete(id);
        request.onsuccess = function(e) {
          deferred.resolve();
        };
        return deferred.promise;
      },
      checkForDuplicate: function(stockRequestedToAdd) {
        var deferred = $q.defer();
        var transaction = this.db.transaction(["portfolio"]);
        var store = transaction.objectStore("portfolio");
        var index = store.index("name");
        var request = index.get(stockRequestedToAdd);
        request.onsuccess = function(e) {
          deferred.resolve(e);
        };
        return deferred.promise;
      }
    };
    if (window.indexedDB) {
      var openRequest = indexedDB.open("users_stocks", 7);
      openRequest.onupgradeneeded = function(e) {
        var thisDB = e.target.result;
        var createStore = thisDB.createObjectStore("portfolio", {
          autoIncrement: true,
          keyPath: "id"
        });
        createStore.createIndex("name", "name", {
          unique: true
        });
      }
      openRequest.onsuccess = function(e) {
        dataMethods.db = e.target.result;
      }
      return dataMethods;
    }
}]);
