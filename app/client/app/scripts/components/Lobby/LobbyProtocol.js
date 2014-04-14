/* global app:false */
'use strict';

app.factory( 'LobbyProtocol', [ 
  'Socket',
  function ( Socket ) {

    // init() will be called just prior to returning the lobby protocol object.
    function init() {

      // Register the lobby protocol's interpretPushCommand() function as the callback 
      // for all network events of on the 'lobby' channel.
      Socket.on( 'lobby', lobbyProtocol.interpretPushCommand );

    }

    // Create the lobby protocol object
    var lobbyProtocol = {

      //
      // Constants
      //

      LOBBY_REQ_INIT: 'I',
      LOBBY_REQ_CREATE_GAME: 'C',
      LOBBY_REQ_LEAVE_GAME: 'L',
      LOBBY_REQ_JOIN_GAME: 'J',
      LOBBY_REQ_SET_NAME: 'N',
      LOBBY_REQ_SET_READY: 'R',
      LOBBY_REQ_SET_WAITING: 'W',
      LOBBY_PUSH_GAME_CREATE: 'GC',
      LOBBY_PUSH_GAME_REMOVE: 'GR',
      LOBBY_PUSH_GAME_UPDATE: 'GU',
      LOBBY_PUSH_PLAYER_CREATE: 'PC',
      LOBBY_PUSH_PLAYER_REMOVE: 'PR',
      LOBBY_PUSH_PLAYER_UPDATE: 'PU',
      LOBBY_PUSH_START_PLAYING: 'SP',

      //
      // Member Variables
      // 

      // Callback registries for each of the network events
      // These arrays should contain function references to be called in response to 
      // the network event of the associated type being triggered.
      registryPushGameCreate: [],
      registryPushGameRemove: [],
      registryPushGameUpdate: [],
      registryPushPlayerCreate: [],
      registryPushPlayerRemove: [],
      registryPushPlayerUpdate: [],
      registryPushStartPlaying: [],

      //
      // Callback Registration
      //

      // addEventListener() is a convenience function to provide a more traditional way of hooking
      // into the observer pattern for listening to events on the network.
      // Note: The callback must be of the form: function ( data ) { ... }
      addEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case lobbyProtocol.LOBBY_PUSH_GAME_CREATE:
          lobbyProtocol.registerToGameCreate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_GAME_REMOVE:
          lobbyProtocol.registerToGameRemove( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_GAME_UPDATE:
          lobbyProtocol.registerToGameUpdate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_CREATE:
          lobbyProtocol.registerToPlayerCreate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_REMOVE:
          lobbyProtocol.registerToPlayerRemove( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_UPDATE:
          lobbyProtocol.registerToPlayerUpdate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_START_PLAYING:
          lobbyProtocol.registerToStartPlaying( callback );
          break;
        default:
          throw 'LobbyProtocol.addEventListener >> Cannot register to this eventType. Unknown eventType!';

        }

      },

      // registerToGameCreate() registers the given function callback to be called when a
      // LOBBY_PUSH_GAME_CREATE network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToGameCreate: function ( callback ) {

        var index = lobbyProtocol.registryPushGameCreate.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryPushGameCreate.push( callback );
        }

      },

      // registerToGameRemove() registers the given function callback to be called when a
      // LOBBY_PUSH_GAME_REMOVE network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToGameRemove: function ( callback ) {

        var index = lobbyProtocol.registryPushGameRemove.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryPushGameRemove.push( callback );
        }

      },

      // registerToGameUpdate() registers the given function callback to be called when a
      // LOBBY_PUSH_GAME_UPDATE network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToGameUpdate: function ( callback ) {

        var index = lobbyProtocol.registryPushGameUpdate.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryPushGameUpdate.push( callback );
        }

      },

      // registerToPlayerCreate() registers the given function callback to be called when a
      // LOBBY_PUSH_PLAYER_CREATE network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToPlayerCreate: function ( callback ) {

        var index = lobbyProtocol.registryPushPlayerCreate.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryPushPlayerCreate.push( callback );
        }

      },

      // registerToPlayerRemove() registers the given function callback to be called when a
      // LOBBY_PUSH_PLAYER_REMOVE network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToPlayerRemove: function ( callback ) {

        var index = lobbyProtocol.registryPushPlayerRemove.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryPushPlayerRemove.push( callback );
        }

      },

      // registerToPlayerUpdate() registers the given function callback to be called when a 
      // LOBBY_PUSH_PLAYER_UPDATE network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToPlayerUpdate: function ( callback ) {

        var index = lobbyProtocol.registryPushPlayerUpdate.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryPushPlayerUpdate.push( callback );
        }

      },

      // registerToStartPlaying() registers the given function callback to be called when a 
      // LOBBY_PUSH_START_PLAYING network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToStartPlaying: function ( callback ) {

        var index = lobbyProtocol.registryPushStartPlaying.indexOf( callback );
        if ( index < 0 ) {
          lobbyProtocol.registryPushStartPlaying.push( callback );
        }

      },

      //
      // Callback Deregistration
      //

      // removeEventListener() is a convenience function to provide a more traditional way of hooking
      // into the observer pattern for listening to events of the network.
      // Note: The callback must be of the form: function ( data ) { ... }
      removeEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case lobbyProtocol.LOBBY_PUSH_GAME_CREATE:
          lobbyProtocol.deregisterFromGameCreate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_GAME_REMOVE:
          lobbyProtocol.deregisterFromGameRemove( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_GAME_UPDATE:
          lobbyProtocol.deregisterFromGameUpdate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_CREATE:
          lobbyProtocol.deregisterFromPlayerCreate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_REMOVE:
          lobbyProtocol.deregisterFromPlayerRemove( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_UPDATE:
          lobbyProtocol.deregisterFromPlayerUpdate( callback );
          break;
        case lobbyProtocol.LOBBY_PUSH_START_PLAYING:
          lobbyProtocol.deregisterFromStartPlaying( callback );
          break;
        default:
          throw 'LobbyProtocol.removeEventListener >> Cannot deregister from this eventType. Unknown eventType!';

        }

      },

      // deregisterFromGameCreate() deregisters the given function callback from the 
      // LOBBY_PUSH_GAME_CREATE network event.
      deregisterFromGameCreate: function ( callback ) {

        var index = lobbyProtocol.registryPushGameCreate.indexOf( callback );
        if ( index > 0 ) {
          lobbyProtocol.registryPushGameCreate.push( callback );
        }

      },

      // deregisterFromGameRemove() deregisters the given function callback from the
      // LOBBY_PUSH_GAME_REMOVE network event.
      deregisterFromGameRemove: function ( callback ) {

        var index = lobbyProtocol.registryPushGameRemove.indexOf( callback );
        if ( index > 0 ) {
          lobbyProtocol.registryPushGameRemove.push( callback );
        }

      },

      // deregisterFromGameUpdate() deregisters the given function callback from the
      // LOBBY_PUSH_GAME_UPDATE network event.
      deregisterFromGameUpdate: function ( callback ) {

        var index = lobbyProtocol.registryPushGameUpdate.indexOf( callback );
        if ( index > 0 ) {
          lobbyProtocol.registryPushGameUpdate.push( callback );
        }

      },

      // deregisterFromPlayerCreate() deregisters the given function callback from the
      // LOBBY_PUSH_PLAYER_CREATE network event.
      deregisterFromPlayerCreate: function ( callback ) {

        var index = lobbyProtocol.registryPushPlayerCreate.indexOf( callback );
        if ( index > 0 ) {
          lobbyProtocol.registryPushPlayerCreate.push( callback );
        }

      },

      // deregisterFromPlayerRemove() deregisters the given function callback from the
      // LOBBY_PUSH_PLAYER_REMOVE network event.
      deregisterFromPlayerRemove: function ( callback ) {

        var index = lobbyProtocol.registryPushPlayerRemove.indexOf( callback );
        if ( index > 0 ) {
          lobbyProtocol.registryPushPlayerRemove.push( callback );
        }

      },

      // deregisterFromPlayerUpdate() deregisters the given function callback from the
      // LOBBY_PUSH_PLAYER_UPDATE network event.
      deregisterFromPlayerUpdate: function ( callback ) {

        var index = lobbyProtocol.registryPushPlayerUpdate.indexOf( callback );
        if ( index > 0 ) {
          lobbyProtocol.registryPushPlayerUpdate.push( callback );
        }

      },

      // deregisterFromStartPlaying() deregisters the given function callback from the
      // LOBBY_PUSH_START_PLAYING network event.
      deregisterFromStartPlaying: function ( callback ) {

        var index = lobbyProtocol.registryPushStartPlaying.indexOf( callback );
        if ( index > 0 ) {
          lobbyProtocol.registryPushStartPlaying.splice( index, 1 );
        }

      },

      //
      // Network Event Emitters
      //

      // emitRequest() is a convenience function to perform request emission as a one-liner for use 
      // in other, more specialized functions.
      emitRequest: function ( cmd, data, name, callback ) {

        // Build the request object
        var request = {
          cmd: cmd,
          data: data,
          name: name,
        };

        // Emit the request on the lobby channel
        Socket.emit( 'lobby', request, callback );

      },

      // requestInit() requests that the server initialize this player object reference by porviding
      // it with a new unique username (which can be changed later -- of course). This must be called
      // for the player to enter the lobby since we have to ensure a unique username is set for the
      // server to distinguish this user's requests from every other user's.
      requestInit: function ( player, callback ) {

        lobbyProtocol.emitRequest( lobbyProtocol.LOBBY_REQ_INIT, null, '', callback );

      },

      // requestGameCreate() notifies the server of the player's intent to create a new game.
      requestGameCreate: function ( player, callback ) {

        lobbyProtocol.emitRequest( lobbyProtocol.LOBBY_REQ_CREATE_GAME, null, player.name, callback );

      },

      // requestGameLeave() notifies the server of the player's intent to leave the game to which they
      // currently belong.
      requestGameLeave: function ( player, callback ) {

        lobbyProtocol.emitRequest( lobbyProtocol.LOBBY_REQ_LEAVE_GAME, null, player.name, callback );

      },

      // requestGameJoin() notifies the server of the player's intent to join the game hosted by another
      // player, identified by the given hostName.
      requestGameJoin: function ( player, hostName, callback ) {

        lobbyProtocol.emitRequest( lobbyProtocol.LOBBY_REQ_JOIN_GAME, hostName, player.name, callback );

      },

      // requestSetName() notifies the server of the player's intent to change his/her name to the given 
      // newName.
      requestSetName: function ( player, newName, callback ) {

        lobbyProtocol.emitRequest( lobbyProtocol.LOBBY_REQ_SET_NAME, newName, player.name, callback );

      },

      // requestSetReady() notifies the server that the player is ready to begin playing.
      requestSetReady: function ( player, callback ) {

        lobbyProtocol.emitRequest( lobbyProtocol.LOBBY_REQ_SET_READY, null, player.name, callback );

      },

      // requestSetWaiting() notifies the server that the player is not ready to begin playing yet.
      requestSetWaiting: function ( player, callback ) {

        lobbyProtocol.emitRequest( lobbyProtocol.LOBBY_REQ_SET_WAITING, null, player.name, callback );

      },

      //
      // Network Event Listeners
      //

      // interpretPushCommand() determines the type of command being sent by the 
      // server and calls the appropriate functions to notify listeners.
      interpretPushCommand: function ( push ) {

        switch ( push.cmd ) {

        case lobbyProtocol.LOBBY_PUSH_GAME_CREATE:
          lobbyProtocol.onPushGameCreate( push.data );
          break;
        case lobbyProtocol.LOBBY_PUSH_GAME_REMOVE:
          lobbyProtocol.onPushGameRemove( push.data );
          break;
        case lobbyProtocol.LOBBY_PUSH_GAME_UPDATE:
          lobbyProtocol.onPushGameUpdate( push.data );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_CREATE:
          lobbyProtocol.onPushPlayerCreate( push.data );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_REMOVE:
          lobbyProtocol.onPushPlayerRemove( push.data );
          break;
        case lobbyProtocol.LOBBY_PUSH_PLAYER_UPDATE:
          lobbyProtocol.onPushPlayerUpdate( push.data );
          break;
        case lobbyProtocol.LOBBY_PUSH_START_PLAYING:
          lobbyProtocol.onPushStartPlaying( push.data );
          break;
        default:
          throw 'LobbyProtocol.interpretPushCommand >> Cannot handle push command. Unknown command!';

        }

      },

      // onPushGameCreate() is called in response to the LOBBY_PUSH_GAME_CREATE network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushGameCreate: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = lobbyProtocol.registryPushGameCreate.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryPushGameCreate[ i ]( data );
        }

      },

      // onPushGameRemove() is called in response to the LOBBY_PUSH_GAME_REMOVE network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushGameRemove: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = lobbyProtocol.registryPushGameRemove.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryPushGameRemove[ i ]( data );
        }

      },

      // onPushGameUpdate() is called in response to the LOBBY_PUSH_GAME_UPDATE network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushGameUpdate: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = lobbyProtocol.registryPushGameUpdate.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryPushGameUpdate[ i ]( data );
        }

      },

      // onPushPlayerCreate() is called in response to the LOBBY_PUSH_PLAYER_CREATE network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushPlayerCreate: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = lobbyProtocol.registryPushPlayerCreate.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryPushPlayerCreate[ i ]( data );
        }

      },

      // onPushPlayerRemove() is called in response to the LOBBY_PUSH_PLAYER_REMOVE network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushPlayerRemove: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = lobbyProtocol.registryPushPlayerRemove.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryPushPlayerRemove[ i ]( data );
        }

      },

      // onPushPlayerUpdate() is called in response to the LOBBY_PUSH_PLAYER_UPDATE network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushPlayerUpdate: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = lobbyProtocol.registryPushPlayerUpdate.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryPushPlayerUpdate[ i ]( data );
        }

      },

      // onPushStartPlaying() is called in response to the LOBBY_PUSH_START_PLAYING network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushStartPlaying: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = lobbyProtocol.registryPushStartPlaying.length;
        for ( var i = 0; i < len; i++ ) {
          lobbyProtocol.registryPushStartPlaying[ i ]( data );
        }

      }

    };

    // Init and retutrn
    init();
    return lobbyProtocol;

  }

] );