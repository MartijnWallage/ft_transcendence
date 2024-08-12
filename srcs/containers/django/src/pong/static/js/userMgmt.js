import { loadPageClosure } from './loadPage.js';
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
        credentials: 'include' // Important for sending cookies (including session cookies)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
			console.log('logout worked for user.');
			showNotification('You are successfully logged out');
            history.pushState(null, '', ''); // Redirect to home or appropriate page
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

function handleFormSubmit(form, url) {
    const formData = new FormData(form);

	console.log("handleformsubmit called")
    console.log('window.loadPage during logout:', window.loadPage);
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
		credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' || response.ok) {
			if (url.includes('login') || url.includes('register')) {
				showNotification('You are now successfully logged in');
				history.pushState(null, '', '');
				// window.UserInfo = data.user_info;
				window.loadPage('game_mode'); // Reload or update page content to reflect logged-out state

			}
        } else {
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) {
				errorContainer.style.display = 'block';
				setTimeout(() => {
					$(errorContainer).alert('close');
				}, 4000); // Hide after 4 seconds
                errorContainer.innerHTML = JSON.stringify(data);
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

export { handleFormSubmitWrapper, handleLogout }