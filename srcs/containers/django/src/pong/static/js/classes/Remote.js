class Remote {
    constructor(playerName) {
        this.name = playerName;
        this.connection = null;
        this.players = [];
        this.game = null;
        this.Tournament = null;
        this.currentPlayerName = null;

        // // Define a mapping for player roles
        // this.roleMapping = {
        //     'player1': 'Player 1',
        //     'player2': 'Player 2',
        //     // Add more roles if needed
        // };

        // this.nameMapping = {};


        // Ensure `startTournamentHandler` is defined here
        this.startTournamentHandler = this.startTournamentHandler.bind(this);
    }

    connectToServer() {
        const serverUrl = 'wss://10.15.109.3:8443/ws/pingpongsocket/';
        this.connection = new WebSocket(serverUrl);

        this.connection.onopen = () => {
            console.log('WebSocket is connected.');
        };

        this.connection.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(`Received message from server:`, event.data);
            this.handleServerMessage(message);
        };

        this.connection.onerror = (error) => {
            console.error(`${this.name} WebSocket error:`, error);
        };

        this.connection.onclose = () => {
            console.log(`${this.name} disconnected from server`);
        };
    }

    isConnectionOpen() {
        return this.connection && this.connection.readyState === WebSocket.OPEN;
    }

    handleServerMessage(data) {
        switch (data.type) {
            case 'player_connected':
                if (data.players && Array.isArray(data.players)) {
                    console.log('Player statuses received:', data.players);

                    this.players = data.players.map(player => ({
                        name: player.name,
                        displayName: player.name,
                        role: player.role,
                        isRemote: true,
                        connection: this.getRemoteConnection(player.name),
                        stats: {}
                    }));

                    console.log('this.players', this.players);
                    console.log('player => player.name', player => player.name);
                    //what players type
                    console.log('this.name', this.name);


                    // Assign the current player based on some unique criteria
                    const currentPlayer = this.players.find(player => player.name === this.name);
                    if (currentPlayer) {
                        this.setCurrentPlayerName(currentPlayer.name);
                    } else {
                        console.error(`Current player with name ${this.name} not found in the players list.`);
                    }

                    this.updatePlayerList(this.players);
                    this.setupTournamentButton();
                } else {
                    console.error('Received player_connected message but data.players is not an array:', data.players);
                }
                break;

            case 'player_disconnected':
                if (data.players && Array.isArray(data.players)) {
                    this.players = data.players;
                    this.updatePlayerList(this.players);
                } else {
                    console.error('Received player_disconnected message but data.players is not an array:', data.players);
                }
                break;

            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    }
    
    updatePlayerList(players) {
        const playerListDiv = document.getElementById('playerList');
        if (!playerListDiv) {
            console.error('Player list element not found.');
            return;
        }
        playerListDiv.innerHTML = ''; // Clear existing list

        players.forEach((player, index) => {
            const playerElement = document.createElement('p');
            const playerName = player.name || player.displayName;
            playerElement.textContent = `Player ${index + 1}: ${playerName}`;
            playerListDiv.appendChild(playerElement);
        });
        console.log('Updated player list:', players);
    }


    setCurrentPlayerName(name) {
        console.log('Setting current player name to:', name);
        this.currentPlayerName = name;
        this.setupTournamentButton(); // Ensure setupTournamentButton is called after setting current player name
    }

    setupTournamentButton() {
        // const startTournamentBtn = document.getElementById('js-start-tournament-btn').style.display = 'block';
        const startTournamentBtn = document.getElementById('js-start-tournament-btn');

        if (!startTournamentBtn) {
            console.error('Start Tournament button not found.');
            return;
        }
        
        console.log('Players:', this.players); // Debugging line
        console.log('Current player name:', this.currentPlayerName); // Log the current player name

        // Determine if the current player is player1
        const currentPlayer = this.players.find(player => player.name === this.currentPlayerName);

        if (!this.currentPlayerName) {
            console.error('Current player name is not set.');
            return;
        }

        console.log('Players data:', this.players);
        console.log('Current player:', currentPlayer);


        if (!currentPlayer) {
            console.error('Current player not found.');
            return;
        }
        

        
        // if (!currentPlayer) {
        //     console.error(`Current player not found in the list. Current player name: ${this.name}`);
        //     return;
        // }

        // const isPlayerOne = currentPlayer.role.role === 'player1';
        // console.log(`Current player's role: ${currentPlayer.role}`); // Debugging line

        // console.log('currentPlayer:', currentPlayer);
        // console.log('currentPlayer.role:', currentPlayer.role);
        // console.log('currentPlayer.role.role:', currentPlayer.role.role);

        if (currentPlayer.role === 'player1') {
            startTournamentBtn.style.display = 'block'; // Show the button for player1
            startTournamentBtn.removeEventListener('click', this.startTournamentHandler);
            startTournamentBtn.addEventListener('click', this.startTournamentHandler);
        } else {
            startTournamentBtn.style.display = 'none'; // Hide the button for others
        }
    }


    // Defined as a class method
    startTournamentHandler() {
        if (this.Tournament) {
            this.Tournament.start();
        } else {
            console.error('Tournament is not initialized.');
        }
    }

    getRemoteConnection(playerName) {
        // Retrieve or create a remote connection for the given player name
        return new Remote(playerName); // Placeholder logic for creating a Remote instance
    }

    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

export { Remote };
