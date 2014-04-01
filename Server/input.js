exports.SetupEvents = function(socket, game, lobby)
{
	socket.on('Lobby', function(data)
	{
		game.request(data);
	});

	socket.on('Game', function(data)
	{
		lobby.request(data);
	});
}