/** Handling all the info about the match */
class Match {

    /**
     * Constructor
     * @param {Player} player1
     * @param {Player} player2
     * @param {Socket} io
     */
    constructor(player1, player2, io) {
        this.player1 = player1;
        this.player2 = player2;
        this.startLocations = {p1: 350, p2: 630};
        this.player1.setPosX(350);
        this.player2.setPosX(630);
        this.io = io;
        this.player1.setPlayerSide('left');
        this.player2.setPlayerSide('right');
        this.roundTime = 30;
        this.round = 1;
        this.timeLeft = null;
        this.gameStarted = false;
        this.roundPause = false; // Used to count 5 seconds between rounds
        this.roomID = Math.random().toString(36).substring(7);
        console.log('Match created');

        const scopeThis = this;
        this.setupPlayers(function() {
            scopeThis.startGame();
            scopeThis.networkEvents();
        });
    }

    /**
     * Setup the players and join the match room
     * @param {Function} playersReadyCallback
     */
    setupPlayers(playersReadyCallback) {
        this.player1.setSearchingMatch(false);
        this.player2.setSearchingMatch(false);
        const player2 = this.player2;
        const roomID = this.roomID;
        this.player1.setRoom(this.roomID, function() {
            player2.setRoom(roomID, function() {
                playersReadyCallback();
            });
        });

    }

    /**
     * Setup the game, notifies the players and starts the game loop
     */
    startGame() {
        console.log('Sending startGame event');
        this.io.to(this.roomID).emit('startGame');
        this.round = 1;
        this.timeLeft = this.roundTime;
        this.handleGameStats();
    }

    /**
     * Checks who is the winner based from damage and sends both players if they lose, win or draw
     */
    handleWinner() {
        this.player1.getSocket().emit('round_end');
        if (this.player1.headDamage < this.player2.headDamage) { // player 1 win
            console.log('Player 1 wins');
            this.player1.getSocket().emit('game_over', 'win');
            this.player2.getSocket().emit('game_over', 'lose');

            this.player1.getSocket().emit('set_text', 'You win!');
            this.player2.getSocket().emit('set_text', 'You lose!');

        } else if (this.player1.headDamage > this.player2.headDamage) { // player 2 win
            console.log('Player 2 wins');
            this.player1.getSocket().emit('game_over', 'lose');
            this.player2.getSocket().emit('game_over', 'win');

            this.player1.getSocket().emit('set_text', 'You lose!');
            this.player2.getSocket().emit('set_text', 'You win!');
        } else { // draw
            console.log('draw');
            this.io.to(this.roomID).emit('game_over', 'draw');
            this.io.to(this.roomID).emit('set_text', 'draw');
        }
    }

    /**
     * Checks if both players are ready, if so it starts the game.
     * @return {boolean}
     */
    playersRumbleDone() {
        if (this.player1.rumbleDone && this.player2.rumbleDone) {
            if (this.gameStarted) {
                return true;
            }
            this.io.to(this.roomID).emit('start_game');
            this.gameStarted = true;
            return true;
        }
        return false;
    }

    /**
     * Resets the player positions, freezes them and starts a new round after 5 seconds.
     */
    newRound() {
        this.resetLocations();
        this.io.to(this.roomID).emit('round_end');
        this.roundPause = true;
        this.io.to(this.roomID).emit('set_text', 'Starting new round');
        const scope = this;

        setTimeout(function() {
            scope.io.to(scope.roomID).emit('round_start');
            scope.roundPause = false;
        }, 5000);
    }

    /**
     * Handles the game round and round timer
     */
    handleGameStats() {
        const scope = this;
        this.statusTimer = setInterval(function() {
            if (!scope.roundPause) {
                if (scope.playersRumbleDone()) {
                    if (scope.timeLeft > 0) {
                        scope.timeLeft--;
                    } else {
                        // time is up
                        if (scope.round < 3) {
                            scope.round++;
                            scope.timeLeft = scope.roundTime;
                            scope.newRound();
                        } else {
                            // round over
                            scope.handleWinner();
                            clearInterval(scope.statusTimer);
                        }
                    }
                    scope.io.to(scope.roomID).emit('game_update', JSON.stringify({
                        round: scope.round,
                        tl: scope.timeLeft,
                    }));
                }
            }
        }, 1000);
    }

