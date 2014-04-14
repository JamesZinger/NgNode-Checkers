'use strict';

// This file details the format specification for any data types
// to be transported between the server and client for Axon Checkers.
// 
// If the protocol says to return an error message, that means to just
// place a string into the data field when sending a response/push.
// Player names are also sent as raw strings. Strings are the only type
// of data that should be sent raw in this way.
// 
// There are 3 predominant JSON formats: Requests, Responses and Pushes.
// Requests are sent by the client to the server to request an action or resource.
// Responses are sent by the server in reply to client requests.
// Pushes are sent by the server to one or more clients but are not replies.

//
// JSON Message Header Formats
//

// Request Format
var req = {

  cmd: ‘C’, // Command code -- A letter or short sequence of letters.
  data: null, // Any data type.

};

// Response Format
var res = {

  approved: true, // Was the request approved? -- true or false.
  data: null // Any data type.

};

// Push Format
var push = {

  cmd: 'GO', // Command code -- A letter or short sequence of letters.
  data: null // Any data type.

};

//
// Data Package Formats
//

// Lobby Game Data
var gameLobby = {

  initialPlayerName: 'Anon053',
  players: [ { // Array of players belonging to the game. The host is always index 0.
    name: 'Kristina', // Player name (used as a unique identifier).
    ready: true // Is the player ready to begin playing? -- true or false.
  }, {
    name: 'James',
    ready: false
  } ],
  games: [ {
      players: [ {
        name: 'James',
        ready: false
      }, {
        name: 'Kristina',
        ready: true
      } ]

    };

    // Checkers Game Data
    var checkersGame = {

      playerColour: 1,
      turn: 0,
      board: [
        [ null, {
            id: 'R4',
            x: 1,
            y: 0,
            king: false
          },
          null, {
            id: 'R3',
            x: 3,
            y: 0,
            king: false
          },
          null, {
            id: 'R2',
            x: 5,
            y: 0,
            king: false
          },
          null, {
            id: 'R1',
            x: 7,
            y: 0,
            king: false
          }
        ],
        [ {
            id: 'R8',
            x: 2,
            y: 1,
            king: false
          },
          null, {
            id: 'R7',
            x: 4,
            y: 1,
            king: false
          },
          null, {
            id: 'R6',
            x: 4,
            y: 1,
            king: false
          },
          null, {
            id: 'R5',
            x: 6,
            y: 1,
            king: false
          },
          null
        ],
        [ null, {
            id: 'R12',
            x: 1,
            y: 2,
            king: false
          },
          null, {
            id: 'R11',
            x: 3,
            y: 2,
            king: false
          },
          null, {
            id: 'R10',
            x: 5,
            y: 2,
            king: false
          },
          null, {
            id: 'R9',
            x: 7,
            y: 2,
            king: false
          }
        ],
        [ null, null, null, null, null, null, null, null ],
        [ null, null, null, null, null, null, null, null ],
        [ {
            id: 'B9',
            x: 0,
            y: 5,
            king: false
          },
          null, {
            id: 'B10',
            x: 2,
            y: 5,
            king: false
          },
          null, {
            id: 'B11',
            x: 4,
            y: 5,
            king: false
          },
          null, {
            id: 'B12',
            x: 6,
            y: 5,
            king: false
          },
          null
        ],
        [ null, {
            id: 'B5',
            x: 1,
            y: 6,
            king: false
          },
          null, {
            id: 'B6',
            x: 3,
            y: 6,
            king: false
          },
          null, {
            id: 'B7',
            x: 5,
            y: 6,
            king: false
          },
          null, {
            id: 'B8',
            x: 7,
            y: 6,
            king: false
          }
        ],
        [ {
            id: 'B1',
            x: 0,
            y: 7,
            king: false
          },
          null, {
            id: 'B2',
            x: 2,
            y: 7,
            king: false
          },
          null, {
            id: 'B3',
            x: 4,
            y: 7,
            king: false
          },
          null, {
            id: 'B4',
            x: 6,
            y: 7,
            king: false
          },
          null
        ],
      ]

    };

    // Lobby Player Data
    var playerLobby = {

      name: 'James', // Player name (used as a unique identifier).
      state: 'Available' // In-game or available to join/create games? -- 'Available' or 'Playing'

    };

    // Gameplay Move Piece Request Data
    var pieceMoveReqData = {

      piece: 'B2', // Text identifier of the piece to act on -- 'B' for black or 'R' for red, then piece # [0, 11].
      x: 2, // Horizontal board position -- [0, 7].
      y: 4 // Vertical board position -- [0, 7].

    };

    // Gameplay Move Piece Response Data
    var pieceMoveResData = {

      endTurn: false // Whether or not the player's turn has ended -- true or false.

    };