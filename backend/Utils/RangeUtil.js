/** Util to calculate range between the players */
class RangeUtil {

    /**
     * Check if the players are in hitting range of each other
     * @param {Player} player
     * @param {Player} enemy
     * @param {number} range
     * @return {boolean}
     */
    static inRange(player, enemy, range) {
        const posLeft = (player.playerSide === 'left') ? player.getPosX() : enemy.getPosX();
        const posRight = (enemy.playerSide === 'left') ? player.getPosX() : enemy.getPosX();

        console.log('pos1 ' + player.playerSide + ':' + posLeft + '  pos2 ' + enemy.playerSide + ':' + posRight);
        if (Math.abs(posRight - posLeft) < range) {
            console.log('in range for punch: ' + Math.abs(posRight - posLeft));
            return true;
        } else {
            return false;
        }
    }

}

module.exports = RangeUtil;
