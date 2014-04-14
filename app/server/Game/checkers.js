function Checkers(game)
{
	if ('undefined' == typeof game)
		return;

	var self = this;

	this.board = null;
	this.game = game;

	this.players = [];

	this.init = function()
	{
		for (var i = 0; i < self.game.players.length; i++)
		{
			var client = self.game.players[i];

			self.players[client.cl_socket] = new Player(client, i);
			
			client.cl_socket.on('game', function(data)
			{
				self.request(client.cl_socket, data);
			});
		}
	};

	this.request = function(socket, data)
	{
		if ( 'undefined' == typeof socket )
		{
			return;
		}

		var res = null;
		if ( 'undefined' == typeof data || 'undefined' == typeof data.cmd )
		{
			res = {
				approved: false,
				data: "Error invaild request"
			};
		}

		else
		{
			switch(data.cmd)
			{
			case 'M':
				res = movePieceRequest(player);
				break;

			default:

				break;
			}
		}

		socket.emit(res);
	};

	this.movePieceRequest = function(player)
	{

	};
}

function Piece(teamNumber, tile)
{
	if ('undefined' == typeof teamNumber)
		return;

	var self = this;

	this.x = tile.x;
	this.y = tile.y;
	tile.hasPiece = true;
	this.isKing = false;
	this.teamNumber = teamNumber;
}

function Tile(x, y)
{
	this.x = x;
	this.y = y;
	this.hasPiece = false;
}

function Board()
{
	var self = this;

	this.pieces = [];

}

function Player(client, number)
{
	if ('undefined' == typeof client || 'undefined' == typeof number)
		return;

	this.client = client;
	this.number = number;
}

exports.CreateGame = function( game )
{
	var checkers = new Checkers(game);
	return checkers;
};