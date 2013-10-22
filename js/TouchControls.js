var element = document.getElementById('container');

var hammertime = Hammer(element).on("swipe", function(event) {
	alert('SWIPE TOIMII');
});