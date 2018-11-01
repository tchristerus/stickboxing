let Animation = require('../Models/Animation');
let AnimationTimer = require('../Utils/AnimationTimer');
let RangeUtil = require('../Utils/RangeUtil');

class Player {

    constructor(socket) {
        this.socket = socket;
        this.playerSide = null; // left or right
        this.socket.searchingMatch = false;
        this.punchAnimation = new Animation('punch', 9, 15);
        this.kickAnimation = new Animation('kick', 8, 15);
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

    setRoom(room, joined){
        this.roomID = room;
        console.log(this.socket.id + ' joining room: ' + room);
        this.socket.leave('menu');
        this.socket.join(room, joined);
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

    getRoomSocket(){
        return this.socket.rooms[this.roomID];
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
        this.headBlocked = false;

        AnimationTimer.animateWhole(this.punchAnimation, function(){
            player.setCanPunch(true);
            player.headBlocked = true;
        });

        // Callback when frame 5 is reached (PUNCH HIT FRAME)
        AnimationTimer.animateUntilFrame(this.punchAnimation,5, function () {
            if (RangeUtil.inRange(player, enemy, 150)) {
                if(enemy.headBlocked) {
                    punchHittedCallback(true);
                }else{
                    punchHittedCallback(false);
                }
            } else {
                punchHittedCallback(null)
            }
        });
    }

    kick(enemy, hittedCallback){
        let player = this;
        this.setCanPunch(false);
        this.headBlocked = false;

        AnimationTimer.animateWhole(this.kickAnimation, function(){
            player.headBlocked = true;
        });

        // Callback when frame 5 is reached (PUNCH HIT FRAME)
        AnimationTimer.animateUntilFrame(this.kickAnimation,5, function () {
            player.setCanPunch(true);

            if (RangeUtil.inRange(player, enemy, 150)) {
                hittedCallback();
            }
        });
    }

    takeLegKick(){
        let player = this;
        this.headBlocked = false;
        AnimationTimer.animateWhole(this.kickAnimation, function(){
            player.headBlocked = true;
        });
    }
}

module.exports = Player;
