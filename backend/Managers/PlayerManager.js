const Player = require('../Models/Player');

/** Keeps track and manages all the players */
class PlayerManager {

    /**
     * Constructor
     */
    constructor() {
        this.players = [];
    }

    /**
     * Creates and adds a new player from a socket
     * @param {Socket} socket
     * @return {Player} Created player
     */
    addPlayer(socket) {
        const player = new Player(socket);
        this.players.push(player);
        return player;
    }

    /**
     * Removes a player by socketID
     * @param {SocketID} socketID
     */
    removePlayer(socketID) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].getSocketId() === socketID) {
                this.players.splice(i, 1);
                console.log(socketID + ' removed');
            }
        }
    }

    /**
     * Returns a player that is searching for a match
     * @param {Player} excludePlayer Don't return the player that is searching
     * @return {*}
     */
    getPlayerSearchingMatch(excludePlayer) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].isSearchingMatch() && this.players[i] != excludePlayer) {
                return this.players[i];
            }
        }
    }

}

module.exports = PlayerManager;