    /**
     * Resets the players position on the client and the server.
     */
    resetLocations() {
        this.player1.setPosX(this.startLocations.p1);
        this.player2.setPosX(this.startLocations.p1);
        this.io.to(this.roomID).emit('set_loc', JSON.stringify({p: this.startLocations.p1, e: this.startLocations.p2}));
    }

    /**
     * @return {Player} Player1
     */
    getPlayer1() {
        return this.player1;
    }

    /**
     * @return {Player} Player2
     */
    getPlayer2() {
        return this.player2;
    }

    /**
     * Checks if the punch was a hit and sends this info to the clients
     * @param {Player} player1
     * @param {Player} player2
     */
    handlePunch(player1, player2) {
        if (player1.getCanPunch()) {
            player2.getSocket().emit('enemy_punch');
            player1.punch(player2, function(headBlocked) {
                if (headBlocked === true) {
                    player1.getSocket().emit('blocked_head');
                    player2.getSocket().emit('blocked_head');
                    // player2.getSocket().emit('hitted_head', JSON.stringify({head_damage: player2.headDamage}));
                } else if (headBlocked === false) {
                    player1.getSocket().emit('hit_head');
                    player2.headDamage += 10;
                    player2.getSocket().emit('hitted_head', JSON.stringify({head_damage: player2.headDamage}));
                }
            });
            console.log('broadcasting enemy_punch');
        } else {
            console.log('Cannot punch ' + player1.getCanPunch());
        }
    }

    /**
     * Checks if the kick was a hit and sends this info to the clients
     * @param {Player} player1
     * @param {Player} player2
     */
    handleKick(player1, player2) {
        player2.getSocket().emit('enemy_kick');
        player1.kick(player2, function() {
            player1.getSocket().emit('hit_leg');
            player2.getSocket().emit('hitted_leg');
            player2.takeLegKick();
        });
    }

    /**
     * Starts the ready to rumble sound on the clients when they are both ready
     */
    startRumble() {
        if (this.player1.ready && this.player2.ready) {
            this.io.to(this.roomID).emit('play_rumble');
        }
    }

    /**
     * Gets called whenever a player is ready and sets the client status text to "Get ready to rumble"
     * @param {Player} player
     */
    playerReady(player) {
        player.getSocket().emit('set_text', 'Get ready to rumble!');
    }

    /**
     * Handles all the socket events
     */
    networkEvents() {
        const player1 = this.player1;
        const player2 = this.player2;
        const scope = this;

        // if both players ready, start ready to rumble sound
        this.player1.getSocket().on('ready', function() {
            player1.ready = true;
            scope.startRumble();
            scope.playerReady(player1);
        });

        this.player2.getSocket().on('ready', function() {
            player2.ready = true;
            scope.startRumble();
            scope.playerReady(player2);
        });

        // rumble sound done
        this.player1.getSocket().on('rumble_done', function() {
            player1.rumbleDone = true;
        });

        this.player2.getSocket().on('rumble_done', function() {
            player2.rumbleDone = true;
        });

        // punch events
        this.player1.getSocket().on('punch', function() {
            scope.handlePunch(player1, player2);
        });

        this.player2.getSocket().on('punch', function() {
            scope.handlePunch(player2, player1);
        });

        // kick events
        this.player1.getSocket().on('kick', function() {
            scope.handleKick(player1, player2);
        });

        this.player2.getSocket().on('kick', function() {
            scope.handleKick(player2, player1);
        });

        // move events
        this.player1.getSocket().on('l', function(data) {
            if (!scope.roundPause) {
                player1.setPosX(data);
                player2.getSocket().volatile.emit('el', data);
            }
        });

        this.player2.getSocket().on('l', function(data) {
            if (!scope.roundPause) {
                player2.setPosX(data);
                player1.getSocket().volatile.emit('el', data);
            }
        });
    }

}

module.exports = Match;
