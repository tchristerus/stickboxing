let Animation = require('../Models/Animation');
let AnimationTimer = require('../Utils/AnimationTimer');

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

module.exports = Player;
