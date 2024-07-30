// Import Web3 library
import Web3 from 'web3';

// Connect to Ethereum node (e.g., MetaMask)
async function connectWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Connected to MetaMask.");
        } catch (error) {
            console.error("User denied account access.");
            alert("Account access is required to interact with the contract. Please try again and grant access.");
            return false;
        }
    } else {
        console.error("MetaMask is not installed. Please install it to use this script.");
        alert("MetaMask is not installed. Please install it to use this script.");
        return false;
    }
    return true;
}

// Contract ABI and address
const contractABI = [{"inputs":[{"internalType":"uint256","name":"_tournamentId","type":"uint256"},{"internalType":"string","name":"_playerName","type":"string"}],"name":"addPlayer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"createTournament","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tournamentId","type":"uint256"}],"name":"getAllPlayers","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tournamentId","type":"uint256"},{"internalType":"uint256","name":"_matchId","type":"uint256"}],"name":"getMatch","outputs":[{"internalType":"string","name":"player1","type":"string"},{"internalType":"string","name":"player2","type":"string"},{"internalType":"uint256","name":"score1","type":"uint256"},{"internalType":"uint256","name":"score2","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tournamentId","type":"uint256"}],"name":"getMatchCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tournamentId","type":"uint256"},{"internalType":"string","name":"_playerName","type":"string"}],"name":"getPlayer","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"victories","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tournamentId","type":"uint256"},{"internalType":"string","name":"_player1","type":"string"},{"internalType":"string","name":"_player2","type":"string"},{"internalType":"uint256","name":"_score1","type":"uint256"},{"internalType":"uint256","name":"_score2","type":"uint256"}],"name":"recordMatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tournamentCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tournaments","outputs":[{"internalType":"string","name":"name","type":"string"}],"stateMutability":"view","type":"function"}];
const contractAddress = "0xb175683F133eB23D2B6e3F6EAf4b97385a9C59ec";

// Create contract instance
let contract;

// Example function to create a tournament
async function createTournament(tournamentName) {
    const accounts = await Web3.eth.getAccounts();
    try {
        await contract.methods.createTournament(tournamentName).send({ from: accounts[0] });
        console.log("Tournament created successfully.");
    } catch (error) {
        console.error("Error creating tournament:", error);
    }
}

// Example function to add a player to a tournament
async function addPlayer(tournamentId, playerName) {
    const accounts = await Web3.eth.getAccounts();
    try {
        await contract.methods.addPlayer(tournamentId, playerName).send({ from: accounts[0] });
        console.log("Player added successfully.");
    } catch (error) {
        console.error("Error adding player:", error);
    }
}

// Example function to record a match
async function recordMatch(tournamentId, player1, player2, score1, score2) {
    const accounts = await Web3.eth.getAccounts();
    try {
        await contract.methods.recordMatch(tournamentId, player1, player2, score1, score2).send({ from: accounts[0] });
        console.log("Match recorded successfully.");
    } catch (error) {
        console.error("Error recording match:", error);
    }
}

// Example function to get player details
async function getPlayer(tournamentId, playerName) {
    try {
        const player = await contract.methods.getPlayer(tournamentId, playerName).call();
        console.log("Player details:", player);
    } catch (error) {
        console.error("Error getting player details:", error);
    }
}

// Example function to get all players in a tournament
async function getAllPlayers(tournamentId) {
    try {
        const players = await contract.methods.getAllPlayers(tournamentId).call();
        console.log("Players in tournament:", players);
    } catch (error) {
        console.error("Error getting players:", error);
    }
}

// Example function to get match details
async function getMatch(tournamentId, matchId) {
    try {
        const match = await contract.methods.getMatch(tournamentId, matchId).call();
        console.log("Match details:", match);
    } catch (error) {
        console.error("Error getting match details:", error);
    }
}

// Example function to get match count in a tournament
async function getMatchCount(tournamentId) {
    try {
        const count = await contract.methods.getMatchCount(tournamentId).call();
        console.log("Match count:", count);
    } catch (error) {
        console.error("Error getting match count:", error);
    }
}

// Initialize and run functions
async function init() {
    const connected = await connectWeb3();
    if (!connected) return;

    contract = new Web3.eth.Contract(contractABI, contractAddress);
    
    // Uncomment the functions below to call them
    // createTournament("My Tournament");
    // addPlayer(0, "Player1");
    // recordMatch(0, "Player1", "Player2", 3, 2);
    // getPlayer(0, "Player1");
    // getAllPlayers(0);
    // getMatch(0, 0);
    // getMatchCount(0);
}

init();
