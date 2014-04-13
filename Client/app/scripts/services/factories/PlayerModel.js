/* global app:false */
'use strict';

app.factory( 'PlayerModel', [ 'LobbyProtocol', 'CheckersProtocol',
  function ( $log ) {

    // Create the player state object
    var player = {};

    //
    // Member variables
    //

    // The name of the player typed in when they log in on the homepage.
    player.name = '';

    // The state of the player ('Available' or 'Playing').
    player.state = 'Available';

    // If the player is in a game, the index of this player in the game's player list.
    // Note: If the player is not in a game, this should be -1.
    player.index = -1;

    // A reference to the game in the lobby
    player.gameLobby = null;

    // A reference to the game state of the game in progress
    player.gamePlay = null;

    //
    // Convenience method: Request builder
    //

    player.createRequest = function ( cmd, data ) {

      return {
        cmd: cmd,
        data: data,
        name: player.name
      };

    };

    //
    // Client-initiated lobby actions (Request/Response)
    //

    player.requestCreateGame = function () {

      $log.info( 'PlayerState.requestCreateGame()' );

      // Build the request
      var request = player.createRequest( Constants.LOBBY_REQ_CREATE_GAME, null );

      // Emit the request on the lobby channel
      Socket.emit( 'lobby', request, function ( response ) {

        // TODO

      } );

    };

    player.requestLeaveGame = function () {

      $log.info( 'PlayerState.requestLeaveGame()' );

      // Build the request
      var request = player.createRequest( Constants.LOBBY_REQ_LEAVE_GAME, null );

      // Emit the request on the lobby channel
      Socket.emit( 'lobby', request, function ( response ) {

        // TODO

      } );

    };

    player.requestJoinGame = function ( hostName ) {

      $log.info( 'PlayerState.requestJoinGame()' );

      // Build the request
      var request = player.createRequest( Constants.LOBBY_REQ_JOIN_GAME, hostName );

      // Emit the request on the lobby channel
      Socket.emit( 'lobby', request, function ( response ) {

        // TODO

      } );

    };

    player.requestSetName = function ( newName ) {

      $log.info( 'PlayerState.requestSetName()' );

      // Build the request
      var request = player.createRequest( Constants.LOBBY_REQ_SET_NAME, newName );

      // Emit the request on the lobby channel
      Socket.emit( 'lobby', request, function ( response ) {

        // TODO

      } );

    };

    player.requestSetReady = function () {

      $log.info( 'PlayerState.requestSetReady()' );

      // Build the request
      var request = player.createRequest( Constants.LOBBY_REQ_SET_READY, null );

      // Emit the request on the lobby channel
      Socket.emit( 'lobby', request, function ( response ) {

        // TODO

      } );

    };

    player.requestSetWaiting = function () {

      $log.info( 'PlayerState.requestSetWaiting()' );

      // Build the request
      var request = player.createRequest( Constants.LOBBY_REQ_SET_WAITING, null );

      // Emit the request on the lobby channel
      Socket.emit( 'lobby', request, function ( response ) {

        // TODO

      } );

    };

    //
    // Server-initiated lobby actions (Push notifications)
    // 

    // None

    //
    // Client-initiated gameplay actions (Request/Response)
    //

    player.requestMovePiece = function ( piece, x, y ) {

      $log.info( 'PlayerState.requestMovePiece()' );

      // Build the request
      var request = player.createRequest( Constants.LOBBY_REQ_MOVE_PIECE, {
        piece: piece,
        x: x,
        y: y
      } );

      // Emit the request on the lobby channel
      Socket.emit( 'lobby', request, function ( response ) {

        // TODO

      } );

    };

    //
    // Server-initiated gameplay actions (Push notifications)
    //

    player.onBeginTurnPushed = function () {

      $log.info( 'PlayerState.onBeginTurnPushed()' );

    };

    player.onGameOverPushed = function () {

      $log.info( 'PlayerState.onGameOverPushed()' );

    };

    player.onPiecePositionPushed = function () {

      $log.info( 'PlayerState.onPiecePositionPushed()' );

    };

    player.onPieceDeadPushed = function () {

      $log.info( 'PlayerState.onPieceDeadPushed()' );

    };

    player.onPieceKingedPushed = function () {

      $log.info( 'PlayerState.onPieceKingedPushed()' );

    };



    /*

  // cancelGame() is called when the player wishes to cancel their currently hosted game.
  player.cancelGame = function () {

    $log.info( 'PlayerState.cancelGame()' );

    // Throw exceptions for common error cases (courtesy authorization).
    if ( player.gameLobby === null ) {
      throw 'PlayerState.cancelGame >> Cannot cancel game. Not in a game!';
    } else if ( player.gameLobby.players[ 0 ].name !== player.name ) {
      throw 'PlayerState.cancelGame >> Cannot cancel game. You are not the creator of the game!';
    }

    // Remove the game from the lobby games list.
    var gameIndex = $scope.lobby.games.indexOf( player.gameLobby );
    $scope.lobby.games.splice( gameIndex, 1 );

    // Remove the reference to the game.
    player.gameLobby = null;

    // Set the index to -1 to indicate that we're not in a game.
    player.index = -1;

  };

  // createGame() is called when the player wishes to create a new game, hosted by them.
  player.createGame = function () {

    $log.info( 'PlayerState.createGame()' );

    // Throw exceptions for common error cases (courtesy authorization).
    if ( player.gameLobby !== null ) {
      throw 'PlayerState.createGame() >> Cannot create game. Currently in a game!';
    }

    // Create a new game to add to the game list.
    var newGame = {
      players: [ {
        name: player.name,
        ready: false
      } ]
    };

    // Keep a reference to this game
    player.gameLobby = newGame;

    // The game creator is always index 0
    player.index = 0;

    // Push this into the lobby's game list
    $scope.lobby.games.push( newGame );

  };

  // joinGame() is called when the player wishes to join another player's game.
  player.joinGame = function ( hostName ) {

    $log.info( 'PlayerState.joinGame()' );

    // Find the index of the game with this host in the games list (linear search)
    for ( var gameIndex = 0; gameIndex < $scope.lobby.games.length; gameIndex++ ) {
      if ( hostName === $scope.lobby.games[ gameIndex ].players[ 0 ].name ) {
        break;
      }
    }

    // If no match was found, then something terrible happened. Throw an exception!
    if ( gameIndex === $scope.lobby.games.length ) {
      throw 'PlayerState.joinGame >> Cannot join game. Game was not found in game list. Uh oh.';
    }

    // Use the game index to get a reference of the game to join.
    var gameToJoin = $scope.lobby.games[ gameIndex ];

    // Throw exceptions for common error cases (courtesy authorization).
    if ( player.gameLobby !== null ) {
      throw 'PlayerState.joinGame >> Cannot join game. Currently in a game!';
    } else if ( gameToJoin.players.length > 1 ) {
      throw 'PlayerState.joinGame >> Cannot join game. Game is full!';
    }

    // Create a player object to add to the game's player list
    var gamePlayer = {
      name: player.name,
      ready: false
    };

    // Keep a reference to this game
    player.gameLobby = gameToJoin;

    // Store the index of this player in the game
    player.index = gameToJoin.players.length;

    // Create a new player in the game matching this player
    gameToJoin.players.push( gamePlayer );

  };

  // leaveGame() is called when the player wishes to leave another player's game.
  player.leaveGame = function () {

    $log.info( 'PlayerState.leaveGame()' );

    // Throw exceptions for common error cases (courtesy authorization).
    if ( player.gameLobby === null ) {
      throw 'PlayerState.leaveGame >> Cannot leave game. Not in a game!';
    } else if ( player.gameLobby.players[ 0 ].name === player.name ) {
      throw 'PlayerState.leaveGame >> Cannot leave game. You are the creator of the game! You must cancel it instead!';
    }

    // Remove this player from the game
    player.gameLobby.players.splice( player.index, 1 );

    // Remove the reference to the game
    player.gameLobby = null;

    // Set the index to -1 to indicate that we're not in a game
    player.index = -1;

  };

  // setReady() is called when the player wishes to indicate to their current game that they are ready to play.
  player.setReady = function () {

    $log.info( 'PlayerState.setReady()' );

    // Throw exceptions for common error cases (courtesy authorization).
    if ( player.gameLobby === null ) {
      throw 'PlayerState.setReady >> Cannot set readiness. Lobby game is null!';
    }

    // Set the player's readiness to TRUE
    player.gameLobby.players[ player.index ].ready = true;

  };

  // setWaiting() is called when the player wishes to indicated to their current game that they are not yet ready.
  player.setWaiting = function () {

    $log.info( 'PlayerState.setWaiting()' );

    // Throw exceptions for common error cases (courtesy authorization).
    if ( player.gameLobby === null ) {
      throw 'PlayerState.setWaiting >> Cannot set readiness. Lobby game is null!';
    }

    // Set the player's readiness to TRUE
    player.gameLobby.players[ player.index ].ready = false;

  };

  */

    return player;

  }
] );