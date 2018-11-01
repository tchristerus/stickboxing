class GameController {

    constructor(game, player, enemy){
        this.game = game;
        this.player = player;
        this.enemy = enemy;
        this.round = 1;
        this.timeLeft = 30;
    }

    enemyEvents(){
        let game = this.game;
        let player = this.player;
        let enemy = this.enemy;
        let blockSound = this.game.blockSound;
        let rumble = this.game.rumble;
        let scope = this;

        socket.on('play_rumble', function(){
            rumble.play();
        });

        socket.on('game_over', function(data){
            console.log(data);
        });

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
            player.takeDamage();
            console.info(data);
            player.setHeadDamage(JSON.parse(data).head_damage);
        });

        socket.on('hit_leg', function () {
            console.info('Hitted enemies leg');
            game.hitSound.play();
            enemy.takeDamageLegs();
        });

        socket.on('hitted_leg', function () {
            console.info('Your leg got hit');
            game.hitSound.play();
            player.takeDamage();
            player.takeDamageLegs();
        });

        socket.on('game_update', function (data) {
            let json = JSON.parse(data);
            scope.round = json.round;
            scope.timeLeft = json.tl;
            scope.updateGameText();
        })
    }

    updateGameText(){
        this.game.text.text = 'Round ' + this.round + ': ' + this.timeLeft + ' sec left';
    }

    audioEvents(){
        this.game.music.onStop.add(this.readyToRumbleDone, this);

    }

    readyToRumbleDone(){
        console.log('audio_done');
    }
}
