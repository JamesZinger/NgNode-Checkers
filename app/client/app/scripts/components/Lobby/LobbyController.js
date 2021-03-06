/* global app:false */
'use strict';

app.controller( 'LobbyController', [
  '$rootScope', '$scope', '$log', '$location',
  function ( $rootScope, $scope, $log, $location ) {

    function start() {

      // Redirect to the home page if not initialized yet
      if ( !$rootScope.initialized ) {
        $location.path( 'home' );
      }

      // Change the nav button to highlight this page in the navbar
      angular.element( '.navbar-nav > li' ).removeClass( 'active' );
      angular.element( '#nav-lobby' ).addClass( 'active' );

      // Set the ngView class for this page
      $scope.pageClass = 'view-lobby';

      // Register callbacks for events on the lobby model
      $rootScope.player.lobby.addEventListener( $rootScope.player.lobby.EVENT_START_PLAYING, $scope.onStartPlaying );
      
      // Scope variables for filtering lists of players and games by the name of a player
      $scope.filterPlayersName = '';
      $scope.filterGamesName = '';

    }

    // Event listener for the Cancel Game UI action
    $scope.onCancelGameAction = function () {

      $log.info( 'LobbyController.onCancelGameAction()' );
      $rootScope.player.requestLeaveGame();

    };

    // Event listener for the Create Game UI action
    $scope.onCreateGameAction = function () {

      $log.info( 'LobbyController.onCreateGameAction()' );
      $rootScope.player.requestCreateGame();

    };

    // Event listener for the Join Game UI action
    $scope.onJoinGameAction = function ( event ) {

      $log.info( 'LobbyController.onJoinGameAction()' );

      // There isn't much DOM parsing wizardry in this file, but this is definitely some here.
      // This grabs the name of the host player from the game DOM element in the lobby.
      var hostName = angular.element( event.currentTarget )
        .parent().parent().find( '.player-joined :first-child' ).text();

      $rootScope.player.requestJoinGame( hostName );

    };

    // Event listener for the Leave Game UI action
    $scope.onLeaveGameAction = function () {

      $log.info( 'LobbyController.onLeaveGameAction()' );
      $rootScope.player.requestLeaveGame();

    };

    // Event listener for the Ready UI action
    $scope.onReadyAction = function () {

      $log.info( 'LobbyController.onReadyAction()' );
      $rootScope.player.requestSetReady();

    };

    // Event listener for the Waiting UI action
    $scope.onWaitingAction = function () {

      $log.info( 'LobbyController.onWaitingAction()' );
      $rootScope.player.requestSetWaiting();

    };

    // Event listener for the Start Playing network event
    $scope.onStartPlaying = function ( data ) {

      $log.info( 'LobbyController.onStartPlaying()' );
      var gameState = data.data;
      $rootScope.gameState = gameState;
      $location.path( 'game' );

    };

    // Start up the controller
    start();

  }
  
] );