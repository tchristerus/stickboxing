const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MatchManager = require('./Managers/MatchManager');
const PlayerManager = require('./Managers/PlayerManager');

/**
 * StickBoxing server logic
 */
class Game {

    /**
     * Constructor
     * @param {Socket} io
     */
    constructor(io) {
        this.socket = io;
        this.players = new PlayerManager();
        this.matches = new MatchManager(this.socket);
        this.setupNetwork();
    }

    /**
     * Sets the http server in listen mode and setup all socket events
     */
    setupNetwork() {
        http.listen(3000, function() {
            console.log('listening on *:3000');
        });
        this.createNetworkEvents();
    }

    /**
     * Setup all the socket events
     */
    createNetworkEvents() {
        const players = this.players;
        const matches = this.matches;
        io.on('connection', function(socket) {
            console.log('a user connected');
            const player = players.addPlayer(socket);
            player.setRoom('menu');

            socket.on('disconnect', function() {
                console.log('User disconnected');
                matches.removeMatch(player);
                players.removePlayer(socket.id);
            });

            socket.on('searchingMatch', function() {
                console.log('Client ' + socket.id + ' is searching a match');
                player.setSearchingMatch(true);

                const checker = setInterval(function() {
                    if (matches.playerInMatch(player) || socket.disconnected) {
                        clearInterval(checker);
                    } else {
                        const enemy = players.getPlayerSearchingMatch(player);
                        if (enemy != null) {
                            matches.createMatch(player, enemy);
                            clearInterval(checker);
                        }
                    }
                }, 1000);
            });
        });
    }

}

const game = new Game(io);


