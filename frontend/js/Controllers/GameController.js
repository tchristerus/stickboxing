/** Manages all the networking and match logic */
class GameController {

    /**
     * Constructor
     * @param {Phaer} game
     * @param {Player} player
     * @param {Enemy} enemy
     */
    constructor(game, player, enemy) {
        this.game = game;
        this.player = player;
        this.enemy = enemy;
        this.round = 1;
        this.timeLeft = 30;
    }

    /**
     * Creates all the socket events
     */
    events() {
        const game = this.game;
        const player = this.player;
        const enemy = this.enemy;
        const rumble = this.game.rumble;
        const bell = this.game.bell;
        const scope = this;

        socket.on('play_rumble', function() {
            rumble.play();
        });

        socket.on('start_game', function() {
            bell.play();
            player.canMove = true;
        });

        socket.on('round_end', function() {
            bell.play();
            player.canMove = false;
        });

        socket.on('round_start', function() {
            bell.play();
            player.canMove = true;
        });

        socket.on('game_over', function(data) {
            player.canMove = false;
        });

        socket.on('enemy_punch', function() {
            console.log('enemy_punch received');
            enemy.punch();
        });

        socket.on('enemy_kick', function() {
            console.log('enemy_kick received');
            enemy.kick();
        });

        socket.on('el', function(data) {
            enemy.setPosition(850 - (data + (enemy.enemy.width / 2)));
        });

        socket.on('punch_done', function(data) {
            console.info('punch animation done');
        });

        socket.on('blocked_head', function(data) {
            console.info('blocked head');
            game.blockSound.play();
        });

        socket.on('hit_head', function(data) {
            console.info('enemy hit');
            game.hitSound.play();
        });

        socket.on('hitted_head', function(data) {
            console.info('Got hit');
            game.hitSound.play();
            player.takeDamage();
            console.info(data);
            player.setHeadDamage(JSON.parse(data).head_damage);
        });

        socket.on('hit_leg', function() {
            console.info('Hitted enemies leg');
            game.hitSound.play();
            enemy.takeDamageLegs();
        });

        socket.on('hitted_leg', function() {
            console.info('Your leg got hit');
            game.hitSound.play();
            player.takeDamage();
            player.takeDamageLegs();
        });

        socket.on('game_update', function(data) {
            if (player.canMove) {
                const json = JSON.parse(data);
                scope.round = json.round;
                scope.timeLeft = json.tl;
                scope.updateGameText();
            }
        });

        socket.on('set_text', function(data) {
            console.log('Update text to ' + data);
            scope.game.text.text = data;
        });

        socket.on('set_loc', function(data) {
            const json = JSON.parse(data);
            player.getSprite().x = json.p; // data.p == player location
            enemy.getSprite().x = json.e; // data.e == enemy location
        });
    }

    /**
     * Updates the game text on the screen to EG (Round1: 20 Sec left)
     */
    updateGameText() {
        this.game.text.text = 'Round ' + this.round + ': ' + this.timeLeft + ' sec left';
    }

}
