import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { ballConf } from './3d-pong-conf.js';

function initScene()
{
	// Scene, Camera, Renderer with Antialiasing
	const container = document.getElementById('threejs-container');
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xc1d1db); // Set background color
	container.appendChild(renderer.domElement);
	const controls = new OrbitControls(camera, container);

	camera.position.set(0, 0.9, 0);
	camera.lookAt(0, 1, 0);
	

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

	// SKYDOME
	const geometry = new THREE.SphereGeometry(50);
	geometry.computeBoundingBox();
	
	const material = new THREE.ShaderMaterial({
	  uniforms: {
		color1: { value: new THREE.Color( 0xe67300 ) },
		color2: { value: new THREE.Color("purple") },
		bboxMin: { value: geometry.boundingBox.min },
		bboxMax: { value: geometry.boundingBox.max }
	  },
	  vertexShader: `
	  uniform vec3 bboxMin;
	  uniform vec3 bboxMax;
	  
	  varying float vHeight;
  
	  void main() {
		// Compute the vertical position relative to the middle of the bounding box
		float middleY = (bboxMax.y + bboxMin.y) / 2.0;
		vHeight = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y); // Normalizing to range 0-1
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	  }
	`,
	fragmentShader: `
	  uniform vec3 color1;
	  uniform vec3 color2;
	  
	  varying float vHeight;
	  
	  void main() {
		float mixValue = smoothstep(0.5, 1.0, vHeight); // Adjusting to start the gradient at the middle
		gl_FragColor = vec4(mix(color1, color2, mixValue), 1.0);
	  }
	`,
		side: THREE.BackSide
	});
	
	const sphere = new THREE.Mesh(geometry, material);
	scene.add(sphere);
	scene.fog = new THREE.Fog(0xff5500 , 1, 130);
	  
	// GROUND
	const groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
	const groundMat = new THREE.MeshStandardMaterial({
		color: 0x330000,
		roughness: 0.5,
		metalness: 0.5
	});
	
	const ground = new THREE.Mesh( groundGeo, groundMat );
	ground.position.y = 0;
	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );
	
	const ambientLight = new THREE.AmbientLight(0xffffff, 3);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffddd0, 2);
	directionalLight.position.set(7	, 20, -30);
	directionalLight.castShadow = true;
	scene.add(directionalLight);

	return ({scene, camera, renderer, hit, controls});
}

export { initScene };