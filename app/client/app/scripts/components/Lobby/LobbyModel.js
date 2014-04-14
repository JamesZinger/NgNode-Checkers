/* global app:false */
'use strict';

app.factory( 'LobbyModel', [
  '$log', 'LobbyProtocol',
  function ( $log, LobbyProtocol ) {

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

      // The lobby player list
      players = null,

      // The lobby game list
      games = null,

      // Callback registries for important events
      registryInitFailed = [],
      registryInitSuccess = [],
      registrySetNameFailed = [],
      registrySetNameSuccess = [],
      registryStartPlaying = [],

      //
      // Init
      //

      // init() initializes the that of the lobby model so it is ready to use.
      init: function ( player ) {

        $log.info( 'LobbyModel.init()' );

        // Register event listeners for push notifications from the server
        LobbyProtocol.registerToGameCreate( self.onPushGameCreate );
        LobbyProtocol.registerToGameRemove( self.onPushGameRemove );
        LobbyProtocol.registerToGameUpdate( self.onPushGameUpdate );
        LobbyProtocol.registerToPlayerCreate( self.onPushPlayerCreate );
        LobbyProtocol.registerToPlayerRemove( self.onPushPlayerRemove );
        LobbyProtocol.registerToPlayerUpdate( self.onPushPlayerUpdate );
        LobbyProtocol.registerToStartPlaying( self.onPushStartPlaying );

        // Request to the server to deliver the inital lobby state.
        self.requestInit( player );

      },

      //
      // Callback Regisitration
      //

      // addEventListener() is a convenience function to provide a more traditional way of 
      // hooking into the observer pattern for listening to events.
      // Note: The callback must be of the form: function ( data ) { ... }
      addEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case self.EVENT_INIT_FAILED:
          self.registerToInitFailed( callback );
          break;
        case self.EVENT_INIT_SUCCESS:
          self.registerToInitSuccess( callback );
          break;
        case self.EVENT_SET_NAME_FAILED:
          self.registerToSetNameFailed( callback );
          break;
        case self.EVENT_SET_NAME_SUCCESS:
          self.registerToSetNameSuccess( callback );
          break;
        case self.EVENT_START_PLAYING:
          self.registerToStartPlaying( callback );
          break;
        default:
          throw 'LobbyModel.addEventListener >> Cannot register to this eventType. Unknown eventType!';

        }

      },

      // registerToInitFailed() registers the given function callback to be called when a
      // EVENT_INIT_FAILED event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToInitFailed: function ( callback ) {

        var index = self.registryInitFailed.indexOf( callback );
        if ( index < 0 ) {
          self.registryInitFailed.push( callback );
        }

      },

      // registerToInitSuccess() registers the given function callback to be called when a
      // EVENT_INIT_SUCCESS event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToInitSuccess: function ( callback ) {

        var index = self.registryInitSuccess.indexOf( callback );
        if ( index < 0 ) {
          self.registryInitSuccess.push( callback );
        }

      },

      // registerToSetNameFailed() registers the given function callback to be called when a
      // EVENT_SET_NAME_FAILED event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToSetNameFailed: function ( callback ) {

        var index = self.registrySetNameFailed.indexOf( callback );
        if ( index < 0 ) {
          self.registrySetNameFailed.push( callback );
        }

      },

      // registerToSetNameSuccess() registers the given function callback to be called when a
      // EVENT_SET_NAME_SUCCESS event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToSetNameSuccess: function ( callback ) {

        var index = self.registrySetNameSuccess.indexOf( callback );
        if ( index < 0 ) {
          self.registrySetNameSuccess.push( callback );
        }

      },

      // registerToStartPlaying() registers the given function callback to be called when a
      // EVENT_START_PLAYING event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToStartPlaying: function ( callback ) {

        var index = self.registryStartPlaying.indexOf( callback );
        if ( index < 0 ) {
          self.registryStartPlaying.push( callback );
        }

      },

      //
      // Callback Deregistration
      //

      // removeEventListener() is a convenience function to provide a more traditional 
      // way of hooking into the observer pattern for listening to events.
      // Note: The callback must be of the form: function ( data ) { ... }
      removeEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case self.EVENT_INIT_FAILED:
          self.deregisterFromInitFailed( callback );
          break;
        case self.EVENT_INIT_SUCCESS:
          self.deregisterFromInitSuccess( callback );
          break;
        case self.EVENT_SET_NAME_FAILED:
          self.deregisterFromSetNameFailed( callback );
          break;
        case self.EVENT_SET_NAME_SUCCESS:
          self.deregisterFromSetNameSuccess( callback );
          break;
        case self.EVENT_START_PLAYING:
          self.deregisterFromStartPlaying( callback );
          break;
        default:
          throw 'LobbyModel.removeEventListener >> Cannot deregister from this eventType. Unknown eventType!';

        }

      },

      // deregisterFromInitFailed() deregisters the given function callback from the 
      // EVENT_INIT_FAILED event.
      deregisterFromInitFailed: function ( callback ) {

        var index = self.registryInitFailed.indexOf( callback );
        if ( index > 0 ) {
          self.registryInitFailed.push( callback );
        }

      },

      // deregisterFromInitSuccess() deregisters the given function callback from the 
      // EVENT_INIT_SUCCESS event.
      deregisterFromInitSuccess: function ( callback ) {

        var index = self.registryInitSuccess.indexOf( callback );
        if ( index > 0 ) {
          self.registryInitSuccess.push( callback );
        }

      },

      // deregisterFromSetNameFailed() deregisters the given function callback from the 
      // EVENT_SET_NAME_FAILED event.
      deregisterFromSetNameFailed: function ( callback ) {

        var index = self.registrySetNameFailed.indexOf( callback );
        if ( index > 0 ) {
          self.registrySetNameFailed.push( callback );
        }

      },

      // deregisterFromSetNameSuccess() deregisters the given function callback from the 
      // EVENT_SET_NAME_SUCCESS event.
      deregisterFromSetNameSuccess: function ( callback ) {

        var index = self.registrySetNameSuccess.indexOf( callback );
        if ( index > 0 ) {
          self.registrySetNameSuccess.push( callback );
        }

      },

      // deregisterFromStartPlaying() deregisters the given function callback from the 
      // EVENT_START_PLAYING event.
      deregisterFromStartPlaying: function ( callback ) {

        var index = self.registryStartPlaying.indexOf( callback );
        if ( index > 0 ) {
          self.registryStartPlaying.push( callback );
        }

      },

      //
      // Requests
      //

      // requestInit() issues a request to fetch the necessary data to initialize
      // the lobby state and the player state on startup of the application.
      requestInit: function ( player ) {

        $log.info( 'LobbyModel.requestInit()' );

        LobbyProtocol.requestInit( player, function ( data ) {

          // Retry calling requestInit() after a delay
          function tryAgain() {
            setTimeout( self.INIT_ATTEMPTS_DELAY, function () {
              self.requestInit();
            } );
          }

          // Check for success to throw the appropriate events in response to the init response
          if ( !data || !data.approved ) {

            if ( self.initAttempts++ < self.INIT_ATTEMPTS_MAX ) {

              // Init attempts remain -- Keep trying
              tryAgain();

            } else {

              // Out of attempts -- Init has failed
              self.onInitFailed();

            }

          } else {

            // Init was successful
            self.onInitSuccess( player, data );

          }

        } );

      },

      // requestGameCreate() issues a request to create a new game with the given
      // player as the host.
      requestGameCreate: function ( player ) {

        $log.info( 'LobbyModel.requestGameCreate()' );

        LobbyProtocol.requestGameCreate( player, function ( data ) {

          if ( !data || !data.approved ) {

            // Do nothing?
            $log.warn( 'LobbyModel.requestGameCreate() >> FAILED/DENIED!' );

          } else {

            // Create a new game using the data package
            var createdGame = data.data;
            self.games.push( createdGame );

            // Update the player state having created the game
            player.onCreatedOrJoinedGame( createdGame );

          }

        } );

      },

      // requestGameLeave() issues a request to cause the given player to leave
      // the game to which they currently belong. If the given player is the host
      // of that game, then the game must also be cancelled.
      requestGameLeave: function ( player ) {

        $log.info( 'LobbyModel.requestGameLeave()' );

        LobbyProtocol.requestGameLeave( player, function ( data ) {

          if ( !data || !data.approved ) {

            // Do nothing?
            $log.warn( 'LobbyModel.requestGameLeave() >> FAILED/DENIED!' );

          } else {

            // If this player is the host, cancel the game
            if ( player.name === player.getGameHost() ) {
              self.games.splice( index, 1 );
            }

            // Update the player state having left the game
            player.onLeftGame();

          }

        } );

      },

      // requestGameJoin() issues a request to join the game hosted by the player
      // with the given hostName.
      requestGameJoin: function ( player, hostName ) {

        $log.info( 'LobbyModel.requestGameJoin()' );

        LobbyProtocol.requestGameJoin( player, hostName, function ( data ) {

          if ( !data || !data.approved ) {

            // Do nothing?
            $log.warn( 'LobbyModel.requestGameJoin() >> FAILED/DENIED!' );

          } else {

            // Update the game using the data package
            var updatedGame = data.data;
            var index = self.indexOfGameByHostPlayerName( hostName );
            self.games[ index ].players = updatedPlayers.players;

            // Update the player state having joined the game
            player.onCreatedOrJoinedGame( games[ index ] );

          }

        } );

      },

      // requestSetName() issues a request to set the given player's name to newName.
      requestSetName: function ( player, newName ) {

        $log.info( 'LobbyModel.requestSetName()' );

        LobbyProtocol.requestSetName( player, newName, function ( data ) {

          if ( !data || !data.approved ) {

            // Name change failed/denied
            self.onSetNameFailed();

          } else {

            // Name change approved
            self.onSetNameSuccess( player, data.data );

          }

        } );

      },

      // requestSetReady() issues a request to set the given player's status to AVAILABLE.
      requestSetReady: function ( player ) {

        $log.info( 'LobbyModel.requestSetReady()' );

        LobbyProtocol.requestSetReady( player, function ( data ) {

          if ( !data || !data.approved ) {

            // Do nothing?
            $log.warn( 'LobbyModel.requestSetReady() >> FAILED/DENIED!' );

          } else {

            // Set the player's readiness in the game to which they belong
            player.onSetReady();

          }

        } );

      },

      // requestSetWaiting() issues a request to set the given player's state to WAITING.
      requestSetWaiting: function ( player ) {

        $log.info( 'LobbyModel.requestSetWaiting()' );

        LobbyProtocol.requestSetWaiting( player, function ( data ) {

          if ( !data || !data.approved ) {

            // Do nothing?
            $log.warn( 'LobbyModel.requestSetWaiting() >> FAILED/DENIED!' );

          } else {

            // Set the player's readiness in the game to which they belong
            player.onSetWaiting();

          }

        } );

      },

      //
      // Event Handlers
      //

      // onInitFailed() is called when requestInit() is repeatedly unsuccessful and 
      // the attempt counter maxes out, so requestInit() gives up trying to connect.
      onInitFailed: function () {

        $log.error( 'LobbyModel.onInitFailed()' );

        // Call each of the functions registered as listeners for this event
        var len = self.registryInitFailed.length;
        for ( var i = 0; i < len; i++ ) {
          self.registryInitFailed[ i ]();
        }

      },

      // onInitSuccess() is called when requestInit() recieves back an initialization
      // data packet from the server to configure the
      onInitSuccess: function ( player, data ) {

        $log.info( 'LobbyModel.onInitSuccess()' );

        // Use the players and games arrays sent from the server
        var initialLobbyState = data.data;
        self.players = initialLobbyState.players;
        self.games = initialLobbyState.games;

        // Call each of the functions registered as listeners for this event
        var len = self.registryInitSuccess.length;
        for ( var i = 0; i < len; i++ ) {
          self.registryInitSuccess[ i ]();
        }

      },

      // onSetNameFailed() is called when requestSetName() is unsuccessful. This is
      // typically caused by a name conflict with another player, and so the player
      // probably just needs to know they should pick something else.
      onSetNameFailed: function () {

        $log.info( 'LobbyModel.onSetNameFailed()' );

        // Call each of the functions registered as listeners for this event
        var len = self.registrySetNameFailed.length;
        for ( var i = 0; i < len; i++ ) {
          self.registrySetNameFailed[ i ]();
        }

      },

      // onSetNameSuccess() is called when requestSetName() is successful. This should
      // result in a screen change from the homepage to the lobby.
      onSetNameSuccess: function ( player, newName ) {

        $log.info( 'LobbyModel.onSetNameSuccess()' );

        // Change the player's name
        player.onSetName( newName );

        // Call each of the functions registered as listeners for this event
        var len = self.registrySetNameSuccess.length;
        for ( var i = 0; i < len; i++ ) {
          self.registrySetNameSuccess[ i ]();
        }

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
        self.games[ index ].players = updatedGame.players;

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
          $log.info( 'LobbyModel.onPushPlayerRemove() >> Removing game...' );
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
      onPushStartPlaying: function ( data ) {

        $log.info( 'LobbyModel.onPushStartPlaying()' );

        // Call each of the functions registered as listeners for this event
        var len = self.registryStartPlaying.length;
        for ( var i = 0; i < len; i++ ) {
          self.registryStartPlaying[ i ]();
        }

      }

      //
      // Utility Functions
      //

      // indexOfGameByHostPlayerName() is a convenience function to find a game by linearly 
      // searching through the lobby game list for the host player of the game.
      // Note: Returns -1 if the given name didn't match any game's host player.
      indexOfGameByHostPlayerName: function ( name ) {

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

    // Init and retutrn
    self.init();
    return self;

  }

] );