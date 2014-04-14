var Players = [];

var game_id_counter = 1;

function Checkers(client)
{
	this.id = game_id_counter;
	game_id_counter++;

	this.gameName = name;
	
	this.players = [];
	players.push(client);

	var self = this;

	this.leaveGame = function(client)
	{
		if ('undefined' == typeof client)
			return;

		var index = players.indexOf(client);
		self.players.splice(index,1);
		
		if (players.length === 0)
			return true;
		else 
			return false;
	};

	this.joinGame = function(client)
	{
		if ('undefined' == typeof client)
			return;

		if(self.players.length === 1)
		{
			self.players.push(client);
			return true;
		}
		else
		{
			return false;
		}
	};
}

function Request(socket, data)
{
	//Decode the JSON API
}

exports.CreateGame = function(client)
{
	var game = new Checkers(client);
	return game;
};