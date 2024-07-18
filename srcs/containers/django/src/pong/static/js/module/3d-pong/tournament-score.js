function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function getCurrentDateISO() {
    const now = new Date();
    return now.toISOString();  // Format ISO 8601
}

function addParticipant(playerName, tournamentId) {
	console.log('Adding participant:', playerName);
	$.ajax({
		url: '/api/add_participant/',
		type: 'POST',

		data: JSON.stringify({
			'player_name': playerName,
			'tournament_id': tournamentId
		}),

		contentType: 'application/json; charset=utf-8',

		dataType: 'json',

		beforeSend: function(xhr) {
			xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
		},

		success: function(response) {
			console.log('Participant added:', response);
		},

		error: function(error) {
			console.log('Erroor:', error);
		}

	});
}

function createTournament(tournament_name) {
	console.log('Creating tournament...');
	const currentDate = getCurrentDateISO();
	console.log('Current Date:', currentDate);
    $.ajax({
        url: '/api/create_tournament/',
        type: 'POST',
        data: JSON.stringify({
			'name': tournament_name,
            'date': currentDate
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        // beforeSend: function(xhr) {
        //     xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        // },
        success: function(response) {
            console.log('Tournament created successfully:', response);
            // Optionally, you can now proceed with adding participants or performing other actions
        },
        error: function(error) {
            console.error('Error creating tournament:', error);
        }
    });
}



export {addParticipant, createTournament};