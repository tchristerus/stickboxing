let MainGame = {};

MainGame.Main = function(game){
};

MainGame.Main.prototype = {
    preload: function(){
        this.player = new Player(this);
        this.enemy = new Enemy(this);
        this.gameController = new GameController(this, this.player, this.enemy);
        this.load.image('background', 'assets/ring/ring.png');
        this.load.audio('ready_to_rumble', ['assets/music/boxing.ogg']);
        this.load.audio('boxing_hit', ['assets/music/boxing_hit.ogg']);
        this.load.audio('boxing_block', ['assets/music/boxing_blocked.ogg']);
    },

    create: function(){
        this.rumble = this.game.add.audio('ready_to_rumble');
        this.hitSound = this.game.add.audio('boxing_hit');
        this.blockSound = this.game.add.audio('boxing_block');
        this.rumble.play();
        this.add.tileSprite(0, 0, 800, 600, 'background');

        this.player.create();
        this.enemy.create();
        this.gameController.enemyEvents();
        console.info("MainGame loaded");
    },

    update: function () {
        let collisionRight = this.player.checkCollide(this.enemy);
        this.player.update(collisionRight);
    }
};
