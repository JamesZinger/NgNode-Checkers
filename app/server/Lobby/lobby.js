/* global require:false,
	exports:false */
'use strict';
var cl_template = require('./client.js');
var game_template = require('./../Game/checkers.js');
var Clients = [];
var Games = [];

function request(socket, data)
{
	if ( 'undefined' == typeof socket )
	{
		return;
	}

	var res = null;
	if ( 'undefined' == typeof data || 'undefined' == typeof data.cmd )
	{
		res = {
			approved: false,
			data: "Error invaild request"
		};
	}

	else
	{
		var clientContext = Clients[socket];
		switch ( data.cmd )
		{
			//Create Game
			case 'C':
				res = createGame(clientContext);
				break;

			//Leave Game
			case 'L':
				res = leaveGame(clientContext);
				break;

			//Join Game
			case 'J':
				res = joinGame(clientContext);
				break;

			//Set Ready
			case 'R':
				res = setReady(clientContext);
				break;

			//Set Wait
			case 'W':
				res = setWait(clientContext);
				break;

			//Set Name
			case 'N':
				res = setName(clientContext);
				break;

			default:
				res = {
					approved: false,
					data: "Error cannot determine command"
				};
				break;
		}
	}
	socket.emit(res);
}

// Helper for adding clients to the lobby.
// Should be done on connect
exports.AddClient = function(socket)
{
	Clients[socket] = new cl_template.CreateClient(socket);
//	Clients.push(
//		{socket: cl_template.CreateClient(socket)}
//		);

	socket.on('lobby', function(data)
	{
		request(socket, data);
	});
};


exports.GetClients = function()
{
	var returns = [];
	for (var i = 0; i < Clients.length; i++) {
		returns.push(Clients[i]);
	}
	return returns;
};

function createGame(clientContext)
{

}

function leaveGame(clientContext)
{

}

function joinGame(clientContext)
{

}

function setReady(clientContext)
{

}

function setWait(clientContext)
{

}

function setName(clientContext)
{

}