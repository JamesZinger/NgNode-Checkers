/* global app:false */
'use strict';

app.controller( 'LobbyController', [ 
  '$rootScope', '$scope', '$log'
  function ( $rootScope, $scope, $log ) {

  // Change the nav button to highlight this page in the navbar
  angular.element( '.navbar-nav > li' ).removeClass( 'active' );
  angular.element( '#nav-lobby' ).addClass( 'active' );

  // Set the ngView class for this page
  $scope.pageClass = 'view-lobby';

  // Scope variables for filtering lists of players and games by the name of a player
  $scope.filterPlayersName = '';
  $scope.filterGamesName = '';

  // Event listener for the Cancel Game UI action
  $scope.onCancelGameAction = function () {

    $rootScope.player.requestLeaveGame();

  };

  // Event listener for the Create Game UI action
  $scope.onCreateGameAction = function () {

    $rootScope.player.requestCreateGame();

  };

  // Event listener for the Join Game UI action
  $scope.onJoinGameAction = function ( event ) {

    // There isn't much DOM parsing wizardry in this file, but this is definitely some here.
    // This grabs the name of the host player from the game DOM element in the lobby.
    var hostName = $( event.currentTarget ).parent().parent().find( '.player-joined :first-child' ).text();


    // This can be done using id tag on join button!


    $rootScope.player.requestJoinGame( hostName );

  };

  // Event listener for the Leave Game UI action
  $scope.onLeaveGameAction = function () {

    $rootScope.player.requestLeaveGame();

  };

  // Event listener for the Ready UI action
  $scope.onReadyAction = function () {

    $rootScope.player.requestSetReady();

  };

  // Event listener for the Waiting UI action
  $scope.onWaitingAction = function () {

    $rootScope.player.requestSetWaiting();

  };

} );