let Player = require('../Models/Player');

class PlayerManager {

    constructor(){
        this.players = [];
    }

    addPlayer(socket){
        let player = new Player(socket);
        this.players.push(player);
        return player;
    }

    removePlayer(socketID){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].getSocketId() === socketID){
                this.players.splice(i, 1);
                console.log(socketID + " removed");
            }
        }
    }

    /***
     * Returns a player that is searching for a match
     * @param excludeSocketID Don't return the player that is searching
     * @returns {*}
     */
    getPlayerSearchingMatch(excludePlayer){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].isSearchingMatch() && this.players[i] != excludePlayer)
                return this.players[i];
        }
    }

    getPlayer(socketID){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].getSocketId() === socketID)
                return this.players[i];
        }
    }
}

module.exports = PlayerManager;
