'use strict';
var app = angular.module('app', ['ngRoute', 'app.controllers', 'app.directives', 'app.services', 'ui.bootstrap', 'angularFileUpload']);

app.config(['$locationProvider', function ($locationProvider, $httpProvider) {
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $locationProvider.html5Mode(true);
}]);
