const MainMenu = {};

/**
 * Main menu logic
 * @param {Phaser} game
 * @constructor
 */
MainMenu.Main = function(game) {

};

/**
 * Main menu logic
 * @type {{preload: MainMenu.Main.preload, create: MainMenu.Main.create}}
 */
MainMenu.Main.prototype = {
    preload: function() {
        this.load.audio('menu', ['assets/music/menu.mp3', 'assets/music/menu.ogg']);
        this.textStyle = {font: 'bold 32px Arial', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle'};

    },

    create: function() {
        this.music = this.game.add.audio('menu');
        this.music.play();
        this.text = this.game.add.text(0, 0, 'Searching for opponent', this.textStyle);
        this.text.setTextBounds(0, 100, 800, 300);

        console.info('Main menu loaded');
        socket.emit('searchingMatch');

        const game = this.game;
        const music = this.music;
        // match found
        socket.on('startGame', function() {
            console.log('Game starting');
            music.stop();
            game.state.start('Game');
        });
    },
};
