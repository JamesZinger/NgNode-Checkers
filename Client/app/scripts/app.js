/* exported app */
'use strict';

// Assign the primary module to app
var app = angular.module( 'ngCheckersApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
] );

// Perform the startup app configuration
app.config( function ( $routeProvider ) {

  $routeProvider
    .when( '/', {
      templateUrl: 'views/main.html',
      controller: 'MainController'
    } )
    .when( '/home', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    } )
    .when( '/lobby', {
      templateUrl: 'views/lobby.html',
      controller: 'LobbyController'
    } )
    .when( '/play', {
      templateUrl: 'views/play.html',
      controller: 'PlayController'
    } )
    .otherwise( {
      redirectTo: '/404'
    } );

} )
  .animation( '.reveal-animation', function () {
    return {
      enter: function ( element, done ) {
        element.css( 'display', 'none' );
        element.fadeIn( 500, done );
        return function () {
          element.stop();
        };
      },
      leave: function ( element, done ) {
        element.fadeOut( 500, done );
        return function () {
          element.stop();
        };
      }
    };
  } );