// What is Unique about a client

var client_id_counter = 1;

function client(socket)
{
	if ('undefined' == typeof socket)
		return;

	this.cl_id        = client_id_counter;
	this.name         = "";
	this.cl_socket    = socket;
	this.isInGame     = false;
	this.gameId       = -1;
	this.isInitalized = false;
	this.isReady      = false;
	this.isPlaying    = false;

	client_id_counter++;
}

exports.CreateClient = function(socket)
{
	var cl = new client(socket);
	return cl;
};