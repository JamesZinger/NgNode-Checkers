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
          var pieceRef = board[ row ][ col ];
          if ( pieceRef === null ) {
            continue;
          } else {
            this[ pieceRef.id ] = pieceRef;
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

      POSSIBLE_MOVES: [ {
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
      pieces: null,

      // Pieces that are killed are removed from the board and added to this data 
      // structure so that killed pieces can be rendered to the side of the board as 
      // though they were physically removed from the game.
      deadPieces: [
        [], // Black pieces (index 0 = PLAYER_COLOUR_BLACK)
        [] // Red pieces (index 1 = PLAYER_COLOUR_RED)
      ],

      // The attached player's piece colour within the game.
      // Note: Initialized by the game server (onPushStartPlaying).
      playerColour: -1,

      // The player colour whose turn is currently is (who is allowed to perform moves).
      // Note: Initialized by the game server (onPushStartPlaying).
      turn: -1,

      // Is the game been decided yet?
      gameOver: false,

      // Which player colour won the game?
      winner: -1,

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

      meshBoard: null,
      meshBlackPice: null,
      meshPieceRed: null,

      //
      // Init
      //

      // init() configures the checkers model so it is ready to use.
      init: function ( gameState, sceneHeight, sceneWidth, parentElement ) {

        $log.info( 'CheckersModel.init()' );

        // Register event listeners for network events triggered by the server
        CheckersProtocol.addEventListener( CheckersProtocol.CHECKERS_REQ_MOVE_PIECE, self.onResMovePiece );
        CheckersProtocol.addEventListener( CheckersProtocol.CHECKERS_PUSH_BEGIN_TURN, self.onPushBeginTurn );
        CheckersProtocol.addEventListener( CheckersProtocol.CHECKERS_PUSH_GAME_OVER, self.onPushGameOver );
        CheckersProtocol.addEventListener( CheckersProtocol.CHECKERS_PUSH_PIECE_DEAD, self.onPushPieceDead );
        CheckersProtocol.addEventListener( CheckersProtocol.CHECKERS_PUSH_PIECE_KINGED, self.onPushPieceKinged );
        CheckersProtocol.addEventListener( CheckersProtocol.CHECKERS_PUSH_PIECE_POSITIONED, self.onPushPiecePositioned );

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
        self.camera.position.set( 0, 2.5, 1.25 );
        self.camera.lookAt( new THREE.Vector3( 0, -1, 0 ) );

        self.renderer = new THREE.WebGLRenderer();
        self.renderer.setSize( height, width );
        self.renderer.setClearColorHex( 0xefefef, 1 );

        // Add a light to the scene
        self.pointLight = new THREE.PointLight( 0xffffff, 3, 50 );
        self.pointLight.position.set( 0, 5, 0 );
        self.scene.add( self.pointLight );

        var ambientLight = new THREE.AmbientLight( 0x111111 );
        self.scene.add( ambientLight );

        // Load our checkers board model
        var boardLoader = new THREE.JSONLoader();
        boardLoader.load( '../../../../assets3D/checkers-board/checkers-board.js',
          function ( geometry, materials ) {

            var material = new THREE.MeshFaceMaterial( materials );
            self.meshBoard = new THREE.Mesh( geometry, material );
            self.meshBoard.scale.set( 1, 1, 1 );
            self.scene.add( self.meshBoard );

          } );

        // Load our black checkers piece model
        var blackPieceLoader = new THREE.JSONLoader();
        blackPieceLoader.load( '../../../../assets3D/checkers-piece/checkers-piece-black.js',
          function ( geometry, materials ) {

            var material = new THREE.MeshFaceMaterial( materials );

            for ( var i = 0; i < 12; i++ ) {

              var pieceRef = self.pieces[ 'B' + i ];
              pieceRef.mesh = new THREE.Mesh( geometry, material );
              pieceRef.mesh.scale.set( 1, 1, 1 );
              pieceRef.mesh.position = self.getBoardPos( pieceRef.x, pieceRef.y );
              self.scene.add( pieceRef.mesh );

              self.killPiece( 'B1' );
              self.killPiece( 'B3' );
              self.killPiece( 'B5' );
              self.killPiece( 'B7' );
              self.killPiece( 'B9' );

            }

          } );

        // Load our red checkers piece model
        var redPieceLoader = new THREE.JSONLoader();
        redPieceLoader.load( '../../../../assets3D/checkers-piece/checkers-piece-red.js',
          function ( geometry, materials ) {

            var material = new THREE.MeshFaceMaterial( materials );

            for ( var i = 0; i < 12; i++ ) {

              var pieceRef = self.pieces[ 'R' + i ];
              pieceRef.mesh = new THREE.Mesh( geometry, material );
              pieceRef.mesh.scale.set( 1, 1, 1 );
              pieceRef.mesh.position = self.getBoardPos( pieceRef.x, pieceRef.y );
              self.scene.add( pieceRef.mesh );

              self.killPiece( 'R1' );
              self.killPiece( 'R3' );
              self.killPiece( 'R5' );
              self.killPiece( 'R7' );
              self.killPiece( 'R9' );

            }

          } );

      },

      //
      // Destroy
      //

      // destroy() clears all of the resources used by the checkers model so they can be
      // garbage collected.
      destroy: function () {

        $log.info( 'CheckersModel.destroy()' );

        // Clear all THREE references
        

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

        

      },

      //
      // Requests
      //

      // requestMovePiece() notifies the server of the player's intent to move a
      // piece on the checkers board.
      requestMovePiece: function ( pieceID, x, y ) {

        $log.info( 'CheckersModel.requestMovePiece()' );

        CheckersProtocol.requestMovePiece( pieceID, x, y );

      },

      //
      // Event Handlers
      //


      onResMovePiece: function ( res ) {

        if ( !res || !res.approved ) {

          // Do nothing?
          var errorMessage = res.data;
          $log.warn( 'CheckersModel.requestMovePiece() >> FAILED/DENIED! ' + errorMessage );

        } else {

          // Push the move onto the animationQueue to be handled by the render loop
          self.animationQueue.push( {
            piece: res.request.piece,
            x: res.request.x,
            y: res.request.y
          } );

        }

      },

      // onPushBeginTurn() is called when a push notification is recieved from the
      // server that a player's turn has begun, so the turn state should be set.
      onPushBeginTurn: function ( push ) {

        $log.info( 'CheckersModel.onPushBeginTurn()' );

        // Cancel any actions in progress right then
        // TODO

        // Remember to allow the animationQueue to empty before the player takes action
        // TODO

        // Set the player turn using the data package
        var turn = push.data;
        self.playerTurn = turn;

      },

      // onPushGameOver() is called when a push notification is recieved from the
      // server that the game is over and one of the two players has won.
      onPushGameOver: function ( push ) {

        $log.info( 'CheckersModel.onPushGameOver()' );

        // Set the winner using the data package
        var winner = push.data;
        self.winner = winner;

        // Flag the game as over
        self.gameOver = true;

      },

      // onPushPieceDead() is called when a push notification is recieved from the
      // server that a piece was jumped and should be removed from play.
      onPushPieceDead: function ( push ) {

        $log.info( 'CheckersModel.onPushPieceDead()' );

        // Remove the piece from the board using the data package
        var piece = push.data;
        self.removePiece( piece );

      },

      // onPushPieceKinged() is called when a push notification is recieved from the
      // server that a piece reached the opposide end of the board and should be kinged.
      onPushPieceKinged: function ( push ) {

        $log.info( 'CheckersModel.onPushPieceKinged()' );

        // King the piece using the data package
        var piece = push.data;
        self.kingPiece( piece );

      },

      // onPushPiecePositioned() is called when a push notification is recieved from 
      // the server that a piece on the board has been repositioned and should be moved.
      onPushPiecePositioned: function ( push ) {

        $log.info( 'CheckersModel.onPushPiecePositioned()' );

        // Push the move onto the animationQueue to be handled by the render loop
        var moveData = push.data;
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
        var pieceRef = self.pieces[ pieceID ];

        // Throw an exception if no piece exists with the given piece ID
        if ( pieceRef === null ) {
          throw 'CheckersModel.getValidMovesForPiece() >> Cannot get valid moves. Invalid piece ID!';
        }

        // Test each possible move and determine if it is possible.
        var len = self.POSSIBLE_MOVES.length;
        for ( var i = 0; i < len; i++ ) {

          // Compute the board co-ordinates to move to.
          var pos = {
            x: pieceRef.x + self.POSSIBLE_MOVES[ i ].x,
            y: pieceRef.y + self.POSSIBLE_MOVES[ i ].y
          };

          if ( self.isValidMove( pieceID, pos.x, pos.y ) ) {

            // The move is valid. Push it into the array to be returned.
            result.push( pos );

          } else {

            // Maybe a piece was in this space, so we can check if it is a 
            // valid move to jump it and land in the space on the opposite side.
            pos.x += self.POSSIBLE_MOVES[ i ].x;
            pos.y += self.POSSIBLE_MOVES[ i ].y;

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
        var pieceRef = self.pieces[ pieceID ];

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

        } else if ( Math.abs( dx ) === 2 && Math.abs( dx ) === 2 && self.board[ pieceRef.x + dx / 2 ][ pieceRef.y + dy / 2 ] === null ) {

          // The piece is being moved to jump another piece that doesn't exist.
          return false;

        } else if ( self.board[ x ][ y ] !== null ) {

          // There is a piece in the target space.
          return false;

        }

        return true;

      },

      // setParent() appends the renderer's domElement to the given parentElement DOM node.
      setParent: function ( parentElement ) {

        self.parentElement = parentElement;
        self.parentElement.append( self.renderer.domElement );

      },

      // getBoardPosFromIndex() returns the actual board position in THREE space, given a board index.
      getBoardPos: function ( x, z ) {

        return new THREE.Vector3( 0.390 * x - 1.37, 0.05, 0.394 * z - 1.37 );

      },

      // killPiece() moves a piece from the board to one of the dead pieces sets on the side of the board.
      killPiece: function ( pieceID ) {

        var pieceRef = self.pieces[ pieceID ];
        if ( pieceRef.id.substring( 0, 1 ) === 'B' ) {

          self.board[ pieceRef.x ][ pieceRef.y ] = null;
          self.deadPieces[ self.PLAYER_COLOUR_BLACK ].push( pieceRef );

        } else {

          self.board[ pieceRef.x ][ pieceRef.y ] = null;
          self.deadPieces[ self.PLAYER_COLOUR_RED ].push( pieceRef );

        }

      }

    };

    return self;

  }

] );