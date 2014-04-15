/* global app:false */
'use strict';

app.controller( 'GameController', [
  '$rootScope', '$scope', '$log', '$location', '$timeout', 'CheckersModel',
  function ( $rootScope, $scope, $log, $location, $timeout, CheckersModel ) {

    // Redirect to the home page if not initialized yet
    if ( !$rootScope.initialized ) {
      $location.path( 'home' );
    }

    // Change the nav button to highlight this page in the navbar
    angular.element( '.navbar-nav > li' ).removeClass( 'active' );
    angular.element( '#nav-game' ).addClass( 'active' );

    // Set the ngView class for this page
    $scope.pageClass = 'view-game';

    // Check for an existing checkers game model inside the scope
    if ( $rootScope.player.game === null ) {
      $rootScope.player.game = CheckersModel;
      $rootScope.player.game.init( $rootScope.gameState, 1080, 608, angular.element( '#game-scene' ) );
      $rootScope.gameState = null;
      $rootScope.player.game.render();
    }

    // Append the scene renderer to the view
    $rootScope.player.game.setParent( angular.element( '#game-scene' ) );

  }
  
] );