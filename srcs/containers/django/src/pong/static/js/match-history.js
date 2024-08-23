import { getCookie } from './userMgmt.js';

const matchData = {
	"1v1": [
		{ id: 1, date: "2023-08-12", opponent: "Player B", score: "3-2", result: "Win", resultClass: "bg-success" },
		{ id: 2, date: "2023-08-10", opponent: "Player C", score: "1-1", result: "Draw", resultClass: "bg-secondary" },
		{ id: 3, date: "2023-08-08", opponent: "Player D", score: "0-2", result: "Loss", resultClass: "bg-danger" }
	],
	"vsAI": [
		{ id: 1, date: "2023-08-15", opponent: "AI Bot", score: "4-0", result: "Win", resultClass: "bg-success" },
		{ id: 2, date: "2023-08-13", opponent: "AI Bot", score: "2-3", result: "Loss", resultClass: "bg-danger" }
	],
	"tournament": [
		{ id: 1, date: "2023-08-18", opponent: "Team Alpha", score: "2-1", result: "Win", resultClass: "bg-success", details: { events: ["Goal by Player 1 at 12'", "Goal by Player 2 at 55'", "Conceded goal at 78'"] }},
		{ id: 2, date: "2023-08-17", opponent: "Team Beta", score: "2-2", result: "Draw", resultClass: "bg-secondary", details: { events: ["Goal by Player 3 at 22'", "Goal by Player 4 at 64'", "Conceded goals at 44' and 89'"] }},
		{ id: 3, date: "2023-08-16", opponent: "Team Gamma", score: "1-3", result: "Loss", resultClass: "bg-danger", details: { events: ["Goal by Player 5 at 10'", "Conceded goals at 30', 45', and 70'"] }}
	]
};

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

// export function showMatchDetails(matchId, mode) {
// 	console.log("LOG: showMatchDetails");
// 	const match = matchData[mode].find(m => m.id === matchId);
// 	const modalOpponent = document.getElementById('modalOpponent');
// 	const modalDate = document.getElementById('modalDate');
// 	const modalScore = document.getElementById('modalScore');
// 	const modalEvents = document.getElementById('modalEvents');

// 	// Populate modal with match details
// 	modalOpponent.textContent = `Opponent: ${match.opponent}`;
// 	modalDate.textContent = `Date: ${match.date}`;
// 	modalScore.textContent = match.score;

// 	// Clear existing events
// 	modalEvents.innerHTML = '';

// 	// Add match events
// 	match.details.events.forEach(event => {
// 		const eventItem = document.createElement('li');
// 		eventItem.classList.add('list-group-item');
// 		eventItem.textContent = event;
// 		modalEvents.appendChild(eventItem);
// 	});
// }

async function fetchUserTournaments(username) {
    try {
        const url = '/api/user_tournaments/';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            return;
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
	// } else if (mode === 'tournament') {
	// 	matchTitle.textContent = 'Tournament Matches';
	// }

	// Populate the table with the selected mode's matches
	matches.slice().reverse().forEach((match, index) => {
		const formattedDate = formatTimestamp(match.timestamp);
		const row = document.createElement('tr');
        const matchresult = match.player1_score > match.player2_score ? "Win" : "Loss";
        const matchresultclass = matchresult === "Win" ? "bg-success" : "bg-danger";
		row.setAttribute('data-bs-toggle', 'modal');
		row.setAttribute('data-bs-target', '#matchDetailModal');
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

    // Clear existing rows
    tableBody.innerHTML = '';

    // Update the title
    tournamentTitle.textContent = 'Tournament Matches';

    // Populate the table with tournament data
    tournaments.slice().reverse().forEach((tournament, index) => {
        const formattedDate = tournament.date;
        tournament.matches.forEach((match, matchIndex) => {
            const row = document.createElement('tr');
            const matchresult = match.player1_score > match.player2_score ? "Win" : "Loss";
            const matchresultclass = matchresult === "Win" ? "bg-success" : "bg-danger";
            row.setAttribute('data-bs-toggle', 'modal');
            row.setAttribute('data-bs-target', '#tournamentMatchDetailModal');
            // row.addEventListener('click', () => {
            //     showMatchDetails(match.id, 'tournament');
            // });
            row.innerHTML = `
                <th scope="row">${index + 1}-${matchIndex + 1}</th>
                <td>${formattedDate}</td>
                <td>${match.player2}</td>
                <td>${match.player1_score}-${match.player2_score}</td>
                <td><span class="badge ${matchresultclass}">${matchresult}</span></td>
            `;
            tableBody.appendChild(row);
        });
    });
}

export { showMatches, formatTimestamp, showTournaments };