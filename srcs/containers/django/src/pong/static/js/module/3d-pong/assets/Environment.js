import * as THREE from '../utils/three.module.js';

class Environment {
	constructor(scene){
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

		// LIGHTS
		const ambientLight = new THREE.AmbientLight(0xffffff, 3);
		scene.add(ambientLight);
	
		const directionalLight = new THREE.DirectionalLight(0xffddd0, 2);
		directionalLight.position.set(7	, 20, -30);
		directionalLight.castShadow = true;
		scene.add(directionalLight);
	}
}

export { Environment };