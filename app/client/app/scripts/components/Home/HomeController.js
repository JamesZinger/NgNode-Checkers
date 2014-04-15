/* global app:false */
'use strict';

app.controller( 'HomeController', [
  '$rootScope', '$scope', '$log', '$location', 'PlayerModel', 'LobbyModel',
  function ( $rootScope, $scope, $log, $location, PlayerModel, LobbyModel ) {

    function start() {

      // Change the nav button to highlight this page in the navbar
      angular.element( '.navbar-nav > li' ).removeClass( 'active' );
      angular.element( '#nav-home' ).addClass( 'active' );

      // Set the ngView class for this page
      $scope.pageClass = 'view-home';

      // Set the requested name using the player's name
      $scope.requestedName = PlayerModel.name;

      // Only run the first time the app launches
      if ( !$rootScope.initialized ) {

        // Register callbacks for events on the lobby model
        LobbyModel.addEventListener( LobbyModel.EVENT_INIT_FAILED, $scope.onLobbyInitFailed );
        LobbyModel.addEventListener( LobbyModel.EVENT_INIT_SUCCESS, $scope.onLobbyInitSuccess );
        LobbyModel.addEventListener( LobbyModel.EVENT_SET_NAME_FAILED, $scope.onPlayerSetNameFailed );
        LobbyModel.addEventListener( LobbyModel.EVENT_SET_NAME_SUCCESS, $scope.onPlayerSetNameSuccess );

        // Init the lobby to hook up listeners for netowrk events and set the player.
        LobbyModel.init( PlayerModel );

        // Attach the player model to the root scope and initialize it
        $rootScope.player = PlayerModel;
        PlayerModel.init( LobbyModel );

      }

    }

    // Event listener for the Enter Lobby UI action
    $scope.onEnterLobbyAction = function () {

      // Start some kind of loading view?
      // TODO

      if ( !$rootScope.initialized ) {

        $log.info( 'HomeController.onEnterLobbyAction() >> Requesting lobby init...' );

        // Get the initial lobby state from the server (when this is complete 
        // it will trigger either onLobbyInitFailed() or onLobbyInitSuccess() below)
        // *** NOTE *** This MUST be done after the player init!
        LobbyModel.requestInit();

      } else if ( PlayerModel.name !== $scope.requestedName ) {

        // Request the adjusted name
        PlayerModel.requestSetName( $scope.requestedName );

      } else {

        // Move to the lobby view
        $location.path( 'lobby' );

      }

    };

    // Event listener for lobby init failure
    $scope.onLobbyInitFailed = function () {

      // Display some kind of error
      $log.error( 'HomeController.onLobbyInitFailed() >> Lobby initialization failed! Try again later.' );

    };

    // Event listener for lobby init success
    $scope.onLobbyInitSuccess = function () {

      $log.info( 'HomeController.onLobbyInitSuccess() >> Lobby initialized successfully!' );

      // Mark the app as initialized
      $rootScope.initialized = true;

      // Move to the lobby view
      $location.path( 'lobby' );

    };

    // Event listener for player set name failure
    $scope.onPlayerSetNameFailed = function () {

      // Display some kind of error
      $log.error( 'HomeController.onPlayerSetNameFailed() >> Initial player set name request failed!' );

    };

    // Event listener for player set name success
    $scope.onPlayerSetNameSuccess = function () {

      // Display some kind of error
      $log.info( 'HomeController.onPlayerSetNameSuccess() >> Set player name successfully!' );

      // Set the requested name field to the player's new name value
      $scope.requestedName = PlayerModel.name;

      // Move to the lobby view if the lobby is already initialized
      if ( $rootScope.initialized ) {
        $location.path( 'lobby' );
      }

    };

    // Start up the controller
    start();

  }

] );