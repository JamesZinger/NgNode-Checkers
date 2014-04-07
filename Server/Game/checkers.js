var Players = [];

var game_id_counter = 1;

function Checkers()
{
	var id = -1;
	var gameName;

}

function Request(socket, data)
{
	//Decode the JSON API
};

exports.AddPlayer = function(socket, player)
{
	Players.push({socket: player});
};

exports.GetPlayers = function()
{
	var returns = [];
	for (var i = 0; i < Players.length; i++) 
	{
		returns.push(Players[i]);
	};

	return returns;
};

exports.CreateGame = function(client)
{
	var game = Checkers;
	game.id = game_id_counter;
	game_id_counter++;
	var gameName = client.name;
};