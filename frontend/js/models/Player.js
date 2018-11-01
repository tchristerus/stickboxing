class Player {

    constructor(game) {
        this.game = game;
        this.game.load.spritesheet('boxer', 'assets/boxer/player_spritesheet.png', 220, 220,20);
        this.lastLocationUpdate = new Date();
        this.headDamage = 0;
        this.canPunch = true;
        this.canMove = false;
    }

    create(){
        this.boxer = this.game.add.sprite(350, 250, 'boxer', 5);
        this.boxer.anchor.setTo(0.85, 0);

        this.boxer.scale.set(1);
        this.boxer.smoothed = false;
        this.boxer.animations.add('idle', [0,1,2], 9, true);
        this.boxer.animations.add('punch', [3,4,5,6,7,8,9,10,11], 15, false);
        this.boxer.animations.add('kick', [12, 13,14,15,16,17,18,19], 15, false);
        this.boxer.animations.add('take_damage_legs', [20, 19,18,19,20], 5, false);
        this.boxer.animations.play("idle");
        this.boxer.animations.getAnimation("punch").onComplete.add(this.animationStopped, this);
        this.boxer.animations.getAnimation("kick").onComplete.add(this.animationStopped, this);
        this.boxer.animations.getAnimation("take_damage_legs").onComplete.add(this.kickDamageAnimation, this);

        // Keyboard input
        let keySpace = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        let kKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        keySpace.onDown.add(this.punch, this);
        kKey.onDown.add(this.kick, this);
    }

    getSprite(){
        return this.boxer;
    }

    update(collisionRight) {
        if(this.canMove) {
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                if (this.boxer.x > 260) { // ring ropes left
                    this.boxer.x -= 4;
                    if (Math.abs(new Date() - this.lastLocationUpdate) > 16) { // 30 times a second position update
                        socket.emit('l', this.boxer.x);
                        this.lastLocationUpdate = new Date();
                    }
                }
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                if (!collisionRight) {
                    if (this.boxer.x < 850) { // ring ropes right
                        this.boxer.x += 4;
                        if (Math.abs(new Date() - this.lastLocationUpdate) > 16) { // 30 times a second position update
                            socket.emit('l', this.boxer.x);
                            this.lastLocationUpdate = new Date();
                        }
                    }
                }
            }
        }
    }

    punch() {
        if(this.canMove) {
            if (this.canPunch) {
                socket.emit('punch');
                this.boxer.animations.play("punch");
                this.game.time.events.add(400, function () {
                    // this.camera.shake(0.01, 100);
                    // game.camera.flash(0xff0000, 250);
                }, this);
            } else {
                console.log('Cannot punch, kick damage in progress');
            }
        }
    }

    kick() {
        if(this.canMove) {
            socket.emit('kick');
            this.boxer.animations.play("kick");
            this.game.time.events.add(400, function () {
                // this.camera.shake(0.01, 100);
                // game.camera.flash(0xff0000, 500);
            }, this);
        }
    }

    takeDamage(){
        this.game.camera.flash(0xff0000, 200);
    }

    takeDamageLegs(){
        this.boxer.animations.play("take_damage_legs");
        this.canPunch = false;
    }

    setHeadDamage(data){
        console.log(data);
        this.headDamage = data;
    }

    animationStopped() {
        this.boxer.animations.play("idle");
    }

    kickDamageAnimation() {
        this.boxer.animations.play("idle");
        this.canPunch = true;
        console.log('Can punch again');
    }

    checkCollide(enemy) {
        return (this.boxer.x + 110 > enemy.getSprite().x + 140 );
    }
}
