// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongTournament {
    struct Player {
        string name;
        uint256 victories;
    }

    struct Match {
        string player1;
        string player2;
        uint256 score1;
        uint256 score2;
        uint256 timestamp;
    }

    struct Tournament {
        string name;
        mapping(string => Player) players; // Player name to Player struct
        string[] playerNames;
        Match[] matches;
    }

    mapping(uint256 => Tournament) public tournaments;
    uint256 public tournamentCount;

    // Create a new tournament
    function createTournament(string memory _name) public {
        Tournament storage t = tournaments[tournamentCount++];
        t.name = _name;
    }

    // Add a player to a tournament
    function addPlayer(uint256 _tournamentId, string memory _playerName) public {
        Tournament storage t = tournaments[_tournamentId];
        require(bytes(t.players[_playerName].name).length == 0, "Player already registered.");
        t.players[_playerName] = Player(_playerName, 0);
        t.playerNames.push(_playerName);
    }

    // Record a match in a tournament
    function recordMatch(uint256 _tournamentId, string memory _player1, string memory _player2, uint256 _score1, uint256 _score2) public {
        Tournament storage t = tournaments[_tournamentId];
        require(bytes(t.players[_player1].name).length != 0, "Player 1 not registered.");
        require(bytes(t.players[_player2].name).length != 0, "Player 2 not registered.");

        t.matches.push(Match({
            player1: _player1,
            player2: _player2,
            score1: _score1,
            score2: _score2,
            timestamp: block.timestamp
        }));
        
        if (_score1 > _score2) {
            t.players[_player1].victories++;
        } else if (_score2 > _score1) {
            t.players[_player2].victories++;
        }
    }

    // Get player details
    function getPlayer(uint256 _tournamentId, string memory _playerName) public view returns (string memory name, uint256 victories) {
        Tournament storage t = tournaments[_tournamentId];
        require(bytes(t.players[_playerName].name).length != 0, "Player not registered.");
        Player storage player = t.players[_playerName];
        return (player.name, player.victories);
    }

    // Get all players in a tournament
    function getAllPlayers(uint256 _tournamentId) public view returns (string[] memory) {
        Tournament storage t = tournaments[_tournamentId];
        return t.playerNames;
    }

    // Get match details
    function getMatch(uint256 _tournamentId, uint256 _matchId) public view returns (string memory player1, string memory player2, uint256 score1, uint256 score2, uint256 timestamp) {
        Tournament storage t = tournaments[_tournamentId];
        require(_matchId < t.matches.length, "Match does not exist.");
        Match storage m = t.matches[_matchId];
        return (m.player1, m.player2, m.score1, m.score2, m.timestamp);
    }

    // Get match count in a tournament
    function getMatchCount(uint256 _tournamentId) public view returns (uint256) {
        Tournament storage t = tournaments[_tournamentId];
        return t.matches.length;
    }
}
