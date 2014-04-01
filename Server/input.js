exports.SetupEvents = function(socket, game, lobby)
{
	socket.on('Lobby', function(data)
	{
		lobby.Request(socket, data);
	});

	socket.on('Game', function(data)
	{
		game.Request(socket, data);
	});
};