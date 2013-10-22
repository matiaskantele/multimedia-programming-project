var connectionBroker = undefined;
var connection = undefined; //Connection to opponent
var serverInfo = {hostname: '82.130.14.29', port: 7500};
var playerName = "";

function RegisterToServer() {

<<<<<<< HEAD
var geometry = new THREE.CubeGeometry(2,2,2);
var material = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});
var cube = new THREE.Mesh(geometry, material);
var geometryPs = new THREE.CubeGeometry(2,2,2);
var materialPs = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});
var particleSystem = new THREE.ParticleSystem(geometryPs, materialPs);
scene.add(cube);
scene.add(particleSystem);

document.addEventListener("keydown", onDocumentKeyDown, false);
=======
	// Register to server using info above. Timeouts/errors if server is not running.
	// Server is off by default, ask Kura2 in IRC if you need it
	connectionBroker = new Peer({host: serverInfo.hostname, port: serverInfo.port}, {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]});
>>>>>>> origin/develop

	connectionBroker.on('error', function(error){
		$('#myId').css({'text-shadow':'0 0 0.1em #C44D58, 0 0 0.1em #C44D58, 0 0 0.1em #C44D58','color':'#C44D58'});
		$('#myId').text("No connection to connection broker");
	});
	// This is run after we've successfully connected to server and recieved an ID
	connectionBroker.on('open', function(id) {
		$('#myId').css({'text-shadow':'0 0 0.1em #C7F464, 0 0 0.1em #C7F464, 0 0 0.1em #C7F464','color':'#C7F464'});
		$('#myId').text("ID: " + id);
	});

	// Set up connection if someone connects to us
	connectionBroker.on('connection', function(conn) {
		SetConnectionEvents(conn);
	});
}

// Creates a connection to a given opponents ID
function ConnectToOpponent(opponentId) {

	// Error checking
	if(connectionBroker === undefined) {
		// Shouldn't be needed to test as this should be done on page load
		alert("Not connected to server");
		return false;
	}

	// Get opponents ID to connect to from input field if there's text
	if(opponentId === undefined) {
		if($("#connectTo").val() === ""){
			alert("No opponent ID specified");
			return false;
		}
		opponentId = $("#connectTo").val();
	}

	// Actual connection
	var conn = connectionBroker.connect(opponentId);

	// Set up connection when we connect to someone
	SetConnectionEvents(conn);
}

<<<<<<< HEAD
function onDocumentKeyDown(event){
	var keyCode = event.which;
	if(keyCode == 70){
		cube.position.x += 0.03;
	}
}

render();
*/
=======
function SetConnectionEvents(conn) {
	
	// When connection is established
	conn.on('open', function() {
		connection = conn;
		$('#welcomeScreen').fadeOut('slow', function(){});

		// Exchange player names
		playerName = $("#playerName").val();
		if(playerName === ""){
			playerName = "Unnamed";
		}
		SendData(connection, ["OpponentName", playerName]);
	});

	// When remote peer connection is closed
	conn.on('close', function() {
		connection = undefined;
		alert('Disconnected from opponent!');
		$('#welcomeScreen').fadeIn('slow', function(){});
	});

	// When we recieve data from remote peer
  	conn.on('data', function(data) {
  		ReceiveData(data);
	});

  	// Peer connection errors e.g. timeouts
	conn.on('error', function(err) {
		console.log("ERROR!!!");
		console.log(err.message);
	});
}

// Game mechanics should use this function for sending data
function SendData(conn, data) {
	conn.send(data);
}

// Define game mechanics to use when receiving data
function ReceiveData(data){

	// Data must be an array
	if(!(data instanceof Array)){
		console.log("Received invalid format data: "+data);
		return;
	}

	// Received data format: ["command", value], note that value can be another array, dict etc...
	switch(data[0]){

		case "Fire":
			// Some game stuff
			break;

		case "Move":
			// And so on
			break;

		case "OpponentName":
			console.log("Connected to " + data[1]);
			break;

		default:
			// Unknown command
			console.log("Unknown command: " + data);
	}
}

// This function is run after whole DOM has been loaded
$(document).ready(function() {

	// Bind functions to html elements
	RegisterToServer();

	$('#connect').on('click', function() {
		ConnectToOpponent();
	});

	RunGame();
});
>>>>>>> origin/develop
