var Players = new Array();

function Checkers()
{
	var id;
}

exports.Request = function(socket, data)
{
	//Decode the JSON API
};

exports.AddPlayer = function(socket, player)
{
	Players.push({socket: player});
};

exports.GetPlayers = function()
{
	var returns = new Array();
	for (var i = 0; i < Players.length; i++) 
	{
		returns.push(Players[i]);
	};

	return returns;
}