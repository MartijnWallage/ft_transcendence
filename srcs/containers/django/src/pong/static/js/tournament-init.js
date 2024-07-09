

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
    // document.getElementById('announcement').innerText = `Next match: ${player1} vs ${player2}`;
    // document.getElementById('announcement').style.display = 'block';
    matchOrderInit();    
    nextGame();
    scoreBoardInit();
    console.log('Players length:', players.length);
}

function stopGame() {
    gameRunning = false;
}


function nextGame() {
    gameRunning = true;
    currentGameIndex += 1;
    console.log('Game index:', currentGameIndex);
    console.log('Match order length:', matchOrder.length);
    if (currentGameIndex > matchOrder.length) {
        endTournament();
        return ;
    }
    const player1 = players[matchOrder[currentGameIndex - 1][0]];
    const player2 = players[matchOrder[currentGameIndex - 1][1]];
    setTimeout(function() {
        console.log('Next match:', player1, 'vs', player2);
        alert(`Next match: ${player1} vs ${player2}`);
    }, 500);
    // document.getElementById('announcement').innerText = `Current match: ${player1} vs ${player2}`;
    setTimeout(() => startGame(player1, player2, 'tournament'), 1000);
}

function endTournament() {
    alert("Tournament Ended!");
    gameRunning = false;

    
    // Step 1: Combine the player names and their victories into an array of objects
    const scoreBoard = [];
    for (let i = 0; i < players.length; i++) {
        scoreBoard.push({ name: players[i], victories: scoreBoard[i] });
    }


    // const scoreBoard = players.map((name, index) => ({
    //     name: name,
    //     victories: scoreBoard[index]
    // }));
    
    // Step 2: Sort the array of objects based on the number of victories in descending order
    scoreBoard.sort((a, b) => b.victories - a.victories);
    
    // Step 3: Extract the sorted player names and their victories (optional, for display)
    const sortedPlayerNames = scoreBoard.map(player => player.name);
    const sortedVictories = scoreBoard.map(player => player.victories);
    
    console.log("scoreBoard:", scoreBoard);
    console.log("Sorted Player Names:", sortedPlayerNames);
    console.log("Sorted Victories:", sortedVictories);

    // alert("scoreBoard: " + scoreBoard.map(player => `Name: ${player.name}, Victories: ${player.victories}`).join(" | "));

    // alert("scoreBoard: " + JSON.stringify(scoreBoard, null, 2));

    // Display scoreBoard in the HTML as a table
    const scoreBoardDiv = document.getElementById('scoreBoard');
    scoreBoardDiv.innerHTML = "<h2>scoreBoard</h2>";
    const scoreBoardTable = document.createElement('table');
    scoreBoardTable.style.width = '100%';
    scoreBoardTable.style.borderCollapse = 'collapse';
    scoreBoardTable.style.color = 'yellow'; // Set the text color to yellow
    
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
    scoreBoardTable.appendChild(headerRow);
    
    // Create rows for each player
    scoreBoard.forEach(player => {
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
        scoreBoardTable.appendChild(row);
    });

    scoreBoardDiv.appendChild(scoreBoardTable);

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

export { displayPlayers, nextGame, endTournament };