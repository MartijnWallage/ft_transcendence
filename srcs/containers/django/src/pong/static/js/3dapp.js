const container = document.getElementById('threejs-container');

// Scene, Camera, Renderer with Antialiasing
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xc1d1db); // Set background color
container.appendChild(renderer.domElement);

// field
const field_geometry = new THREE.BoxGeometry(16, 0.5, 12);
const field_material = new THREE.MeshBasicMaterial({ color: 0x0a1826 });
const field = new THREE.Mesh(filed_geometry, filed_material);
scene.add(field);

// Nett
const nett_geometry = new THREE.BoxGeometry(0.3, 0.6, 11.8);
const nett_material = new THREE.MeshBasicMaterial({ color: 0xc1d1db });
const nett_cube = new THREE.Mesh(nett_geometry, nett_material);
scene.add(nett);

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

