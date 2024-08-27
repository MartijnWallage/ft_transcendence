import { getCookie } from "../utils.js";

class Blockchain {

	constructor(tournamentId){
		this.tournamentId = tournamentId;
		this.registerMatches();
	}

	async registerMatches() {
		console.log('Tournament ID:', this.tournamentId);
	
		const registerButton = document.getElementById('registerOnBlockchainBtn');
    
		// Immediately disable the button and change its appearance to indicate processing
		registerButton.classList.remove('btn-success');
		registerButton.classList.add('btn-secondary');
		registerButton.textContent = 'Registering...';
		registerButton.disabled = true;

		try {
			// Send tournament ID to the server
			const response = await fetch('/api/register_matches/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken')
				},
				body: JSON.stringify({ tournament_id: this.tournamentId })
			});
	
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
	
			const result = await response.json();
			console.log('Server response:', result);
	
			if (result.success) {
				const transactionInfoElement = document.getElementById('transaction-info');
				const txHash = result.tx_hash;
				const etherscanUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
				alert(`Matches registered successfully! Transaction Hash: ${txHash}`);

				transactionInfoElement.innerHTML = 
					`Transaction Hash: <a href="${etherscanUrl}" target="_blank">${txHash}</a>`;

				// Update the button to show it's registered and keep it disabled
				registerButton.textContent = 'Registered';
			} else {
				// Handle specific errors returned by the backend
				if (result.error === 'Insufficient funds')
					alert('Error: Insufficient funds to cover the gas fees. Please add more ETH and try again.');
				else {
					alert('Please try again later. ' + result.error);
				}

				// Re-enable the button if the registration failed
				registerButton.classList.remove('btn-secondary');
				registerButton.classList.add('btn-success');
				registerButton.textContent = 'Register on Blockchain';
				registerButton.disabled = false;
			}
		} catch (error) {
			console.error(error);
			if (error.message === 'Transaction timed out') {
				console.log('Transaction timed out');
				alert('The Sepolia network may be overloaded. Please try again.');
			} else {
				console.log('Unexpected error:', error.message);
				alert('The gas fees are too high. Please try again later.');
			}
			registerButton.classList.remove('btn-secondary');
			registerButton.classList.add('btn-success');
			registerButton.textContent = 'Register on Blockchain';
			registerButton.disabled = false;
		}
	}
}

export { Blockchain };