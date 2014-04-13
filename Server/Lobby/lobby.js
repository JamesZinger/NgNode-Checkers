
var cl_template = require('./client.js');
var game_template = require('./../Game/checkers.js');
var Clients = [];
var Games = [];

function Request(socket, data)
{
	//Decode the JSON API
	if ( 'undefined' === typeof data || 'undefined' === typeof socket )
	{
		return;
	}
}

// Helper for adding clients to the lobby.
// Should be done on connect
exports.AddClient = function(socket)
{
	Clients.push(
		{socket: cl_template.CreateClient(socket)}
		);

	socket.on('Lobby', function(data)
	{
		Request(socket, data);
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

function CreateGame(socket)
{

}