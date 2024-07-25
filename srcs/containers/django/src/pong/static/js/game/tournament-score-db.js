function getCurrentDateISO() {
    const now = new Date();
    return now.toISOString();  // Format ISO 8601
}

async function addParticipant(playerName, tournamentId) {
	console.log('Adding participant:', playerName);
	$.ajax({
		url: '/api/add_participant/',
		type: 'POST',

		data: JSON.stringify({
			'tournament_id': tournamentId,
			'player_name': playerName
		}),

		contentType: 'application/json; charset=utf-8',

		dataType: 'json',

		success: function(response) {
			console.log('Participant added:', response);
		},

		error: function(error) {
			console.log('Error addParicipant:', error);
		}

	});
}

async function createTournament() {
    console.log('Creating tournament...');
    const currentDate = getCurrentDateISO();
    console.log('Current Date:', currentDate);

    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/create_tournament/',
            type: 'POST',
            data: JSON.stringify({
                'date': currentDate
            }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',

            success: function(response) {
                console.log('Tournament created successfully:', response);
                if (response && response.tournament_id) {
                    console.log('Tournament ID:', response.tournament_id);
                    resolve(response.tournament_id);
                } else {
                    console.log('Tournament ID not found in the response.');
                    resolve(null);
                }
            },
            error: function(error) {
                console.error('Error creating tournament:', error);
                reject(error);
            }
        });
    });
}

async function createMatch(tournamentId, player1, player2, player1_score, player2_score) {
	console.log('Creating Match...');
    $.ajax({
        url: '/api/create_match/',
        type: 'POST',
        data: JSON.stringify({
			'tournament_id': tournamentId,
			'player1' : player1,
			'player2' : player2,
			'player1_score' : player1_score,
			'player2_score' : player2_score
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',

        success: function(response) {
            console.log('Match created successfully:', response);
        },
        error: function(error) {
            console.error('Error creating match:', error);
        }
    });
}



export {addParticipant, createTournament, createMatch};