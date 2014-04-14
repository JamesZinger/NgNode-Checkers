/* global app:false */
'use strict';

app.factory( 'CheckersProtocol', [ 'Socket',
  function () {

    // init() will be called just prior to returning the lobby protocol object.
    function init() {

      // Register the checkers protocol's interpretPushCommand() function as the callback 
      // for all network events of on the 'checkers' channel.
      Socket.on( 'checkers', lobbyProtocol.interpretPushCommand );

    }

    // Create the lobby protocol object
    var checkersProtocol = {

      //
      // Constants
      //

      CHECKERS_REQ_MOVE_PIECE: 'M',
      CHECKERS_PUSH_BEGIN_TURN: 'B',
      CHECKERS_PUSH_GAME_OVER: 'GO'
      CHECKERS_PUSH_PIECE_DEAD: 'D',
      CHECKERS_PUSH_PIECE_KINGED: 'K',
      CHECKERS_PUSH_PIECE_POSITIONED: 'P',

      //
      // Member Variables
      // 

      // Callback registries for each of the network events
      // These arrays should contain function references to be called in response to 
      // the network event of the associated type being triggered.
      registryPushBeginTurn: [],
      registryPushGameOver: [],
      registryPushPieceDead: [],
      registryPushPieceKinged: [],
      registryPushPiecePositioned: [],

      //
      // Callback Registration
      //

      // addEventListener() is a convenience function to provide a more traditional way of hooking
      // into the observer pattern for listening to events of the network.
      // Note: The callback must be of the form: function ( data ) { ... }
      addEventListener: function ( eventType, callback ) {

        switch ( eventType ) {

        case checkersProtocol.CHECKERS_PUSH_BEGIN_TURN:
          checkersProtocol.registerToBeginTurn( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_GAME_OVER:
          checkersProtocol.registerToGameOver( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_DEAD:
          checkersProtocol.registerToPieceDead( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_KINGED:
          checkersProtocol.registerToPieceKinged( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_POSITIONED:
          checkersProtocol.registerToPiecePositioned( callback );
          break;
        default:
          throw 'CheckersProtocol.addEventListener >> Cannot register to this eventType. Unknown eventType!';

        }

      },

      // registerToBeginTurn() registers the given function callback to be called when a
      // CHECKERS_PUSH_BEGIN_TURN network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToBeginTurn: function ( callback ) {

        var index = checkersProtocol.registryPushBeginTurn.indexOf( callback );
        if ( index < 0 ) {
          checkersProtocol.registryPushBeginTurn.push( callback );
        }

      },

      // registerToGameOver() registers the given function callback to be called when a
      // CHECKERS_PUSH_GAME_OVER network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToGameOver: function ( callback ) {

        var index = checkersProtocol.registryPushGameOver.indexOf( callback );
        if ( index < 0 ) {
          checkersProtocol.registryPushGameOver.push( callback );
        }

      },

      // registerToPieceDead() registers the given function callback to be called when a
      // CHECKERS_PUSH_PIECE_DEAD network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToPieceDead: function ( callback ) {

        var index = checkersProtocol.registryPushPieceDead.indexOf( callback );
        if ( index < 0 ) {
          checkersProtocol.registryPushPieceDead.push( callback );
        }

      },

      // registerToPieceKinged() registers the given function callback to be called when a
      // CHECKERS_PUSH_PIECE_KINGED network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToPieceKinged: function ( callback ) {

        var index = checkersProtocol.registryPushPieceKinged.indexOf( callback );
        if ( index < 0 ) {
          checkersProtocol.registryPushPieceKinged.push( callback );
        }

      },

      // registerToPiecePositioned() registers the given function callback to be called when a
      // CHECKERS_PUSH_PIECE_POSITIONED network event takes place.
      // Note: The callback must be of the form: function ( data ) { ... }
      registerToPiecePositioned: function ( callback ) {

        var index = checkersProtocol.registryPushPiecePositioned.indexOf( callback );
        if ( index < 0 ) {
          checkersProtocol.registryPushPiecePositioned.push( callback );
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

        case checkersProtocol.CHECKERS_PUSH_BEGIN_TURN:
          checkersProtocol.deregisterFromBeginTurn( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_GAME_OVER:
          checkersProtocol.deregisterFromGameOver( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_DEAD:
          checkersProtocol.deregisterFromPieceDead( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_KINGED:
          checkersProtocol.deregisterFromPieceKinged( callback );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_POSITIONED:
          checkersProtocol.deregisterFromPiecePositioned( callback );
          break;
        default:
          throw 'CheckersProtocol.removeEventListener >> Cannot deregister from this eventType. Unknown eventType!';

        }

      },

      // deregisterFromBeginTurn() deregisters the given function callback from the 
      // CHECKERS_PUSH_BEGIN_TURN network event.
      deregisterFromBeginTurn: function ( callback ) {

        var index = checkersProtocol.registryPushBeginTurn.indexOf( callback );
        if ( index > 0 ) {
          checkersProtocol.registryPushBeginTurn.push( callback );
        }

      },

      // deregisterFromGameOver() deregisters the given function callback from the
      // CHECKERS_PUSH_GAME_OVER network event.
      deregisterFromGameOver: function ( callback ) {

        var index = checkersProtocol.registryPushGameOver.indexOf( callback );
        if ( index > 0 ) {
          checkersProtocol.registryPushGameOver.push( callback );
        }

      },

      // deregisterFromPieceDead() deregisters the given function callback from the
      // CHECKERS_PUSH_PIECE_DEAD network event.
      deregisterFromPieceDead: function ( callback ) {

        var index = checkersProtocol.registryPushPieceDead.indexOf( callback );
        if ( index > 0 ) {
          checkersProtocol.registryPushPieceDead.push( callback );
        }

      },

      // deregisterFromPieceKinged() deregisters the given function callback from the
      // CHECKERS_PUSH_PIECE_KINGED network event.
      deregisterFromPieceKinged: function ( callback ) {

        var index = checkersProtocol.registryPushPieceKinged.indexOf( callback );
        if ( index > 0 ) {
          checkersProtocol.registryPushPieceKinged.push( callback );
        }

      },

      // deregisterFromPiecePositioned() deregisters the given function callback from the
      // CHECKERS_PUSH_PIECE_POSITIONED network event.
      deregisterFromPiecePositioned: function ( callback ) {

        var index = checkersProtocol.registryPushPiecePositioned.indexOf( callback );
        if ( index > 0 ) {
          checkersProtocol.registryPushPiecePositioned.push( callback );
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
          name: pname
        };

        // Emit the request on the checkers channel
        Socket.emit( 'checkers', request, callback );

      },

      // requestMovePiece() notifies the server of the player's intent to move a piece on the board.
      requestMovePiece: function ( player, piece, x, y, callback ) {

        // Build the data packet to send with the request
        var data = {
          piece: piece,
          x: x,
          y: y
        };

        // Emit the request to the entwork
        checkersProtocol.emitRequest( checkersProtocol.CHECKERS_REQ_MOVE_PIECE, data, player.name, callback );

      },

      //
      // Network Event Listeners
      //

      // interpretPushCommand() determines the type of command being sent by the 
      // server and calls the appropriate functions to notify listeners.
      interpretPushCommand: function ( push ) {

        switch ( push.cmd ) {

        case checkersProtocol.CHECKERS_PUSH_BEGIN_TURN:
          checkersProtocol.onPushBeginTurn( push.data );
          break;
        case checkersProtocol.CHECKERS_PUSH_GAME_OVER:
          checkersProtocol.onPushGameOver( push.data );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_DEAD:
          checkersProtocol.onPushPieceDead( push.data );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_KINGED:
          checkersProtocol.onPushPieceKinged( push.data );
          break;
        case checkersProtocol.CHECKERS_PUSH_PIECE_POSITIONED:
          checkersProtocol.onPushPiecePositioned( push.data );
          break;
        default:
          throw 'CheckersProtocol.interpretPushCommand >> Cannot handle push command. Unknown command!';

        }

      },

      // onPushBeginTurn() is called in response to the CHECKERS_PUSH_BEGIN_TURN network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushBeginTurn: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = checkersProtocol.registryPushBeginTurn.length;
        for ( var i = 0; i < len; i++ ) {
          checkersProtocol.registryPushBeginTurn[ i ]( data );
        }

      },

      // onPushGameOver() is called in response to the CHECKERS_PUSH_GAME_OVER network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushGameOver: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = checkersProtocol.registryPushGameOver.length;
        for ( var i = 0; i < len; i++ ) {
          checkersProtocol.registryPushGameOver[ i ]( data );
        }

      },

      // onPushPieceDead() is called in response to the CHECKERS_PUSH_PIECE_DEAD network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushPieceDead: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = checkersProtocol.registryPushPieceDead.length;
        for ( var i = 0; i < len; i++ ) {
          checkersProtocol.registryPushPieceDead[ i ]( data );
        }

      },

      // onPushPieceKinged() is called in response to the CHECKERS_PUSH_PIECE_KINGED network event
      // to notify all registered listeners to that event by calling all registered callbacks.
      onPushPieceKinged: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = checkersProtocol.registryPushPieceKinged.length;
        for ( var i = 0; i < len; i++ ) {
          checkersProtocol.registryPushPieceKinged[ i ]( data );
        }

      },

      // onPushPiecePositioned() is called in response to the CHECKERS_PUSH_PIECE_POSITIONED 
      // network event to notify all registered listeners to that event by calling all 
      // registered callbacks.
      onPushPiecePositioned: function ( data ) {

        // Call each of the functions registered as listeners for this network event
        var len = checkersProtocol.registryPushPiecePositioned.length;
        for ( var i = 0; i < len; i++ ) {
          checkersProtocol.registryPushPiecePositioned[ i ]( data );
        }

      }

    };

    // Init and retutrn
    init();
    return checkersProtocol;

  }

] );