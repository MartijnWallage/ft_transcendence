import Web3 from 'web3';
import TruffleContract from '@truffle/contract';
import { readFileSync } from 'fs';

// Connect to local Ganache
const web3 = new Web3('http://localhost:8545');

// Load compiled contract ABI and bytecode
const contractJSON = JSON.parse(readFileSync('build/contracts/PongTournament.json', 'utf8'));
const PongTournament = TruffleContract(contractJSON);
PongTournament.setProvider(web3.currentProvider);

// Deploy contract
(async () => {
  const accounts = await web3.eth.getAccounts();
  const instance = await PongTournament.new({ from: accounts[0] });
  console.log('Contract deployed at address:', instance.address);
})();
