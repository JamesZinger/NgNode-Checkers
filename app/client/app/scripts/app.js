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

// Assign the server address
app.constant( 'SERVER_ADDRESS', 'http://localhost:3000/' );

// Perform the startup app configuration
app.config( function ( $routeProvider ) {

  $routeProvider
    .when( '/', {
      redirectTo: '/home'
    } )
    .when( '/404', {
      templateUrl: 'views/404.html'
    } )
    .when( '/home', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    } )
    .when( '/lobby', {
      templateUrl: 'views/lobby.html',
      controller: 'LobbyController'
    } )
    .when( '/game', {
      templateUrl: 'views/game.html',
      controller: 'GameController'
    } )
    .otherwise( {
      redirectTo: '/404'
    } );

} ).animation( '.reveal-animation', function () {

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