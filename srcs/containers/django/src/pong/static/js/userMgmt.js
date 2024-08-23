

// error container visibility
// login and signup button near 3 dots at the top (my suggestion)
// Logout and profile should be displayed if username is clicked. (I will finish profile this week)

let isUserLoggedIn = false;


function bindUserEventListeners(userContent, page) {
	
    if (page === 'dashboard') {
        console.log('Event is binded to call dashboard');
        updateSuggestedFriends();
        updateFriendList();
        updateFriendRequestList();
    }
    document.getElementById('js-logout-btn').addEventListener('click', handleLogout);
	if (userContent) {
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
    } else {
        console.error('Form ID not recognized');
        return;
    }

    handleFormSubmit(form, url);
}

// Handle browser/tab close
window.addEventListener('beforeunload', () => {
    if (isUserLoggedIn === true) {
        navigator.sendBeacon('/api/logout/', JSON.stringify({
            csrfmiddlewaretoken: getCookie('csrftoken')
        }));
    }
});


function handleLogout() {
    if (isUserLoggedIn === true) {
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
}

function updateSuggestedFriends() {
    fetch('/api/suggested-friends/')
        .then(response => response.json())
        .then(data => {
            const suggestedFriendsList = document.getElementById('suggested-friends-list');
            suggestedFriendsList.innerHTML = '';
            
            data.suggested_friends.forEach(user => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.textContent = user.username;

                const addButton = document.createElement('button');
                addButton.textContent = 'Add Friend';
                addButton.className = 'btn btn-success btn-sm';
                addButton.onclick = () => sendFriendRequest(user.username, listItem);

                listItem.appendChild(addButton);
                suggestedFriendsList.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error updating suggested friends:", error));
}

function sendFriendRequest(username, listItem) {
    fetch(`/api/add-friend/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ friend_username: username }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        listItem.remove();
        if (data.status === 'success') {
            showNotification("Friend request sent successfully");
        } else if (data.status === 'error') {
            showNotification(data.message);
        }else {
            showNotification("Error handling friend request");
        }
    })
    .catch(error => console.error("Error handling friend request:", error));
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
            data.friends.forEach(friend => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                const usernameSpan = document.createElement('span');
                usernameSpan.textContent = friend.username;
                listItem.appendChild(usernameSpan);

                const avatarImg = document.createElement('img');
                avatarImg.src = friend.avatar || 'static/images/guest.png'; 
                avatarImg.alt = `${friend.username}'s avatar`;
                avatarImg.className = 'avatar-img'; 
                listItem.appendChild(avatarImg);

                allFriendsList.appendChild(listItem);

                if (friend.online_status) {
                    const onlineItem = document.createElement('li');
                    onlineItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                    
                    const onlineUsernameSpan = document.createElement('span');
                    onlineUsernameSpan.textContent = friend.username;
                    onlineItem.appendChild(onlineUsernameSpan);

                    const avatarImg = document.createElement('img');
                    avatarImg.src = friend.avatar || 'static/images/guest.png'; 
                    avatarImg.alt = `${friend.username}'s avatar`;
                    avatarImg.className = 'avatar-img'; 
                    avatarImg.classList.add('online');
                    onlineItem.appendChild(avatarImg);
                    
                    const onlineStatusSpan = document.createElement('span');
                    onlineStatusSpan.textContent = 'Online';
                    onlineStatusSpan.className = 'online-status online'; 
                    onlineItem.appendChild(onlineStatusSpan);

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
            const friendRequestList = document.getElementById('friend-request-list');
            friendRequestList.innerHTML = '';

            data.requests.forEach(request => {
                const listItem = document.createElement('li');
                listItem.textContent = request.username;
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.classList.add('btn', 'btn-success', 'btn-sm');
                acceptButton.onclick = () => handleFriendRequest(request.username ,'accept');

                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.classList.add('btn', 'btn-danger', 'btn-sm');
                rejectButton.onclick = () => handleFriendRequest(request.username, 'reject');

                listItem.appendChild(acceptButton);
                listItem.appendChild(rejectButton);
                friendRequestList.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error updating friend request list:", error));
}

function handleFriendRequest(username, action) {
    fetch(`/api/handle-friend-request/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ action: action, friend_username: username }),
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
            return data.user_info;
        } catch (error) {
            console.error('Failed to fetch user info', error);
            return null;
        }
    }
}

function handleFormSubmit(form, url) {
    const formData = new FormData(form);

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

export { handleLogout, bindUserEventListeners, updateUI, getCookie }