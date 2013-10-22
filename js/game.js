var container;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var highlightBox;
var clock = new THREE.Clock();

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

var skyBox;
var homePlanet;
var raycaster = new THREE.Raycaster();
var projector = new THREE.Projector();

function startGame(){
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

	// Homeplanet

	// base image texture for mesh
	var waterTexture = new THREE.ImageUtils.loadTexture( 'img/wat.jpg');
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var baseSpeed = 0.0001;
	// number of times to repeat texture in each direction
	var repeatS = repeatT = 4.0;
	
	// texture used to generate "randomness", distort all other textures
	var noiseTexture = new THREE.ImageUtils.loadTexture( 'img/cloud.png' );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
	// magnitude of noise effect
	var noiseScale = 0.5;
	
	// texture to additively blend with base image texture
	var blendTexture = new THREE.ImageUtils.loadTexture( 'img/wat.jpg' );
	blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 
	var blendSpeed = 0.003;
	// adjust lightness/darkness of blended texture
	var blendOffset = 0.35;

	// texture to determine normal displacement
	var bumpTexture = noiseTexture;
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var bumpSpeed   = 0.02;
	// magnitude of normal displacement
	var bumpScale   = 3.0;
	
	// use "this." to create global object
	this.customUniforms = {
		baseTexture: 	{ type: "t", value: waterTexture },
		baseSpeed:		{ type: "f", value: baseSpeed },
		repeatS:		{ type: "f", value: repeatS },
		repeatT:		{ type: "f", value: repeatT },
		noiseTexture:	{ type: "t", value: noiseTexture },
		noiseScale:		{ type: "f", value: noiseScale },
		blendTexture:	{ type: "t", value: blendTexture },
		blendSpeed: 	{ type: "f", value: blendSpeed },
		blendOffset: 	{ type: "f", value: blendOffset },
		bumpTexture:	{ type: "t", value: bumpTexture },
		bumpSpeed: 		{ type: "f", value: bumpSpeed },
		bumpScale: 		{ type: "f", value: bumpScale },
		alpha: 			{ type: "f", value: 1.0 },
		time: 			{ type: "f", value: 1.0 }
	};

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: customUniforms,
		vertexShader: document.getElementById( 'waterVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'waterFragmentShader' ).textContent
	}   );
		
	var ballGeometry = new THREE.SphereGeometry( 200, 64, 64 );
	homePlanet = new THREE.Mesh( ballGeometry, customMaterial );
	homePlanet.position.set(0, 65, 160);
	scene.add( homePlanet );

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
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

	// Time for shader
	var delta = clock.getDelta();
	customUniforms.time.value += delta;

	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects([homePlanet], true);

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