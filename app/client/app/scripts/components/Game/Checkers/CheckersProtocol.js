/* global app:false */
'use strict';

app.factory( 'CheckersProtocol', [ 
  '$log', 'Socket',
  function ( $log, Socket ) {

    // init() will be called just prior to returning the lobby protocol object.
    function init() {

      // Register the checkers protocol's interpretCommand() function as the callback 
      // for all network events of on the 'checkers' channel.
      Socket.on( 'checkers', self.interpretCommand );

    }

    // Create the lobby protocol object
    var self = {

      //
      // Constants
      //

      CHECKERS_REQ_MOVE_PIECE: 'M',
      CHECKERS_PUSH_BEGIN_TURN: 'B',
      CHECKERS_PUSH_GAME_OVER: 'GO',
      CHECKERS_PUSH_PIECE_DEAD: 'D',
      CHECKERS_PUSH_PIECE_KINGED: 'K',
      CHECKERS_PUSH_PIECE_POSITIONED: 'P',

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
      registryResMovePiece: [],
      registryPushBeginTurn: [],
      registryPushGameOver: [],
      registryPushPieceDead: [],
      registryPushPieceKinged: [],
      registryPushPiecePositioned: [],

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
      // into the observer pattern for listening to events of the network.
      // Note: The callback must be of the form: function ( data ) { ... }
      addEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case self.CHECKERS_REQ_MOVE_PIECE:
          self.registerListener( self.registryResMovePiece, callback );
          break;

        case self.CHECKERS_PUSH_BEGIN_TURN:
          self.registerListener( self.registryPushBeginTurn, callback );
          break;

        case self.CHECKERS_PUSH_GAME_OVER:
          self.registerListener( self.registryPushGameOver, callback );
          break;

        case self.CHECKERS_PUSH_PIECE_DEAD:
          self.registerListener( self.registryPushPieceDead, callback );
          break;

        case self.CHECKERS_PUSH_PIECE_KINGED:
          self.registerListener( self.registryPushPieceKinged, callback );
          break;

        case self.CHECKERS_PUSH_PIECE_POSITIONED:
          self.registerListener( self.registryPushPiecePositioned, callback );
          break;

        default:
          throw 'CheckersProtocol.addEventListener >> Cannot register to this eventType. Unknown eventType!';

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

    case self.CHECKERS_REQ_MOVE_PIECE:
          self.deregisterListener( self.registryResMovePiece, callback );
          break;

        case self.CHECKERS_PUSH_BEGIN_TURN:
          self.deregisterListener( self.registryPushBeginTurn, callback );
          break;

        case self.CHECKERS_PUSH_GAME_OVER:
          self.deregisterListener( self.registryPushGameOver, callback );
          break;

        case self.CHECKERS_PUSH_PIECE_DEAD:
          self.deregisterListener( self.registryPushPieceDead, callback );
          break;

        case self.CHECKERS_PUSH_PIECE_KINGED:
          self.deregisterListener( self.registryPushPieceKinged, callback );
          break;

        case self.CHECKERS_PUSH_PIECE_POSITIONED:
          self.deregisterListener( self.registryPushPiecePositioned, callback );
          break;

        default:
          throw 'CheckersProtocol.removeEventListener >> Cannot deregister from this eventType. Unknown eventType!';

        }

      },

      //
      // Network Event Emitters
      //

      // emitRequest() is a convenience function to perform request emission as a one-liner 
      // for use in other, more specialized functions and to handle incrementing the requestID
      // and mapping the request so it can be matched with its response.
      emitRequest: function ( cmd, data ) {

        // Build the request object
        var request = {
          cmd: cmd,
          data: data,
          id: self.requestID
        };

        // Store the request into the sentRequests map
        self.sentRequests[ self.requestID++ ] = request;

        // Emit the request on the checkers channel
        Socket.emit( 'checkers', request );

      },

      // requestMovePiece() notifies the server of the player's intent to move a piece on the board.
      requestMovePiece: function ( piece, x, y ) {

        // Build the data packet to send with the request
        var data = {
          piece: piece,
          x: x,
          y: y
        };

        // Emit the request to the entwork
        self.emitRequest( self.CHECKERS_REQ_MOVE_PIECE, data );

      },

      //
      // Network Event Listeners
      //

      // interpretCommand() determines the type of command being sent by the 
      // server and calls the appropriate functions to notify listeners.
      interpretCommand: function ( data ) {

        // Interpret the command
        switch ( data.cmd ) {

        case self.CHECKERS_PUSH_BEGIN_TURN:
          self.notifyListeners( self.registryPushBeginTurn, data.data );
          break;

        case self.CHECKERS_PUSH_GAME_OVER:
          self.notifyListeners( self.registryPushGameOver, data.data );
          break;

        case self.CHECKERS_PUSH_PIECE_DEAD:
          self.notifyListeners( self.registryPushPieceDead, data.data );
          break;

        case self.CHECKERS_PUSH_PIECE_KINGED:
          self.notifyListeners( self.registryPushPieceKinged, data.data );
          break;

        case self.CHECKERS_PUSH_PIECE_POSITIONED:
          self.notifyListeners( self.registryPushPiecePositioned, data.data );
          break;

        default:
          // No command was sent, so this must be a response for a previous request
          self.onResponse( data );
          break;

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
        var index = self.sentRequests.indexOf( associatedRequest );
        self.sentRequests.splice( index, 1 );

        // If a request matched interpret the request's command but pass the response's data
        switch ( associatedRequest.cmd ) {

          case self.CHECKERS_REQ_MOVE_PIECE:
            self.notifyListeners( self.registryResMovePiece, res.data );
            break;

          default:
            $log.error( 'CheckersProtocol.onResponse() >> Request command unknown! OMFG IS THIS EVEN POSSIBLE?!' );

        }

      }

    };

    // Init and retutrn
    init();
    return self;

  }

] );