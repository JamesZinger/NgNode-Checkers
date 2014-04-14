/* global app:false */
/* global THREE:false */
'use strict';

app.factory( 'CheckersModel', [ 
  '$log', 'CheckersProtocol',
  function ( $log, CheckersProtocol ) {

    // *** Polyfill ***
    // Provides browser support for requestAnimationFrame() since THREE considers
    // requestAnimationFrame() best-practice for running the render loop. Also has
    // a fallback to use setTimeout if no other option is available.
    // Source: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = ( function () {

      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function ( callback ) {
          window.setTimeout( callback, 1000 / 60 );
      };

    } )();

    // Constructor for the hashmap of pieces
    function Pieces( board ) {

      // Seek through the board, adding pieces to the map by their IDs
      for ( var row = 0; row < 8; row++ ) {
        for ( var col = 0; col < 8; col++ ) {
          var piece = board[ row ][ col ];
          if ( piece === null ) {
            continue;
          } else {
            this[ piece.id ] = piece;
          }
        }
      }

    }

    // Create the checkers model object
    var self = {

      //
      // Constants
      //

      PLAYER_COLOUR_NEITHER: -1,
      PLAYER_COLOUR_BLACK: 0,
      PLAYER_COLOUR_RED: 1,

      PIECE_MOVE_ANIM_DURATION: 1.0, // seconds
      PIECE_MOVE_ANIM_DELAY: 0.5, // seconds

      POSSIBLE_MOVES = [ {
        x: 1,
        y: 1
      }, {
        x: -1,
        y: 1
      }, {
        x: -1,
        y: -1
      }, {
        x: 1,
        y: -1
      } ],

      //
      // Member Variables
      //

      // The data structure that makes up the state of the checkers game board.
      // Game pieces are attached to cells of a 2D array to indicate their positions,
      // states, and player ownership.
      // Note: Initialized by the game server (onPushStartPlaying).
      board: null,

      // This object is used to store a hashmap of pieces to look them up by their IDs.
      // Note: This must be built by the client when the server initialized the board.
      pieces = {},

      // Pieces that are killed are removed from the board and added to this data 
      // structure so that killed pieces can be rendered to the side of the board as 
      // though they were physically removed from the game.
      deadPieces = [
        [], // Black pieces (index 0 = PLAYER_COLOUR_BLACK)
        [] // Red pieces (index 1 = PLAYER_COLOUR_RED)
      ],

      // The attached player's piece colour within the game.
      // Note: Initialized by the game server (onPushStartPlaying).
      playerColour: PLAYER_COLOUR_NEITHER,

      // The player colour whose turn is currently is (who is allowed to perform moves).
      // Note: Initialized by the game server (onPushStartPlaying).
      turn: PLAYER_COLOUR_NEITHER,

      // Is the game been decided yet?
      gameOver: false,

      // Which player colour won the game?
      winner: PLAYER_COLOUR_NEITHER,

      // A queue of piece moves to be animated by the scene. Each piece move will queue
      // an action here to be lerped by the render loop. Once the animation completes,
      // it will be removed from the queue, and the next one will begin. All player actions
      // will be ignored until the animationQueue is empty.
      animationQueue: [],

      // The parent DOM element to which the THREE renderer is attached.
      parentElement: null,

      // The THREE scene that contains the 3D models.
      scene: null,

      // The THREE camera within the scene.
      camera: null,

      // The THREE renderer that draws the camera's view to the DOM.
      renderer: null,

      cube: null,

      //
      // Init
      //

      // init() configures the checkers model so it is ready to use.
      init: function ( gameState, sceneHeight, sceneWidth, parentElement ) {

        $log.info( 'CheckersModel.init()' );

        // Register event listeners for push notifications from the server
        CheckersProtocol.registerToBeginTurn( self.onPushBeginTurn );
        CheckersProtocol.registerToGameOver( self.onPushGameOver );
        CheckersProtocol.registerToPieceDead( self.onPushPieceDead );
        CheckersProtocol.registerToPieceKinged( self.onPushPieceKinged );
        CheckersProtocol.registerToPiecePositioned( self.onPushPiecePositioned );

        // Read in the game state
        self.board = gameState.board;
        self.playerColour = gameState.playerColour;
        self.turn = gameState.turn;

        // Build the pieces hashmap using the board state
        self.pieces = new Pieces( gameState.board );

        // Configure the scene
        self.initScene( sceneHeight, sceneWidth );

        // Append this to a parent element
        self.setParent( parentElement );

      },

      // initScene() configures the THREE objects in the scene so they are ready to use.
      initScene: function ( height, width ) {

        $log.info( 'CheckersModel.initScene()' );

        // Configure the scene
        self.scene = new THREE.Scene();
        self.camera = new THREE.PerspectiveCamera( 75, height / width, 0.1, 1000 );
        self.renderer = new THREE.WebGLRenderer();
        self.renderer.setSize( height, width );

        // Add a cube to the scene so we have something to look at
        var geometry = new THREE.CubeGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {
          color: 0x00ff00
        } );
        self.cube = new THREE.Mesh( geometry, material );
        self.scene.add( self.cube );
        self.camera.position.z = 5;

      },

      //
      // Destroy
      //

      // destroy() clears all of the resources used by the checkers model so they can be
      // garbage collected.
      destroy: function () {

        $log.info( 'CheckersModel.destroy()' );

        // Set all variables to null
        self.scene.remove( self.cube );
        self.cube = null;

        self.scene = null;
        self.camera = null;
        self.renderer = null;

        self.parentElement = null;

      },

      //
      // Update/Render
      //

      // render() signals to the window to start a render loop by repeatedly calling
      // this function at set intervals.
      render: function () {

        window.requestAnimFrame( self.render );
        self.update();
        self.renderer.render( self.scene, self.camera );

      },

      // update() performs changes to the scene objects through time by affecting
      // changes on a per-frame basis.
      update: function () {

        self.cube.rotation.x += 0.1;
        self.cube.rotation.y += 0.1;

      },

      //
      // Requests
      //

      // requestMovePiece() notifies the server of the player's intent to move a
      // piece on the checkers board.
      requestMovePiece: function ( player, piece, x, y ) {

        $log.info( 'CheckersModel.requestMovePiece()' );

        CheckersProtocol.requestMovePiece( self, piece, x, y, function ( data ) {

          if ( !data || !data.approved ) {

            // Do nothing?
            var errorMessage = data.data;
            $log.warn( 'CheckersModel.requestMovePiece() >> FAILED/DENIED! ' + errorMessage );

          } else {

            // Push the move onto the animationQueue to be handled by the render loop
            self.animationQueue.push( {
              piece: piece,
              x: x,
              y: y
            } );

          }

        } );

      },

      //
      // Event Handlers
      //

      // onPushBeginTurn() is called when a push notification is recieved from the
      // server that a player's turn has begun, so the turn state should be set.
      onPushBeginTurn: function () {

        $log.info( 'CheckersModel.onPushBeginTurn()' );

        // Cancel any actions in progress right then
        // TODO

        // Remember to allow the animationQueue to empty before the player takes action
        // TODO

        // Set the player turn using the data package
        var turn = data.data;
        self.playerTurn = turn;

      },

      // onPushGameOver() is called when a push notification is recieved from the
      // server that the game is over and one of the two players has won.
      onPushGameOver: function ( data ) {

        $log.info( 'CheckersModel.onPushGameOver()' );

        // Set the winner using the data package
        var winner = data.data;
        self.winner = winner;

        // Flag the game as over
        self.gameOver = true;

      },

      // onPushPieceDead() is called when a push notification is recieved from the
      // server that a piece was jumped and should be removed from play.
      onPushPieceDead: function () {

        $log.info( 'CheckersModel.onPushPieceDead()' );

        // Remove the piece from the board using the data package
        var piece = data.data;
        removePiece( piece );

      },

      // onPushPieceKinged() is called when a push notification is recieved from the
      // server that a piece reached the opposide end of the board and should be kinged.
      onPushPieceKinged: function () {

        $log.info( 'CheckersModel.onPushPieceKinged()' );

        // King the piece using the data package
        var piece = data.data;
        kingPiece( piece );

      },

      // onPushPiecePositioned() is called when a push notification is recieved from 
      // the server that a piece on the board has been repositioned and should be moved.
      onPushPiecePositioned: function ( data ) {

        $log.info( 'CheckersModel.onPushPiecePositioned()' );

        // Push the move onto the animationQueue to be handled by the render loop
        var moveData = data.data;
        self.animationQueue.push( {
          piece: moveData.piece,
          x: moveData.x,
          y: moveData.y
        } );

      },

      //
      // Utility Functions
      //

      // getValidMoves() returns an array of up to 4 potential moves that are valid 
      // for the piece with the given piece ID. If not valid moves are available, an 
      // empty array is returned.
      getValidMoves: function ( pieceID ) {

        var result = [];

        // Get the piece
        var pieceRef = pieces[ pieceID ];

        // Throw an exception if no piece exists with the given piece ID
        if ( pieceRef === null ) {
          throw 'CheckersModel.getValidMovesForPiece() >> Cannot get valid moves. Invalid piece ID!';
        }

        // Test each possible move and determine if it is possible.
        var len = POSSIBLE_MOVES.length;
        for ( var i = 0; i < len; i++ ) {

          // Compute the board co-ordinates to move to.
          var pos = {
            x: pieceRef.x + POSSIBLE_MOVES[ i ].x,
            y: pieceRef.y + POSSIBLE_MOVES[ i ].y
          };

          if ( self.isValidMove( pieceID, pos.x, pos.y ) ) {

            // The move is valid. Push it into the array to be returned.
            result.push( pos );

          } else {

            // Maybe a piece was in this space, so we can check if it is a 
            // valid move to jump it and land in the space on the opposite side.
            pos.x += POSSIBLE_MOVES[ i ].x;
            pos.y += POSSIBLE_MOVES[ i ].y;

            if ( self.isValidMove( pieceID, pos.x, pos.y ) ) {

              // The move is valid. Push it into the array to be returned.
              result.push( pos );

            } else {

              // The move was invalid. Continue from the next possible move.
              continue;

            }

          }

        }

        return result;

      },

      // isValidMove() checks if the piece with the given piece ID can move into the space
      // given by the provided (x, y) co-ordinate. Returns true or false.
      isValidMove: function ( pieceID, x, y ) {

        // Get the piece
        var pieceRef = pieces[ pieceID ];

        // Throw an exception if no piece exists with the given piece ID
        if ( pieceRef === null ) {
          throw 'CheckersModel.isValidMove() >> Cannot check move validity. Invalid piece ID!';
        }

        // Keep the change in position -- we'll use it soon.
        var dx = x - pieceRef.x;
        var dy = y - pieceRef.y;

        // Is this position within the bounds of the board?
        if ( x >= 0 || x < 7 || y >= 0 || y < 7 ) {

          // The position is outside the bounds of the board.
          return false;

        } else if ( x % 2 !== y % 2 ) {

          // The piece is being moved to a board space that is out of play (white space).
          return false;

        } else if ( Math.abs( dx ) > 2 || Math.abs( dx ) > 2 ) {

          // The piece is being moved farther than is possible.
          return false;

        } else if ( Math.abs( dx ) !== Math.abs( dy ) ) {

          // The piece is not being moved diagonally.
          return false;

        } else if ( Math.abs( dx ) === 2 && Math.abs( dx ) === 2 && board[ pieceRef.x + dx / 2 ][ pieceRef.y + dy / 2 ] === null ) {

          // The piece is being moved to jump another piece that doesn't exist.
          return false;

        } else if ( board[ x ][ y ] !== null ) {

          // There is a piece in the target space.
          return false;

        }

        return true;

      },

      // setParent() appends the renderer's domElement to the given parentElement DOM node.
      setParent: function ( parentElement ) {

        self.parentElement = parentElement;
        self.parentElement.append( self.renderer.domElement );

      };

    };

    // Init and return
    self.init();
    return self;

  }

] );