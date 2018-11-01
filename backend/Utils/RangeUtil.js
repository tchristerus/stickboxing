class RangeUtil {

    static inRange(player, enemy, range){
        let posLeft = (player.playerSide === 'left') ? player.getPosX() : enemy.getPosX();
        let posRight = (enemy.playerSide === 'left') ? player.getPosX() : enemy.getPosX();

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