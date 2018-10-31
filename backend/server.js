var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

class Animation {

    constructor(name, frames, fps){
        this.name = name;
        this.frames = frames;
        this.fps = fps;
    }

    getName(){
        return this.name;
    }

    getFrames(){
        return this.frames;
    }

    getFPS(){
        return this.fps();
    }

    getTotalTime(){
        return (1000/this.fps) * this.frames;
    }

    getSpecificFrameTime(frame){
        return (1000/this.fps) * frame;
    }
}

class AnimationTimer {

    /***
     * Will calculate the total animation time and give a callback when done
     * @param animation
     * @param callback
     */
    static animateWhole(animation, callback){
        setTimeout(callback, animation.getTotalTime());
    }


    static animateUntilFrame(animation, frame, callback){
        setTimeout(callback, animation.getSpecificFrameTime(frame));
    }
}

class Match {

    constructor(player1, player2, io){
        this.player1 = player1;
        this.player2 = player2;
        this.socket = io;
        this.player1.setPlayerSide('left');
        this.player2.setPlayerSide('right');
        this.round = 1;
        this.timeLeft = null;
        this.roomID = Math.random().toString(36).substring(7);
        console.log("Match created");
        this.setupPlayers();
        this.startGame();
        this.networkEvents();
    }

    setupPlayers(){
        this.player1.setSearchingMatch(false);
        this.player2.setSearchingMatch(false);
        this.player1.setRoom(this.roomID);
        this.player2.setRoom(this.roomID);
    }

    playIntro(){
        // start audio intro
    }

    startGame(){
        console.log('Sending startGame event');
        io.to(this.roomID).emit('startGame');
    }

    getPlayer1(){
        return this.player1;
    }

    getPlayer2(){
        return this.player2;
    }

    stop(){
        // gets called right before the match gets removed
    }

    networkEvents(){
        let player1 = this.player1;
        let player2 = this.player2;
        let socket = this.socket;
        let roomID = this.roomID;

        // punch events
        this.player1.getSocket().on('punch', function () {
            if(player1.getCanPunch()) {
                player1.getSocket().broadcast.emit('enemy_punch');
                player1.punch(player2, function () {
                    player1.getSocket().emit('hit_head');
                    player1.getSocket().to(roomID).emit('hitted_head');
                });
                console.log('broadcasting enemy_punch');
            }else{
                console.log('Cannot punch ' + player1.getCanPunch());
            }
        });

        this.player2.getSocket().on('punch', function () {
            if(player2.getCanPunch()) {
                player2.getSocket().broadcast.emit('enemy_punch');
                player2.punch(player1, function () {
                    player2.getSocket().emit('hit_head');
                    player2.getSocket().to(roomID).emit('hitted_head');
                });
                console.log('broadcasting enemy_punch');
            }
        });


        // kick events
        this.player1.getSocket().on('kick', function () {
            player1.getSocket().broadcast.emit('enemy_kick');
            console.log('broadcasting enemy_kick');
        });

        this.player2.getSocket().on('kick', function () {
            player2.getSocket().broadcast.emit('enemy_kick');
        });

        // move events
        this.player1.getSocket().on('l', function (data) {
            player1.setPosX(data);
            player1.getSocket().broadcast.volatile.emit('el', data);
        });

        this.player2.getSocket().on('l', function (data) {
            player2.setPosX(data);
            player2.getSocket().broadcast.volatile.emit('el', data);
        });
    }
}

class MatchManager {

    constructor(io){
        this.matches = [];
        this.socket = io;
    }

    createMatch(player1, player2){
        this.matches.push(new Match(player1, player2, this.socket));
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

class Player {

    constructor(socket) {
        this.socket = socket;
        this.playerSide = null; // left or right
        this.socket.searchingMatch = false;
        this.kickAnimation = new Animation('kick', 9, 15);
        this.resetGameStats();
    }

    resetGameStats(){
        // game stats, health etc.
        this.headDamage = 0; // 0-100
        this.legDamage = 0; // 0-100
        this.headBlocked = true;
        this.canPunch = true;
        this.x = 0;
    }

    setRoom(room){
        this.socket.join(room);
    }

    setPlayerSide(side){
        this.playerSide = side;
    }

    getSocketId(){
        return this.socket.id;
    }

    getSocket(){
        return this.socket;
    }

    getRoom(){
        return this.socket.getRoom();
    }

    isSearchingMatch(){
        return this.socket.searchingMatch;
    }

    setSearchingMatch(val){
        this.socket.searchingMatch = val;
    }

    getCanPunch(){
        return this.canPunch;
    }

    setCanPunch(val){
        this.canPunch = val;
    }

    getPosX(){
        return (this.playerSide === 'right') ? this.x + 110 : this.x; // 850 == ring width, so placing the enemy on the right side of the ring. 110 = enemy width / 2
    }

    setPosX(val){
        this.x = (this.playerSide === 'right') ? (850 - val) + 170 : val;
    }

    punch(enemy, punchHittedCallback){
        let player = this;
        this.setCanPunch(false);
        AnimationTimer.animateUntilFrame(this.kickAnimation,5, function () {
            player.setCanPunch(true);

            let posLeft = (player.playerSide === 'left') ? player.getPosX() : enemy.getPosX();
            let posRight = (enemy.playerSide === 'left') ? player.getPosX() : enemy.getPosX();

            console.log('pos1 ' + player.playerSide + ':' + posLeft + '  pos2 ' + enemy.playerSide + ':' + posRight);
            if(Math.abs(posRight - posLeft) < 150){
                console.log('in range for punch: ' + Math.abs(posRight - posLeft));
                punchHittedCallback();
            }else{
                console.log('To far away to punch the enemy: ' + Math.abs(posRight - posLeft) + 'px');
            }
        });
    }
}

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

let game = new Game(io);




