'use strict';
var app = angular.module('app', ['ngRoute', 'app.controllers', 'app.directives', 'app.services', 'ui.bootstrap', 'angularFileUpload']);

app.config(['$locationProvider','$routeProvider', function ($locationProvider, $routeProvider) {
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//    html5 mode for location
    $locationProvider.html5Mode(true).hashPrefix('!');

    $routeProvider
        .when('/:id', {
            controller: 'modalCtrl as Modal',
            templateUrl: 'templates/modal.html',
            resolve: {
                workspace: function ($route, workspace) {
                    console.log('RESOLVING');
                    return workspace.getData($route.current.params.id);
                }
            }
        });
//        .otherwise({
//            redirectTo: '/'
//        });

}]);
