const contractAddress = '0x47B6919de3AF7FFE9e23da1201fAFeb8557C4B32';
const contractABI = [{"inputs":[{"internalType":"uint256","name":"_matchId","type":"uint256"}],"name":"getMatch","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMatchCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"matches","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct PongTournament.Match[]","name":"_matches","type":"tuple[]"}],"name":"recordMatches","outputs":[],"stateMutability":"nonpayable","type":"function"}];

export async function registerMatches() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();

        const matches = [
            { player1: "Emma", player2: "Jean", score1: 3, score2: 0, timestamp: 0 },
            { player1: "Benoit", player2: "Jean", score1: 3, score2: 2, timestamp: 0 },
            { player1: "Emma", player2: "Benoit", score1: 2, score2: 3, timestamp: 0 }
        ];

        try {
            const receipt = await contract.methods.recordMatches(matches).send({ from: accounts[0] });
            console.log('Transaction receipt:', receipt);
            const transactionHash = receipt.transactionHash;
            alert('Matches registered successfully! Transaction Hash: ' + transactionHash);
            // Display the transaction hash or link to Etherscan
        } catch (error) {
            console.error(error);
            alert('Error registering matches.');
        }
    } else {
        alert('Please install MetaMask!');
    }
}
