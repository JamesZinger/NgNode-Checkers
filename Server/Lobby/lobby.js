var Clients = new Array();

var Games = new Array();

exports.Request = function(socket, data)
{
	//Decode the JSON API
}

// Helper for adding clients to the lobby.
// Should be done on connect
exports.AddClient = function(socket)
{
	Clients.push(
		{socket: require('./client.js')}
		);
}


exports.GetClients = function()
{
	var returns = new Array();
	for (var i = 0; i < Clients.length; i++) {
		returns.push(Clients[i]);
	};
	return returns;
}

