class Crab {

    game: Phaser.Game;

    base: Phaser.Sprite;
    player: Phaser.Sprite;
    speed: number;
    constructor(game: Phaser.Game, x: number, y: number, player: Phaser.Sprite) {

        this.game = game;
        this.speed = 10;
        this.base = this.game.add.sprite(x, y, "urchin");
        this.base.scale.set(1.0);
        this.game.physics.p2.enable([this.base], SHOW_PHYSICS_DEBUG);
        this.player = player;

    }

    attach(parent: Phaser.Sprite) {
        console.log("wow made an eyeball, attached " + this.base.position.toString());
        parent.addChild(this.base);
    }

    update() {
        console.log(this.player, this.base);
        let angle = Math.atan2(this.player.y - this.base.y, this.player.x - this.base.x);
        this.base.body.rotation = angle;  // correct angle of angry bullets (depends on the sprite used)
        this.base.body.force.x = Math.cos(angle) * this.speed;    // accelerateToObject 
        this.base.body.force.y = Math.sin(angle) * this.speed;
    }

}