'use strict'; /* Controllers */
stocks.controller('homescreen', ['$scope', '$http', 'stockData', 'database', function homescreen($scope, $http, stockData, database) {
    $scope.$on('typeahead-updated', function() {
        $scope.submit();
    });
    $scope.typeahead = function(query, callback) {
        $http.jsonp('http://autoc.finance.yahoo.com/autoc?query=' + query + '&callback=YAHOO.Finance.SymbolSuggest.ssCallback');
        $scope.arrayss = symbolsArray;
        callback($scope.arrayss);
    }
    $scope.timeFrame = [{
        name: '1 Day',
        value: '1d'
    }, {
        name: '5 Days',
        value: '5d'
    }, {
        name: '3 Months',
        value: '3m'
    }, {
        name: '6 Months',
        value: '6m'
    }, {
        name: '1 Year',
        value: '1y'
    }, {
        name: '2 Years',
        value: '2y'
    }, {
        name: '5 Years',
        value: '5y'
    }, {
        name: 'Maximum',
        value: 'my'
    }];
    $scope.statusbar = false;
    $scope.submit = function() {
/*converted below to resource in services.js
          $http.get('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+$scope.symbol_wanted+'%22)%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json').success(function(data) {
          $scope.info = data;
          console.dir($scope.info);
        });*/
        $scope.statusbar = true;
        var parseSymbol = $scope.symbol_wanted;
        if (parseSymbol.indexOf("-")) {
            parseSymbol = parseSymbol.substring(0, parseSymbol.indexOf('-'));
        }
        var parseSymbol = "%22" + parseSymbol + "%22";
        stockData.query(parseSymbol).then(function(result) {
            $scope.info = result;
            console.log(result);
           $("#symbol_form").blur();
            $('#main_save').show().addClass('btn-primary').html('Save To My Portfolio');
            $scope.statusbar = false;
        }, function() {
            //no data returned!
        });
    }
    $scope.saveToPortfolio = function(symbol, companyName) {
        console.log('starting check for duplicates');
        database.checkForDuplicate(symbol).then(function(result) {
            if (typeof result.target.result !== "object") {
                console.log('proceeding with add');
                database.addStock(symbol, companyName).then(function(result) {
                    $('#main_save').removeClass('btn-primary').html('Added to your portfolio');
                }, function(result) {});
            } else {
                $('#main_save').removeClass('btn-primary').html('Already in your portfolio');
                console.log('already in DB!');
            }
        }, function(result) {});
    }
}]);
stocks.controller('portfolio', ['$scope', '$http', 'stockData', 'database', function portfolio($scope, $http, stockData, database) {
    $scope.price = "";
    $scope.getAllStocks = database.readOnlyStock().then(function(result) {
        console.log(result);
        $scope.stocksRetrieved = result;
        for (var i = 0; i < result.length; i++) {
            $scope.price = $scope.price + "%22" + result[i].name + "%22%2C";
        }
        $scope.price = $scope.price.substring(0, $scope.price.length - 3)
        $scope.fetchPrices($scope.price);
    }, function() {
        console.log('could not retrieve');
    });
    $scope.allPrices = [];
    $scope.arrayCheck = true;
    $scope.fetchPrices = function(symbols) {
        stockData.query(symbols).then(function(result) {
            if (Array.isArray(result.data.query.results.quote)) {
                $scope.arrayCheck = true;
            } else {
                $scope.arrayCheck = false;
            }
            $('.spinner').hide();
            $scope.allPrices = result.data.query.results.quote;
        }, function() {
            //no data returned!
        });
    }
    $scope.deleteItem = function(record, row) {
        database.deleteStock(record).then(function() {
            console.log(row);
            $('#stockRow' + row).slideUp('slow');
        }, function() {});
    }
    $scope.refreshPrices = function(){

        $scope.fetchPrices($scope.price);
    }
}]);



stocks.controller('eula', ['$scope', '$http', function portfolio($scope, $http) {
  //nothing needed yet
}]);