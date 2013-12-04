var connectionBroker = undefined;
var connection = undefined; //Connection to opponent
var serverInfo = {hostname: '127.0.0.1', port: 7500};//{hostname: 'lair.dy.fi', port: 7500};
var playerName = "";

function RegisterToServer() {

	// Register to server using info above. Timeouts/errors if server is not running.
	// Server is off by default, ask Kura2 in IRC if you need it
	connectionBroker = new Peer({host: serverInfo.hostname, port: serverInfo.port}, {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]});

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

		SendData(connection, ["PlanetIndex" , ownPlanetIndex]);

		//Show unit selection screen
		ShowUnitSelection();
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

		case "UnitPlacementFinished":
			console.log(data);
			break;

		//Define the planet you are assigned
		case "PlanetIndex":
			ownPlanet = 1; //1 = water, 2 = sand
			if(ownPlanetIndex > data[1]){
				ownPlanet = 2;
			}

			if(ownPlanet == 1){
				planetToFollowPos = objects.waterPlanet.position;
			}
			else{
				planetToFollowPos = objects.sandPlanet.position;
			}

			break;

		default:
			// Unknown command
			console.log("Unknown command: " + data);
	}
}

//Show the screen for unit selection
function ShowUnitSelection(){

	var cssfile = {rel:'stylesheet',type:'text/css',href:'css/main.css'};

	//Actual div
	var $selectscreen = $("<div id='selectscreen' />", cssfile).css({
		'bottom': (Math.max(0, (($(window).height()- 300)/ 2))-100) + "px",
		'left': Math.max(0, (($(window).width() - 600)/ 2))      + "px"
	});

	//Insert into DOM
	$("#container").after($selectscreen);

	//Selectionbox text
	var $selectscreentext = $("<span id='selectscreentext' />",cssfile).html('Select your unit<br />Remaining money: '+money);

	//Dummy div for <span> centering
	var $dummydiv = $("<div id='dummy' />").css({'text-align':'center'})
	$selectscreen.append($dummydiv);
	$dummydiv.append($selectscreentext);

	//Button for an unit
	var $unit1btn = $("<div class='unitbtn' />",cssfile).css({
		'background' : 'url(img/dummybox.png)',
		'background-size' : 'contain'
	}).on('click', function(){
		if(money - parseInt($unit1cost.html()) < 0) return; //Should show error "not enough money blabla"
		money -= parseInt($unit1cost.html());
		addDummyUnit();
		$("#selectscreen").fadeOut('fast');
		$selectscreentext.html('Select your unit<br />Remaining money: '+money);
	});

	//Cost text for unit 1
	var $unit1cost = $("<span class='unitcost' />", cssfile).css({
		'left':'50px',
    	'top':'20px'
	}).html('200');

	//Insert
	$selectscreen.append($unit1btn);
	$unit1btn.after($unit1cost);

	//Button to finish unit placement
	$finishbtn = $("<div id='finishselection' />", cssfile).html('Finish unit selection').on('click', function(){
		$("#selectscreen").hide();

		//.. Send other player message about finishing unit placement etc...
		/*
		var unit_positions = [];
		$.each(objects.units, function(idx, obj){
			unit_positions.push(Vec3List(obj.position));
		});
		SendData(connection, ["UnitPlacementFinished", unit_positions]);
		*/
	});

	$selectscreen.append($finishbtn);

}

// This function is run after whole DOM has been loaded
$(document).ready(function() {

	//Uncomment these to debug unit selection/placement
	ShowUnitSelection();
	$('#welcomeScreen').hide();

	// Bind functions to html elements
	RegisterToServer();

	$('#connect').on('click', function() {
		ConnectToOpponent();
	});

	$("#connectTo").on('keydown', function(e){
		if(e.keyCode == 13) ConnectToOpponent();
	});

	startGame();
});


function Vec3List(vec){
	return [vec.x, vec.y, vec.z];
}

function ListVec3(li){
	var to_return = new THREE.Vector3(li[0], li[1], li[2]);
	return to_return;
}