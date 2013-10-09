/*
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(2,2,2);
var material = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});
var cube = new THREE.Mesh(geometry, material);
var geometryPs = new THREE.CubeGeometry(2,2,2);
var materialPs = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});
var particleSystem = new THREE.ParticleSystem(geometryPs, materialPs);
scene.add(cube);
scene.add(particleSystem);

document.addEventListener("keydown", onDocumentKeyDown, false);

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

function onDocumentKeyDown(event){
	var keyCode = event.which;
	if(keyCode == 70){
		cube.position.x += 0.03;
	}
}

render();
*/
