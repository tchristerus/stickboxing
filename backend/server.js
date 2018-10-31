var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MatchManager = require('./Managers/MatchManager');
var PlayerManager = require('./Managers/PlayerManager');


class Game {

    constructor(io) {
        this.socket = io;
        this.players = new PlayerManager();
        this.matches = new MatchManager(this.socket);
        this.setupNetwork();
    }

    setupNetwork(){
        http.listen(3000, function(){
            console.log('listening on *:3000');
        });
        this.createNetworkEvents();
    }

    createNetworkEvents(){
        let players = this.players;
        let matches = this.matches;
        io.on('connection', function(socket){
            console.log('a user connected');
            let player = players.addPlayer(socket);
            player.setRoom('menu');

            socket.on('disconnect', function(){
                console.log("User disconnected");
                matches.removeMatch(player);
                players.removePlayer(socket.id);
            });

            socket.on('searchingMatch', function () {
                console.log("Client " + socket.id + " is searching a match");
                player.setSearchingMatch(true);

                let checker = setInterval(function(){
                    if(matches.playerInMatch(player) || socket.disconnected)
                        clearInterval(checker);
                    else {
                        let enemy = players.getPlayerSearchingMatch(player);
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



let game = new Game(io);




