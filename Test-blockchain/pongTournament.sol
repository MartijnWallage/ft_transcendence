// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongTournament {
    struct Match {
        string player1;
        string player2;
        uint256 score1;
        uint256 score2;
        uint256 timestamp;
    }

    struct Tournament {
        string name;
        Match[] matches;
        address organizer;
    }

    mapping(uint256 => Tournament) public tournaments;
    uint256 public tournamentCount;

    // Create a new tournament
    function createTournament(string memory _name) public {
        Tournament storage t = tournaments[tournamentCount++];
        t.name = _name;
        t.organizer = msg.sender;
    }

    // Record multiple matches in a tournament
    function recordMatches(uint256 _tournamentId, Match[] memory _matches) public {
        Tournament storage t = tournaments[_tournamentId];
        require(msg.sender == t.organizer, "Only the organizer can record matches.");

        for (uint256 i = 0; i < _matches.length; i++) {
            Match memory matchData = _matches[i];
            t.matches.push(Match({
                player1: matchData.player1,
                player2: matchData.player2,
                score1: matchData.score1,
                score2: matchData.score2,
                timestamp: block.timestamp
            }));
        }
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
