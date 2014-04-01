// What is Unique about a client

var client_id_counter = 1;

function client()
{
	var cl_id = -1;
	var cl_socket;
}

exports.CreateClient = function(socket)
{
	var cl = client;
	cl.cl_socket = socket;
	cl.cl_id = client_id_counter;
	client_id_counter++;
	return cl;
}