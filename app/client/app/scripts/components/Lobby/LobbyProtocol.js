/* global app:false */
'use strict';

app.factory( 'LobbyProtocol', [ 
  '$log', 'Socket',
  function ( $log, Socket ) {

    // init() will be called just prior to returning the lobby protocol object.
    function init() {

      // Register the lobby protocol's interpretCommand() function as the callback 
      // for all network events of on the 'lobby' channel.
      Socket.on( 'lobby', self.interpretCommand );

    }

    // Create the lobby protocol object
    var self = {

      //
      // Constants
      //

      LOBBY_REQ_INIT: 'I',
      LOBBY_REQ_CREATE_GAME: 'C',
      LOBBY_REQ_JOIN_GAME: 'J',
      LOBBY_REQ_LEAVE_GAME: 'L',
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

      // Request ID to keep track of sent requests and match them up with their responses
      requestID: 0,

      // A map of requestIDs to request data packets that need to be held onto until the
      // server replies back with a response to resolve the request.
      sentRequests: {},

      // Callback registries for each of the network events
      // These arrays should contain function references to be called in response to 
      // the network event of the associated type being triggered.
      registryResInit: [],
      registryResGameCreate: [],
      registryResGameJoin: [],
      registryResGameLeave: [],
      registryResSetName: [],
      registryResSetReady: [],
      registryResSetWaiting: [],
      registryPushGameCreate: [],
      registryPushGameRemove: [],
      registryPushGameUpdate: [],
      registryPushPlayerCreate: [],
      registryPushPlayerRemove: [],
      registryPushPlayerUpdate: [],
      registryPushStartPlaying: [],

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

      // addEventListener() is a convenience function to provide a more traditional way of hooking
      // into the observer pattern for listening to events on the network.
      // Note: The callback must be of the form: function ( data ) { ... }
      addEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case self.LOBBY_REQ_INIT:
          self.registerListener( self.registryResInit, callback );
          break;

        case self.LOBBY_REQ_CREATE_GAME:
          self.registerListener( self.registryResGameCreate, callback );
          break;

        case self.LOBBY_REQ_JOIN_GAME:
          self.registerListener( self.registryResGameJoin, callback );
          break;

        case self.LOBBY_REQ_LEAVE_GAME:
          self.registerListener( self.registryResGameLeave, callback );
          break;

        case self.LOBBY_REQ_SET_NAME:
          self.registerListener( self.registryResSetName, callback );
          break;

        case self.LOBBY_REQ_SET_READY:
          self.registerListener( self.registryResSetReady, callback );
          break;

        case self.LOBBY_REQ_SET_WAITING:
          self.registerListener( self.registryResSetWaiting, callback );
          break;

        case self.LOBBY_PUSH_GAME_CREATE:
          self.registerListener( self.registryResGameCreate, callback );
          break;

        case self.LOBBY_PUSH_GAME_REMOVE:
          self.registerListener( self.registryPushGameRemove, callback );
          break;

        case self.LOBBY_PUSH_GAME_UPDATE:
          self.registerListener( self.registryPushGameUpdate, callback );
          break;

        case self.LOBBY_PUSH_PLAYER_CREATE:
          self.registerListener( self.registryPushPlayerCreate, callback );
          break;

        case self.LOBBY_PUSH_PLAYER_REMOVE:
          self.registerListener( self.registryPushPlayerRemove, callback );
          break;

        case self.LOBBY_PUSH_PLAYER_UPDATE:
          self.registerListener( self.registryPushPlayerUpdate, callback );
          break;

        case self.LOBBY_PUSH_START_PLAYING:
          self.registerListener( self.registryPushStartPlaying, callback );
          break;

        default:
          throw 'LobbyProtocol.addEventListener >> Cannot register to this eventType. Unknown eventType!';

        }

      },

      // removeEventListener() is a convenience function to provide a more traditional way of hooking
      // into the observer pattern for listening to events of the network.
      // Note: The callback must be of the form: function ( data ) { ... }
      removeEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case self.LOBBY_REQ_INIT:
          self.deregisterListener( self.registryResInit, callback );
          break;

        case self.LOBBY_REQ_CREATE_GAME:
          self.deregisterListener( self.registryResGameCreate, callback );
          break;

        case self.LOBBY_REQ_JOIN_GAME:
          self.deregisterListener( self.registryResGameJoin, callback );
          break;

        case self.LOBBY_REQ_LEAVE_GAME:
          self.deregisterListener( self.registryResGameLeave, callback );
          break;

        case self.LOBBY_REQ_SET_NAME:
          self.deregisterListener( self.registryResSetName, callback );
          break;

        case self.LOBBY_REQ_SET_READY:
          self.deregisterListener( self.registryResSetReady, callback );
          break;

        case self.LOBBY_REQ_SET_WAITING:
          self.deregisterListener( self.registryResSetWaiting, callback );
          break;

        case self.LOBBY_PUSH_GAME_CREATE:
          self.deregisterListener( self.registryPushGameCreate, callback );
          break;

        case self.LOBBY_PUSH_GAME_REMOVE:
          self.deregisterListener( self.registryPushGameRemove, callback );
          break;

        case self.LOBBY_PUSH_GAME_UPDATE:
          self.deregisterListener( self.registryPushGameUpdate, callback );
          break;

        case self.LOBBY_PUSH_PLAYER_CREATE:
          self.deregisterListener( self.registryPushPlayerCreate, callback );
          break;

        case self.LOBBY_PUSH_PLAYER_REMOVE:
          self.deregisterListener( self.registryPushPlayerRemove, callback );
          break;

        case self.LOBBY_PUSH_PLAYER_UPDATE:
          self.deregisterListener( self.registryPushPlayerUpdate, callback );
          break;

        case self.LOBBY_PUSH_START_PLAYING:
          self.deregisterListener( self.registryPushStartPlaying, callback );
          break;

        default:
          throw 'LobbyProtocol.removeEventListener >> Cannot deregister from this eventType. Unknown eventType!';

        }

      },

      //
      // Network Event Emitters
      //

      // emitRequest() is a convenience function to perform request emission as a one-liner for use 
      // in other, more specialized functions.
      emitRequest: function ( cmd, data ) {

        // Build the request object
        var request = {
          cmd: cmd,
          data: data,
          id: self.requestID
        };

        // Store the request into the sentRequests map
        self.sentRequests[ self.requestID++ ] = request;

        // Emit the request on the lobby channel
        Socket.emit( 'lobby', request );

      },

      // requestInit() requests that the server initialize this player object reference by porviding
      // it with a new unique username (which can be changed later -- of course). This must be called
      // for the player to enter the lobby since we have to ensure a unique username is set for the
      // server to distinguish this user's requests from every other user's.
      requestInit: function () {

        self.emitRequest( self.LOBBY_REQ_INIT, null );

      },

      // requestGameCreate() notifies the server of the player's intent to create a new game.
      requestGameCreate: function () {

        self.emitRequest( self.LOBBY_REQ_CREATE_GAME, null );

      },

      // requestGameLeave() notifies the server of the player's intent to leave the game to which they
      // currently belong.
      requestGameLeave: function () {

        self.emitRequest( self.LOBBY_REQ_LEAVE_GAME, null );

      },

      // requestGameJoin() notifies the server of the player's intent to join the game hosted by another
      // player, identified by the given hostName.
      requestGameJoin: function ( hostName ) {

        self.emitRequest( self.LOBBY_REQ_JOIN_GAME, hostName );

      },

      // requestSetName() notifies the server of the player's intent to change his/her name to the given 
      // newName.
      requestSetName: function ( newName ) {

        self.emitRequest( self.LOBBY_REQ_SET_NAME, newName );

      },

      // requestSetReady() notifies the server that the player is ready to begin playing.
      requestSetReady: function () {

        self.emitRequest( self.LOBBY_REQ_SET_READY, null );

      },

      // requestSetWaiting() notifies the server that the player is not ready to begin playing yet.
      requestSetWaiting: function () {

        self.emitRequest( self.LOBBY_REQ_SET_WAITING, null );

      },

      //
      // Network Event Listeners
      //

      // interpretCommand() determines the type of command being sent by the 
      // server and calls the appropriate functions to notify listeners.
      interpretCommand: function ( data ) {

        switch ( data.cmd ) {

        case self.LOBBY_PUSH_GAME_CREATE:
          self.notifyListeners( self.registryPushGameCreate, data );
          break;

        case self.LOBBY_PUSH_GAME_REMOVE:
          self.notifyListeners( self.registryPushGameRemove, data );
          break;

        case self.LOBBY_PUSH_GAME_UPDATE:
          self.notifyListeners( self.registryPushGameUpdate, data );
          break;

        case self.LOBBY_PUSH_PLAYER_CREATE:
          self.notifyListeners( self.registryPushPlayerCreate, data );
          break;

        case self.LOBBY_PUSH_PLAYER_REMOVE:
          self.notifyListeners( self.registryPushPlayerRemove, data );
          break;

        case self.LOBBY_PUSH_PLAYER_UPDATE:
          self.notifyListeners( self.registryPushPlayerUpdate, data );
          break;

        case self.LOBBY_PUSH_START_PLAYING:
          self.notifyListeners( self.registryPushStartPlaying, data );
          break;

        default:
          // No command was sent, so this must be a response for a previous request
          self.onResponse( data );

        }

      },

      // onResponse() is a convenience function to match up responses with the requests that
      // they are related to, so that they can be dealt with appropriately.
      onResponse: function ( res ) {

      // Look up the stored request matching the response's id
      var associatedRequest = self.sentRequests[ res.id ];
      
      // If no request matched the response, throw an exception.
      if ( 'undefined' == typeof( associatedRequest ) ) {
        $log.error( 'CheckersProtocol.onResponse() >> Cannot match response to any request by ID!' );
      }

      // Attach the request to the response
      res.request = associatedRequest;

      // Remove the request from the stored requests since it's no longer needed
      delete self.sentRequests[ res.id ];

      // If a request matched interpret the request's command but pass the response's data
      switch ( associatedRequest.cmd ) {

        case self.LOBBY_REQ_INIT:
        self.notifyListeners( self.registryResInit, res );
        break;

        case self.LOBBY_REQ_CREATE_GAME:
          self.notifyListeners( self.registryResGameCreate, res );
          break;

        case self.LOBBY_REQ_JOIN_GAME:
          self.notifyListeners( self.registryResGameJoin, res );
          break;

        case self.LOBBY_REQ_LEAVE_GAME:
          self.notifyListeners( self.registryResGameLeave, res );
          break;

        case self.LOBBY_REQ_SET_NAME:
          self.notifyListeners( self.registryResSetName, res );
          break;

        case self.LOBBY_REQ_SET_READY:
          self.notifyListeners( self.registryResSetReady, res );
          break;

        case self.LOBBY_REQ_SET_WAITING:
          self.notifyListeners( self.registryResSetWaiting, res );
          break;

        default:
          $log.error( 'CheckersProtocol.onResponse() >> Request command unknown! OMFG IS THIS EVEN POSSIBLE?!' );

      }

    },

    };

    // Init and retutrn
    init();
    return self;

  }

] );