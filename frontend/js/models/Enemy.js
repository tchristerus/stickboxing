/** Manages the enemy */
class Enemy {

    /**
     * Constructor
     * @param {Phaser} game
     */
    constructor(game) {
        this.game = game;
        this.game.load.spritesheet('enemy', 'assets/boxer/enemy_spritesheet.png', 220, 220, 20);
    }

    /**
     * Gets called after the preload and before the phaser update
     */
    create() {
        this.enemy = this.game.add.sprite(630, 250, 'enemy', 5);

        this.enemy.anchor.setTo(0.15, 0);
        this.enemy.scale.set(1);
        this.enemy.scale.x *=-1;
        this.enemy.animations.add('idle', [0, 1, 2], 9, true);
        this.enemy.animations.add('punch', [3, 4, 5, 6, 7, 8, 9, 10, 11], 15, false);
        this.enemy.animations.add('kick', [12, 13, 14, 15, 16, 17, 18, 19], 15, false);
        this.enemy.animations.add('take_damage_legs', [20, 19, 18, 19, 20], 5, false);
        this.enemy.animations.getAnimation('punch').onComplete.add(this.animationStopped, this);
        this.enemy.animations.getAnimation('kick').onComplete.add(this.animationStopped, this);
        this.enemy.animations.getAnimation('take_damage_legs').onComplete.add(this.animationStopped, this);
        this.enemy.animations.play('idle');
    }

    /**
     * Sets the enemy sprite location
     * @param {number} locX
     */
    setPosition(locX) {
        this.enemy.x = locX;
    }

    /**
     * Gets the emeny sprite
     * @return {Sprite}
     */
    getSprite() {
        return this.enemy;
    }

    /**
     * Makes the enemy punch
     */
    punch() {
        this.enemy.animations.play('punch');
        this.game.time.events.add(400, function() {
            // this.camera.shake(0.01, 100);
            // game.camera.flash(0xff0000, 250);
        }, this);

    }

    /**
     * Makes the enemy kick
     */
    kick() {
        this.enemy.animations.play('kick');
        this.game.time.events.add(400, function() {
            // this.camera.shake(0.01, 100);
            // game.camera.flash(0xff0000, 500);
        }, this);
    }

    /**
     * Makes the enemy take damage
     */
    takeDamageLegs() {
        this.enemy.animations.play('take_damage_legs');
    }

    /**
     * Gets called whenever a animation is finished
     */
    animationStopped() {
        this.enemy.animations.play('idle');
    }

}
