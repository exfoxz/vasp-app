'use strict';
var app = angular.module('app', ['app.controllers', 'app.directives', 'app.services', 'ui.bootstrap', 'angularFileUpload']);

app.config(function ($httpProvider) {
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});
