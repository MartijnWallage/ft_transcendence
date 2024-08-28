import { getCookie } from '../utils.js';

class Stats {
    constructor(game) {
        this.game = game;
        this.statForUser = null;
        this.tournamentsData = [];
        this.tournamentId = null;
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
            console.log("Fetching user matches...username", username);
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
                    return null;
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
            console.log("mode: ", mode);
            const tableBody = document.getElementById('matchTableBody');
            const matchTitle = document.getElementById('matchTitle');
            const matches = await this.fetchUserMatches(this.statForUser, mode);
            // Clear existing rows
            tableBody.innerHTML = '';
            if (mode === 'UvU') {
                matchTitle.textContent = '1 vs 1 Matches';
            } else if (mode === 'solo') {
                matchTitle.textContent = 'Player vs AI Matches';
            }
            else if (mode === 'vsOnline') {
                matchTitle.textContent = 'Player vs Online users';
            }
            if (matches.length === 0) {
                // Show a message when there are no matches
                tableBody.innerHTML = '<tr><td colspan="5">No matches found.</td></tr>';
                return;
            }
            matches.slice().reverse().forEach((match, index) => {
                const formattedDate = this.formatTimestamp(match.timestamp);
                const row = document.createElement('tr');
                const score = match.player1_score + '-' + match.player2_score;
                // Determine the opponent
                const opponent = match.player1 === this.statForUser ? match.player2 : match.player1;
                // Determine if this.statForUser is player1 or player2 and then set the match result accordingly
                let matchresult, matchresultclass;
                if (match.player1 === this.statForUser) {
                    matchresult = match.player1_score > match.player2_score ? "Win" : "Loss";
                } else {
                    matchresult = match.player2_score > match.player1_score ? "Win" : "Loss";
                }
                // Set the CSS class based on the result
                matchresultclass = matchresult === "Win" ? "bg-success" : "bg-danger";
                row.innerHTML = `
                    <th scope="row">${index + 1}</th>
                    <td>${formattedDate}</td>
                    <td>${opponent}</td>
                    <td>${score}</td>
                    <td><span class="badge ${matchresultclass}">${matchresult}</span></td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        
        async showTournaments() {
            console.log("showTournaments");
            const tableBody = document.getElementById('tournamentTableBody');
            const tournamentTitle = document.getElementById('tournamentTitle');
            const username = this.statForUser;
            console.log("Username in stats: ", username);
            const tournaments = await this.fetchUserTournaments(username);
            console.log("LOG Tournaments:", tournaments);
            // Clear existing rows
            tableBody.innerHTML = '';
            // Store tournaments data in a variable
            this.tournamentsData = tournaments;
        
            // Update the title
            tournamentTitle.textContent = 'Tournament Matches';

            if (this.tournamentsData.length === 0) {
                // Show a message when there are no matches
                tableBody.innerHTML = '<tr><td colspan="5">No tournaments found.</td></tr>';
                return;
            }

            tournaments.slice().reverse().forEach((tournament, index) => {
                const formattedDate = this.formatTimestamp(tournament.date);
                const number_of_players = tournament.matches.length + 1;
                const tournament_result = this.determineTournamentResult(tournament, username);
                const tournament_result_class = tournament_result === "Win" ? "bg-success" : "bg-danger";
                const row = document.createElement('tr');
                row.addEventListener('click', () => {
                    console.log("LOG Tournament ID:", tournament.id);
                    this.tournamentId = tournament.id;
                    this.showTournamentDetails(tournament.id, username);
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
            const tournament = this.tournamentsData.find(t => t.id === parseInt(tournamentId));
            
            if (!tournament) {
                console.error("Tournament not found");
                return;
            }
        
            const tournamentResult = this.determineTournamentResult(tournament, loggedInUser);
            const resultElement = document.getElementById('tournamentResult');
            const matchDetailsTableBody = document.getElementById('matchDetailsTableBody');
            const transactionInfoElement = document.getElementById('transaction-info');
            const registerButton = document.getElementById('registerOnBlockchainBtn');
            
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
                
                // Show transaction info and update button state
                if (tournament.transaction_hash) {
                    const etherscanUrl = `https://sepolia.etherscan.io/tx/${tournament.transaction_hash}`;
                    transactionInfoElement.innerHTML = 
                        `Transaction Hash: <a href="${etherscanUrl}" target="_blank">${tournament.transaction_hash}</a>`;
                    
                    // Disable the "Register on Blockchain" button if a transaction hash exists
                    registerButton.classList.remove('btn-success');
                    registerButton.classList.add('btn-secondary');
                    registerButton.textContent = 'Registered';
                    registerButton.disabled = true;
                 } else {
                    // If no transaction hash, ensure the button is enabled for registration
                    transactionInfoElement.innerHTML = 'Nothing has been registered on the blockchain yet.';
                    
                    registerButton.classList.remove('btn-secondary');
                    registerButton.classList.add('btn-success');
                    registerButton.textContent = 'Register on Blockchain';
                    registerButton.disabled = false;
                }
        
            // Show the modal
            const modalElement = document.getElementById('tournamentDetailsModal');
            if (!modalElement) {
                console.error("Modal element not found.");
                return;
            }

            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        }
}

export { Stats };