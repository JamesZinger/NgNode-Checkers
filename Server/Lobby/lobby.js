var cl_template = require('./client.js');
var Clients = [];
var Games = [];

exports.Request = function(socket, data)
{
	//Decode the JSON API
	console.log("Data");
};

// Helper for adding clients to the lobby.
// Should be done on connect
exports.AddClient = function( socket )
{
	Clients.push(
		{socket: cl_template.CreateClient(socket)}
		);

	socket.on('Lobby', function(data)
	{
		Request(socket, data);
	});
	
	//socket.on('disconnect', onDisconnect(socket) );

	console.log(Clients);
};

exports.GetClients = function()
{
	var returns = [];
	for ( var i = 0; i < Clients.length; i++ )
	{
		returns.push( Clients[ i ] );
	}
	return returns;
};


function onDisconnect(socket)
{
	removeClient(socket);
}

function removeClient(socket)
{
	for ( var i = 0; i < Clients.length; i++ )
	{
		if (Clients[i].cl_socket == socket)
		{
			Clients.splice(i,1);
		}
	}
}