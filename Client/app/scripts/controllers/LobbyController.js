/* global app:false */
/* global $:false */
'use strict';

app.controller( 'LobbyController', function ( $rootScope, $scope, $log, PlayerState, LobbyState ) {

  // Change the nav button to highlight this page in the navbar
  angular.element( '.navbar-nav > li' ).removeClass( 'active' );
  angular.element( '#nav-lobby' ).addClass( 'active' );

  // Set the ngView class for this page
  $scope.pageClass = 'view-lobby';

  // Scope variables for filtering lists of players and games by the name of a player
  $scope.filterPlayersName = '';
  $scope.filterGamesName = '';

  // Data structure to maintain lobby state
  if ( $scope.lobby === undefined ) {
    $scope.lobby = LobbyState;
  }

  // Data structure to maintain player state
  if ( $rootScope.player === undefined ) {
    $rootScope.player = PlayerState;
  }

  // Event listener for the Cancel Game UI action
  $scope.onCancelGameAction = function () {
    try {
      $rootScope.player.requestCancelGame();
    } catch ( e ) {
      $log.error( 'requestCancelGame() threw ' + e );
    }
  };

  // Event listener for the Create Game UI action
  $scope.onCreateGameAction = function () {
    try {
      $rootScope.player.requestCreateGame();
    } catch ( e ) {
      $log.error( 'requestCreateGame() threw ' + e );
    }
  };

  // Event listener for the Join Game UI action
  $scope.onJoinGameAction = function ( evt ) {

    // There isn't much DOM parsing wizardry in this file, but this is definitely some here.
    // This grabs the name of the host player from the game DOM element in the lobby.
    var hostName = $( evt.currentTarget ).parent().parent().find( '.player-joined :first-child' ).text();


    // This can be done using id tag on join button!


    try {
      $rootScope.player.requestJoinGame( hostName );
    } catch ( e ) {
      $log.error( 'requestJoinGame() threw ' + e );
    }
  };

  // Event listener for the Leave Game UI action
  $scope.onLeaveGameAction = function () {
    try {
      $rootScope.player.requestLeaveGame();
    } catch ( e ) {
      $log.error( 'requestLeaveGame() threw ' + e );
    }
  };

  // Event listener for the Ready UI action
  $scope.onReadyAction = function () {
    try {
      $rootScope.player.requestSetReady();
    } catch ( e ) {
      $log.error( 'requestSetReady() threw ' + e );
    }
  };

  // Event listener for the Waiting UI action
  $scope.onWaitingAction = function () {
    try {
      $rootScope.player.requestSetWaiting();
    } catch ( e ) {
      $log.error( 'requestSetWaiting() threw ' + e );
    }
  };

} );