// error container visibility
// login and signup button near 3 dots at the top (my suggestion)
// Logout and profile should be displayed if username is clicked. (I will finish profile this week)

let isUserLoggedIn = false;


function bindUserEventListeners(userContent, page) {
	
    // const user_status = document.getElementById('user-name');
	// if (isUserLoggedIn) {
    //     console.log('Event is binded to call dashboard');
	// 	document.getElementById('user-name').addEventListener('click', () => window.loadPage('dashboard'));
	// }

    if (page === 'dashboard') {
        console.log('Event is binded to call dashboard');
        updateSuggestedFriends();
        updateFriendList();
        updateFriendRequestList();
    }
    document.getElementById('js-logout-btn').addEventListener('click', handleLogout);
	if (userContent) {
        // userContent.removeEventListener('submit', handleFormSubmitWrapper);
        userContent.addEventListener('submit', handleFormSubmitWrapper);
    }

}

function handleFormSubmitWrapper(event) {
    event.preventDefault();
    const form = event.target;

    let url;
    if (form.id === 'login-form') {
        console.log("User content login-form handling");
        url = '/api/login/';
    } else if (form.id === 'register-form') {
        console.log("User content register-form handling");
        url = '/api/register/';
    } else if (form.id === 'update-profile-form') {
        console.log("User content register-form handling");
        url = '/api/update-profile/';
    } else if (form.id === 'update-password-form') {
        console.log("User content Password Change handling");
        url = '/api/update-password/';
    } else if (form.id === 'add-friend-form') {
        console.log("User content adding friend");
        url = '/api/add-friend/';
    } else if (form.id === 'friend-request-form') {
        console.log("User content friend request handling");
        url = '/api/handle-friend-request/';
    } else {
        console.error('Form ID not recognized');
        return;
    }

    handleFormSubmit(form, url);
}

function handleLogout() {
    console.log('window.loadPage during logout:', window.loadPage);
    fetch('/api/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
			console.log('logout worked for user.');
			showNotification('You are successfully logged out');
            history.pushState(null, '', '');
            isUserLoggedIn = false;
			window.loadPage('game_mode');
        } else {
            console.error('Logout failed:', data);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}

function updateSuggestedFriends() {
    fetch('/api/suggested-friends/')
        .then(response => response.json())
        .then(data => {
            const suggestedFriendsList = document.getElementById('suggested-friends-list');
            suggestedFriendsList.innerHTML = '';
            
            data.suggested_friends.forEach(user => {
                console.log('suggested friends list', user);
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                // listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                listItem.textContent = user.username;
                // const usernameElement = document.createElement('span');
                // usernameElement.textContent = user.username;
                console.log('this is username', user.username);

                // Add button to send friend request
                const addButton = document.createElement('button');
                addButton.textContent = 'Add Friend';
                addButton.className = 'btn btn-success btn-sm';
                addButton.onclick = () => sendFriendRequest(user.username);

                listItem.appendChild(addButton);
                suggestedFriendsList.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error updating suggested friends:", error));
}

function updateFriendList() {
    fetch('/api/list-friends/')
        .then(response => response.json())
        .then(data => {
            const allFriendsList = document.getElementById('all-friends-list');
            const onlineFriendsList = document.getElementById('online-friends-list');

            allFriendsList.innerHTML = '';
            onlineFriendsList.innerHTML = '';
            console.log('this is data-> ', data);
            data.all_friends.forEach(friend => {
                console.log('looging through friends list', friend);
                const listItem = document.createElement('li');
                console.log('friend: ', friend.username);
                listItem.textContent = friend.username;
                allFriendsList.appendChild(listItem);

                if (friend.online_status) {
                    const onlineItem = document.createElement('li');
                    onlineItem.textContent = friend.username;
                    onlineFriendsList.appendChild(onlineItem);
                }
            });
        })
        .catch(error => console.error("Error updating friend list:", error));
}


function updateFriendRequestList() {
    fetch('/api/friend-requests/')
        .then(response => response.json())
        .then(data => {
            console.log('this is data-> ', data);
            const friendRequestList = document.getElementById('friend-request-list');
            friendRequestList.innerHTML = '';

            data.requests.forEach(request => {
                console.log('looging through friend request list', request);
                const listItem = document.createElement('li');
                listItem.textContent = request.username;
                // You can add buttons for accepting/rejecting friend requests
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.classList.add('btn', 'btn-success', 'btn-sm');
                acceptButton.onclick = () => handleFriendRequest(request.id, 'accept');

                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.classList.add('btn', 'btn-danger', 'btn-sm');
                rejectButton.onclick = () => handleFriendRequest(request.id, 'reject');

                listItem.appendChild(acceptButton);
                listItem.appendChild(rejectButton);
                friendRequestList.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error updating friend request list:", error));
}

function handleFriendRequest(requestID, action) {
    console.log('handleFriendRequest:', requestID, action);
    // requestID = 0;
    fetch(`/api/handle-friend-request/${requestID}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ action: action }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateFriendRequestList();
            updateFriendList();
        } else {
            showNotification("Error handling friend request");
        }
    })
    .catch(error => console.error("Error handling friend request:", error));
}


function showNotification(message) {
    const notificationElement = document.getElementById('notification');
	if (notificationElement && message) {
		notificationElement.innerText = message;
		notificationElement.style.display = 'block';
		setTimeout(() => {
			$(notificationElement).alert('close');
		}, 2000); // Hide after 2 seconds
	}
}

async function updateUI(game) {
    const userInfo = await fetchUserInfo();
    const userInfoElement = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (userInfo && userInfo.username) {
        userInfoElement.innerText = `Welcome, ${userInfo.username}`;
        game.loggedUser = userInfo.username;
        if (userInfo.avatar_url) {
            userAvatar.src = userInfo.avatar_url;
        }
    } else if (!isUserLoggedIn) {
        game.loggedUser = 'Guest';
        userInfoElement.innerText = 'Guest';
        userAvatar.src = 'static/images/guest.png';
    }
}



async function fetchUserInfo() {
    if (isUserLoggedIn) {
        try {
            const response = await fetch('/api/userinfo/');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.user_info; // Return user_info object directly
        } catch (error) {
            console.error('Failed to fetch user info', error);
            return null; // Return null if there's an error
        }
    }
}

function handleFormSubmit(form, url) {
    const formData = new FormData(form);

	console.log("handleformsubmit called")
    fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
		credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification('Form Action Success');
            history.pushState(null, '', '');

            if (form.id === 'login-form' || form.id === 'register-form') {
                isUserLoggedIn = true;
                window.loadPage('game_mode');
            } else if (form.id === 'update-profile-form' || form.id === 'update-password-form') {
                window.loadPage('dashboard');
            } else if (form.id === 'add-friend-form') {
                console.log('update friend list call from add friend form');
                updateFriendList();
            } else if (form.id === 'friend-request-form') {
                updateFriendRequestList();
            }

        } else {
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) {
                errorContainer.style.display = 'block';
                errorContainer.innerHTML = '';

                if (data.errors && data.errors.__all__) {
                    data.errors.__all__.forEach(error => {
                        const errorMessage = document.createElement('div');
                        errorMessage.textContent = error;
                        errorMessage.classList.add('alert', 'alert-danger');
                        errorContainer.appendChild(errorMessage);
                    });
                } else {
                    errorContainer.innerHTML = 'An unknown error occurred. Please try again.';
                }
                
                showNotification("Invalid User or Password");
            }
        }
    })
    .catch(error => {
		console.error("Fetch error:", error);
	 });
}

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

export { handleLogout, bindUserEventListeners, updateUI }