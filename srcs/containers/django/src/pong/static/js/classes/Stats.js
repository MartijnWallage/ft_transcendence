class Stats {
    constructor(game) {
        this.game = game;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        // Format the date as YYYY-MM-DD HH:mm:ss
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
        return formattedDate;
    }
        
    async fetchUserTournaments(username) {
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
        
        async fetchUserMatches(username, mode) {
            try {
                const url = `/api/user_matches/`;
                
                // Make the GET request to the Django API
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify({ username, mode })
                });
        
                if (!response.ok) {
                    throw new Error(`Error fetching matches: ${response.statusText}`);
                }
        
                const data = await response.json();
                
                if (data.error) {
                    console.error(data.error);
                    alert(data.error);
                    return;
                }
        
                console.log("Fetched matches:", data.matches);
        
                return data.matches;
        
            } catch (error) {
                console.error('Fetch error:', error);
                return null;
            }
        }
        
        async fetchLoggedInUser() {
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
                return null;
            }
        }
        
        async showMatches(mode) {
            console.log("showMatches");
            console.log("mode: ", mode);
            const tableBody = document.getElementById('matchTableBody');
            const matchTitle = document.getElementById('matchTitle');
            const username = await fetchLoggedInUser();
            const matches = await fetchUserMatches(username, mode);
        
            // Clear existing rows
            tableBody.innerHTML = '';
        
            if (mode === 'UvU') {
                matchTitle.textContent = '1 vs 1 Matches';
            } else if (mode === 'solo') {
                matchTitle.textContent = 'Player vs AI Matches';
            }
        
            matches.slice().reverse().forEach((match, index) => {
                const formattedDate = formatTimestamp(match.timestamp);
                const row = document.createElement('tr');
                const matchresult = match.player1_score > match.player2_score ? "Win" : "Loss";
                const matchresultclass = matchresult === "Win" ? "bg-success" : "bg-danger";
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
        
        
        async showTournaments() {
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
        
            tournaments.slice().reverse().forEach((tournament, index) => {
                const formattedDate = formatTimestamp(tournament.date);
                const number_of_players = tournament.matches.length + 1;
                const tournament_result = determineTournamentResult(tournament, username);
                const tournament_result_class = tournament_result === "Win" ? "bg-success" : "bg-danger";
                const row = document.createElement('tr');
                row.setAttribute('data-bs-toggle', 'modal');
                row.setAttribute('data-bs-target', '#tournamentMatchDetailModal');
                row.setAttribute('data-tournament-id', tournament.id);
                row.addEventListener('click', () => {
                    console.log("LOG Tournament ID:", tournament.id);
                    showTournamentDetails(tournament.id, username);
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
        
        determineTournamentResult(tournament, loggedInUser) {
            const lastMatch = tournament.matches[tournament.matches.length - 1];
            if (lastMatch.player1 === loggedInUser || lastMatch.player2 === loggedInUser) {
                return lastMatch.player1_score > lastMatch.player2_score ? "Win" : "Loss";
            }
            return "Loss";
        }
        
        showTournamentDetails(tournamentId, loggedInUser) {
            console.log("showTournamentDetails called with ID:", tournamentId);
        
            // Find the specific tournament using its ID
            const tournament = window.tournamentsData.find(t => t.id === parseInt(tournamentId));
            
            if (!tournament) {
                console.error("Tournament not found");
                return;
            }
        
            const tournamentResult = determineTournamentResult(tournament, loggedInUser);
            const resultElement = document.getElementById('tournamentResult');
            const matchDetailsTableBody = document.getElementById('matchDetailsTableBody');
            const transactionInfoElement = document.getElementById('transaction-info');
        
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
        
            // Show transaction info
            if (tournament.transaction_hash) {
                const etherscanUrl = `https://sepolia.etherscan.io/tx/${tournament.transaction_hash}`;
                transactionInfoElement.innerHTML = 
                    `Transaction Hash: <a href="${etherscanUrl}" target="_blank">${tournament.transaction_hash}</a>`;
            } else {
                transactionInfoElement.innerHTML = 
                    'Nothing has been registered on the blockchain yet.';
            }
        
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
}