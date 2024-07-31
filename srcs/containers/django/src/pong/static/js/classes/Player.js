import { AI } from './AI.js';

class Player {
	constructor(name) {
		this.name = name;
		this.ai = null;

		this.stats = {
			wins: 0,
			losses: 0,
		};
	}

	setAI() {
		this.ai = new AI();
	}
}

export { Player };