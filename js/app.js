'use strict';


// Declare app level module which depends on filters, and services
 var stocks = angular.module('stocks', ['$strap.directives', 'ngResource', 'ngRoute']);

stocks.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'homescreen'});
  $routeProvider.when('/portfolio', {templateUrl: 'partials/portfolio.html', controller: 'portfolio'});
  $routeProvider.when('/eula', {templateUrl: 'partials/eula.html', controller: 'eula'});
  $routeProvider.otherwise({redirectTo: '/home'});
}]);
