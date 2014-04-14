/* global app:false */
'use strict';

app.controller( 'HomeController', [
  '$rootScope', '$scope', '$log', '$location', 'PlayerModel', 'LobbyModel',
  function ( $rootScope, $scope, $log, $location, PlayerModel, LobbyModel ) {

    // Change the nav button to highlight this page in the navbar
    angular.element( '.navbar-nav > li' ).removeClass( 'active' );
    angular.element( '#nav-home' ).addClass( 'active' );

    // Set the ngView class for this page
    $scope.pageClass = 'view-home';

    // Create the player model and call to the server to initialize it by giving 
    // the player a unique scientist name.
    $rootScope.player = PlayerModel;
    $rootScope.player.init( LobbyModel );

    // Event listener for the Enter Lobby UI action
    $scope.onEnterLobbyAction = function () {

      // Start some kind of loading view?
      $log.info( 'HomeController.onEnterLobbyAction() >> Requesting lobby init...' );

      // Init the lobby (when this is complete it will trigger either 
      // onLobbyInitFailed() or onLobbyInitSuccess() below)
      $rootScope.player.lobby.init( $rootScope.player );

    };

    // Event listener for lobby init failure
    $scope.onLobbyInitFailed = function () {

      // Display some kind of error
      $log.error( 'HomeController.onLobbyInitFailed() >> Lobby initialization failed! Try again later.' );

    };

    // Event listener for lobby init success
    $scope.onLobbyInitSuccess = function () {

      $log.info( 'HomeController.onLobbyInitSuccess() >> Lobby initialized successfully!' );

      // Move to the lobby view
      $location.path( 'lobby' );

    };

    // Register callbacks for events on the lobby model
    LobbyModel.registerToInitFailed( $scope.onLobbyInitFailed );
    LobbyModel.registerToInitSuccess( $scope.onLobbyInitSuccess );

  }

] );