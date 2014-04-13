// What is Unique about a client

var client_id_counter = 1;

function client()
{
	var cl_id = new Number(-1);
	var name = new String();
	var cl_socket;
	var isInGame = new Boolean(false);
}

exports.CreateClient = function(socket, name)
{
	var cl = client.constructor();
	console.log("Client: " + cl);
	cl.cl_socket = socket;
	cl.cl_id = client_id_counter;
	client_id_counter++;
	cl.name = name;
	return cl;
};
