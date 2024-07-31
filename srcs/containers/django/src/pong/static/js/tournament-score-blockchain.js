
const contractABI = [{"inputs":[{"internalType":"uint256","name":"_matchId","type":"uint256"}],"name":"getMatch","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMatchCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"matches","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct PongTournament.Match[]","name":"_matches","type":"tuple[]"}],"name":"recordMatches","outputs":[],"stateMutability":"nonpayable","type":"function"}];

async function registerMatches(tournament) {
    const alchemyUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    const web3 = new Web3(new Web3.providers.HttpProvider(alchemyUrl));
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

	console.log(`Tournament and tournament match result: ${tournament} ${tournament.matchResult}`);

    const matches = tournament.matchResult.map(match => ({
        player1: match.player1,
        player2: match.player2,
        score1: match.player1Score,
        score2: match.player2Score,
        timestamp: match.timestamp || Date.now() // Use existing timestamp or set to current time
    }));

	for (let index = 0; index < matches.length; index++) {
		console.log(`Match ${index} - Player1: ${matches[index].player1}, Player2: ${matches[index].player2}, Score1: ${matches[index].score1}, Score2: ${matches[index].score2}, Timestamp: ${matches[index].timestamp}`);
	}

    try {
        const gasEstimate = await contract.methods.recordMatches(matches).estimateGas({ from: account.address });
        const receipt = await contract.methods.recordMatches(matches).send({ 
            from: account.address,
            gas: gasEstimate 
        });

        console.log('Transaction receipt:', receipt);
        const transactionHash = receipt.transactionHash;
        alert('Matches registered successfully! Transaction Hash: ' + transactionHash);
    } catch (error) {
        console.error(error);
        alert('Error registering matches.');
    }
}

export { registerMatches };