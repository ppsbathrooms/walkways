import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();

loader.load( '/src/assets/franklinModel.glb', function ( franklin ) {

	scene.add( franklin.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

window.addEventListener('resize', onWindowResize);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#121211');

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, 
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(1, 3, 10);
orbit.update();

// lights
const light = new THREE.PointLight('#ffffff', 100, 100);
light.position.set(0,10,0);
scene.add(light);

const ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambient );

const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}
orbit.addEventListener( 'change', animate );
animate();
// renderer.setAnimationLoop(animate)


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

orbit.addEventListener('start', function () {
  orbit.domElement.style.cursor = 'move';
});

orbit.addEventListener('end', function () {
  orbit.domElement.style.cursor = 'auto';
});

orbit.domElement.style.cursor = 'auto';