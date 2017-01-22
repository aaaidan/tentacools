class Eye {

    game: Phaser.Game;

    base: Phaser.Image;
    iris: Phaser.Image;
    highlight: Phaser.Image;
    offset: number;
    constructor(game: Phaser.Game, x: number, y: number) {

        this.game = game;
        this.offset = 0;//Math.random() * 10000;
        this.base = this.game.add.image(x, y, "eyeball-base");
        this.iris = this.game.make.image(this.base.width / 2, this.base.height / 2, "eyeball-iris");
        this.highlight = this.game.make.image(0, 0, "eyeball-highlight");

        setPivotCenter(this.base);
        setPivotCenter(this.iris);
        // setPivotCenter(this.highlight);

        this.highlight.position.set(0);

        this.base.scale.setTo(1.5);
        
        this.base.addChild(this.iris);
        this.base.addChild(this.highlight);
    }

    attach(parent: Phaser.Sprite) {
        console.log("wow made an eyeball, attached " + this.base.position.toString());
        parent.addChild(this.base);
    }

    update() {
        const now = this.game.time.now;
        const xoffset = this.base.width / 3;
        const yoffset = this.base.height / 3;
        this.iris.position.set(
            Math.sin(2 * Math.PI * (now + this.offset) / 1000 * 0.2) * 5 + xoffset,
            Math.cos(2 * Math.PI * (now + this.offset) / 1000 * 0.17) * 5 + yoffset,
        );

        this.base.rotation = -this.base.parent.rotation;
    }

}