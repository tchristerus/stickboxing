const Match = require('../Models/Match');

/** Class to manage all the matches*/
class MatchManager {

    /**
     * Constructor
     * @param {socket} io
     */
    constructor(io) {
        this.matches = [];
        this.io = io;
    }

    /**
     * Create a new match
     * @param {Player} player1
     * @param {Player} player2
     */
    createMatch(player1, player2) {
        this.matches.push(new Match(player1, player2, this.io));
        console.log(this.matches.length + ' matches');
    }

    /**
     * Remove the match this player is in
     * @param {Player} player
     */
    removeMatch(player) {
        for (let i = 0; i < this.matches.length; i++) {
            const match = this.matches[i];
            if (match.getPlayer1() === player || match.getPlayer2() === player) {
                this.matches.splice(i, 1);
                console.log('Match removed. ' + this.matches.length + ' matches left' + i);
            }
        }
    }

    /**
     * Get the match this player is in
     * @param {Player} player
     * @return {boolean}
     */
    playerInMatch(player) {
        for (let i = 0; i < this.matches.length; i++) {
            const match = this.matches[i];
            if (match.getPlayer1() === player || match.getPlayer2() === player) {
                return (match != null);
            }
        }
    }

}

module.exports = MatchManager;
