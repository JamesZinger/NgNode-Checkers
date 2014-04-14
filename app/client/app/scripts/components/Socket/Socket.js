/* global app:false */
'use strict';

app.factory( 'Socket', [ 
  '$rootScope', 'SERVER_ADDRESS',
  function ( $rootScope, SERVER_ADDRESS ) {

    // Connect to the server and create the socket interface object
    var socket = window.io.connect( SERVER_ADDRESS );
    var socketInterface = {};

    // on() listens for server messages indicating events with the given eventName
    socketInterface.on = function ( eventName, callback ) {
      socket.on( eventName, function () {
        var args = arguments;
        $rootScope.$apply( function () {
          callback.apply( socket, args );
        } );
      } );
    };

    // emit() triggers an event on the server by sending a socket message with the given eventName
    socketInterface.emit = function ( eventName, data, callback ) {
      socket.emit( eventName, data, function () {
        var args = arguments;
        $rootScope.$apply( function () {
          if ( callback ) {
            callback.apply( socket, args );
          }
        } );
      } );
    };

    return socketInterface;

  }

] );