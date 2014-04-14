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

  cmd: 'C', // Command code -- A letter or short sequence of letters.
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

  players: [ { // Array of players belonging to the game. The host is always index 0.
    name: 'Kristina', // Player name (used as a unique identifier).
    state: 'Available' // In-game or available to join/create games? -- 'Available' or 'Playing'
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

}]};

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