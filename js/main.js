//!!!
//@TODO: p2p connection and data send/receive need testing badly, current implementation in 100% untested
//!!!

//@todo: sending and recieving data between peers
//@todo: test connections between peers (currently everything untested)
//@todo: fix node.js http.get error when trying to get unique ID from server locally

//Initialize vars here to make them global
var peer = undefined;
var connection = undefined; //Connection to another peer, should be made an array in future for possible multiple connections
var serverInfo = {ownID: 'kone1', hostname: '82.130.14.29', port: 7500};

function HandleReceivedData(conn, data){
	//Supposedly game related data receiving goes here

	$("dataChannelRecieve").val(data);
	console.log(data);
}

function SendData(conn, data){
	//And supposedly game mechanics should use this function for sending data
	conn.send(data);
}

function RegisterToServer(){

	//Register to server using info above. Timeouts/errors if server is not running.
	//Server is off by default, ask Kura2 in IRC if you need it
	//Note: Server should assign a random ID to peer when ID is omitted from constructor
	//...but I got some strange http.open bug in peer.js when i tested that locally so i left the ID there
	//Another note: There is no reason not to run this function immediately on page load
	//...if there wasn't that damn ID assignment error when testing locally, that is
	peer = new Peer(serverInfo.ownID, {host: serverInfo.hostname, port: serverInfo.port});

	//Error handling
	peer.on('error', function(error){
		alert(error.message);
	});

	//This is run after we've successfully connected to server and recieved an ID
	peer.on('open', function(id) {
		$("#OwnID").text("Own ID: "+id);
		console.log("Connected to brokering server");
	});

	peer.on('connection', function(conn) {
  		conn.on('data', function(data){
  			//Handle whatever data we got (do we need to pass conn as arg?)
    		HandleReceivedData(conn, data);
  		});
	});
}

//Creates a connection to a given peer id
function ConnectToPeer(peerId){

	//Error checking
	if(peer === undefined){
		//Shouldn't be needed to test as this should be done on page load
		alert("Not connected to server");
		return false;
	}
	else if(connection === undefined){
		alert("Not connected to any peers");
		return false;
	}
	else if(peerId === undefined){
		alert("No input");
		return false;
	}

	//Get peer ID to connect to from input box text if there's text
	if(peerId === undefined){
		if($("#dataChannelSend").val() === ""){
			alert("No peer ID specified");
			return false;
		}
		peerId = $("#dataChannelSend").val();
		$("#dataChannelSend").val(""); //Empty after taking the ID
	}

	//Actual connection
	connection = peer.connect(peerId);

	console.log("Connected to another peer");
}

//This function is run after whole DOM has been loaded
$(document).ready(function() {

	//Bind functions to html elements
	$("#ConnectToServer").on('click', function(){
		//Should be run on page load instead of having a separate button
		RegisterToServer();
	});

	$("#ConnectToPeer").on('click', function(){
		ConnectToPeer();
	});
	$("#Disconnect").on('click', function(){
		if(peer === undefined){
			alert("Not connected to a server"); //Is this even needed?
		}
		else{
			peer.destroy(); //destroy() or disconnect() based on what we're going to make
			peer = undefined; connection = undefined;
			console.log("Disconnected from brokering server");
		}
	});

	$("#Send").on('click', function(){
		//Get data from textbox (later on game functionality should use the SendData function)
		var data = $("#dataChannelSend").val();
		
		if(connection === undefined){
			alert("not connected to a peer");
		}
		else if(data === undefined || data === ""){
			alert("nothing to send!");
		}

		//Actual send data
		SendData(connection, "bet this doesn't work yet");
		$("#dataChannelSend").val(""); //clear textbox
	});
	
});

/*

THREE JS STUFF BELOW

*/


/*
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(2,2,2);
var material = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

window.addEventListener( 'resize', onWindowResize, false );

var render = function () {
	requestAnimationFrame(render);

	cube.rotation.x += 0.02;
	cube.rotation.y += 0.02;

	renderer.render(scene, camera);
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var peer = new Peer({key: 'jlr92mqbkkai3sor'});


render();
*/