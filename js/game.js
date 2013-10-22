var container;
var camera, controls, scene, renderer;
var pickingData = [], pickingTexture, pickingScene;
var objects = [];
var highlightBox;

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3( 10, 10, 10 );

var skyBox;
var raycaster;
var cursorParticle;

function RunGame(){
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

	// Icosahedron sphere (Planet 1)
	var icosGeo = new THREE.IcosahedronGeometry( 200, 3 );
	var icosMat = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('img/water.jpg') /*,color: 0xffffff*/, vertexColors: THREE.FaceColors}); //Unique colors for each face... i guess?
	for ( var i = 0; i < icosGeo.faces.length; i++ ){
		face  = icosGeo.faces[ i ];	
		face.color.setRGB( 0.0, 0.66, 0.91);		
	}
	planet1 = new THREE.Mesh( icosGeo, icosMat);
	objects.push(planet1);
	scene.add( planet1);

	// Icosahedron sphere 2 (Planet 2)
	var icosGeo2 = new THREE.IcosahedronGeometry( 200, 3 );
	var icosMat2 = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('img/water.jpg') /*,color: 0xffffff*/, vertexColors: THREE.FaceColors}); //Unique colors for each face... i guess?
	for ( var i = 0; i < icosGeo2.faces.length; i++ ){
		face  = icosGeo2.faces[ i ];	
		face.color.setRGB( 0.0, 0.66, 0.91);		
	}
	planet2 = new THREE.Mesh( icosGeo2, icosMat2);
	planet2.position.x -= 1000;
	planet2.position.z -= 1000;
	objects.push(planet2);
	scene.add(planet2);

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

	projector = new THREE.Projector();
	raycaster = new THREE.Raycaster();
}

// Note! This should be handled by hammer js events, e.g. "OnTap"
// This current implementation triggers even when dragging so it's not viable!
function onMouseDown(e){
	//CreateParticle();
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

	//Colors the face currently under mouse
	TrackPointUnderMouse();

	// Hacky way of preventing camera moving relative to skybox
	//skyBox.position.copy( camera.position );
	
	renderer.render( scene, camera );

}

var k = new THREE.Vector3(0,0,0);
var k2 = new THREE.Vector3(0,0,0);
function TrackPointUnderMouse(){
	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(objects, true);

	// If intersect
	if(intersects.length > 0){

		k2 = intersects[0].object.position;

		cursorParticle.position = intersects[0].point;
		cursorParticle.position.x += (intersects[0].point.x - intersects[0].object.position.x)*0.05;
		cursorParticle.position.y += (intersects[0].point.y - intersects[0].object.position.y)*0.05;
		cursorParticle.position.z += (intersects[0].point.z - intersects[0].object.position.z)*0.05;
	}

	k.subVectors(k2 , controls.target).multiplyScalar(0.1);
	controls.object.position.add(k);
	controls.target.add(k);
}

function CreateParticle(){

	// Raycast from camera to under mouse
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1 );
	projector.unprojectVector(vector, camera);
	raycaster.set(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(objects, true);

	// If intersect
	if(intersects.length > 0){
		var wat = new THREE.IcosahedronGeometry( 50, 1 );
		var wat2 = new THREE.MeshPhongMaterial({color: 0xffffff}); 
		var itemzz = new THREE.Mesh( wat, wat2);

		itemzz.position = intersects[ 0 ].point;
		scene.add( itemzz );
	}
}