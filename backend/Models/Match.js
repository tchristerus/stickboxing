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

        this.round = 1;
        this.timeLeft = 10;
        this.handleGameStats();
    }

    handleWinner(){
        if(this.player1.headDamage < this.player2.headDamage){ // player 1 win
            console.log('Player 1 wins');
            this.player1.getSocket().emit('game_over', 'win');
            this.player2.getSocket().emit('game_over', 'lose');
        }else if(this.player1.headDamage > this.player2.headDamage){ // player 2 win
            console.log('Player 2 wins');
            this.player1.getSocket().emit('game_over', 'lose');
            this.player2.getSocket().emit('game_over', 'win');
        }else { // draw
            console.log('draw');
            this.io.to(this.roomID).emit('game_over', 'draw');
        }
    }

    playersRumbleDone(){
        return (this.player1.rumbleDone && this.player2.rumbleDone);
    }

    handleGameStats(){
        let scope = this;
        this.statusTimer = setInterval(function () {
            if(scope.playersRumbleDone()) {
                if (scope.timeLeft > 0) {
                    scope.timeLeft--;
                } else {
                    // time is up
                    if (scope.round < 3) {
                        scope.round++;
                        scope.timeLeft = 10;
                    } else {
                        // round over
                        scope.handleWinner();
                        clearInterval(scope.statusTimer);
                    }
                }
                scope.io.to(scope.roomID).emit('game_update', JSON.stringify({round: scope.round, tl: scope.timeLeft}));
            }
        },1000);
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

    handlePunch(player1, player2){
        let io = this.io;
        let roomID = this.roomID;

        if(player1.getCanPunch()) {
            player2.getSocket().emit('enemy_punch');
            player1.punch(player2, function (headBlocked) {
                if(headBlocked === true) {
                    player1.getSocket().emit('blocked_head');
                    player2.getSocket().emit('blocked_head');
                    // player2.getSocket().emit('hitted_head', JSON.stringify({head_damage: player2.headDamage}));
                }else if(headBlocked === false){
                    player1.getSocket().emit('hit_head');
                    player2.headDamage += 10;
                    player2.getSocket().emit('hitted_head', JSON.stringify({head_damage: player2.headDamage}));
                }
            });
            console.log('broadcasting enemy_punch');
        }else{
            console.log('Cannot punch ' + player1.getCanPunch());
        }
    }

    handleKick(player1, player2){
        let io = this.io;
        let roomID = this.roomID;
        player2.getSocket().emit('enemy_kick');

        player1.kick(player2, function(){
            player1.getSocket().emit('hit_leg');
            player2.getSocket().emit('hitted_leg');
            player2.takeLegKick();
        })
    }

    startRumble(){
        if(this.player1.ready && this.player2.ready){
            this.io.to(this.roomID).emit('play_rumble');
        }
    }


    networkEvents(){
        let player1 = this.player1;
        let player2 = this.player2;
        let scope = this;


        //if both players ready, start ready to rumble sound
        this.player1.getSocket().on('ready', function(){
            player1.ready = true;
            scope.startRumble();
        });

        this.player2.getSocket().on('ready', function(){
            player2.ready = true;
            scope.startRumble();
        });

        // rumble sound done
        this.player1.getSocket().on('rumble_done', function(){
            player1.rumbleDone = true;
        });

        this.player2.getSocket().on('rumble_done', function(){
            player2.rumbleDone = true;
        });

        // punch events
        this.player1.getSocket().on('punch', function () {
            scope.handlePunch(player1, player2)
        });

        this.player2.getSocket().on('punch', function () {
            scope.handlePunch(player2, player1);
        });

        // kick events
        this.player1.getSocket().on('kick', function () {
            scope.handleKick(player1, player2);
        });

        this.player2.getSocket().on('kick', function () {
            scope.handleKick(player2, player1);
        });

        // move events
        this.player1.getSocket().on('l', function (data) {
            player1.setPosX(data);
            player2.getSocket().volatile.emit('el', data);
        });

        this.player2.getSocket().on('l', function (data) {
            player2.setPosX(data);
            player1.getSocket().volatile.emit('el', data);
        });
    }
}

module.exports = Match;
