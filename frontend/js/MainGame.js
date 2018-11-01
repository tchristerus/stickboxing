const MainGame = {};

/**
 * Main game logic
 * @param {Phaser} game
 * @constructor
 */
MainGame.Main = function(game) {
};

/**
 * Main game logic
 * @type {{preload: MainGame.Main.preload, create: MainGame.Main.create, start: MainGame.Main.start, rumbleStopped: MainGame.Main.rumbleStopped, update: MainGame.Main.update}}
 */
MainGame.Main.prototype = {
    preload: function() {
        this.player = new Player(this);
        this.enemy = new Enemy(this);
        this.gameController = new GameController(this, this.player, this.enemy);
        this.load.image('background', 'assets/ring/ring.png');
        this.load.audio('ready_to_rumble', ['assets/music/boxing.ogg']);
        this.load.audio('boxing_hit', ['assets/music/boxing_hit.ogg']);
        this.load.audio('boxing_block', ['assets/music/boxing_blocked.ogg']);
        this.load.audio('bell', ['assets/music/bell.ogg']);
    },

    create: function() {
        this.rumble = this.game.add.audio('ready_to_rumble');
        this.hitSound = this.game.add.audio('boxing_hit');
        this.blockSound = this.game.add.audio('boxing_block');
        this.bell = this.game.add.audio('bell');
        this.add.tileSprite(0, 0, 800, 600, 'background');
        this.player.create();
        this.enemy.create();
        this.gameController.events();
        this.game.sound.setDecodedCallback([this.rumble, this.hitSound, this.blockSound, this.bell], this.start, this);

        const style = {font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle'};
        //  The Text is positioned at 0, 100
        this.text = this.add.text(0, 0, 'Round 1: 30 sec left', style);
        this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

        //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
        this.text.setTextBounds(0, 100, 800, 100);
    },

    start: function() {
        console.info('Audio loaded loaded');
        this.rumble.onStop.add(this.rumbleStopped, this);
        socket.emit('ready');
    },

    rumbleStopped: function() {
        socket.emit('rumble_done');
    },
    update: function() {
        const collisionRight = this.player.checkCollide(this.enemy);
        this.player.update(collisionRight);
    },
};
