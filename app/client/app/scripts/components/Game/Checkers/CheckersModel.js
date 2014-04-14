/* global app:false */
/* global THREE:false */
'use strict';

app.factory( 'CheckersModel', [ 'CheckersProtocol',
  function ( $log ) {

    // Create the checkers model object
    var self = {

      //
      // Constants
      //



      //
      // Member Variables
      //



      parentElement: null,

      scene: null,
      camera: null,
      renderer: null,

      cube: null,

      //
      // Init
      //

      // init() configures the checkers model so it is ready to use.
      init: function ( height, width, parentElement ) {

        $log.info( 'CheckersModel.init()' );

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

        // Register event listeners for push notifications from the server
        CheckersProtocol.registerToBeginTurn( self.onPushBeginTurn );
        CheckersProtocol.registerToGameOver( self.onPushGameOver );
        CheckersProtocol.registerToPieceDead( self.onPushPieceDead );
        CheckersProtocol.registerToPieceKinged( self.onPushPieceKinged );
        CheckersProtocol.registerToPiecePositioned( self.onPushPiecePositioned );

        // Configure the scene
        self.initScene( height, width );

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



      },

      //
      // Event Handlers
      //

      // onPushBeginTurn() is called when a push notifiecation is recieved from the
      // server that a player's turn has begun, so the turn state should be set.
      onPushBeginTurn: function () {

        $log.info( 'CheckersModel.onPushBeginTurn()' );



      },

      // onPushGameOver() is called when a push notifiecation is recieved from the
      // server that the game is over and one of the two players has won.
      onPushGameOver: function () {

        $log.info( 'CheckersModel.onPushGameOver()' );



      },

      // onPushPieceDead() is called when a push notifiecation is recieved from the
      // server that a piece was jumped and should be removed from play.
      onPushPieceDead: function () {

        $log.info( 'CheckersModel.onPushPieceDead()' );



      },

      // onPushPieceKinged() is called when a push notifiecation is recieved from the
      // server that a piece reached the opposide end of the board and should be kinged.
      onPushPieceKinged: function () {

        $log.info( 'CheckersModel.onPushPieceKinged()' );



      },

      // onPushPiecePositioned() is called when a push notifiecation is recieved from 
      // the server that a piece on the board has been repositioned and should be moved.
      onPushPiecePositioned: function () {

        $log.info( 'CheckersModel.onPushPiecePositioned()' );



      },

      //
      // Utility Functions
      //

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