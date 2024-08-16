// error container visibility
// login and signup button near 3 dots at the top (my suggestion)
// Logout and profile should be displayed if username is clicked. (I will finish profile this week)

let isUserLoggedIn = false;


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
    console.log('window.loadPage during logout:', window.loadPage);
    fetch(url, {
        method: 'POST',
        // body: JSON.stringify(Object.fromEntries(formData)),
        body: formData,
        headers: {
            // 'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
		credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
			if (url.includes('login') || url.includes('register')) {
				showNotification('You are now successfully logged in');
				history.pushState(null, '', '');
                isUserLoggedIn = true;
				window.loadPage('game_mode'); // Reload or update page content to reflect logged-out state

			}
        } else {
            // alert('Username or Password Incorrect.');
            const errorContainer = document.getElementById('error-container');
            // if (errorContainer) {
			// 	errorContainer.style.display = 'block';
            //     errorContainer.innerHTML = 'Usrname or Password Invalid';
            //     showNotification("Invalid User or Password");
            //     // errorContainer.innerHTML = JSON.stringify(data.errors);
			// 	// setTimeout(() => {
			// 	// 	$(errorContainer).alert = 'close';
			// 	// }, 4000); // Hide after 4 seconds
            //     // this is bootstrap js which I have included in base.html to show alert only for 4 seconds
            // }
            if (errorContainer) {
                // Clear previous messages
                errorContainer.style.display = 'block';
                errorContainer.innerHTML = ''; // Clear any previous messages

                // Extract and display error messages
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

export { handleFormSubmitWrapper, handleLogout, fetchUserInfo }