const Animation = require('../Models/Animation');
const AnimationTimer = require('../Utils/AnimationTimer');
const RangeUtil = require('../Utils/RangeUtil');

/** Handles the player */
class Player {

    /**
     * Constructor
     * @param {Socket} socket
     */
    constructor(socket) {
        this.socket = socket;
        this.playerSide = null; // left or right
        this.socket.searchingMatch = false;
        this.punchAnimation = new Animation(9, 15);
        this.kickAnimation = new Animation(8, 15);
        this.resetGameStats();
    }

    /**
     * Resets all the player stats to a default state
     */
    resetGameStats() {
        // game stats, health etc.
        this.headDamage = 0; // 0-100
        this.ready = false;
        this.rumbleDone = false;
        this.headBlocked = true;
        this.canPunch = true;
        this.x = 0;
    }

    /**
     * Puts the user in a specific socket room
     * @param {string} room
     * @param {Function} joined
     */
    setRoom(room, joined) {
        this.roomID = room;
        console.log(this.socket.id + ' joining room: ' + room);
        this.socket.leave('menu');
        this.socket.join(room, joined);
    }

    /**
     * Sets the player to be on the left side or the right side of the boxing ring
     * @param {string} side
     */
    setPlayerSide(side) {
        this.playerSide = side;
    }

    /**
     * @return {SocketID}
     */
    getSocketId() {
        return this.socket.id;
    }

    /**
     * @return {Socket} Players socket connection
     */
    getSocket() {
        return this.socket;
    }

    /**
     * @return {boolean}
     */
    isSearchingMatch() {
        return this.socket.searchingMatch;
    }

    /**
     * Sets the players "is searching a match" state
     * @param {boolean} val
     */
    setSearchingMatch(val) {
        this.socket.searchingMatch = val;
    }

    /**
     * Gets if the user is allowed to punch
     * @return {boolean}
     */
    getCanPunch() {
        return this.canPunch;
    }

    /**
     * Sets the user can punch state
     * @param {bool} val
     */
    setCanPunch(val) {
        this.canPunch = val;
    }

    /**
     * Gets the users x position
     * @return {number}
     */
    getPosX() {
        return (this.playerSide === 'right') ? this.x + 110 : this.x; // 850 == ring width, so placing the enemy on the right side of the ring. 110 = enemy width / 2
    }

    /**
     * Sets the users x position
     * @param {number} val
     */
    setPosX(val) {
        this.x = (this.playerSide === 'right') ? (850 - val) + 170 : val;
    }

    /**
     * This callback will be called with the status of the punch
     *
     * @callback punchHittedCallback
     * @param {boolean} punchHitted (true = hitted, false = blocked, null = missed)
     */

    /**
     * Checks if the player is in range of the enemy and checks if the punch was a hit or a block
     * @param {Player} enemy
     * @param {punchHittedCallback} punchHittedCallback
     */
    punch(enemy, punchHittedCallback) {
        const player = this;
        this.setCanPunch(false);
        this.headBlocked = false;

        AnimationTimer.animateWhole(this.punchAnimation, function() {
            player.setCanPunch(true);
            player.headBlocked = true;
        });

        // Callback when frame 5 is reached (PUNCH HIT FRAME)
        AnimationTimer.animateUntilFrame(this.punchAnimation, 5, function() {
            if (RangeUtil.inRange(player, enemy, 150)) {
                if (enemy.headBlocked) {
                    punchHittedCallback(true);
                } else {
                    punchHittedCallback(false);
                }
            } else {
                punchHittedCallback(null);
            }
        });
    }

    /**
     * This callback will be called when the kick hitted the enemy
     *
     * @callback HittedCallback
     */

    /**
     * Checks if the player is in range of the enemy and checks if the punch was a hit or a block
     * @param {Player} enemy
     * @param {HittedCallback} hittedCallback
     */
    kick(enemy, hittedCallback) {
        const player = this;
        this.setCanPunch(false);
        this.headBlocked = false;

        AnimationTimer.animateWhole(this.kickAnimation, function() {
            player.headBlocked = true;
        });

        // Callback when frame 5 is reached (PUNCH HIT FRAME)
        AnimationTimer.animateUntilFrame(this.kickAnimation, 5, function() {
            player.setCanPunch(true);

            if (RangeUtil.inRange(player, enemy, 150)) {
                hittedCallback();
            }
        });
    }

    /**
     * This function will handle the face unblocked if the player gets hit on the legs
     */
    takeLegKick() {
        const player = this;
        this.headBlocked = false;
        AnimationTimer.animateWhole(this.kickAnimation, function() {
            player.headBlocked = true;
        });
    }

}

module.exports = Player;
