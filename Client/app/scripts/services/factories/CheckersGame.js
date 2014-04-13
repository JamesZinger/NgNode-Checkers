/* global app:false */
/* global THREE:false */

'use strict';

app.factory( 'CheckersGame', function ( $log ) {

  // Create the Three.js game environment 
  var checkersGame = {};

  checkersGame.init = function ( height, width, parentElement ) {

    $log.info( 'Initializing CheckersGame' );

    // Configure the scene
    checkersGame.scene = new THREE.Scene();
    checkersGame.camera = new THREE.PerspectiveCamera( 75, height / width, 0.1, 1000 );
    checkersGame.renderer = new THREE.WebGLRenderer();
    checkersGame.renderer.setSize( height, width );

    // Add a cube to the scene so we have something to look at
    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
      color: 0x00ff00
    } );
    checkersGame.cube = new THREE.Mesh( geometry, material );
    checkersGame.scene.add( checkersGame.cube );
    checkersGame.camera.position.z = 5;

    // Set up an event listener to update the camera when the window size changes
    window.addEventListener( 'resize', checkersGame.onWindowResize );

    // Append this to a parent element
    checkersGame.setParent( parentElement );

  };

  checkersGame.destroy = function () {

    $log.info( 'Destroying CheckersGame' );

    // Set all variables to null
    checkersGame.scene.remove( checkersGame.cube );
    checkersGame.cube = null;
    checkersGame.parentElement = null;
    checkersGame.scene = null;
    checkersGame.camera = null;
    checkersGame.renderer = null;

    // Remove the window resize event listener
    window.removeEventListener( 'resize', checkersGame.onWindowResize );

  };

  checkersGame.update = function () {

    checkersGame.cube.rotation.x += 0.1;
    checkersGame.cube.rotation.y += 0.1;

  };

  checkersGame.render = function () {

    window.requestAnimFrame( checkersGame.render );
    checkersGame.update();
    checkersGame.renderer.render( checkersGame.scene, checkersGame.camera );

  };

  checkersGame.setParent = function ( parentElement ) {

    checkersGame.parentElement = parentElement;
    checkersGame.parentElement.append( checkersGame.renderer.domElement );

  };

  checkersGame.onWindowResize = function () {

    $log.info( 'Resize' );

  };

  return checkersGame;

} );