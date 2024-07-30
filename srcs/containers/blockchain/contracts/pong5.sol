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

    Match[] public matches;

    // Record multiple matches in a single transaction
    function recordMatches(Match[] memory _matches) public {
        for (uint256 i = 0; i < _matches.length; i++) {
            matches.push(Match({
                player1: _matches[i].player1,
                player2: _matches[i].player2,
                score1: _matches[i].score1,
                score2: _matches[i].score2,
                timestamp: block.timestamp
            }));
        }
    }

    // Get match details
    function getMatch(uint256 _matchId) public view returns (string memory player1, string memory player2, uint256 score1, uint256 score2, uint256 timestamp) {
        require(_matchId < matches.length, "Match does not exist.");
        Match storage m = matches[_matchId];
        return (m.player1, m.player2, m.score1, m.score2, m.timestamp);
    }

    // Get match count
    function getMatchCount() public view returns (uint256) {
        return matches.length;
    }
}
