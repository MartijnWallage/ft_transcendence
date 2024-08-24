import { getCookie } from './userMgmt.js';
import { Blockchain } from './classes/Blockchain.js';

function formatTimestamp(timestamp) {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp);
    
    // Get the year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Get the hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format the date as YYYY-MM-DD HH:mm:ss
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    return formattedDate;
}

async function fetchUserTournaments(username) {
    try {
        const url = '/api/user_tournaments/';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching tournaments: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
            console.error(data.error);
            alert(data.error);
            return null;
        }

        console.log("Fetched tournaments:", data.tournaments);
        return data.tournaments;

    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function fetchUserMatches(username, mode) {
    try {
        // Construct the URL for the request
        const url = `/api/user_matches/`;
        
        // Make the GET request to the Django API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ username, mode }) // Pass the username and mode in the body
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`Error fetching matches: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();
        
        // Check if there's an error in the response
        if (data.error) {
            console.error(data.error);
            alert(data.error); // Or handle the error as you prefer
            return;
        }

        // Log the fetched matches data to the console
        console.log("Fetched matches:", data.matches);

		return data.matches;

    } catch (error) {
        console.error('Fetch error:', error);
		return null; // Return null if there's an error
    }
}

async function fetchLoggedInUser() {
    try {
        const response = await fetch('/api/get_logged_in_user/');
        if (!response.ok) {
            throw new Error('Failed to fetch username');
        }
        const data = await response.json();
        const username = data.username;
        console.log("Logged in user:", username);
		return username;
    } catch (error) {
        console.error('Error fetching logged-in user:', error);
		return null; // Return null if there's an error
    }
}

async function showMatches(mode) {
	console.log("showMatches");
	console.log("mode: ", mode);
	const tableBody = document.getElementById('matchTableBody');
	const matchTitle = document.getElementById('matchTitle');
	const username = await fetchLoggedInUser();
	const matches = await fetchUserMatches(username, mode);
	// const matches = matchData[mode];

	// Clear existing rows
	tableBody.innerHTML = '';

	// Update the title
	if (mode === 'UvU') {
		matchTitle.textContent = '1 vs 1 Matches';
	} else if (mode === 'solo') {
		matchTitle.textContent = 'Player vs AI Matches';
    }

	// Populate the table with the selected mode's matches
	matches.slice().reverse().forEach((match, index) => {
		const formattedDate = formatTimestamp(match.timestamp);
		const row = document.createElement('tr');
        const matchresult = match.player1_score > match.player2_score ? "Win" : "Loss";
        const matchresultclass = matchresult === "Win" ? "bg-success" : "bg-danger";
		// row.setAttribute('data-bs-toggle', 'modal');
		// row.setAttribute('data-bs-target', '#matchDetailModal');
        // row.addEventListener('click', () => {
        //     showMatchDetails(match.id, mode);
        // });
		row.innerHTML = `
			<th scope="row">${index + 1}</th>
			<td>${formattedDate}</td>
			<td>${match.player2}</td>
			<td>${match.player1_score}-${match.player2_score}</td>
			<td><span class="badge ${matchresultclass}">${matchresult}</span></td>
		`;
		tableBody.appendChild(row);
	});
}


async function showTournaments() {
    console.log("showTournaments");
    const tableBody = document.getElementById('tournamentTableBody');
    const tournamentTitle = document.getElementById('tournamentTitle');
    const username = await fetchLoggedInUser();
    const tournaments = await fetchUserTournaments(username);
    console.log("LOG Tournaments:", tournaments);
    // Clear existing rows
    tableBody.innerHTML = '';

    // Store tournaments data in a variable
    window.tournamentsData = tournaments;

    // Update the title
    tournamentTitle.textContent = 'Tournament Matches';

    // Populate the table with tournament data
    tournaments.slice().reverse().forEach((tournament, index) => {
        const formattedDate = formatTimestamp(tournament.date);
        const number_of_players = tournament.matches.length + 1;
        const tournament_result = tournament.matches[0].player1_score > tournament.matches[0].player2_score ? "Win" : "Loss";
        const tournament_result_class = tournament_result === "Win" ? "bg-success" : "bg-danger";
        const row = document.createElement('tr');
        row.setAttribute('data-bs-toggle', 'modal');
        row.setAttribute('data-bs-target', '#tournamentMatchDetailModal');
        row.setAttribute('data-tournament-id', tournament.id);
        row.addEventListener('click', () => {
            console.log("LOG Tournament ID:", tournament.id);
            showTournamentDetails(tournament.id);
        });
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${formattedDate}</td>
            <td>${number_of_players}</td>
            <td><span class="badge ${tournament_result_class}">${tournament_result}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function showTournamentDetails(tournamentId) {
    console.log("showTournamentDetails called with ID:", tournamentId);

    // Find the specific tournament using its ID
    const tournament = window.tournamentsData.find(t => t.id === parseInt(tournamentId));
    
    if (!tournament) {
        console.error("Tournament not found");
        return;
    }

    const tournamentResult = tournament.matches.length > 0 && tournament.matches[0].player1_score > tournament.matches[0].player2_score ? "Win" : "Loss";
    const resultElement = document.getElementById('tournamentResult');
    const matchDetailsTableBody = document.getElementById('matchDetailsTableBody');

    resultElement.textContent = tournamentResult;
    
    // Clear previous match details
    matchDetailsTableBody.innerHTML = '';

    tournament.matches.forEach(match => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${match.player1}</td>
            <td>${match.player2}</td>
            <td>${match.player1_score} - ${match.player2_score}</td>
        `;
        matchDetailsTableBody.appendChild(row);
    });

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('tournamentDetailsModal'));
    modal.show();

    const registerButton = document.getElementById('registerOnBlockchainBtn');
    if (registerButton) {
        registerButton.addEventListener('click', () => {
            // this.audio.playSound(this.audio.select_1);
            new Blockchain(tournamentId);
        });
    }
}

export { showMatches, formatTimestamp, showTournaments, fetchLoggedInUser };