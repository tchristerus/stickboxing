class GameController {

    constructor(game, player, enemy){
        this.game = game;
        this.player = player;
        this.enemy = enemy;
    }

    enemyEvents(){
        let game = this.game;
        let player = this.player;
        let enemy = this.enemy;
        let blockSound = this.game.blockSound;
        socket.on('enemy_punch', function () {
            console.log('enemy_punch received');
            enemy.punch();
        });

        socket.on('enemy_kick', function () {
            console.log('enemy_kick received');
            enemy.kick();
        });

        socket.on('el', function (data) {
            enemy.setPosition(850 - (data + (enemy.enemy.width / 2)));
        });

        socket.on('punch_done', function (data) {
            console.info('punch animation done');
        });



        socket.on('blocked_head', function (data) {
            console.info('blocked head');
            game.blockSound.play();
        });

        socket.on('hit_head', function (data) {
            console.info('enemy hit');
            game.hitSound.play();
        });

        socket.on('hitted_head', function (data) {
            console.info('Got hit');
            game.hitSound.play();
            player.takeDamage()
        });
    }

    audioEvents(){
        this.game.music.onStop.add(this.readyToRumbleDone, this);

    }

    readyToRumbleDone(){
        console.log('audio_done');
    }
}
