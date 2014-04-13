/* global app:false */
'use strict';

app.factory( 'Constants', function () {

  return {
    HOME_REQ_INIT:                'I',
    LOBBY_REQ_CREATE_GAME:        'C',
    LOBBY_REQ_LEAVE_GAME;         'L',
    LOBBY_REQ_JOIN_GAME:          'J',
    LOBBY_REQ_SET_NAME:           'N',
    LOBBY_REQ_SET_READY:          'R',
    LOBBY_REQ_SET_WAITING:        'W',
    LOBBY_PUSH_CREATE_GAME:       'GC',
    LOBBY_PUSH_REMOVE_GAME:       'GR',
    LOBBY_PUSH_UPDATE_GAME:       'GU',
    LOBBY_PUSH_CREATE_PLAYER:     'PC',
    LOBBY_PUSH_REMOVE_PLAYER:     'PR',
    LOBBY_PUSH_UPDATE_PLAYER:     'PU',
    LOBBY_PUSH_START_PLAYING:     'SP',
    PLAYING_REQ_MOVE_PIECE:       'M',
    PLAYING_PUSH_PIECE_POSITION:  'P',
    PLAYING_PUSH_PIECE_DEAD:      'D',
    PLAYING_PUSH_PIECE_KINGED:    'K',
    PLAYING_PUSH_BEGIN_TURN:      'B',
    PLAYING_PUSH_GAME_OVER:       'GO'
  };

} );