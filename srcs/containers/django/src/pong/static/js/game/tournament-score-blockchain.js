const contractAddress = '0x47B6919de3AF7FFE9e23da1201fAFeb8557C4B32';
const contractABI = [{"inputs":[{"internalType":"uint256","name":"_matchId","type":"uint256"}],"name":"getMatch","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMatchCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"matches","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct PongTournament.Match[]","name":"_matches","type":"tuple[]"}],"name":"recordMatches","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const alchemyUrl = 'https://eth-sepolia.g.alchemy.com/v2/2AsN4uOkIhtp_rjXEag8H4yQxnj21R3z';
const privateKey = '';

const matches = [
    { player1: "Emma", player2: "Jean", score1: 3, score2: 0, timestamp: Date.now() },
    { player1: "Benoit", player2: "Jean", score1: 3, score2: 2, timestamp: Date.now() },
    { player1: "Emma", player2: "Benoit", score1: 2, score2: 3, timestamp: Date.now() }
];

export async function registerMatches() {
    const web3 = new Web3(new Web3.providers.HttpProvider(alchemyUrl));
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
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
