/** Main logic */
class Game {

    /**
     * Constructor
     */
    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'Boxing-game', {preload: this.preload, create: this.create, update: this.update});
    }

    /**
     * Loads everything before starting the game
     */
    preload() {
        this.game.stage.backgroundColor = '#FFFFFF';
        this.game.state.add('Main', MainMenu.Main);
        this.game.state.add('Game', MainGame.Main);
    }

    /**
     * Creates everything before starting the main loop
     */
    create() {
        this.game.stage.disableVisibilityChange = true;
        this.game.state.start('Main');
    }

    /**
     * Gets called on every game update
     */
    update() {

    }

}

const socket = io(window.location.hostname + ':3000');
const game = new Game();

socket.on('connect_error', function(error){
    alert('The server is down. Try again later');
});
