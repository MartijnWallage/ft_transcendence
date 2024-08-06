import { AI } from './AI.js';
import { Remote } from './Remote.js';

class Player {
	constructor(name) {
		this.name = name;
		this.ai = null;
		this.remote = null;
		this.isRemote = false; // Flag to indicate if the player is remote

		this.stats = {
			wins: 0,
			losses: 0,
		};
	}

	setAI() {
		this.ai = new AI();
	}

	setRemote(websocket) {
		this.remote = new Remote(websocket);
		this.isRemote = true;
	}
}

export { Player };