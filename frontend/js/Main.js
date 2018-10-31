class Game {

    constructor(){
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'Boxing-game', { preload: this.preload, create: this.create, update: this.update });
    }

    preload(){
        this.game.stage.backgroundColor = "#FFFFFF";
        this.game.state.add('Main', MainMenu.Main);
        this.game.state.add('Game', MainGame.Main);
    }

    create(){
        this.game.stage.disableVisibilityChange = true;
        this.game.state.start('Main');
    }

    update(){

    }
}

socket = io('192.168.1.27:3000');
let game = new Game();