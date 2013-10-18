var container;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var highlightBox;

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

var skyBox;
var drawnSphere;
var raycaster;

function RunGame(){
	init();
	animate();
}

function init() {

	container = document.getElementById( "container" );

	// Camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 1000;

	// Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

	// Trackball controls
	renderer.domElement.addEventListener( 'mousemove', onMouseMove );
	controls = new THREE.TrackballControls( camera , renderer.domElement );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	// Scene
	scene = new THREE.Scene();

	// Lights
	scene.add( new THREE.AmbientLight( 0x555555 ) );
	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	scene.add( light );

	// Skybox
	var imagePrefix = "img/";
	var imageSuffix = '.jpg';
	var directions = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
	var skyGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );

	// Icosahedron sphere
	var icosGeo = new THREE.IcosahedronGeometry( 200, 2 );
	var icosMat = new THREE.MeshPhongMaterial({color: 0xffffff, vertexColors: THREE.FaceColors}); //Unique colors for each face... i guess?
	for ( var i = 0; i < icosGeo.faces.length; i++ ){
		face  = icosGeo.faces[ i ];	
		face.color.setRGB( 0.0, 0.66, 0.91);		
	}
	drawnSphere = new THREE.Mesh( icosGeo, icosMat);
	scene.add( drawnSphere);

	projector = new THREE.Projector();
	raycaster = new THREE.Raycaster();
}


function onMouseMove( e ) {
	e.preventDefault();
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

// Really dirty to use 3 global vars for the mouseover highlight but cba to think better way atm
var faceUnderMouse = undefined;
var previousColor = undefined;
var previousIntersect = undefined;

function render() {

	// Trackball controls
	controls.update();

	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects([drawnSphere], true);

	// Set face color under cursor
	if(intersects.length > 0){
		if(intersects[0].face !== faceUnderMouse){
			if(faceUnderMouse !== undefined){
				faceUnderMouse.color = previousColor;
			}

			previousIntersect = intersects[0];
			faceUnderMouse = intersects[0].face;
			previousColor = new THREE.Color(faceUnderMouse.color);
			faceUnderMouse.color.setRGB(1,0,0);
			intersects[0].object.geometry.colorsNeedUpdate = true;
		}
	}
	else{
		if(faceUnderMouse !== undefined){
			// Remove face color if cursor moved out of the sphere
			faceUnderMouse.color = previousColor;
			previousIntersect.object.geometry.colorsNeedUpdate = true;
		}
		previousIntersect = undefined;
		previousColor = undefined;
		faceUnderMouse = undefined;
	}

	// Hacky way of preventing camera moving relative to skybox
	skyBox.position.copy( camera.position );
	
	renderer.render( scene, camera );

}