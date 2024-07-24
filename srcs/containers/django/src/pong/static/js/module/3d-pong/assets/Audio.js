import * as THREE from '../utils/three.module.js';

class Audio {
	constructor(camera) {
	// Add audio listener to the camera
	const listener = new THREE.AudioListener();
	camera.cam.add(listener);

	// Create a global audio source
	const hit = new THREE.Audio(listener);
	this.hit = hit;

	// Load a sound and set it as the Audio object's buffer
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load('./static/audio/hit.wav', function(buffer) {
		hit.setBuffer(buffer);
		hit.setLoop(false);
		hit.setVolume(1.0);
		});
	}

	playSound(sound) {
		if (sound.isPlaying) {
			sound.stop();
		}
		sound.play();
	}
}

export { Audio };