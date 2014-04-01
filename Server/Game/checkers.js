var Players = new Array();

exports.Request = function(socket, data)
{
	
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