let players = [];
let matchOrder = [];
let currentGameIndex = 0;

function addPlayer() {
    const playerName = document.getElementById('playerNameInput').value.trim();

    if (playerName === '') {
        alert('Please enter a valid name.');
        return;
    }
    players.push(playerName);
    displayPlayers();
    document.getElementById('playerNameInput').value = '';
}

function displayPlayers() {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = ''; // Clear existing list

    players.forEach(player => {
        let index = players.indexOf(player) + 1;
        let name = player;
        const playerElement = document.createElement('p');
        playerElement.textContent = `Player ${index}: ${name}`;
        playerListDiv.appendChild(playerElement);
    });
}

function startTournament() {
    if (players.length < 2) {
        alert('Please add at least 2 players to start the tournament.');
        return;
    }
	initializeTournament();
}

function matchOrderInit() {
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            matchOrder.push([i, j]);
        }
    }
    console.log('Match order:', matchOrder);
}

let scoreBoard = [];

function scoreBoardInit() {
    for (let i = 0; i < players.length; i++) {
        scoreBoard.push(0);
    }
}

function initializeTournament() {
    console.log('Players:', players); 
    document.getElementById('nameInputsTournament').style.display = 'none';
    document.getElementById('announcement').innerText = `Next match: ${player1} vs ${player2}`;
    document.getElementById('announcement').style.display = 'block';
    matchOrderInit();    
    nextGame();
    scoreBoardInit();
    console.log('Players length:', players.length);
}

function stopGame() {
    gameRunning = false;
}


function nextGame() {
    currentGameIndex += 1;
    console.log('Game index:', currentGameIndex);
    console.log('Match order length:', matchOrder.length);
    if (currentGameIndex > matchOrder.length) {
        endTournament();
        return ;
    }
    const player1 = players[matchOrder[currentGameIndex - 1][0]];
    const player2 = players[matchOrder[currentGameIndex - 1][1]];
    console.log('Next match:', player1, 'vs', player2);
    
    document.getElementById('announcement').innerText = `Next match: ${player1} vs ${player2}`;
    setTimeout(() => startGame(player1, player2, 'tournament'), 1000);
}

function endTournament() {
    alert("Tournament Ended!");

    
    // Step 1: Combine the player names and their victories into an array of objects
    const leaderboard = [];
    for (let i = 0; i < players.length; i++) {
        leaderboard.push({ name: players[i], victories: scoreBoard[i] });
    }


    // const leaderboard = players.map((name, index) => ({
    //     name: name,
    //     victories: scoreBoard[index]
    // }));
    
    // Step 2: Sort the array of objects based on the number of victories in descending order
    leaderboard.sort((a, b) => b.victories - a.victories);
    
    // Step 3: Extract the sorted player names and their victories (optional, for display)
    const sortedPlayerNames = leaderboard.map(player => player.name);
    const sortedVictories = leaderboard.map(player => player.victories);
    
    console.log("Leaderboard:", leaderboard);
    console.log("Sorted Player Names:", sortedPlayerNames);
    console.log("Sorted Victories:", sortedVictories);

    // alert("Leaderboard: " + leaderboard.map(player => `Name: ${player.name}, Victories: ${player.victories}`).join(" | "));

    // alert("Leaderboard: " + JSON.stringify(leaderboard, null, 2));

    // Display leaderboard in the HTML as a table
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = "<h2>Leaderboard</h2>";
    const leaderboardTable = document.createElement('table');
    leaderboardTable.style.width = '100%';
    leaderboardTable.style.borderCollapse = 'collapse';
    leaderboardTable.style.color = 'yellow'; // Set the text color to yellow
    
    // Create the header row
    const headerRow = document.createElement('tr');
    const playerHeader = document.createElement('th');
    playerHeader.textContent = 'Player';
    playerHeader.style.border = '3px solid yellow';
    playerHeader.style.padding = '8px';
    const victoriesHeader = document.createElement('th');
    victoriesHeader.textContent = 'Victories';
    victoriesHeader.style.border = '3px solid yellow';
    victoriesHeader.style.padding = '8px';
    headerRow.appendChild(playerHeader);
    headerRow.appendChild(victoriesHeader);
    leaderboardTable.appendChild(headerRow);
    
    // Create rows for each player
    leaderboard.forEach(player => {
        const row = document.createElement('tr');
        const playerCell = document.createElement('td');
        playerCell.textContent = player.name;
        playerCell.style.border = '1px solid yellow';
        playerCell.style.padding = '8px';
        const victoriesCell = document.createElement('td');
        victoriesCell.textContent = player.victories;
        victoriesCell.style.border = '1px solid yellow';
        victoriesCell.style.padding = '8px';
        row.appendChild(playerCell);
        row.appendChild(victoriesCell);
        leaderboardTable.appendChild(row);
    });

    leaderboardDiv.appendChild(leaderboardTable);

    players = [];
    matchOrder = [];
    scoreBoard = [];

    document.getElementById('startTournamentBtn').style.display = 'none';
    document.getElementById('playerNameInput').value = '';
    // document.getElementById('announcement').innerText = 'Tournament has ended. Please add players for a new tournament.';
    setTimeout(() => document.getElementById('announcement').innerText = 'Tournament has ended. Please add players for a new tournament.', 4000);
    document.getElementById('announcement').style.display = 'none';

    stopGame();
    // endGame();
}
