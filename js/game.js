var container;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var highlightBox;
var clock = new THREE.Clock();

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

var skyBox;
var waterPlanet;
var sandPlanet;
var raycaster = new THREE.Raycaster();
var projector = new THREE.Projector();
var cursorParticle;

function startGame(){
	init();
	animate();
}

function init() {

	container = document.getElementById( "container" );

	// Camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.z = 1000;

	// Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

	// Trackball controls
	renderer.domElement.addEventListener( 'mousemove', onMouseMove );
	renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );

	controls = new THREE.TrackballControls( camera , renderer.domElement );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = false;
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
	var skyGeometry = new THREE.CubeGeometry( 100000, 100000, 100000 );	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );

	// Water planet
	// base image texture for mesh
	var waterTexture = new THREE.ImageUtils.loadTexture( 'img/wat.jpg');
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var wBaseSpeed = 0.0001;
	// number of times to repeat texture in each direction
	var wRepeatS = wRepeatT = 4.0;
	
	// texture used to generate "randomness", distort all other textures
	var wNoiseTexture = new THREE.ImageUtils.loadTexture( 'img/cloud.png' );
	wNoiseTexture.wrapS = wNoiseTexture.wrapT = THREE.RepeatWrapping; 
	// magnitude of noise effect
	var wNoiseScale = 0.5;
	
	// texture to additively blend with base image texture
	var wBlendTexture = new THREE.ImageUtils.loadTexture( 'img/wat.jpg' );
	wBlendTexture.wrapS = wBlendTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 
	var wBlendSpeed = 0.003;
	// adjust lightness/darkness of blended texture
	var wBlendOffset = 0.35;

	// texture to determine normal displacement
	var wBumpTexture = wNoiseTexture;
	wBumpTexture.wrapS = wBumpTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var wBumpSpeed   = 0.02;
	// magnitude of normal displacement
	var wBumpScale   = 3.0;
	
	// use "this." to create global object
	this.waterUniforms = {
		baseTexture: 	{ type: "t", value: waterTexture },
		baseSpeed:		{ type: "f", value: wBaseSpeed },
		repeatS:		{ type: "f", value: wRepeatS },
		repeatT:		{ type: "f", value: wRepeatT },
		noiseTexture:	{ type: "t", value: wNoiseTexture },
		noiseScale:		{ type: "f", value: wNoiseScale },
		blendTexture:	{ type: "t", value: wBlendTexture },
		blendSpeed: 	{ type: "f", value: wBlendSpeed },
		blendOffset: 	{ type: "f", value: wBlendOffset },
		bumpTexture:	{ type: "t", value: wBumpTexture },
		bumpSpeed: 		{ type: "f", value: wBumpSpeed },
		bumpScale: 		{ type: "f", value: wBumpScale },
		alpha: 			{ type: "f", value: 1.0 },
		time: 			{ type: "f", value: 1.0 }
	};

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var waterMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: waterUniforms,
		vertexShader: document.getElementById( 'waterVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'waterFragmentShader' ).textContent
	}   );
		
	var waterGeometry = new THREE.SphereGeometry( 200, 64, 64 );
	waterPlanet = new THREE.Mesh( waterGeometry, waterMaterial );
	waterPlanet.position.set(0, 65, 160);
	objects.push(waterPlanet);
	scene.add( waterPlanet );

	// Sandplanet
	// base image texture for mesh
	var sandTexture = new THREE.ImageUtils.loadTexture( 'img/wat.jpg');
	sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var sBaseSpeed = 0.0001;
	// number of times to repeat texture in each direction
	var sRepeatS = sRepeatT = 4.0;
	
	// texture used to generate "randomness", distort all other textures
	var sNoiseTexture = new THREE.ImageUtils.loadTexture( 'img/cloud.png' );
	sNoiseTexture.wrapS = sNoiseTexture.wrapT = THREE.RepeatWrapping; 
	// magnitude of noise effect
	var sNoiseScale = 0.5;
	
	// texture to additively blend with base image texture
	var sBlendTexture = new THREE.ImageUtils.loadTexture( 'img/wat.jpg' );
	sBlendTexture.wrapS = sBlendTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 
	var sBlendSpeed = 0.003;
	// adjust lightness/darkness of blended texture
	var sBlendOffset = 0.35;

	// texture to determine normal displacement
	var sBumpTexture = sNoiseTexture;
	sBumpTexture.wrapS = sBumpTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var sBumpSpeed   = 0.02;
	// magnitude of normal displacement
	var sBumpScale   = 3.0;
	
	// use "this." to create global object
	this.sandUniforms = {
		baseTexture: 	{ type: "t", value: sandTexture },
		baseSpeed:		{ type: "f", value: sBaseSpeed },
		repeatS:		{ type: "f", value: sRepeatS },
		repeatT:		{ type: "f", value: sRepeatT },
		noiseTexture:	{ type: "t", value: sNoiseTexture },
		noiseScale:		{ type: "f", value: sNoiseScale },
		blendTexture:	{ type: "t", value: sBlendTexture },
		blendSpeed: 	{ type: "f", value: sBlendSpeed },
		blendOffset: 	{ type: "f", value: sBlendOffset },
		bumpTexture:	{ type: "t", value: sBumpTexture },
		bumpSpeed: 		{ type: "f", value: sBumpSpeed },
		bumpScale: 		{ type: "f", value: sBumpScale },
		alpha: 			{ type: "f", value: 1.0 },
		time: 			{ type: "f", value: 1.0 }
	};

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var sandMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: sandUniforms,
		vertexShader: document.getElementById( 'sandVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'sandFragmentShader' ).textContent
	}   );
		
	var sandGeometry = new THREE.SphereGeometry( 200, 64, 64 );
	sandPlanet = new THREE.Mesh( sandGeometry, sandMaterial );
	sandPlanet.position.set(0, 65, 160);
	sandPlanet.position.x -= 1000;
	sandPlanet.position.z -= 1000;
	objects.push(sandPlanet);
	scene.add( sandPlanet );

	// Particle under cursor
	var spriteMaterial = new THREE.SpriteMaterial( 
	{ 
		map: new THREE.ImageUtils.loadTexture( 'img/glow.png' ), 
		useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center,
		color: 0xff0000, transparent: false, blending: THREE.AdditiveBlending
	});
	cursorParticle = new THREE.Sprite( spriteMaterial );
	cursorParticle.scale.set(50, 50, 1.0);
	scene.add(cursorParticle);

	//Starfield
	var count = 1000;
	var particles = new THREE.Geometry();

	for(var i=0; i<count; i++){
		
		var distance = 10000+Math.random()*10000;

		var phi = Math.random()*(2*Math.PI);
		var costheta = (1-2*Math.round(Math.random())) * Math.random();		
		var theta = Math.acos(costheta);

		var pX = distance * Math.sin(theta) * Math.cos(phi);
		var pY = distance * Math.sin(theta) * Math.sin(phi);
		var pZ = distance * Math.cos(theta);

		particle = new THREE.Vector3(pX,pY,pZ);

		particles.vertices.push(particle);
	}

	var partmat = new THREE.ParticleBasicMaterial({map: THREE.ImageUtils.loadTexture("img/particle.png"), blending: THREE.AdditiveBlending, transparent:true, color:0xffffff, size: 100});
	var starfield = new THREE.ParticleSystem( particles, partmat );
	scene.add(starfield);

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Note! This should be handled by hammer js events, e.g. "OnTap"
// This current implementation triggers even when dragging so it's not viable!
function onMouseDown(e){
	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(objects, true);

	if(intersects.length > 0){
		planetToFollowPos = intersects[0].object.position;
	}
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

function render() {

	// Trackball controls
	controls.update();

	// Time for shader
	var delta = clock.getDelta();
	waterUniforms.time.value += delta;
	sandUniforms.time.value += delta;

	//Colors the face currently under mouse
	TrackPointUnderMouse();

	// Hacky way of preventing camera moving relative to skybox
	skyBox.position.copy( camera.position );
	
	renderer.render( scene, camera );

}

var cameraMovementVector = new THREE.Vector3(0,0,0);
var planetToFollowPos = new THREE.Vector3(0,0,0);

function TrackPointUnderMouse(){
	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());

	var intersects = raycaster.intersectObjects(objects, true);

	cameraMovementVector.subVectors(planetToFollowPos , controls.target).multiplyScalar(0.1);

	if(intersects.length > 0){
		cursorParticle.position = intersects[0].point;
	}
	controls.object.position.add(cameraMovementVector);
	controls.target.add(cameraMovementVector);
}

function CreateParticle(){

	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(objects, true);

	if(intersects.length > 0){
		var wat = new THREE.IcosahedronGeometry( 50, 1 );
		var wat2 = new THREE.MeshPhongMaterial({color: 0xffffff}); 
		var itemzz = new THREE.Mesh( wat, wat2);

		itemzz.position = intersects[ 0 ].point;
		scene.add( itemzz );
	}
}