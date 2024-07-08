const container = document.getElementById('threejs-container');

// Scene, Camera, Renderer with Antialiasing
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xc1d1db); // Set background color
container.appendChild(renderer.domElement);

// Cube 1
const geometry = new THREE.BoxGeometry(16, 0.5, 12);
const material = new THREE.MeshBasicMaterial({ color: 0x0a1826 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Cube 2
const geometry2 = new THREE.BoxGeometry(0.3, 0.6, 11.8);
const material2 = new THREE.MeshBasicMaterial({ color: 0xc1d1db });
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

camera.position.z = 10;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.001;
  cube.rotation.y += 0.001;
  cube2.rotation.x += 0.001;
  cube2.rotation.y += 0.001;
  renderer.render(scene, camera);
}

animate();

// // Sky
// const sky = new Sky();
// sky.scale.setScalar(450000);
// scene.add(sky);

// const phi = MathUtils.degToRad(90);
// const theta = MathUtils.degToRad(180);
// const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
// sky.material.uniforms.sunPosition.value.copy(sunPosition);

