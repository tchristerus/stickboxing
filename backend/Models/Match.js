class Match {

    constructor(player1, player2, io){
        this.player1 = player1;
        this.player2 = player2;
        this.player1.setPosX(350);
        this.player2.setPosX(630);
        this.io = io;
        this.player1.setPlayerSide('left');
        this.player2.setPlayerSide('right');
        this.round = 1;
        this.timeLeft = null;
        this.roomID = Math.random().toString(36).substring(7);
        console.log("Match created");

        let scopeThis = this;
        this.setupPlayers(function(){
            scopeThis.startGame();
            scopeThis.networkEvents();
        });
    }

    setupPlayers(playersReadyCallback){
        this.player1.setSearchingMatch(false);
        this.player2.setSearchingMatch(false);
        let player2 = this.player2;
        let roomID = this.roomID;
        this.player1.setRoom(this.roomID, function(){
            player2.setRoom(roomID, function () {
                playersReadyCallback();
            });
        });

    }

    playIntro(){
        // start audio intro
    }

    startGame(){
        console.log('Sending startGame event');
        this.io.to(this.roomID).emit('startGame');
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
        let io = this.io;
        let roomID = this.roomID;

        // punch events
        this.player1.getSocket().on('punch', function () {
            if(player1.getCanPunch()) {
                player1.getSocket().broadcast.emit('enemy_punch');
                player1.punch(player2, function () {
                    player1.getSocket().emit('hit_head');
                    io.sockets.to(roomID).emit('hitted_head');
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
                    io.sockets.to(roomID).emit('hitted_head');
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

module.exports = Match;
