/* global app:false */
'use strict';

app.factory( 'LobbyModel', [
  '$log', 'LobbyProtocol',
  function ( $log, LobbyProtocol ) {

    // Retry calling requestInit() after a delay
    function tryAgain() {

      setTimeout( self.INIT_ATTEMPTS_DELAY, function () {
        self.requestInit();
      } );

    }

    // Create the lobby model object
    var self = {

      //
      // Constants
      //

      EVENT_INIT_FAILED: 0,
      EVENT_INIT_SUCCESS: 1,
      EVENT_SET_NAME_FAILED: 2,
      EVENT_SET_NAME_SUCCESS: 3,
      EVENT_START_PLAYING: 4,

      INIT_ATTEMPTS_DELAY: 1000, // ms between each attempt
      INIT_ATTEMPTS_MAX: 10, // # of attempts before failing

      //
      // Member Variables
      //

      // The player on this client
      player: null,

      // The lobby player list
      players: null,

      // The lobby game list
      games: null,

      // Counter to keep track of the number of initializion attempts made so far
      initAttempts: 0,

      // Callback registries for important events
      registryInitFailed: [],
      registryInitSuccess: [],
      registrySetNameFailed: [],
      registrySetNameSuccess: [],
      registryStartPlaying: [],

      //
      // Init
      //

      // init() initializes the that of the lobby model so it is ready to use.
      init: function ( player ) {

        $log.info( 'LobbyModel.init()' );

        // Store the player
        self.player = player;

        // Set initAttempts to 0
        self.initAttempts = 0;

        // Register event listeners for push notifications from the server
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_REQ_INIT, self.onResInit );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_REQ_CREATE_GAME, self.onResGameCreate );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_REQ_JOIN_GAME, self.onResGameJoin );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_REQ_LEAVE_GAME, self.onResGameLeave );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_REQ_SET_NAME, self.onResSetName );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_REQ_SET_READY, self.onResSetReady );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_REQ_SET_WAITING, self.onResSetWaiting );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_PUSH_GAME_CREATE, self.onPushGameCreate );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_PUSH_GAME_REMOVE, self.onPushGameRemove );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_PUSH_GAME_UPDATE, self.onPushGameUpdate );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_PUSH_PLAYER_CREATE, self.onPushPlayerCreate );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_PUSH_PLAYER_REMOVE, self.onPushPlayerRemove );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_PUSH_PLAYER_UPDATE, self.onPushPlayerUpdate );
        LobbyProtocol.addEventListener( LobbyProtocol.LOBBY_PUSH_START_PLAYING, self.onPushStartPlaying );

      },

      //
      // Observer Pattern
      //

      // deregisterListener() is a convenience function to deregister an event
      // listener from an event, knowing the array of listeners from which the
      // callback should be removed.
      deregisterListener: function ( listeners, callback ) {

        var index = listeners.indexOf( callback );
        if ( index > 0 ) {
          listeners.push( callback );
        }

      },

      // notifyListeners() is a convenience function to perform notification of all
      // registered listeners by calling each one and passing along the network
      // event data. Listeners must be an array of callbacks.
      notifyListeners: function ( listeners, data ) {

        // Call each of the functions registered as listeners for this network event
        var len = listeners.length;
        for ( var i = 0; i < len; i++ ) {
          listeners[ i ]( data );
        }

      },

      // registerListener() is a convenience function to register an event
      // listener to an event, knowing the array of listeners from which the
      // callback should be removed.
      registerListener: function ( listeners, callback ) {

        var index = listeners.indexOf( callback );
        if ( index < 0 ) {
          listeners.push( callback );
        }

      },

      // addEventListener() is a convenience function to provide a more traditional way of 
      // hooking into the observer pattern for listening to events.
      // Note: The callback must be of the form: function ( data ) { ... }
      addEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case self.EVENT_INIT_FAILED:
          self.registerListener( self.registryInitFailed, callback );
          break;

        case self.EVENT_INIT_SUCCESS:
          self.registerListener( self.registryInitSuccess, callback );
          break;

        case self.EVENT_SET_NAME_FAILED:
          self.registerListener( self.registrySetNameFailed, callback );
          break;

        case self.EVENT_SET_NAME_SUCCESS:
          self.registerListener( self.registrySetNameSuccess, callback );
          break;

        case self.EVENT_START_PLAYING:
          self.registerListener( self.registryStartPlaying, callback );
          break;

        default:
          throw 'LobbyModel.addEventListener >> Cannot register to this eventType. Unknown eventType!';

        }

      },

      // removeEventListener() is a convenience function to provide a more traditional 
      // way of hooking into the observer pattern for listening to events.
      // Note: The callback must be of the form: function ( data ) { ... }
      removeEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case self.EVENT_INIT_FAILED:
          self.deregisterListener( self.registryInitFailed, callback );
          break;

        case self.EVENT_INIT_SUCCESS:
          self.deregisterListener( self.registryInitSuccess, callback );
          break;

        case self.EVENT_SET_NAME_FAILED:
          self.deregisterListener( self.registrySetNameFailed, callback );
          break;

        case self.EVENT_SET_NAME_SUCCESS:
          self.deregisterListener( self.registrySetNameSuccess, callback );
          break;

        case self.EVENT_START_PLAYING:
          self.deregisterListener( self.registryStartPlaying, callback );
          break;

        default:
          throw 'LobbyModel.removeEventListener >> Cannot deregister from this eventType. Unknown eventType!';

        }

      },

      //
      // Requests
      //

      // requestInit() issues a request to fetch the necessary data to initialize
      // the lobby state and the player state on startup of the application.
      requestInit: function () {

        $log.info( 'LobbyModel.requestInit()' );
        LobbyProtocol.requestInit();

      },

      // requestGameCreate() issues a request to create a new game with the given
      // player as the host.
      requestGameCreate: function () {

        $log.info( 'LobbyModel.requestGameCreate()' );
        LobbyProtocol.requestGameCreate();

      },

      // requestGameLeave() issues a request to cause the given player to leave
      // the game to which they currently belong. If the given player is the host
      // of that game, then the game must also be cancelled.
      requestGameLeave: function () {

        $log.info( 'LobbyModel.requestGameLeave()' );
        LobbyProtocol.requestGameLeave();

      },

      // requestGameJoin() issues a request to join the game hosted by the player
      // with the given hostName.
      requestGameJoin: function ( hostName ) {

        $log.info( 'LobbyModel.requestGameJoin()' );
        LobbyProtocol.requestGameJoin( hostName );

      },

      // requestSetName() issues a request to set the given player's name to newName.
      requestSetName: function ( newName ) {

        $log.info( 'LobbyModel.requestSetName()' );
        LobbyProtocol.requestSetName( newName );

      },

      // requestSetReady() issues a request to set the given player's status to AVAILABLE.
      requestSetReady: function () {

        $log.info( 'LobbyModel.requestSetReady()' );
        LobbyProtocol.requestSetReady();

      },

      // requestSetWaiting() issues a request to set the given player's state to WAITING.
      requestSetWaiting: function () {

        $log.info( 'LobbyModel.requestSetWaiting()' );
        LobbyProtocol.requestSetWaiting();

      },

      //
      // Event Listeners
      //

      // onResInit()
      onResInit: function ( res ) {

        $log.info( 'LobbyModel.onResInit()' );

        // Check for success to throw the appropriate events in response to the init response
        if ( !res || !res.approved ) {

          if ( self.initAttempts++ < self.INIT_ATTEMPTS_MAX ) {

            // Init attempts remain -- Keep trying
            tryAgain();

          } else {

            // Out of attempts -- Init has failed
            self.onInitFailed();

          }

        } else {

          // Init was successful
          self.onInitSuccess( res.data );

        }

      },

      // onResGameCreate()
      onResGameCreate: function ( res ) {

        $log.info( 'LobbyModel.onResGameCreate()' );

        if ( !res || !res.approved ) {

          // Do nothing?
          $log.warn( 'LobbyModel.onResGameCreate() >> FAILED/DENIED!' );

        } else {

          // Create a new game using the data package
          var createdGame = res.data;
          self.games.push( createdGame );

          // Update the player state having created the game
          self.player.onCreatedOrJoinedGame( createdGame );

        }

      },

      // onResGameJoin()
      onResGameJoin: function ( res ) {

        $log.info( 'LobbyModel.onResGameJoin()' );

        if ( !res || !res.approved ) {

          // Do nothing?
          $log.warn( 'LobbyModel.onResGameJoin() >> FAILED/DENIED!' );

        } else {

          // Update the game using the data package
          var updatedGame = res.data;
          var index = self.indexOfGameByHostPlayerName( res.request.data );
          self.games[ index ].players = updatedGame.players;

          // Update the player state having joined the game
          self.player.onCreatedOrJoinedGame( self.games[ index ] );

        }

      },

      // onResGameLeave()
      onResGameLeave: function ( res ) {

        $log.info( 'LobbyModel.onResGameLeave()' );

        if ( !res || !res.approved ) {

          // Do nothing?
          $log.warn( 'LobbyModel.onResGameLeave() >> FAILED/DENIED!' );

        } else {

          // If this player is the host, cancel the game
          if ( self.player.name === self.player.getGameHostName() ) {
            var index = self.indexOfGameByHostPlayerName( self.player.name );
            self.games.splice( index, 1 );
          }

          // Update the player state having left the game
          self.player.onLeftGame();

        }

      },

      // onResSetName()
      onResSetName: function ( res ) {

        $log.info( 'LobbyModel.onResSetName()' );

        if ( !res || !res.approved ) {

          // Name change failed/denied
          self.onSetNameFailed();

        } else {

          // Name change approved
          self.onSetNameSuccess( res.data );

        }

      },

      // onResSetReady()
      onResSetReady: function ( res ) {

        $log.info( 'LobbyModel.onResSetReady()' );

        if ( !res || !res.approved ) {

            // Do nothing?
            $log.warn( 'LobbyModel.onResSetReady() >> FAILED/DENIED!' );

          } else {

            // Set the player's readiness in the game to which they belong
            self.player.onSetReady();

          }

      },

      // onResSetWaiting()
      onResSetWaiting: function ( res ) {

        $log.info( 'LobbyModel.onResSetWaiting()' );

        if ( !res || !res.approved ) {

          // Do nothing?
          $log.warn( 'LobbyModel.onResSetWaiting() >> FAILED/DENIED!' );

        } else {

          // Set the player's readiness in the game to which they belong
          self.player.onSetWaiting();

        }

      },

      // onInitFailed() is called when requestInit() is repeatedly unsuccessful and 
      // the attempt counter maxes out, so requestInit() gives up trying to connect.
      onInitFailed: function () {

        $log.error( 'LobbyModel.onInitFailed()' );

        // Call each of the functions registered as listeners for this event
        self.notifyListeners( self.registryInitFailed, null );

      },

      // onInitSuccess() is called when requestInit() recieves back an initialization
      // data packet from the server to configure the
      onInitSuccess: function ( initialLobbyState ) {

        $log.info( 'LobbyModel.onInitSuccess()' );

        // Use the players and games arrays sent from the server
        self.players = initialLobbyState.players;
        self.games = initialLobbyState.games;

        // Call each of the functions registered as listeners for this event
        self.notifyListeners( self.registryInitSuccess, initialLobbyState );

      },

      // onSetNameFailed() is called when requestSetName() is unsuccessful. This is
      // typically caused by a name conflict with another player, and so the player
      // probably just needs to know they should pick something else.
      onSetNameFailed: function () {

        $log.info( 'LobbyModel.onSetNameFailed()' );

        // Call each of the functions registered as listeners for this event
        self.notifyListeners( self.registrySetNameFailed, null );

      },

      // onSetNameSuccess() is called when requestSetName() is successful. This should
      // result in a screen change from the homepage to the lobby.
      onSetNameSuccess: function ( newName ) {

        $log.info( 'LobbyModel.onSetNameSuccess()' );

        // Change the player's name
        self.player.onSetName( newName );

        // Call each of the functions registered as listeners for this event
        self.notifyListeners( self.registrySetNameSuccess, newName );

      },

      // onPushGameCreate() is called when a push notification is received from the server
      // that a game should be created using the provided data package.
      onPushGameCreate: function ( data ) {

        $log.info( 'LobbyModel.onPushGameCreate()' );

        // The data package contains the created game.
        var createdGame = data.data;

        // Search for and remove any other games with this player as host. If any others 
        // exist then they are errors and it's time to fix the problem.
        while ( true ) {
          var index = self.indexOfGameByHostPlayerName( createdGame.players[ 0 ].name );
          if ( index === -1 ) {
            break;
          }
          $log.warn( 'LobbyModel.onPushGameCreate() >> Host player already is hosting another game! Removing game...' );
          self.games.splice( index, 1 );
        }

        // Add the created game to the lobby games list.
        self.games.push( createdGame );

      },

      // onPushGameRemove() is called when a push notification is received from the server
      // that the game with the host player named in the data package should be removed.
      onPushGameRemove: function ( data ) {

        $log.info( 'LobbyModel.onPushGameRemove()' );

        // The data package contains the name of the player whose game should be removed.
        var gameHostToRemove = data.data;

        // Search for and remove any games with this player as host.
        while ( true ) {
          var index = self.indexOfGameByHostPlayerName( gameHostToRemove );
          if ( index === -1 ) {
            break;
          }
          $log.info( 'LobbyModel.onPushGameRemove() >> Removing game...' );
          self.games.splice( index, 1 );
        }

      },

      // onPushGameUpdate() is called when a push notification is received from the server
      // that a game should be overwritten using the data package provided.
      onPushGameUpdate: function ( data ) {

        $log.info( 'LobbyModel.onPushGameUpdate()' );

        // The data package contains the updated game.
        var updatedGame = data.data;

        // Search for the game to update.
        var index = self.indexOfGameByHostPlayerName( updatedGame.players[ 0 ].name );

        // Update the game's members using the data package.
        //self.games[ index ].players = updatedGame.players;
        for ( var i = 0; i < self.games.length; i++ ) {
          self.games[ index ].players[ i ].name = updatedGame.players[ i ].name;
          self.games[ index ].players[ i ].ready = updatedGame.players[ i ].ready;
        }

      },

      // onPushPlayerCreate() is called when a push notification is received from the server
      // that a player should be created using the provided data package.
      onPushPlayerCreate: function ( data ) {

        $log.info( 'LobbyModel.onPushPlayerCreate()' );

        // The data package contains the created player.
        var createdPlayer = data.data;

        // Search for players with the same name. If another is found it is an error and 
        // should be removed.
        while ( true ) {
          var index = self.indexOfPlayerByName( createdPlayer.name );
          if ( index === -1 ) {
            break;
          }
          $log.warn( 'LobbyModel.onPushPlayerCreate() >> Player already exists! Removing player...' );
          self.players.splice( index, 1 );
        }

        // Add the created player to the lobby players list.
        self.players.push( createdPlayer );

      },

      // onPushPlayerRemove() is called when a push notification is received from the server
      // that the player named in the data package should be removed.
      onPushPlayerRemove: function ( data ) {

        $log.info( 'LobbyModel.onPushPlayerRemove()' );

        // The data package contains the name of the player to remove.
        var playerToRemove = data.data;

        // Search for and remove any players with this name.
        while ( true ) {
          var index = self.indexOfPlayerByName( playerToRemove );
          if ( index === -1 ) {
            break;
          }
          $log.info( 'LobbyModel.onPushPlayerRemove() >> Removing player...' );
          self.players.splice( index, 1 );
        }

      },

      // onPushPlayerUpdate() is called when a push notification is received from the server
      // that a player should be overwritten with the data package provided.
      onPushPlayerUpdate: function ( data ) {

        $log.info( 'LobbyModel.onPushPlayerUpdate()' );

        // The data package contains the updated player
        var updatedPlayer = data.data;

        // Search for the player to update.
        var index = self.indexOfPlayerByName( updatedPlayer.name );

        // Update the player's members using the data package.
        self.players[ index ].name = updatedPlayer.name;
        self.players[ index ].state = updatedPlayer.state;

      },

      // onPushStartPlaying() is called when a push notification is received from the server
      // that a the game the player belongs to has begun.
      onPushStartPlaying: function () {

        $log.info( 'LobbyModel.onPushStartPlaying()' );

        // Call each of the functions registered as listeners for this event
        var len = self.registryStartPlaying.length;
        for ( var i = 0; i < len; i++ ) {
          self.registryStartPlaying[ i ]();
        }

      },

      //
      // Utility Functions
      //

      // indexOfGameByHostPlayerName() is a convenience function to find a game by linearly 
      // searching through the lobby game list for the host player of the game.
      // Note: Returns -1 if the given name didn't match any game's host player.
      indexOfGameByHostPlayerName: function ( name ) {

        if ( self.games === null ) {
          return -1;
        }

        // Perform a linear search for the game with the host player to match the data package
        var len = self.games.length;
        for ( var i = 0; i < len; i++ ) {
          if ( name === self.games[ i ].players[ 0 ].name ) {
            return i;
          }
        }
        return -1;

      },

      // indexOfPlayerByName() is a convenience function to find a player by linearly searching
      // through the lobby player list for the player by name.
      // Note: Returns -1 if the given name didn't match any player.
      indexOfPlayerByName: function ( name ) {

        if ( self.players === null ) {
          return -1;
        }

        // Perform a linear search for the game with the host player to match the data package
        var len = self.players.length;
        for ( var i = 0; i < len; i++ ) {
          if ( name === self.players[ i ].name ) {
            return i;
          }
        }
        return -1;

      },

    };

    return self;

  }

] );