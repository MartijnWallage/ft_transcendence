import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

function initScene()
{
	// Scene, Camera, Renderer with Antialiasing
	const container = document.getElementById('threejs-container');
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xc1d1db); // Set background color
	container.appendChild(renderer.domElement);
	const controls = new OrbitControls(camera, container);

	camera.position.z = 0;
	camera.position.y = 32;
	camera.rotateX(-Math.PI/2);
	controls.update();

	// Add audio listener to the camera
	const listener = new THREE.AudioListener();
	camera.add(listener);

	// Create a global audio source
	const hit = new THREE.Audio(listener);

	// Load a sound and set it as the Audio object's buffer
	const audioLoader = new THREE.AudioLoader();
				audioLoader.load('./static/audio/hit.wav', function(buffer) {
						hit.setBuffer(buffer);
						hit.setLoop(false);
						hit.setVolume(1.0);
				});

	return ({scene, camera, renderer, hit, controls});
}

export { initScene };