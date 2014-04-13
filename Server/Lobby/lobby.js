
var cl_template = require('./client.js');
var game_template = require('./../Game/checkers.js');
var Clients = [];
var Games = [];

function Request(socket, data)
{
	if ( 'undefined' == typeof socket )
	{
		return;
	}

	var res = {};
	
	
	if ( 'undefined' == typeof data || 'undefined' == typeof data.cmd )
	{
		res.data = {
			approved: false,
			data: "Error invaild request"
		};
	}

	else
	{
		switch ( data.cmd )
		{
			//Create Game
			case 'C':
				res = CreateGame(socket);
				break;

			//Leave Game
			case 'L':
				res = LeaveGame(socket);
				break;

			//Join Game
			case 'J':
				break;

			//Set Ready
			case 'R':
				break;

			//Set Wait
			case 'W':
				break;

			//Set Name
			case 'N':
				break;

			default:
				res.id = data.id;
				res.data = {
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

function LeaveGame(socket)
{

}

