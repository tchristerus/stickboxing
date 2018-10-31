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
    },

    create: function(){
        this.music = this.game.add.audio('ready_to_rumble');
        this.music.play();
        this.add.tileSprite(0, 0, 800, 600, 'background');

        this.player.create();
        this.enemy.create();
        this.gameController.enemyEvents();
        console.info("MainGame loaded");
    },

    update: function () {
        this.player.update();
    }
};