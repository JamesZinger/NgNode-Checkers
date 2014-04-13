/* global app:false */
'use strict';

app.factory( 'LobbyModel', [ 'LobbyProtocol',
  function ( $log ) {

    // init() will be called just prior to returning the lobby model object.
    function init() {

      // Register event listeners for push notifications from the server
      LobbyProtocol.registerToGameCreate( lobbyModel.onPushGameCreate );
      LobbyProtocol.registerToGameRemove( lobbyModel.onPushGameRemove );
      LobbyProtocol.registerToGameUpdate( lobbyModel.onPushGameUpdate );
      LobbyProtocol.registerToPlayerCreate( lobbyModel.onPushPlayerCreate );
      LobbyProtocol.registerToPlayerRemove( lobbyModel.onPushPlayerRemove );
      LobbyProtocol.registerToPlayerUpdate( lobbyModel.onPushPlayerUpdate );
      LobbyProtocol.registerToStartPlaying( lobbyModel.onPushStartPlaying );

    }

    // Create the lobby model object
    var lobbyModel = {

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
      // Callback Regisitration
      //

      // addEventListener() is a convenience function to provide a more traditional way of hooking
      // into the observer pattern for listening to events.
      // Note: The callback must be of the form: function ( data ) { ... }
      addEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case lobbyModel.EVENT_INIT_FAILED:
          lobbyModel.registerFromInitFailed( callback );
          break;
        case lobbyModel.EVENT_INIT_SUCCESS:
          lobbyModel.registerFromInitSuccess( callback );
          break;
        case lobbyModel.EVENT_SET_NAME_FAILED:
          lobbyModel.registerFromSetNameFailed( callback );
          break;
        case lobbyModel.EVENT_SET_NAME_SUCCESS:
          lobbyModel.registerFromSetNameSuccess( callback );
          break;
        case lobbyModel.EVENT_START_PLAYING:
          lobbyModel.registerFromStartPlaying( callback );
          break;
        default:
          throw 'LobbyModel.addEventListener >> Cannot register to this eventType. Unknown eventType!';

        }

      },

      // registerFromInitFailed() registers the given function callback to be called when a
      // EVENT_INIT_FAILED event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerFromInitFailed: function ( callback ) {

        var index = lobbyProtocol.registryInitFailed.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryInitFailed.push( callback );
        }

      },

      // registerFromInitSuccess() registers the given function callback to be called when a
      // EVENT_INIT_SUCCESS event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerFromInitSuccess: function ( callback ) {

        var index = lobbyProtocol.registryInitSuccess.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryInitSuccess.push( callback );
        }

      },

      // registerFromSetNameFailed() registers the given function callback to be called when a
      // EVENT_SET_NAME_FAILED event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerFromSetNameFailed: function ( callback ) {

        var index = lobbyProtocol.registrySetNameFailed.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registrySetNameFailed.push( callback );
        }

      },

      // registerFromSetNameSuccess() registers the given function callback to be called when a
      // EVENT_SET_NAME_SUCCESS event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerFromSetNameSuccess: function ( callback ) {

        var index = lobbyProtocol.registrySetNameSuccess.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registrySetNameSuccess.push( callback );
        }

      },

      // registerFromStartPlaying() registers the given function callback to be called when a
      // EVENT_START_PLAYING event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerFromStartPlaying: function ( callback ) {

        var index = lobbyProtocol.registryStartPlaying.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryStartPlaying.push( callback );
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

        case lobbyModel.EVENT_INIT_FAILED:
          lobbyModel.deregisterFromInitFailed( callback );
          break;
        case lobbyModel.EVENT_INIT_SUCCESS:
          lobbyModel.deregisterFromInitSuccess( callback );
          break;
        case lobbyModel.EVENT_SET_NAME_FAILED:
          lobbyModel.deregisterFromSetNameFailed( callback );
          break;
        case lobbyModel.EVENT_SET_NAME_SUCCESS:
          lobbyModel.deregisterFromSetNameSuccess( callback );
          break;
        case lobbyModel.EVENT_START_PLAYING:
          lobbyModel.deregisterFromStartPlaying( callback );
          break;
        default:
          throw 'LobbyModel.removeEventListener >> Cannot deregister from this eventType. Unknown eventType!';

        }

      },

      // deregisterFromInitFailed() deregisters the given function callback from the 
      // EVENT_INIT_FAILED event.
      deregisterFromInitFailed: function ( callback ) {

        var index = lobbyModel.registryInitFailed.indexOf( callback );
        if ( index > 0 ) {
          lobbyModel.registryInitFailed.push( callback );
        }

      },

      // deregisterFromInitSuccess() deregisters the given function callback from the 
      // EVENT_INIT_SUCCESS event.
      deregisterFromInitSuccess: function ( callback ) {

        var index = lobbyModel.registryInitSuccess.indexOf( callback );
        if ( index > 0 ) {
          lobbyModel.registryInitSuccess.push( callback );
        }

      },

      // deregisterFromSetNameFailed() deregisters the given function callback from the 
      // EVENT_SET_NAME_FAILED event.
      deregisterFromSetNameFailed: function ( callback ) {

        var index = lobbyModel.registrySetNameFailed.indexOf( callback );
        if ( index > 0 ) {
          lobbyModel.registrySetNameFailed.push( callback );
        }

      },

      // deregisterFromSetNameSuccess() deregisters the given function callback from the 
      // EVENT_SET_NAME_SUCCESS event.
      deregisterFromSetNameSuccess: function ( callback ) {

        var index = lobbyModel.registrySetNameSuccess.indexOf( callback );
        if ( index > 0 ) {
          lobbyModel.registrySetNameSuccess.push( callback );
        }

      },

      // deregisterFromStartPlaying() deregisters the given function callback from the 
      // EVENT_START_PLAYING event.
      deregisterFromStartPlaying: function ( callback ) {

        var index = lobbyModel.registryStartPlaying.indexOf( callback );
        if ( index > 0 ) {
          lobbyModel.registryStartPlaying.push( callback );
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
            setTimeout( lobbyModel.INIT_ATTEMPTS_DELAY, function () {
              lobbyModel.requestInit();
            } );
          }

          // Check for success to throw the appropriate events in response to the init response
          if ( !data || !data.approved ) {

            if ( lobbyModel.initAttempts++ < lobbyModel.INIT_ATTEMPTS_MAX ) {

              // Init attempts remain -- Keep trying
              tryAgain();

            } else {

              // Out of attempts -- Init has failed
              lobbyModel.onInitFailed();

            }

          } else {

            // Init was successful
            lobbyModel.onInitSuccess( player, data );

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
            games.push( data.data );

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
              games.splice( index, 1 );
            }

            // Update the player state to have left the game
            player.leaveGame();
            //player.gameLobby = null;
            //player.state = 'Available';

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

            // Update the game
            var index = lobyyModel.indexOfGameByHostPlayerName( hostName );
            games[ index ].players = data.data.players;

            // Update the player state to have joined the game
            player.joinGame( games[ index ] );
            //player.gameLobby = games[ index ];
            //player.state = 'Playing';

          }

        } );

      },

      // requestSetName() issues a request to set the given player's name to newName.
      requestSetName: function ( player, newName ) {

        $log.info( 'LobbyModel.requestSetName()' );

        LobbyProtocol.requestSetName( player, newName, function ( data ) {

          if ( !data || !data.approved ) {

            // Name change failed/denied
            lobbyModel.onSetNameFailed();

          } else {

            // Name change approved
            lobbyModel.onSetNameSuccess( player, newName );

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
            player.setReady();

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
            player.setWaiting();

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
        var len = lobbyModel.registryInitFailed.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyModel.registryInitFailed[ i ]();
        }

      },

      // onInitSuccess() is called when requestInit() recieves back an initialization
      // data packet from the server to configure the
      onInitSuccess: function ( player, data ) {

        $log.info( 'LobbyModel.onInitSuccess()' );

        // Give the player an initial name
        player.name = data.data.initialPlayerName;

        // Use the players and games arrays sent from the server
        players = data.data.players;
        games = data.data.games;

        // Call each of the functions registered as listeners for this event
        var len = lobbyModel.registryInitSuccess.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyModel.registryInitSuccess[ i ]();
        }

      },

      // onSetNameFailed() is called when requestSetName() is unsuccessful. This is
      // typically caused by a name conflict with another player, and so the player
      // probably just needs to know they should pick something else.
      onSetNameFailed: function () {

        $log.info( 'LobbyModel.onSetNameFailed()' );

        // Call each of the functions registered as listeners for this event
        var len = lobbyModel.registrySetNameFailed.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registrySetNameFailed[ i ]();
        }

      },

      // onSetNameSuccess() is called when requestSetName() is successful. This should
      // result in a screen change from the homepage to the lobby.
      onSetNameSuccess: function ( player, newName ) {

        $log.info( 'LobbyModel.onSetNameSuccess()' );

        // Change the player's name
        player.name = newName;

        // Call each of the functions registered as listeners for this event
        var len = lobbyModel.registrySetNameSuccess.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registrySetNameSuccess[ i ]();
        }

      },

      // onPushGameCreate() is called when a push notification is received from the server
      // that a game should be created using the provided data package.
      // Note: Push notifications don't require verification of approval!
      onPushGameCreate: function ( data ) {

        $log.info( 'LobbyModel.onPushGameCreate()' );

        // Search for and remove any other games with this player as host. If any others 
        // exist then they are errors and it's time to fix the problem.
        while ( true ) {
          var index = lobbyModel.indexOfGameByHostPlayerName( data.data.players[ 0 ].name );
          if ( index === -1 ) {
            break;
          }
          $log.warn( 'LobbyModel.onPushGameCreate() >> Host player already is hosting another game! Removing game...' );
          games.splice( index, 1 );
        }

        // Add the created game to the lobby games list.
        games.push( data.data );

      },

      // onPushGameRemove() is called when a push notification is received from the server
      // that the game with the host player named in the data package should be removed.
      // Note: Push notifications don't require verification of approval!
      onPushGameRemove: function ( data ) {

        $log.info( 'LobbyModel.onPushGameRemove()' );

        // Search for and remove any games with this player as host.
        while ( true ) {
          var index = lobbyModel.indexOfGameByHostPlayerName( data.data );
          if ( index === -1 ) {
            break;
          }
          $log.info( 'LobbyModel.onPushGameRemove() >> Removing game...' );
          games.splice( index, 1 );
        }

      },

      // onPushGameUpdate() is called when a push notification is received from the server
      // that a game should be overwritten using the data package provided.
      // Note: Push notifications don't require verification of approval!
      onPushGameUpdate: function ( data ) {

        $log.info( 'LobbyModel.onPushGameUpdate()' );

        // Search for the game to update.
        var index = lobbyModel.indexOfGameByHostPlayerName( data.data.players[ 0 ].name );

        // Update the game's members using the data package.
        $log.info( 'LobbyModel.onPushGameUpdate() >> Updating game...' );
        games[ index ].players = data.data.players;

      },

      // onPushPlayerCreate() is called when a push notification is received from the server
      // that a player should be created using the provided data package.
      // Note: Push notifications don't require verification of approval!
      onPushPlayerCreate: function ( data ) {

        $log.info( 'LobbyModel.onPushPlayerCreate()' );

        // Search for players with the same name. If another is found it is an error and 
        // should be removed.
        while ( true ) {
          var index = lobbyModel.indexOfPlayerByName( data.data.name );
          if ( index === -1 ) {
            break;
          }
          $log.warn( 'LobbyModel.onPushPlayerCreate() >> Player already exists! Removing player...' );
          players.splice( index, 1 );
        }

        // Add the created player to the lobby players list.
        games.push( data.data );

      },

      // onPushPlayerRemove() is called when a push notification is received from the server
      // that the player named in the data package should be removed.
      // Note: Push notifications don't require verification of approval!
      onPushPlayerRemove: function ( data ) {

        $log.info( 'LobbyModel.onPushPlayerRemove()' );

        // Search for and remove any players with this name.
        while ( true ) {
          var index = lobbyModel.indexOfPlayerByName( data.data );
          if ( index === -1 ) {
            break;
          }
          $log.info( 'LobbyModel.onPushPlayerRemove() >> Removing game...' );
          players.splice( index, 1 );
        }

      },

      // onPushPlayerUpdate() is called when a push notification is received from the server
      // that a player should be overwritten with the data package provided.
      // Note: Push notifications don't require verification of approval!
      onPushPlayerUpdate: function ( data ) {

        $log.info( 'LobbyModel.onPushPlayerUpdate()' );

        // Search for the player to update.
        var index = lobbyModel.indexOfPlayerByName( data.data.name );

        // Update the player's members using the data package.
        $log.info( 'LobbyModel.onPushPlayerUpdate() >> Updating player...' );
        players[ index ].name = data.data.name;
        players[ index ].state = data.data.state;

      },

      // onPushStartPlaying() is called when a push notification is received from the server
      // that a the game the player belongs to has begun.
      // Note: Push notifications don't require verification of approval!
      onPushStartPlaying: function ( data ) {

        $log.info( 'LobbyModel.onPushStartPlaying()' );

        // Call each of the functions registered as listeners for this event
        var len = lobbyModel.registryStartPlaying.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryStartPlaying[ i ]();
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
        var len = games.length;
        for ( var i = 0; i < len; i++ ) {
          if ( name === games[ i ].players[ 0 ].name ) {
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
        var len = players.length;
        for ( var i = 0; i < len; i++ ) {
          if ( name === players[ i ].name ) {
            return i;
          }
        }
        return -1;

      },

    };

    // Init and retutrn
    init();
    return lobbyModel;

  }

] );