import { AI } from './AI.js';
import { Remote } from './Remote.js';

class Player {
	constructor(name, isRemote = false) {
		this.name = name;
		this.ai = null;
		this.isRemote = isRemote;
		this.connection = isRemote ? new Remote(name) : null;
		
		if (this.connection) {
            this.connection.connectToServer();
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


// import { AI } from './AI.js';
// import { Remote } from './Remote.js';

// class Player {
//     constructor(name, isRemote = false, tournament = null) {
//         this.name = name;
//         this.ai = null;
//         this.isRemote = isRemote;
//         this.connection = isRemote ? new Remote(name) : null;
//         this.tournament = tournament; // Initialize the tournament variable
        
//         if (this.connection) {
//             this.connection.connectToServer();
//         }
        
//         this.stats = {
//             wins: 0,
//             losses: 0,
//         };
//     }

//     setAI(game) {
//         this.ai = new AI(game);
//     }

//     isAI() {
//         return this.ai !== null;
//     }
// }

// export { Player };
