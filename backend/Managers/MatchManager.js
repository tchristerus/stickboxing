let Match = require('../Models/Match');

class MatchManager {

    constructor(io){
        this.matches = [];
        this.io = io;
    }

    createMatch(player1, player2){
        this.matches.push(new Match(player1, player2, this.io));
        console.log(this.matches.length + " matches");
    }

    removeMatch(player){
        for(let i = 0; i < this.matches.length; i++){
            let match = this.matches[i];
            if(match.getPlayer1() === player || match.getPlayer2() === player) {
                match.stop();
                this.matches.splice(i, 1);
                console.log("Match removed. " + this.matches.length + " matches left" + i);
            }
        }
    }

    playerInMatch(player){
        for(let i = 0; i < this.matches.length; i++){
            let match = this.matches[i];
            if(match.getPlayer1() === player || match.getPlayer2() === player)
                return (match != null);
        }
    }
}

module.exports = MatchManager;
