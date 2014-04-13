/* global app:false */
'use strict';

app.factory( 'PlayerModel', [ 'CheckersModel',
  function ( $log ) {

    // Create the player model object
    var self = {

      //
      // Member variables
      //

      // The name of the player typed in when they log in on the homepage.
      name = '',

      // The state of the player ('Available' or 'Playing').
      state = 'Available',

      // If the player is in a game, the index of this player in the game's player list.
      // Note: If the player is not in a game, this should be -1.
      index = -1,

      // The lobby to which the
      lobby: null,

      // A reference to the game in the lobby
      gameLobby = null,

      // A reference to the game state of the game in progress
      game = null,

      //
      // Init
      //

      // requestInit() hooks up the given lobby to this player and requests that the
      // lobby assign a random initial name to the player.
      requestInit: function ( lobby ) {

        $log.info( 'PlayerModel.requestInit()' );

        // Store the lobby model reference
        self.lobby = lobby;

        // Request that the lobby model assign a random scientist name to the player
        self.lobby.requestSetName( self, '' );

      },

      //
      // Player Actions
      //

      // requestCreateGame() issues a request to the lobby model to create a
      // new game in the lobby with this player as the host.
      requestCreateGame: function () {

        $log.info( 'PlayerModel.requestCreateGame()' );
        self.lobby.requestCreateGame( self );

      },

      // requestLeaveGame() issues a request to the lobby model to have this
      // player leave the game to which he/she currently belongs. If this player
      // is the host of the game, the game is cancelled.
      requestLeaveGame: function () {

        $log.info( 'PlayerModel.requestLeaveGame()' );
        self.lobby.requestLeaveGame( self );

      },

      // requestJoinGame() issues a request to the lobby model to join the game
      // hosted by the user whose name matches the given hostName.
      requestJoinGame: function ( hostName ) {

        $log.info( 'PlayerModel.requestJoinGame()' );
        self.lobby.requestJoinGame( self, hostName );

      },

      // requestSetName()  issues a request to the lobby model to change this
      // player's name to the given newName. If newName is set to '', a random
      // unique scientist name will be reutrned from the server.
      requestSetName: function ( newName ) {

        $log.info( 'PlayerModel.requestSetName()' );
        self.lobby.requestSetName( self, newName );

      },

      // requestSetReady() issues a request to the lobby model to change this 
      // player's readiness be set to 'Ready' in the player's current game.
      requestSetReady: function () {

        $log.info( 'PlayerModel.requestSetReady()' );
        self.lobby.requestSetReady( self );

      },

      // requestSetWaiting() issues a request to the lobby model to change this 
      // player's readiness be set to 'Waiting' in the player's current game.
      requestSetWaiting: function () {

        $log.info( 'PlayerModel.requestSetWaiting()' );
        self.lobby.requestSetWaiting( self );

      },

      // requestMovePiece() issues a request to the checkers model to move the
      // given piece to the given (x, y) board space.
      requestMovePiece: function ( piece, x, y ) {

        $log.info( 'PlayerModel.requestMovePiece()' );
        self.game.requestMovePiece( self, piece, x, y );

      }

    }

    return self;

  }

] );