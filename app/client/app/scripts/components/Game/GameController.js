/* global app:false */
'use strict';

app.controller( 'PlayController', function ( $rootScope, $scope, $log, $timeout, CheckersModel ) {

  // Change the nav button to highlight this page in the navbar
  angular.element( '.navbar-nav > li' ).removeClass( 'active' );
  angular.element( '#nav-play' ).addClass( 'active' );

  // Set the ngView class for this page
  $scope.pageClass = 'view-play';

  // Check for an existing checkers game model inside the scope
  if ( $rootScope.player.gamePlay === null ) {
    $rootScope.player.gamePlay = CheckersModel;
    $rootScope.player.gamePlay.init( 960, 540, angular.element( '#play-scene' ) );
    $rootScope.player.gamePlay.render();
  }

  // Append the scene renderer to the view
  $rootScope.player.gamePlay.setParent( angular.element( '#play-scene' ) );

} );