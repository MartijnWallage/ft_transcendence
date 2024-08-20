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

function showMatchDetails(matchId, mode) {
	console.log("LOG: showMatchDetails");
	const match = matchData[mode].find(m => m.id === matchId);
	const modalOpponent = document.getElementById('modalOpponent');
	const modalDate = document.getElementById('modalDate');
	const modalScore = document.getElementById('modalScore');
	const modalEvents = document.getElementById('modalEvents');

	// Populate modal with match details
	modalOpponent.textContent = `Opponent: ${match.opponent}`;
	modalDate.textContent = `Date: ${match.date}`;
	modalScore.textContent = match.score;

	// Clear existing events
	modalEvents.innerHTML = '';

	// Add match events
	match.details.events.forEach(event => {
		const eventItem = document.createElement('li');
		eventItem.classList.add('list-group-item');
		eventItem.textContent = event;
		modalEvents.appendChild(eventItem);
	});
}

function showMatches(mode) {
	console.log("showMatches");
	console.log("mode: ", mode);
	const tableBody = document.getElementById('matchTableBody');
	const matchTitle = document.getElementById('matchTitle');
	const matches = matchData[mode];

	// Clear existing rows
	tableBody.innerHTML = '';

	// Update the title
	if (mode === '1v1') {
		matchTitle.textContent = '1 vs 1 Matches';
	} else if (mode === 'vsAI') {
		matchTitle.textContent = 'Player vs AI Matches';
	} else if (mode === 'tournament') {
		matchTitle.textContent = 'Tournament Matches';
	}

	// Populate the table with the selected mode's matches
	matches.forEach(match => {
		const row = document.createElement('tr');
		row.setAttribute('data-bs-toggle', 'modal');
		row.setAttribute('data-bs-target', '#matchDetailModal');
        row.addEventListener('click', () => {
            showMatchDetails(match.id, mode);
        });
		row.innerHTML = `
			<th scope="row">${match.id}</th>
			<td>${match.date}</td>
			<td>${match.opponent}</td>
			<td>${match.score}</td>
			<td><span class="badge ${match.resultClass}">${match.result}</span></td>
		`;
		tableBody.appendChild(row);
	});
}

export { showMatches, showMatchDetails };