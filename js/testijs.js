// grab the room from the URL
//var room = location.search && location.search.split('?')[1];

$(document).ready(function() {

	$("#Start").bind(function(){
		var peer = new Peer('kura', {host: '82.130.14.29', port: 7500});
	});	

	peer.on('open', function(id) {
	  console.log('My peer ID is: ' + id);
	});	


	//var conn = peer.connect('durr');
});