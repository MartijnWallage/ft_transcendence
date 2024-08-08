import { AI } from './AI.js';
import { Remote } from './Remote.js';


class Player {
	constructor(name, isRemote = false) {
		this.name = name;
		this.ai = null;
		this.isRemote = isRemote;
		// this.connection = null; // WebSocket connection for remote player
		
		if (isRemote) {
			this.connection = new Remote(this.name); // Pass the name to Remote
			this.connection.connectToServer(); // Connect to the server
		}
		
		this.stats = {
			wins: 0,
			losses: 0,
		};
	}

	setAI(game) {
		this.ai = new AI(game);
	}

	isAI() {
		return this.ai !== null;
	}
}

export { Player };
