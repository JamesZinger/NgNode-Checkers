/* global app:false */
'use strict';

// THIS MODULE MUST BE INITIALIZED BEFORE IT CAN BE USED!

app.factory( 'PlayerModel', [
  '$log',
  function ( $log ) { 

    // Create the player model object
    var self = {

      //
      // Constants
      //

      LOBBY_STATE_AVAILABLE: 'Available',
      LOBBY_STATE_PLAYING: 'Playing',

      LOBBY_READINESS_READY: 'Ready',
      LOBBY_READINESS_WAITING: 'Waiting',

      LOBBY_INDEX_NO_GAME: -1,

      //
      // Member Variables
      //

      // The name of the player typed in when they log in on the homepage.
      name: '',

      // The lobby that the player is participating in.
      lobby: null,

      // The state of the player in the lobby (LOBBY_STATE_AVAILABLE or 
      // LOBBY_STATE_PLAYING).
      lobbyState: 'Available',

      // A reference to a game in the lobby that the player currently belongs to.
      gameLobby: null,

      // A reference to the player object contained by the lobby game.
      playerLobby: null,

      // If the player is in a game, the index of this player in the game's player list.
      // Note: If the player is not in a game, this should be LOBBY_INDEX_NO_GAME.
      gameLobbyIndex: -1,

      // A reference to the game state of the game in progress
      game: null,

      //
      // Init
      //

      // init() hooks up the given lobby to this player and requests that the lobby 
      // assign a random initial name to the player.
      init: function ( lobby ) {

        $log.info( 'PlayerModel.init()' );

        // Store the lobby model reference
        self.lobby = lobby;

        // Request that the lobby model assign a random scientist name to the player
        self.lobby.requestSetName( '' );

      },

      //
      // Requests
      //

      // requestCreateGame() issues a request to the lobby model to create a
      // new game in the lobby with this player as the host.
      requestCreateGame: function () {

        $log.info( 'PlayerModel.requestCreateGame()' );
        self.lobby.requestGameCreate();

      },

      // requestJoinGame() issues a request to the lobby model to join the game
      // hosted by the user whose name matches the given hostName.
      requestJoinGame: function ( hostName ) {

        $log.info( 'PlayerModel.requestJoinGame()' );
        self.lobby.requestGameJoin( hostName );

      },

      // requestLeaveGame() issues a request to the lobby model to have this
      // player leave the game to which he/she currently belongs. If this player
      // is the host of the game, the game is cancelled.
      requestLeaveGame: function () {

        $log.info( 'PlayerModel.requestLeaveGame()' );
        self.lobby.requestGameLeave();

      },

      // requestSetName()  issues a request to the lobby model to change this
      // player's name to the given newName. If newName is set to '', a random
      // unique scientist name will be reutrned from the server.
      requestSetName: function ( newName ) {

        $log.info( 'PlayerModel.requestSetName()' );
        self.lobby.requestSetName( newName );

      },

      // requestSetReady() issues a request to the lobby model to change this 
      // player's readiness be set to 'Ready' in the player's current game.
      requestSetReady: function () {

        $log.info( 'PlayerModel.requestSetReady()' );
        self.lobby.requestSetReady();

      },

      // requestSetWaiting() issues a request to the lobby model to change this 
      // player's readiness be set to 'Waiting' in the player's current game.
      requestSetWaiting: function () {

        $log.info( 'PlayerModel.requestSetWaiting()' );
        self.lobby.requestSetWaiting();

      },

      // requestMovePiece() issues a request to the checkers model to move the
      // given piece to the given (x, y) board space.
      requestMovePiece: function ( piece, x, y ) {

        $log.info( 'PlayerModel.requestMovePiece()' );
        self.game.requestMovePiece( piece, x, y );

      },

      //
      // Request Callbacks
      //

      // onCreatedOrJoinedGame() is called in response to the lobby model approving 
      // the player's request to create a game.
      onCreatedOrJoinedGame: function ( game ) {

        $log.info( 'PlayerModel.onCreatedOrJoinedGame()' );

        // Store the game reference, keep the player's index in the game's player 
        // list and switch the player's state to LOBBY_STATE_PLAYING.
        self.gameLobby = game;
        self.gameLobbyIndex = game.players.length - 1;
        self.playerLobby = self.gameLobbyIndex;
        self.lobbyState = self.LOBBY_STATE_PLAYING;

      },

      // onLeftGame() is called in response to the lobby model approving the
      // player's request to leave a game.
      onLeftGame: function () {

        $log.info( 'PlayerModel.onLeftGame()' );

        // Clear the game reference, reset the player index to LOBBY_INDEX_NO_GAME
        // list and switch the player's state to LOBBY_STATE_AVAILABLE.
        self.gameLobby = null;
        self.gameLobbyIndex = self.LOBBY_INDEX_NO_GAME;
        self.playerLobby = null;
        self.state = self.LOBBY_STATE_AVAILABLE;

      },

      // onSetName() is called in response to the lobby model approving the
      // player's request to set his/her name.
      onSetName: function ( newName ) {

        $log.info( 'PlayerModel.onSetName()' );

        // Set the player's name
        self.name = newName;

        // If the player is in a game, change the player's name there too
        if ( self.playerLobby !== null ) {
          self.playerLobby.name = newName;
        }

      },

      // onSetReady() is called in response to the lobby model approving the
      // player's request to be marked as ready to play in the game to which
      // the players currently belongs.
      onSetReady: function () {

        $log.info( 'PlayerModel.onSetReady()' );

        // Set readiness in the game to LOBBY_READINESS_READY
        self.playerLobby.ready = self.LOBBY_READINESS_READY;

      },

      // onSetWaiting() is called in response to the lobby model approving the
      // player's request to be marked as not ready to play in the game to 
      // which the players currently belongs.
      onSetWaiting: function () {

        $log.info( 'PlayerModel.onSetWaiting()' );

        // Set readiness in the game to LOBBY_READINESS_WAITING
        self.playerLobby.ready = self.LOBBY_READINESS_WAITING;

      },

      //
      // Utility Functions
      //

      // getGameHostName() returns the name of the player hosting the game that the
      // player currently belongs to. If the player is not currently in a game, then
      // null is returned instead.
      getGameHostName: function () {

        var result = null;
        if ( self.gameLobby === null ) {
          return result;
        }
        return self.gameLobby.players[ 0 ].name;

      }

    };

    return self;

  }
  
] );